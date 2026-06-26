// ============================================================
// 文件: api/index.ts
// 说明: Axios 实例封装（整个前端只创建这一个 Axios 实例）
//       包含：基础URL配置、请求/响应拦截器、统一错误处理
//
// TypeScript 知识点：
//   AxiosResponse<T> → 包装后端返回的数据，T 是 data 的类型
//   AxiosRequestConfig → 请求配置类型
// ============================================================
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'  // Element Plus 消息提示组件
import type { ApiResponse } from '@/types' // 导入统一返回类型

// ============================================================
// 1. 创建 Axios 实例
// ============================================================
const http: AxiosInstance = axios.create({
  // baseURL: 所有请求的基础前缀
  // import.meta.env 是 Vite 提供的环境变量访问方式
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // timeout: 请求超时时间（毫秒）
  timeout: 15000,
  // headers: 默认请求头
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================================
// 2. 请求拦截器（Request Interceptor）
//    每次发送请求前自动执行
//    用途：添加 Token、添加语言头、修改请求配置等
// ============================================================
http.interceptors.request.use(
  // 参数 config 的类型是 InternalAxiosRequestConfig
  (config: InternalAxiosRequestConfig) => {
    // --- 从 localStorage 获取 JWT Token 并添加到请求头 ---
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      // Authorization: Bearer <token> 是 JWT 标准格式
      config.headers.Authorization = `Bearer ${token}`
    }

    // --- 添加语言偏好头（配合后端双语功能） ---
    const locale = localStorage.getItem('locale') || 'zh-CN'
    if (config.headers) {
      config.headers['Accept-Language'] = locale
    }

    // 必须返回 config，否则请求会被阻止
    return config
  },
  // 请求错误处理
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================================
// 3. 响应拦截器（Response Interceptor）
//    每次收到响应后自动执行
//    用途：统一处理错误码、提取 data、处理 Token 过期等
// ============================================================
http.interceptors.response.use(
  // 参数 response 的类型是 AxiosResponse<ApiResponse>
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data // 后端返回的 { code, message, data }

    // --- 业务状态码非 200 时视为错误 ---
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 401 未授权：Token 过期或无效，清除登录信息
      if (res.code === 401) {
        localStorage.removeItem('token')
        // 后续可跳转到登录页：
        // window.location.href = '/login'
      }

      // 返回一个 rejected Promise，让调用方的 .catch() 捕获
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    // 成功时直接返回 response，调用方通过 response.data 获取数据
    return response
  },
  // HTTP 错误处理（网络错误、超时、500等）
  (error) => {
    if (error.response) {
      // 服务器返回了错误响应
      const status = error.response.status
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          break
        case 403:
          ElMessage.error('没有权限执行此操作')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(`请求失败 (${status})`)
      }
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      ElMessage.error('请求超时，请检查网络')
    } else {
      // 网络错误
      ElMessage.error('网络连接失败')
    }

    return Promise.reject(error)
  }
)

// 导出 Axios 实例，其他模块通过此实例发送请求
export default http
