// ============================================================
// 文件: api/modules/ai.ts
// 说明: AI 聊天相关 API
// ============================================================
import http from '@/api'
import type { ApiResponse } from '@/types'

/** AI 供应商信息 */
export interface AIProvider {
  key: string   // deepseek / qwen / openai / anthropic
  name: string  // 显示名称
  model: string // 默认模型
}

/** 聊天消息 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** 聊天请求 */
export interface ChatRequest {
  provider: string
  model?: string
  messages: ChatMessage[]
  stream?: boolean
}

/**
 * 获取可用的 AI 供应商列表
 * GET /api/v1/admin/ai/providers
 */
export function getAIProviders() {
  return http.get<ApiResponse<AIProvider[]>>('/admin/ai/providers')
}

/**
 * 发送聊天消息（SSE 流式）
 * POST /api/v1/admin/ai/chat
 *
 * 返回 ReadableStream，由调用方自行读取 SSE 事件
 * 因为 Axios 不原生支持 SSE 流，这里用 fetch + AbortController
 */
export function chatWithAI(
  req: ChatRequest,
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
): AbortController {
  const controller = new AbortController()
  const token = localStorage.getItem('token') || ''

  // Bypass Vite proxy for SSE — Vite proxy buffers the stream,
  // so we call the backend directly (CORS is enabled on backend).
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  const url = import.meta.env.DEV
    ? `http://localhost:8080/api/v1/admin/ai/chat`
    : `${baseURL}/admin/ai/chat`

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ...req, stream: true }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        onError(errData?.message || `HTTP ${response.status}`)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        onError('无法读取响应流')
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 按 SSE 协议解析：data: {...}\n\n
        const lines = buffer.split('\n')
        // 最后一行可能不完整，保留到下次
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          const data = trimmed.slice(6) // 去掉 "data: " 前缀
          if (data === '[DONE]') {
            onDone()
            return
          }

          try {
            const parsed = JSON.parse(data)
            // OpenAI 兼容格式：choices[0].delta.content
            const delta = parsed.choices?.[0]?.delta?.content
            // Anthropic 格式：delta.text 或 content_block.text
            const text = delta || parsed.delta?.text || parsed.content_block?.text || ''

            if (text) {
              onChunk(text)
            }
          } catch {
            // 非 JSON 行，跳过
          }
        }
      }

      onDone()
    })
    .catch((err) => {
      if (err.name === 'AbortError') {
        onDone()
        return
      }
      onError(err.message || '网络错误')
    })

  return controller
}
