package service

import (
	"archive/zip"
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
	"gorm.io/gorm"
	"openpanda-backend/model"
	"openpanda-backend/utils"
)

const maxTransferSize int64 = 100 << 20

var localImage = regexp.MustCompile(`(?:!\[[^\]]*\]\()?(/uploads/[A-Za-z0-9_./-]+)`)

type TransferManifest struct {
	Format     string             `json:"format"`
	Version    int                `json:"version"`
	ExportedAt time.Time          `json:"exported_at"`
	Articles   []TransferArticle  `json:"articles"`
	Resources  []TransferResource `json:"resources"`
}
type TransferArticle struct {
	File        string           `json:"file"`
	Title       string           `json:"title"`
	Slug        string           `json:"slug"`
	Summary     string           `json:"summary"`
	CoverImage  string           `json:"cover_image"`
	Category    TransferCategory `json:"category"`
	Tags        []TransferTag    `json:"tags"`
	Language    string           `json:"language"`
	IsPublished bool             `json:"is_published"`
	IsPublic    bool             `json:"is_public"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}
type TransferCategory struct {
	Name        string `json:"name" yaml:"name"`
	Slug        string `json:"slug" yaml:"slug"`
	Description string `json:"description" yaml:"description"`
	SortOrder   int    `json:"sort_order" yaml:"sort_order"`
}
type TransferTag struct {
	Name string `json:"name" yaml:"name"`
	Slug string `json:"slug" yaml:"slug"`
}
type TransferResource struct {
	ArchivePath string `json:"archive_path"`
	OriginalURL string `json:"original_url"`
	SHA256      string `json:"sha256"`
}
type TransferResult struct {
	ArticlesCreated   int      `json:"articles_created"`
	ResourcesImported int      `json:"resources_imported"`
	Warnings          []string `json:"warnings"`
}
type importPackage struct {
	Manifest  TransferManifest
	Articles  map[string]string
	Resources map[string][]byte
}

type ContentTransferService struct {
	DB        *gorm.DB
	UploadDir string
}

func NewContentTransferService(db *gorm.DB, uploadDir string) *ContentTransferService {
	return &ContentTransferService{DB: db, UploadDir: uploadDir}
}

func (s *ContentTransferService) Export(w io.Writer) error {
	var articles []model.Article
	if err := s.DB.Preload("Category").Preload("Tags").Order("id ASC").Find(&articles).Error; err != nil {
		return err
	}
	var out bytes.Buffer
	zw := zip.NewWriter(&out)
	manifest := TransferManifest{Format: "openpanda-export", Version: 1, ExportedAt: time.Now().UTC()}
	resources := map[string]string{}
	for i, a := range articles {
		content := a.Content
		cover := a.CoverImage
		for _, url := range imageURLs(a) {
			archivePath, err := s.writeResource(zw, url, resources)
			if err != nil {
				return fmt.Errorf("article %q resource %s: %w", a.Title, url, err)
			}
			content = strings.ReplaceAll(content, url, "../"+archivePath)
			if cover == url {
				cover = "../" + archivePath
			}
		}
		file := fmt.Sprintf("articles/%03d-%s.md", i+1, safeName(a.Slug, a.ID))
		entry, err := zw.Create(file)
		if err != nil {
			return err
		}
		if _, err = io.WriteString(entry, content); err != nil {
			return err
		}
		item := TransferArticle{File: file, Title: a.Title, Slug: a.Slug, Summary: a.Summary, CoverImage: cover, Category: TransferCategory{Name: a.Category.Name, Slug: a.Category.Slug, Description: a.Category.Description, SortOrder: a.Category.SortOrder}, Language: a.Language, IsPublished: a.IsPublished, IsPublic: a.IsPublic, CreatedAt: a.CreatedAt, UpdatedAt: a.UpdatedAt}
		for _, t := range a.Tags {
			item.Tags = append(item.Tags, TransferTag{Name: t.Name, Slug: t.Slug})
		}
		manifest.Articles = append(manifest.Articles, item)
	}
	for original, archive := range resources {
		data, err := os.ReadFile(filepath.Join(s.UploadDir, filepath.FromSlash(strings.TrimPrefix(original, "/uploads/"))))
		if err != nil {
			return err
		}
		sum := sha256.Sum256(data)
		manifest.Resources = append(manifest.Resources, TransferResource{ArchivePath: archive, OriginalURL: original, SHA256: hex.EncodeToString(sum[:])})
	}
	meta, _ := json.MarshalIndent(manifest, "", "  ")
	e, err := zw.Create("manifest.json")
	if err != nil {
		return err
	}
	if _, err = e.Write(meta); err != nil {
		return err
	}
	if err = zw.Close(); err != nil {
		return err
	}
	_, err = w.Write(out.Bytes())
	return err
}
func (s *ContentTransferService) writeResource(zw *zip.Writer, url string, known map[string]string) (string, error) {
	if p := known[url]; p != "" {
		return p, nil
	}
	rel := strings.TrimPrefix(url, "/uploads/")
	if !safePath(rel) {
		return "", errors.New("invalid path")
	}
	data, err := os.ReadFile(filepath.Join(s.UploadDir, filepath.FromSlash(rel)))
	if err != nil {
		return "", err
	}
	if int64(len(data)) > 10<<20 {
		return "", errors.New("resource too large")
	}
	sum := sha256.Sum256(data)
	archive := "resources/images/" + hex.EncodeToString(sum[:8]) + strings.ToLower(filepath.Ext(rel))
	e, err := zw.Create(archive)
	if err != nil {
		return "", err
	}
	_, err = e.Write(data)
	known[url] = archive
	return archive, err
}
func (s *ContentTransferService) ImportZIP(r io.Reader) (TransferResult, error) {
	data, err := io.ReadAll(io.LimitReader(r, maxTransferSize+1))
	if err != nil {
		return TransferResult{}, err
	}
	if int64(len(data)) > maxTransferSize {
		return TransferResult{}, errors.New("ZIP 超过100MB")
	}
	p, err := parseZIP(data)
	if err != nil {
		return TransferResult{}, err
	}
	return s.persist(p, false)
}
func (s *ContentTransferService) ImportMarkdown(name string, r io.Reader) (TransferResult, error) {
	data, err := io.ReadAll(io.LimitReader(r, maxTransferSize+1))
	if err != nil {
		return TransferResult{}, err
	}
	a, body, err := parseMarkdown(name, string(data))
	if err != nil {
		return TransferResult{}, err
	}
	return s.persist(importPackage{Manifest: TransferManifest{Format: "openpanda-export", Version: 1, Articles: []TransferArticle{a}}, Articles: map[string]string{a.File: body}, Resources: map[string][]byte{}}, true)
}
func parseZIP(data []byte) (importPackage, error) {
	zr, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil {
		return importPackage{}, errors.New("ZIP 格式无效")
	}
	if len(zr.File) > 2000 {
		return importPackage{}, errors.New("ZIP 文件数量过多")
	}
	p := importPackage{Articles: map[string]string{}, Resources: map[string][]byte{}}
	var total uint64
	for _, f := range zr.File {
		if f.FileInfo().IsDir() {
			continue
		}
		if !safePath(f.Name) {
			return p, errors.New("ZIP 包含不安全路径")
		}
		total += f.UncompressedSize64
		if total > 300<<20 {
			return p, errors.New("解压内容过大")
		}
		rc, e := f.Open()
		if e != nil {
			return p, e
		}
		b, e := io.ReadAll(io.LimitReader(rc, 300<<20+1))
		rc.Close()
		if e != nil {
			return p, e
		}
		if f.Name == "manifest.json" {
			if e = json.Unmarshal(b, &p.Manifest); e != nil {
				return p, errors.New("manifest.json 无效")
			}
		} else if strings.HasPrefix(f.Name, "articles/") && strings.HasSuffix(f.Name, ".md") {
			p.Articles[f.Name] = string(b)
		} else if strings.HasPrefix(f.Name, "resources/images/") {
			if !safeImage(f.Name) {
				return p, errors.New("资源格式不支持")
			}
			p.Resources[f.Name] = b
		}
	}
	if p.Manifest.Format != "openpanda-export" || p.Manifest.Version != 1 {
		return p, errors.New("不支持的导出版本")
	}
	for _, a := range p.Manifest.Articles {
		if p.Articles[a.File] == "" {
			return p, errors.New("文章文件缺失")
		}
	}
	for _, r := range p.Manifest.Resources {
		b, ok := p.Resources[r.ArchivePath]
		if !ok {
			return p, errors.New("资源文件缺失")
		}
		sum := sha256.Sum256(b)
		if hex.EncodeToString(sum[:]) != r.SHA256 {
			return p, errors.New("资源校验失败")
		}
	}
	return p, nil
}
func (s *ContentTransferService) persist(p importPackage, draft bool) (TransferResult, error) {
	if err := os.MkdirAll(s.UploadDir, 0755); err != nil {
		return TransferResult{}, err
	}
	result := TransferResult{Warnings: []string{}}
	urls := map[string]string{}
	stage, err := os.MkdirTemp(s.UploadDir, ".import-")
	if err != nil {
		return result, err
	}
	defer os.RemoveAll(stage)
	created := []string{}
	for _, r := range p.Manifest.Resources {
		rel := filepath.FromSlash(path.Join(time.Now().Format("2006/01"), fmt.Sprintf("%d-%s", time.Now().UnixNano(), filepath.Base(r.ArchivePath))))
		src := filepath.Join(stage, rel)
		if err = os.MkdirAll(filepath.Dir(src), 0755); err != nil {
			return result, err
		}
		if err = os.WriteFile(src, p.Resources[r.ArchivePath], 0644); err != nil {
			return result, err
		}
		dst := filepath.Join(s.UploadDir, rel)
		if err = os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
			return result, err
		}
		if err = os.WriteFile(dst, p.Resources[r.ArchivePath], 0644); err != nil {
			return result, err
		}
		created = append(created, dst)
		urls[r.ArchivePath] = "/uploads/" + filepath.ToSlash(rel)
	}
	err = s.DB.Transaction(func(tx *gorm.DB) error {
		for _, a := range p.Manifest.Articles {
			var c model.Category
			if a.Category.Slug != "" {
				tx.Where("slug = ?", a.Category.Slug).First(&c)
			}
			if c.ID == 0 {
				c = model.Category{Name: a.Category.Name, Slug: a.Category.Slug, Description: a.Category.Description, SortOrder: a.Category.SortOrder}
				if c.Slug == "" {
					c.Slug = utils.GenerateSlug(c.Name)
				}
				if err := tx.Create(&c).Error; err != nil {
					return err
				}
			}
			slug := a.Slug
			if slug == "" {
				slug = utils.GenerateSlug(a.Title)
			}
			base := slug
			for n := 2; ; n++ {
				var count int64
				tx.Model(&model.Article{}).Where("slug = ?", slug).Count(&count)
				if count == 0 {
					break
				}
				slug = fmt.Sprintf("%s-import-%d", base, n)
			}
			content := replacePaths(p.Articles[a.File], urls)
			article := model.Article{Title: a.Title, Slug: slug, Content: content, Summary: a.Summary, CoverImage: replacePaths(a.CoverImage, urls), CategoryID: c.ID, Language: a.Language, IsPublished: a.IsPublished && !draft, IsPublic: a.IsPublic && !draft, CreatedAt: a.CreatedAt, UpdatedAt: a.UpdatedAt}
			if article.CreatedAt.IsZero() {
				article.CreatedAt = time.Now()
			}
			if article.UpdatedAt.IsZero() {
				article.UpdatedAt = article.CreatedAt
			}
			if err := tx.Create(&article).Error; err != nil {
				return err
			}
			result.ArticlesCreated++
		}
		return nil
	})
	if err != nil {
		for _, f := range created {
			_ = os.Remove(f)
		}
		return TransferResult{}, err
	}
	result.ResourcesImported = len(created)
	return result, nil
}
func parseMarkdown(name, text string) (TransferArticle, string, error) {
	a := TransferArticle{File: "articles/" + safeName(strings.TrimSuffix(filepath.Base(name), filepath.Ext(name)), 0) + ".md", Language: "zh"}
	body := strings.TrimSpace(text)
	if strings.HasPrefix(body, "---\n") {
		if end := strings.Index(body[4:], "\n---"); end >= 0 {
			var m struct {
				Title, Slug, Summary, Language string           `yaml:"title,slug,summary,language"`
				Category                       TransferCategory `yaml:"category"`
				Tags                           []TransferTag    `yaml:"tags"`
			}
			if err := yaml.Unmarshal([]byte(body[4:4+end]), &m); err != nil {
				return a, "", errors.New("Front Matter 无效")
			}
			a.Title, a.Slug, a.Summary, a.Language, a.Category, a.Tags = m.Title, m.Slug, m.Summary, m.Language, m.Category, m.Tags
			body = strings.TrimSpace(body[4+end+4:])
		}
	}
	if a.Title == "" {
		lines := strings.Split(body, "\n")
		if len(lines) > 0 && strings.HasPrefix(strings.TrimSpace(lines[0]), "# ") {
			a.Title = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(lines[0]), "# "))
			body = strings.TrimSpace(strings.Join(lines[1:], "\n"))
		}
	}
	if a.Title == "" {
		return a, "", errors.New("Markdown 缺少标题")
	}
	return a, body, nil
}
func imageURLs(a model.Article) []string {
	seen := map[string]bool{}
	out := []string{}
	for _, m := range localImage.FindAllStringSubmatch(a.Content, -1) {
		if !seen[m[1]] {
			seen[m[1]] = true
			out = append(out, m[1])
		}
	}
	if strings.HasPrefix(a.CoverImage, "/uploads/") && !seen[a.CoverImage] {
		out = append(out, a.CoverImage)
	}
	return out
}
func replacePaths(s string, m map[string]string) string {
	for a, b := range m {
		s = strings.ReplaceAll(s, "../"+a, b)
		s = strings.ReplaceAll(s, a, b)
	}
	return s
}
func safePath(s string) bool {
	return s != "" && !strings.HasPrefix(s, "/") && !strings.HasPrefix(path.Clean(s), "../") && !strings.Contains(s, "\\") && !strings.Contains(s, ":") && path.Clean(s) == s
}
func safeImage(s string) bool {
	e := strings.ToLower(path.Ext(s))
	return safePath(s) && (e == ".png" || e == ".jpg" || e == ".jpeg" || e == ".gif" || e == ".webp")
}
func safeName(s string, id uint) string {
	s = regexp.MustCompile(`[^A-Za-z0-9-]+`).ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if s == "" {
		return fmt.Sprintf("article-%d", id)
	}
	return s
}
