package controller

import (
	"github.com/gin-gonic/gin"
	"openpanda-backend/service"
	"openpanda-backend/utils"
	"path/filepath"
	"strings"
)

type ContentTransferController struct {
	Service *service.ContentTransferService
}

func NewContentTransferController(s *service.ContentTransferService) *ContentTransferController {
	return &ContentTransferController{Service: s}
}
func (c *ContentTransferController) Export(ctx *gin.Context) {
	ctx.Header("Content-Type", "application/zip")
	ctx.Header("Content-Disposition", `attachment; filename="openpanda-export.zip"`)
	ctx.Header("Cache-Control", "no-store")
	if err := c.Service.Export(ctx.Writer); err != nil && !ctx.Writer.Written() {
		utils.InternalError(ctx, "导出失败")
	}
}
func (c *ContentTransferController) ImportZIP(ctx *gin.Context) {
	f, err := ctx.FormFile("file")
	if err != nil || strings.ToLower(filepath.Ext(f.Filename)) != ".zip" {
		utils.BadRequest(ctx, "请选择 ZIP 文件")
		return
	}
	if f.Size > 100<<20 {
		utils.BadRequest(ctx, "ZIP 文件不能超过 100MB")
		return
	}
	r, err := f.Open()
	if err != nil {
		utils.BadRequest(ctx, "无法读取文件")
		return
	}
	defer r.Close()
	result, err := c.Service.ImportZIP(r)
	if err != nil {
		utils.BadRequest(ctx, err.Error())
		return
	}
	utils.Success(ctx, result)
}
func (c *ContentTransferController) ImportMarkdown(ctx *gin.Context) {
	f, err := ctx.FormFile("file")
	if err != nil || strings.ToLower(filepath.Ext(f.Filename)) != ".md" {
		utils.BadRequest(ctx, "请选择 Markdown 文件")
		return
	}
	r, err := f.Open()
	if err != nil {
		utils.BadRequest(ctx, "无法读取文件")
		return
	}
	defer r.Close()
	result, err := c.Service.ImportMarkdown(f.Filename, r)
	if err != nil {
		utils.BadRequest(ctx, err.Error())
		return
	}
	utils.Success(ctx, result)
}
