package config

import "os"

// GetEnv 公开的环境变量读取函数（供其他包使用）
// 优先读环境变量，不存在则返回默认值
func GetEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
