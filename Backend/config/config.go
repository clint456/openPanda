// ============================================================
// 包名: config
// 说明: 全局配置管理，从环境变量读取数据库、Redis、JWT等配置
//
//	后续拓展：新增配置项只需在此结构体中添加字段即可
//
// ============================================================
package config

// Config 全局配置结构体
// 拓展方式：直接在结构体中新增字段，例如：
//
//	type Config struct {
//	    // ...已有字段...
//	    NewFeature NewFeatureConfig  // 新增配置
//	}
type Config struct {
	Server   ServerConfig   // 服务器配置
	Database DatabaseConfig // PostgreSQL 数据库配置
	Redis    RedisConfig    // Redis 缓存配置
	JWT      JWTConfig      // JWT 认证配置
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Port string // 监听端口，默认 8080
	Mode string // Gin 运行模式: debug / release / test
}

// DatabaseConfig PostgreSQL 数据库配置
type DatabaseConfig struct {
	Host     string // 主机地址
	Port     string // 端口
	User     string // 用户名
	Password string // 密码
	DBName   string // 数据库名
	SSLMode  string // SSL模式
	TimeZone string // 时区
}

// RedisConfig Redis 缓存配置
type RedisConfig struct {
	Addr     string // Redis 地址，如 localhost:6379
	Password string // Redis 密码
	DB       int    // Redis 数据库编号
}

// JWTConfig JWT认证配置
type JWTConfig struct {
	Secret     string // JWT 签名密钥（生产环境必须修改为强密码）
	ExpireHour int    // Token 过期时间（小时）
}

// LoadConfig 加载配置
// 实际项目中应从配置文件或环境变量读取，这里提供默认值方便开发
func LoadConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port: GetEnv("SERVER_PORT", "8080"),
			Mode: GetEnv("GIN_MODE", "debug"),
		},
		Database: DatabaseConfig{
			Host:     GetEnv("DB_HOST", "localhost"),
			Port:     GetEnv("DB_PORT", "5432"),
			User:     GetEnv("DB_USER", "postgres"),
			Password: GetEnv("DB_PASSWORD", "postgres"),
			DBName:   GetEnv("DB_NAME", "openpanda"),
			SSLMode:  GetEnv("DB_SSLMODE", "disable"),
			TimeZone: GetEnv("DB_TIMEZONE", "Asia/Shanghai"),
		},
		Redis: RedisConfig{
			Addr:     GetEnv("REDIS_ADDR", "localhost:6379"),
			Password: GetEnv("REDIS_PASSWORD", ""),
			DB:       0,
		},
		JWT: JWTConfig{
			Secret:     GetEnv("JWT_SECRET", "openpanda-dev-secret-change-in-production"),
			ExpireHour: 24, // 默认24小时过期
		},
	}
}
