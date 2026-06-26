// ============================================================
// 文件: stores/app.ts
// 说明: Pinia 全局状态管理（App级别的状态）
//       Pinia 是 Vue3 官方推荐的状态管理库，替代 Vuex
//
// 核心概念：
//   state: 数据（类似 data）
//   getters: 计算属性（类似 computed）
//   actions: 修改数据的方法（类似 methods，支持异步）
//
// 拓展方式：
//   1. 新建 stores/article.ts（文章状态）
//   2. 新建 stores/user.ts（用户状态）
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'  // Vue3 Composition API

// defineStore 第一个参数是 store 的唯一ID
// 第二个参数是配置函数（Setup Store 风格，推荐）
export const useAppStore = defineStore('app', () => {
  // ============================================================
  // State（状态/数据）
  // ref() 创建响应式数据，.value 读取/修改
  // TypeScript 会自动推断类型：ref<string> 会被推导为 Ref<string>
  // ============================================================

  /** 当前语言（zh-CN / en-US） */
  const locale = ref<string>(localStorage.getItem('locale') || 'zh-CN')

  /** 侧边栏是否展开（移动端适配用） */
  const sidebarOpen = ref<boolean>(false)

  /** 夜间模式 */
  const isDark = ref<boolean>(localStorage.getItem('theme') === 'dark')

  // ============================================================
  // Getters（计算属性）
  // computed() 创建派生数据，依赖变化时自动更新
  // ============================================================

  /** 是否为中文环境 */
  const isZhCN = computed<boolean>(() => locale.value === 'zh-CN')

  /** 是否为英文环境 */
  const isEnUS = computed<boolean>(() => locale.value === 'en-US')

  // ============================================================
  // Actions（操作/方法）
  // 修改 state 的唯一途径
  // ============================================================

  /**
   * 切换语言
   * @param lang 目标语言代码
   */
  function setLocale(lang: string): void {
    locale.value = lang
    localStorage.setItem('locale', lang) // 持久化到本地存储
  }

  /** 切换侧边栏 */
  function toggleSidebar(): void {
    sidebarOpen.value = !sidebarOpen.value
  }

  /** 切换夜间模式 */
  function toggleDark(): void {
    isDark.value = !isDark.value
    const theme = isDark.value ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : '')
  }

  /** 初始化夜间模式（应用启动时调用） */
  function initTheme(): void {
    if (isDark.value) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }

  return {
    locale,
    sidebarOpen,
    isDark,
    isZhCN,
    isEnUS,
    setLocale,
    toggleSidebar,
    toggleDark,
    initTheme,
  }
})
