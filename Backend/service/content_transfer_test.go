package service

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"openpanda-backend/model"
)

func TestMarkdownPreview(t *testing.T) {
	for _, text := range []string{"正文，没有标题", "# Heading\n\n正文", "\ufeff---\r\ntitle: 标题\r\nslug: test\r\nsummary: 摘要\r\n---\r\n正文"} {
		preview, err := PreviewMarkdown("test.md", strings.NewReader(text))
		if err != nil {
			t.Fatal(err)
		}
		if preview.Content == "" {
			t.Fatal("lost body")
		}
	}
	a, body, err := parseMarkdown("test.md", "---\ntitle: 标题\nslug: test\nsummary: 摘要\n---\n正文")
	if err != nil || a.Title != "标题" || a.Slug != "test" || a.Summary != "摘要" || body != "正文" {
		t.Fatalf("%+v %q %v", a, body, err)
	}
	if _, _, err := parseMarkdown("test.md", "---\ntitle: broken"); err == nil {
		t.Fatal("unclosed front matter accepted")
	}
}

// Opt-in integration test; all tables live in a fresh schema, never public.
func TestTransferPostgresRoundTrip(t *testing.T) {
	dsn := os.Getenv("OPENPANDA_TEST_DSN")
	if dsn == "" {
		t.Skip("set OPENPANDA_TEST_DSN for isolated-schema integration test")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(1)
	defer sqlDB.Close()
	schema := fmt.Sprintf("transfer_test_%d", time.Now().UnixNano())
	if err := db.Exec("CREATE SCHEMA " + schema).Error; err != nil {
		t.Fatal(err)
	}
	defer db.Exec("DROP SCHEMA " + schema + " CASCADE")
	if err := db.Exec("SET search_path TO " + schema).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&model.Category{}, &model.Tag{}, &model.Article{}); err != nil {
		t.Fatal(err)
	}
	category := model.Category{Name: "测试分类", Slug: "123"}
	if err := db.Create(&category).Error; err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	image := []byte("image-fixture")
	if err := os.WriteFile(filepath.Join(root, "image.png"), image, 0600); err != nil {
		t.Fatal(err)
	}
	article := model.Article{Title: "测试文章", Slug: "test", Content: "![图](/uploads/image.png)", CoverImage: "/uploads/image.png", CategoryID: category.ID, IsPublished: true, IsPublic: true, Language: "zh", Tags: []model.Tag{{Name: "测试标签", Slug: "test-tag"}}}
	if err := db.Create(&article).Error; err != nil {
		t.Fatal(err)
	}
	svc := NewContentTransferService(db, root)
	var archive bytes.Buffer
	if err := svc.Export(&archive); err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 2; i++ {
		result, err := svc.ImportZIP(bytes.NewReader(archive.Bytes()))
		if err != nil {
			t.Fatal(err)
		}
		if result.ArticlesCreated != 1 || result.ResourcesImported != 1 {
			t.Fatalf("%+v", result)
		}
	}
	var imported model.Article
	if err := db.Preload("Tags").Where("slug = ?", "test-import-2").First(&imported).Error; err != nil {
		t.Fatal(err)
	}
	if imported.CategoryID != category.ID || len(imported.Tags) != 1 || !imported.IsPublished || !imported.IsPublic {
		t.Fatalf("metadata lost: %+v", imported)
	}
	b, err := os.ReadFile(filepath.Join(root, strings.TrimPrefix(imported.CoverImage, "/uploads/")))
	if err != nil || !bytes.Equal(b, image) || !strings.Contains(imported.Content, imported.CoverImage) {
		t.Fatal("resource/path mismatch", err)
	}
	_, err = svc.ImportMarkdownWithMetadata("plain.md", strings.NewReader("正文没有标题"), MarkdownMetadata{Title: "补填标题", Slug: "plain", Category: "123", Language: "zh", Tags: "新的标签"})
	if err != nil {
		t.Fatal(err)
	}
	var draft model.Article
	if err := db.Preload("Tags").Where("slug = ?", "plain").First(&draft).Error; err != nil {
		t.Fatal(err)
	}
	if draft.Content != "正文没有标题" || draft.IsPublished || draft.IsPublic || len(draft.Tags) != 1 {
		t.Fatalf("invalid draft: %+v", draft)
	}
}
