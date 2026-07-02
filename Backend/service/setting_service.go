// ============================================================
// 包名: service
// 说明: 系统设置业务逻辑
//       从数据库读写配置，以 key-value 形式管理
// ============================================================
package service

import (
	"openpanda-backend/model"

	"gorm.io/gorm"
)

// SettingService 设置服务
type SettingService struct {
	DB *gorm.DB
}

// NewSettingService 构造函数
func NewSettingService(db *gorm.DB) *SettingService {
	return &SettingService{DB: db}
}

// GetAll 获取所有设置
func (s *SettingService) GetAll(group string) ([]model.Setting, error) {
	var settings []model.Setting
	query := s.DB.Model(&model.Setting{})
	if group != "" {
		query = query.Where("\"group\" = ?", group)
	}
	if err := query.Order("id ASC").Find(&settings).Error; err != nil {
		return nil, err
	}
	return settings, nil
}

// GetByKey 根据 key 获取单个设置值
func (s *SettingService) GetByKey(key string) (string, error) {
	var setting model.Setting
	if err := s.DB.Where("\"key\" = ?", key).First(&setting).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", err
	}
	return setting.Value, nil
}

// GetMapByGroup 获取某个分组的所有配置，返回 map[string]string
func (s *SettingService) GetMapByGroup(group string) (map[string]string, error) {
	settings, err := s.GetAll(group)
	if err != nil {
		return nil, err
	}
	result := make(map[string]string, len(settings))
	for _, st := range settings {
		result[st.Key] = st.Value
	}
	return result, nil
}

// Upsert 创建或更新设置
func (s *SettingService) Upsert(setting model.Setting) error {
	var existing model.Setting
	err := s.DB.Where("\"key\" = ?", setting.Key).First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return s.DB.Create(&setting).Error
	}
	if err != nil {
		return err
	}
	return s.DB.Model(&existing).Updates(map[string]interface{}{
		"value": setting.Value,
		"label": setting.Label,
		"group": setting.Group,
	}).Error
}

// BatchUpsert 批量更新设置
func (s *SettingService) BatchUpsert(settings []model.Setting) error {
	for _, st := range settings {
		if err := s.Upsert(st); err != nil {
			return err
		}
	}
	return nil
}

// SeedAISettings 初始化 AI 相关默认设置（仅在不存在时创建）
func (s *SettingService) SeedAISettings() {
	defaults := []model.Setting{
		{Key: "ai.deepseek.api_key", Value: "", Label: "DeepSeek API Key", Group: "ai"},
		{Key: "ai.deepseek.model", Value: "deepseek-chat", Label: "DeepSeek 模型", Group: "ai"},
		{Key: "ai.deepseek.base_url", Value: "https://api.deepseek.com", Label: "DeepSeek Base URL", Group: "ai"},

		{Key: "ai.qwen.api_key", Value: "", Label: "通义千问 API Key", Group: "ai"},
		{Key: "ai.qwen.model", Value: "qwen-plus", Label: "通义千问 模型", Group: "ai"},
		{Key: "ai.qwen.base_url", Value: "https://dashscope.aliyuncs.com/compatible-mode/v1", Label: "通义千问 Base URL", Group: "ai"},

		{Key: "ai.openai.api_key", Value: "", Label: "OpenAI API Key", Group: "ai"},
		{Key: "ai.openai.model", Value: "gpt-4o", Label: "OpenAI 模型", Group: "ai"},
		{Key: "ai.openai.base_url", Value: "https://api.openai.com", Label: "OpenAI Base URL", Group: "ai"},

		{Key: "ai.anthropic.api_key", Value: "", Label: "Claude API Key", Group: "ai"},
		{Key: "ai.anthropic.model", Value: "claude-3-5-sonnet-20241022", Label: "Claude 模型", Group: "ai"},
		{Key: "ai.anthropic.base_url", Value: "https://api.anthropic.com", Label: "Claude Base URL", Group: "ai"},
	}

	for _, st := range defaults {
		var count int64
		s.DB.Model(&model.Setting{}).Where("\"key\" = ?", st.Key).Count(&count)
		if count == 0 {
			s.DB.Create(&st)
		}
	}
}
