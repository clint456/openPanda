// ============================================================
// 包名: model
// 说明: 系统设置模型（key-value 键值对存储）
//       用于存储 AI API Key 等可配置项，管理员可通过页面修改
// ============================================================
package model

// Setting 系统设置（键值对）
type Setting struct {
	ID    uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Key   string `gorm:"type:varchar(100);uniqueIndex;not null" json:"key"`   // 配置键（如 ai.deepseek.api_key）
	Value string `gorm:"type:text" json:"value"`                               // 配置值
	Label string `gorm:"type:varchar(200)" json:"label"`                       // 显示标签
	Group string `gorm:"type:varchar(50);index" json:"group"`                  // 分组（如 ai）
}

// TableName 指定表名
func (Setting) TableName() string {
	return "settings"
}
