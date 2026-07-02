// ============================================================
// 包名: controller
// 说明: AI 聊天控制器
//       作为后端代理，转发请求到各 AI 供应商（DeepSeek/Qwen/OpenAI/Claude）
//       支持 SSE（Server-Sent Events）流式响应
//       API Key 存储在服务端环境变量，前端不可见
// ============================================================
package controller

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"openpanda-backend/config"

	"github.com/gin-gonic/gin"
)

// ============================================================
// 请求/响应结构体
// ============================================================

// ChatRequest 前端发送的聊天请求
type ChatRequest struct {
	Provider string          `json:"provider" binding:"required"` // deepseek / qwen / openai / anthropic
	Model    string          `json:"model"`                       // 可选，覆盖默认模型
	Messages []ChatMessage   `json:"messages" binding:"required"` // 对话历史
	Stream   bool            `json:"stream"`                      // 是否流式（默认 true）
}

// ChatMessage 聊天消息
type ChatMessage struct {
	Role    string `json:"role"`    // system / user / assistant
	Content string `json:"content"` // 消息内容
}

// AIController AI 聊天控制器
type AIController struct {
	cfg *config.AIProvidersConfig
}

// NewAIController 创建 AI 控制器实例
func NewAIController(cfg *config.AIProvidersConfig) *AIController {
	return &AIController{cfg: cfg}
}

// ReloadConfig 从数据库重新加载配置（管理员修改设置后调用）
func (ctrl *AIController) ReloadConfig(dbSettings map[string]string) {
	ctrl.cfg.MergeFromDB(dbSettings)
}

// ============================================================
// Chat 处理聊天请求（SSE 流式）
// POST /api/v1/admin/ai/chat
// ============================================================
func (ctrl *AIController) Chat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误: " + err.Error()})
		return
	}

	// 获取供应商配置
	providerCfg := ctrl.getProviderConfig(req.Provider)
	if providerCfg == nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "不支持的 AI 供应商: " + req.Provider})
		return
	}
	if !providerCfg.IsConfigured() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"code": 503, "message": req.Provider + " 未配置 API Key，请在环境变量中设置"})
		return
	}

	// 使用请求中指定的模型，否则用默认模型
	model := providerCfg.Model
	if req.Model != "" {
		model = req.Model
	}

	// 默认启用流式
	stream := true
	if req.Stream == false {
		// 如果明确传了 false，允许非流式（但建议始终流式）
		stream = req.Stream
	}

	// 根据供应商类型路由
	switch req.Provider {
	case "deepseek", "qwen", "openai":
		ctrl.handleOpenAICompatible(c, providerCfg, model, req.Messages, stream)
	case "anthropic":
		ctrl.handleAnthropic(c, providerCfg, model, req.Messages, stream)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "不支持的供应商"})
	}
}

// ============================================================
// ListProviders 列出已配置的 AI 供应商
// GET /api/v1/admin/ai/providers
// ============================================================
func (ctrl *AIController) ListProviders(c *gin.Context) {
	providers := []gin.H{}

	if ctrl.cfg.DeepSeek.IsConfigured() {
		providers = append(providers, gin.H{
			"key":   "deepseek",
			"name":  "DeepSeek",
			"model": ctrl.cfg.DeepSeek.Model,
		})
	}
	if ctrl.cfg.Qwen.IsConfigured() {
		providers = append(providers, gin.H{
			"key":   "qwen",
			"name":  "通义千问",
			"model": ctrl.cfg.Qwen.Model,
		})
	}
	if ctrl.cfg.OpenAI.IsConfigured() {
		providers = append(providers, gin.H{
			"key":   "openai",
			"name":  "ChatGPT",
			"model": ctrl.cfg.OpenAI.Model,
		})
	}
	if ctrl.cfg.Anthropic.IsConfigured() {
		providers = append(providers, gin.H{
			"key":   "anthropic",
			"name":  "Claude",
			"model": ctrl.cfg.Anthropic.Model,
		})
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": providers})
}

// ============================================================
// 私有方法：获取供应商配置
// ============================================================
func (ctrl *AIController) getProviderConfig(provider string) *config.AIProviderConfig {
	switch provider {
	case "deepseek":
		return &ctrl.cfg.DeepSeek
	case "qwen":
		return &ctrl.cfg.Qwen
	case "openai":
		return &ctrl.cfg.OpenAI
	case "anthropic":
		return &ctrl.cfg.Anthropic
	default:
		return nil
	}
}

// ============================================================
// OpenAI 兼容格式处理（DeepSeek / Qwen / OpenAI 通用）
// 这三个供应商的 API 格式完全兼容 OpenAI Chat Completions
// ============================================================
func (ctrl *AIController) handleOpenAICompatible(
	c *gin.Context,
	cfg *config.AIProviderConfig,
	model string,
	messages []ChatMessage,
	stream bool,
) {
	// 构建 OpenAI 格式的请求体
	openaiReq := map[string]interface{}{
		"model":    model,
		"messages": messages,
		"stream":   stream,
	}

	reqBody, err := json.Marshal(openaiReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "构建请求失败"})
		return
	}

	// 构造上游请求
	url := strings.TrimRight(cfg.BaseURL, "/") + "/v1/chat/completions"
	upstreamReq, err := http.NewRequest("POST", url, bytes.NewReader(reqBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建请求失败"})
		return
	}
	upstreamReq.Header.Set("Content-Type", "application/json")
	upstreamReq.Header.Set("Authorization", "Bearer "+cfg.APIKey)

	// 发送请求（禁用压缩以保证 SSE 实时推送）
	client := &http.Client{
		Transport: &http.Transport{
			DisableCompression: true,
		},
	}
	resp, err := client.Do(upstreamReq)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"code": 502, "message": "AI 服务请求失败: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		c.JSON(http.StatusBadGateway, gin.H{"code": 502, "message": fmt.Sprintf("AI 服务返回错误 (%d): %s", resp.StatusCode, string(body))})
		return
	}

	if stream {
		ctrl.proxySSE(c, resp)
	} else {
		// 非流式：直接转发 JSON
		c.DataFromReader(resp.StatusCode, resp.ContentLength, "application/json", resp.Body, nil)
	}
}

// ============================================================
// Anthropic (Claude) 处理
// Anthropic API 格式与 OpenAI 不同，需要转换
// ============================================================
func (ctrl *AIController) handleAnthropic(
	c *gin.Context,
	cfg *config.AIProviderConfig,
	model string,
	messages []ChatMessage,
	stream bool,
) {
	// 提取 system 消息
	var systemPrompt string
	var userMessages []ChatMessage
	for _, msg := range messages {
		if msg.Role == "system" {
			systemPrompt = msg.Content
		} else {
			userMessages = append(userMessages, msg)
		}
	}

	// 构建 Anthropic 格式的请求体
	anthropicReq := map[string]interface{}{
		"model":      model,
		"max_tokens": 4096,
		"messages":   userMessages,
		"stream":     stream,
	}
	if systemPrompt != "" {
		anthropicReq["system"] = systemPrompt
	}

	reqBody, err := json.Marshal(anthropicReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "构建请求失败"})
		return
	}

	// 构造上游请求
	url := strings.TrimRight(cfg.BaseURL, "/") + "/v1/messages"
	upstreamReq, err := http.NewRequest("POST", url, bytes.NewReader(reqBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建请求失败"})
		return
	}
	upstreamReq.Header.Set("Content-Type", "application/json")
	upstreamReq.Header.Set("x-api-key", cfg.APIKey)
	upstreamReq.Header.Set("anthropic-version", "2023-06-01")

	// 发送请求（禁用压缩以保证 SSE 实时推送）
	client := &http.Client{
		Transport: &http.Transport{
			DisableCompression: true,
		},
	}
	resp, err := client.Do(upstreamReq)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"code": 502, "message": "AI 服务请求失败: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		c.JSON(http.StatusBadGateway, gin.H{"code": 502, "message": fmt.Sprintf("AI 服务返回错误 (%d): %s", resp.StatusCode, string(body))})
		return
	}

	if stream {
		ctrl.proxySSEAnthropic(c, resp)
	} else {
		c.DataFromReader(resp.StatusCode, resp.ContentLength, "application/json", resp.Body, nil)
	}
}

// ============================================================
// SSE 流式代理（OpenAI 兼容格式）
// OpenAI 的 SSE 格式：data: {"choices":[{"delta":{"content":"..."}}]}\n\n
// 我们直接透传给前端，前端负责解析
// ============================================================
func (ctrl *AIController) proxySSE(c *gin.Context, upstreamResp *http.Response) {
	// 设置 SSE 响应头
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no") // 禁用 nginx 缓冲

	c.Stream(func(w io.Writer) bool {
		reader := bufio.NewReader(upstreamResp.Body)
		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				if err == io.EOF {
					return false
				}
				return false
			}

			// 转发原始 SSE 数据行
			line = strings.TrimRight(line, "\r\n")
			if line == "" {
				// 空行，原样发送
				fmt.Fprintf(w, "\n")
				continue
			}

			if strings.HasPrefix(line, "data: ") {
				// 解析 data 行，检查是否是结束信号
				data := strings.TrimPrefix(line, "data: ")
				if data == "[DONE]" {
					fmt.Fprintf(w, "data: [DONE]\n\n")
					c.Writer.Flush()
					return false
				}
				// 原样转发
				fmt.Fprintf(w, "%s\n\n", line)
				c.Writer.Flush()
			}
		}
	})
}

// ============================================================
// SSE 流式代理（Anthropic 格式）
// Anthropic SSE 格式与 OpenAI 不同，直接透传
// ============================================================
func (ctrl *AIController) proxySSEAnthropic(c *gin.Context, upstreamResp *http.Response) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	c.Stream(func(w io.Writer) bool {
		reader := bufio.NewReader(upstreamResp.Body)
		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				return false
			}

			line = strings.TrimRight(line, "\r\n")
			if line == "" {
				fmt.Fprintf(w, "\n")
				continue
			}

			// 解析 Anthropic SSE 格式并转为统一格式
			if strings.HasPrefix(line, "data: ") {
				// 直接透传，前端解析
				fmt.Fprintf(w, "%s\n\n", line)
				c.Writer.Flush()
			} else if strings.HasPrefix(line, "event: ") {
				// 透传 event 行
				fmt.Fprintf(w, "%s\n", line)
				c.Writer.Flush()
			}
		}
	})
}
