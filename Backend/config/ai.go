// ============================================================
// 包名: config
// 说明: AI 服务配置
//
//	优先级：数据库设置 > 环境变量 > 默认值
//
// ============================================================
package config

// AIProvidersConfig AI 供应商配置（可从数据库动态覆盖）
type AIProvidersConfig struct {
	DeepSeek  AIProviderConfig
	Qwen      AIProviderConfig
	OpenAI    AIProviderConfig
	Anthropic AIProviderConfig
}

// AIProviderConfig 单个 AI 供应商配置
type AIProviderConfig struct {
	APIKey  string // API 密钥
	BaseURL string // API 基础地址
	Model   string // 默认模型名称
}

// LoadAIConfig 从环境变量加载默认 AI 配置
// 后续可由数据库设置覆盖
func LoadAIConfig() *AIProvidersConfig {
	return &AIProvidersConfig{
		DeepSeek: AIProviderConfig{
			APIKey:  getEnv("DEEPSEEK_API_KEY", ""),
			BaseURL: getEnv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
			Model:   getEnv("DEEPSEEK_MODEL", "deepseek-chat"),
		},
		Qwen: AIProviderConfig{
			APIKey:  getEnv("QWEN_API_KEY", ""),
			BaseURL: getEnv("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1"),
			Model:   getEnv("QWEN_MODEL", "qwen-plus"),
		},
		OpenAI: AIProviderConfig{
			APIKey:  getEnv("OPENAI_API_KEY", ""),
			BaseURL: getEnv("OPENAI_BASE_URL", "https://api.openai.com"),
			Model:   getEnv("OPENAI_MODEL", "gpt-4o"),
		},
		Anthropic: AIProviderConfig{
			APIKey:  getEnv("ANTHROPIC_API_KEY", ""),
			BaseURL: getEnv("ANTHROPIC_BASE_URL", "https://api.anthropic.com"),
			Model:   getEnv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
		},
	}
}

// MergeFromDB 用数据库中的设置覆盖默认配置
// 优先级：数据库值（非空）> 环境变量值 > 默认值
func (cfg *AIProvidersConfig) MergeFromDB(dbSettings map[string]string) {
	if dbSettings == nil {
		return
	}

	// 辅助函数：如果 DB 有值就用 DB 的，否则保留当前值（来自 env）
	applyDB := func(key string, target *string) {
		if v, ok := dbSettings[key]; ok && v != "" {
			*target = v
		}
	}

	// DeepSeek
	applyDB("ai.deepseek.api_key", &cfg.DeepSeek.APIKey)
	applyDB("ai.deepseek.model", &cfg.DeepSeek.Model)
	applyDB("ai.deepseek.base_url", &cfg.DeepSeek.BaseURL)

	// Qwen
	applyDB("ai.qwen.api_key", &cfg.Qwen.APIKey)
	applyDB("ai.qwen.model", &cfg.Qwen.Model)
	applyDB("ai.qwen.base_url", &cfg.Qwen.BaseURL)

	// OpenAI
	applyDB("ai.openai.api_key", &cfg.OpenAI.APIKey)
	applyDB("ai.openai.model", &cfg.OpenAI.Model)
	applyDB("ai.openai.base_url", &cfg.OpenAI.BaseURL)

	// Anthropic
	applyDB("ai.anthropic.api_key", &cfg.Anthropic.APIKey)
	applyDB("ai.anthropic.model", &cfg.Anthropic.Model)
	applyDB("ai.anthropic.base_url", &cfg.Anthropic.BaseURL)
}

// IsConfigured 检查指定供应商是否已配置 API Key
func (c *AIProviderConfig) IsConfigured() bool {
	return c.APIKey != ""
}
