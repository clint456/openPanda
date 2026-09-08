package controller

import (
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"openpanda-backend/model"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type articleStub struct {
	ArticleUseCases
	article model.Article
	views   int
}

func (s *articleStub) GetByID(uint) (*model.Article, error) { return &s.article, nil }
func (s *articleStub) IncrementViewCount(uint) error        { s.views++; return nil }

func TestArticleVisibilityMatrix(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("JWT_SECRET", "test-only-secret")
	for _, state := range []struct {
		name              string
		published, public bool
	}{
		{"draft", false, true}, {"hidden", true, false}, {"public", true, true},
	} {
		for _, identity := range []string{"anonymous", "expired", "forged", "valid", "missing-id"} {
			t.Run(state.name+"/"+identity, func(t *testing.T) {
				stub := &articleStub{article: model.Article{ID: 1, Content: "private-body", IsPublished: state.published, IsPublic: state.public}}
				r := gin.New()
				r.GET("/articles/:id", NewArticleController(stub, nil).GetArticleDetail)
				req := httptest.NewRequest("GET", "/articles/1", nil)
				if identity != "anonymous" {
					expires := time.Now().Add(time.Hour)
					if identity == "expired" {
						expires = time.Now().Add(-time.Hour)
					}
					claims := jwt.MapClaims{"exp": expires.Unix()}
					if identity != "missing-id" {
						claims["user_id"] = 1
					}
					secret := "test-only-secret"
					if identity == "forged" {
						secret = "wrong-secret"
					}
					token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
					if err != nil {
						t.Fatal(err)
					}
					req.Header.Set("Authorization", "Bearer "+token)
				}
				w := httptest.NewRecorder()
				r.ServeHTTP(w, req)
				allowed := identity == "valid" || (state.published && state.public)
				want := 404
				if allowed {
					want = 200
				}
				if w.Code != want {
					t.Fatalf("status %d, want %d: %s", w.Code, want, w.Body.String())
				}
				if !allowed && (strings.Contains(w.Body.String(), "private-body") || stub.views != 0) {
					t.Fatal("private content accessed")
				}
				if w.Header().Get("Cache-Control") != "no-store" {
					t.Fatal("missing no-store")
				}
			})
		}
	}
}

type categoryStub struct {
	CategoryUseCases
	requested uint
	saved     *model.Category
}

func (s *categoryStub) GetByID(id uint) (*model.Category, error) {
	s.requested = id
	return &model.Category{ID: id, Slug: "old"}, nil
}
func (s *categoryStub) GetBySlug(string) (*model.Category, error) {
	return &model.Category{ID: 99}, nil
}
func (s *categoryStub) Update(c *model.Category) error { s.saved = c; return nil }

func TestCategoryUpdateUsesURLIdentity(t *testing.T) {
	for _, tc := range []struct {
		body   string
		status int
	}{
		{`{"name":"Renamed"}`, 200}, {`{"slug":"occupied"}`, 409},
	} {
		s := &categoryStub{}
		r := gin.New()
		r.PUT("/categories/:id", NewArticleController(nil, s).UpdateCategory)
		req := httptest.NewRequest("PUT", "/categories/7", strings.NewReader(tc.body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		if w.Code != tc.status || s.requested != 7 {
			t.Fatalf("status=%d requested=%d", w.Code, s.requested)
		}
		if tc.status == 409 && s.saved != nil {
			t.Fatal("conflicting category was saved")
		}
		if tc.status == 200 && (s.saved == nil || s.saved.ID != 7) {
			t.Fatal("wrong category updated")
		}
	}
}
