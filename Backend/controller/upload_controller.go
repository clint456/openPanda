// ============================================================
// 包名: controller
// 说明: 文件上传控制器 - 图片上传（Markdown 编辑器用）
//
//	上传后返回可访问的图片URL
//
// ============================================================
package controller

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"openpanda-backend/utils"

	"github.com/gin-gonic/gin"
)

// UploadController 文件上传控制器
type UploadController struct {
	UploadDir string // 上传文件存储目录
	BaseURL   string // 图片访问基础URL
}

// NewUploadController 构造函数
func NewUploadController() *UploadController {
	return &UploadController{
		UploadDir: "./uploads", // 存储目录
		BaseURL:   "/uploads",  // 相对路径，适配所有环境（Vite代理 / Nginx代理 / 直接访问）
	}
}

// UploadImage 上传图片
// POST /api/v1/admin/upload/image
// 请求: multipart/form-data, 字段名 file
// 响应: { "code": 200, "data": { "url": "http://xxx/uploads/2024/01/abc.png" } }
func (ctrl *UploadController) UploadImage(c *gin.Context) {
	// 1. 获取上传文件
	file, err := c.FormFile("file")
	if err != nil {
		utils.BadRequest(c, "请选择图片文件")
		return
	}

	// 2. 检查文件类型（只允许图片）
	ext := filepath.Ext(file.Filename)
	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true, ".svg": true}
	if !allowedExts[ext] {
		utils.BadRequest(c, "不支持的文件类型，仅允许 jpg/png/gif/webp/svg")
		return
	}

	// 3. 检查文件大小（最大 10MB）
	const maxSize = 10 * 1024 * 1024
	if file.Size > maxSize {
		utils.BadRequest(c, "图片大小不能超过 10MB")
		return
	}

	// 4. 生成存储路径（按日期分目录）
	dateDir := time.Now().Format("2006/01")
	saveDir := filepath.Join(ctrl.UploadDir, dateDir)
	if err := os.MkdirAll(saveDir, 0755); err != nil {
		utils.InternalError(c, "创建目录失败")
		return
	}

	// 5. 生成唯一文件名（时间戳 + 原始扩展名）
	newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join(saveDir, newFileName)

	// 6. 打开源文件
	src, err := file.Open()
	if err != nil {
		utils.InternalError(c, "读取文件失败")
		return
	}
	defer src.Close()

	// 7. 创建目标文件
	dst, err := os.Create(savePath)
	if err != nil {
		utils.InternalError(c, "保存文件失败")
		return
	}
	defer dst.Close()

	// 8. 复制文件内容
	if _, err := io.Copy(dst, src); err != nil {
		utils.InternalError(c, "写入文件失败")
		return
	}

	// 9. 返回图片URL
	url := fmt.Sprintf("%s/%s/%s", ctrl.BaseURL, dateDir, newFileName)
	utils.Success(c, gin.H{"url": url})
}
