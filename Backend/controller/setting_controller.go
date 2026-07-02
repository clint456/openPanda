// ============================================================
// 包名: controller
// 说明: 系统设置控制器
//       管理员可通过 API 读写 AI 配置
// ============================================================
package controller

import (
	"net/http"

	"openpanda-backend/model"
	"openpanda-backend/service"

	"github.com/gin-gonic/gin"
)

// SettingController 设置控制器
type SettingController struct {
	svc          *service.SettingService
	aiController *AIController // 用于刷新 AI 配置
}

// NewSettingController 构造函数
func NewSettingController(svc *service.SettingService, aiCtrl *AIController) *SettingController {
	return &SettingController{svc: svc, aiController: aiCtrl}
}

// GetAISettings 获取 AI 分组的所有配置
// GET /api/v1/admin/settings/ai
func (ctrl *SettingController) GetAISettings(c *gin.Context) {
	settings, err := ctrl.svc.GetAll("ai")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}
	if settings == nil {
		settings = []model.Setting{}
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": settings})
}

// UpdateAISettings 批量更新 AI 配置
// PUT /api/v1/admin/settings/ai
func (ctrl *SettingController) UpdateAISettings(c *gin.Context) {
	var settings []model.Setting
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误: " + err.Error()})
		return
	}

	for i := range settings {
		settings[i].Group = "ai"
	}

	if err := ctrl.svc.BatchUpsert(settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	// 刷新 AI 控制器配置（热更新，无需重启）
	dbMap, _ := ctrl.svc.GetMapByGroup("ai")
	ctrl.aiController.ReloadConfig(dbMap)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "保存成功，AI 配置已生效"})
}
