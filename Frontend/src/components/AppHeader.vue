<!--
  文件: components/AppHeader.vue
  说明: 顶部导航栏组件
        包含：Logo、导航菜单、搜索框、中英文切换按钮
        支持响应式（电脑端显示完整菜单，手机端折叠为汉堡菜单）
-->
<template>
  <header class="header">
    <div class="header__container">
      <!-- ============================================================
      Logo + 标题
      ============================================================ -->
      <router-link to="/" class="header__logo">
        <!-- <img src="/panda.png" alt="OpenPanda" class="logo__img" /> -->
        <span class="logo__text">OpenPanda</span>
      </router-link>

      <!-- ============================================================
      导航菜单（桌面端显示）
      el-menu: Element Plus 的导航菜单组件
      mode="horizontal": 水平排列
      router: 启用路由模式，el-menu-item 的 index 对应路由路径
      ============================================================ -->
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        router
        class="header__menu"
      >
        <el-menu-item index="/">{{ $t('common.home') }}</el-menu-item>
        <el-menu-item index="/articles">{{ $t('common.articles') }}</el-menu-item>
      </el-menu>

      <!-- ============================================================
      右侧操作区：语言切换 + 移动端菜单按钮
      ============================================================ -->
      <div class="header__actions">
        <!-- 写文章按钮（仅登录后显示） -->
        <el-button
          v-if="authStore.isLoggedIn"
          size="small"
          :icon="EditIcon"
          @click="goToEditor"
        >
          {{ $t('nav.writeArticle') }}
        </el-button>

        <!-- 专栏管理（仅登录后显示） -->
        <el-button
          v-if="authStore.isLoggedIn"
          size="small"
          @click="router.push('/admin/categories')"
        >
          专栏管理
        </el-button>

        <!-- AI 助手（仅登录后显示） -->
        <el-button
          v-if="authStore.isLoggedIn"
          size="small"
          @click="router.push('/admin/ai')"
        >
          AI 助手
        </el-button>

        <!-- 语言切换按钮 -->
        <el-switch
          v-model="isZhCN"
          active-text="中"
          inactive-text="EN"
          inline-prompt
          @change="handleLocaleChange"
        />

        <!-- 夜间模式切换 -->
        <el-button
          text
          :icon="appStore.isDark ? SunnyIcon : MoonIcon"
          @click="appStore.toggleDark()"
          title="夜间模式"
        />

        <!-- 登录/用户区 -->
        <template v-if="authStore.isLoggedIn">
          <el-button text size="small" @click="handleLogout">登出</el-button>
          <span class="header__username">{{ authStore.username }}</span>
        </template>
        <el-button v-else text size="small" @click="router.push('/login')">
          登录
        </el-button>

        <!-- 移动端菜单按钮（桌面端隐藏） -->
        <el-button
          class="header__mobile-btn"
          :icon="MenuIcon"
          @click="appStore.toggleSidebar()"
          circle
        />
      </div>
    </div>
  </header>
</template>

<!--
  script setup lang="ts": Vue3 Composition API 的 <script setup> 语法糖
  特点：顶层变量自动暴露给模板，无需 return
-->
<script setup lang="ts">
// ============================================================
// 导入
// ============================================================
import { ref, computed } from 'vue'           // Vue3 响应式 API
import { useRoute, useRouter } from 'vue-router'         // 获取当前路由信息
import { useAppStore } from '@/stores/app'    // 全局状态
import { useAuthStore } from '@/stores/auth'  // 认证状态
import { Menu as MenuIcon, Edit as EditIcon, Sunny as SunnyIcon, Moon as MoonIcon } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'            // 国际化 hook

// ============================================================
// 初始化和状态
// ============================================================
const route = useRoute()           // 当前路由对象
const router = useRouter()       // 编程式导航
const appStore = useAppStore()     // Pinia store
const authStore = useAuthStore()   // 认证 store
const { locale } = useI18n()       // i18n 实例（解构出 locale）

// isZhCN: 是否中文模式（绑定到 el-switch）
// ref 是 Vue3 创建响应式数据的函数
const isZhCN = ref<boolean>(appStore.locale === 'zh-CN')

// ============================================================
// 计算属性：当前激活的菜单项
// route.path 变化时自动更新
// ============================================================
const activeMenu = computed<string>(() => {
  return route.path
})

// ============================================================
// 方法
// ============================================================

/**
 * 语言切换处理
 * 同时更新：Pinia store、vue-i18n、localStorage、Element Plus 配置
 */
function handleLocaleChange(value: string | number | boolean): void {
  // value 是 el-switch 传来的值（true=中文, false=英文）
  const lang = value ? 'zh-CN' : 'en-US'
  appStore.setLocale(lang)     // 更新 Pinia
  locale.value = lang          // 更新 vue-i18n
}

/** 跳转到写文章页面 */
function goToEditor(): void {
  router.push('/articles/new')
}

/** 登出 */
function handleLogout(): void {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 60px;
}

.header__logo {
  display: flex;
  align-items: center;
  margin-right: 30px;
  gap: 8px;
}
.logo__img {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}
.logo__text {
  font-size: 22px;
  font-weight: bold;
  color: #c8754a;
}

.header__menu {
  flex: 1;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header__username {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.header__mobile-btn { display: none; }

@media (max-width: 768px) {
  .header__menu { display: none; }
  .header__mobile-btn { display: inline-flex; }
}
</style>
