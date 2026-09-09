package controller

import (
	"bytes"
	"github.com/gin-gonic/gin"
	"mime/multipart"
	"net/http/httptest"
	"openpanda-backend/service"
	"testing"
)

func TestMarkdownMultipartPreview(t *testing.T) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	file, err := writer.CreateFormFile("file", "test.md")
	if err != nil {
		t.Fatal(err)
	}
	file.Write([]byte("正文没有标题"))
	writer.Close()
	r := gin.New()
	c := NewContentTransferController(service.NewContentTransferService(nil, t.TempDir()))
	r.POST("/preview", c.PreviewMarkdown)
	req := httptest.NewRequest("POST", "/preview", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	response := httptest.NewRecorder()
	r.ServeHTTP(response, req)
	if response.Code != 200 || !bytes.Contains(response.Body.Bytes(), []byte("正文没有标题")) {
		t.Fatalf("%d %s", response.Code, response.Body.String())
	}
}
