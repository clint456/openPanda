// ============================================================
// 文件: api/modules/auth.ts
// 说明: 认证相关 API（登录、获取用户信息）
// ============================================================
import http from '@/api'
import type { ApiResponse } from '@/types'

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 登录响应数据 */
export interface LoginData {
  token: string
  username: string
}

/** 用户信息 */
export interface UserInfo {
  user_id: number
  username: string
  role: string
}

/**
 * 登录
 * POST /api/v1/login
 */
export function login(data: LoginParams) {
  return http.post<ApiResponse<LoginData>>('/login', data)
}

/**
 * 获取当前用户信息（验证 Token 是否有效）
 * GET /api/v1/auth/me
 */
export function getMe() {
  return http.get<ApiResponse<UserInfo>>('/auth/me')
}
