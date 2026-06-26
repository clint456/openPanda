// ============================================================
// 文件: stores/auth.ts
// 说明: 认证状态管理（Token、用户信息、登录/登出）
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getMe, type UserInfo } from '@/api/modules/auth'

export const useAuthStore = defineStore('auth', () => {
  // ============================================================
  // State
  // ============================================================

  /** JWT Token（持久化到 localStorage） */
  const token = ref<string>(localStorage.getItem('token') || '')

  /** 当前用户信息 */
  const user = ref<UserInfo | null>(null)

  // ============================================================
  // Getters（计算属性）
  // ============================================================

  /** 是否已登录 */
  const isLoggedIn = computed<boolean>(() => !!token.value)

  /** 当前用户名 */
  const username = computed<string>(() => user.value?.username || '')

  // ============================================================
  // Actions
  // ============================================================

  /**
   * 登录
   * @param username 用户名
   * @param password 密码
   */
  async function loginAction(username: string, password: string): Promise<void> {
    const { data } = await loginApi({ username, password })
    if (data.data) {
      token.value = data.data.token
      user.value = {
        user_id: 1,
        username: data.data.username,
        role: 'admin',
      }
      // 持久化 Token
      localStorage.setItem('token', data.data.token)
    }
  }

  /**
   * 登出
   */
  function logout(): void {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  /**
   * 初始化：从 localStorage 恢复登录状态
   * 应用启动时调用，验证 Token 是否仍然有效
   */
  async function initAuth(): Promise<void> {
    if (!token.value) return

    try {
      const { data } = await getMe()
      if (data.data) {
        user.value = data.data
      }
    } catch {
      // Token 无效或已过期，清除
      logout()
    }
  }

  return {
    // state
    token,
    user,
    // getters
    isLoggedIn,
    username,
    // actions
    loginAction,
    logout,
    initAuth,
  }
})
