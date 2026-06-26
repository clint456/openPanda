<!--
  文件: App.vue
  说明: Vue 应用的根组件（所有页面的最外层容器）
        模板中使用 Element Plus 的 el-config-provider 实现全局配置
        <router-view /> 是路由出口，根据当前 URL 显示对应的页面组件

  Vue 单文件组件(.vue) 结构：
    <template>    → HTML 模板（视图层）
    <script>      → JS/TS 逻辑（逻辑层）
    <style>       → CSS 样式（样式层）
-->
<template>
  <!--
    el-config-provider: Element Plus 的全局配置组件
    locale: 设置 Element Plus 组件内部的文字语言
    size: 设置组件默认尺寸（default / small / large）
  -->
  <el-config-provider :locale="elementLocale">
    <!--
      DefaultLayout: 默认布局组件（顶部导航 + 主体内容 + 页脚）
      后续可按路由切换不同布局，例如：
        <AdminLayout v-if="isAdminRoute" />
        <DefaultLayout v-else />
    -->
    <DefaultLayout>
      <!-- router-view: 路由出口，当前匹配的页面组件会渲染在这里 -->
      <router-view />
    </DefaultLayout>
  </el-config-provider>
</template>

<!--
  script setup lang="ts": Vue3 Composition API + TypeScript
  setup 是语法糖，无需手动 return，顶层绑定自动暴露给模板
  lang="ts" 表示使用 TypeScript
-->
<script setup lang="ts">
// ============================================================
// 导入
// ============================================================
import { computed } from 'vue'                  // computed: 计算属性
import { useAppStore } from '@/stores/app'      // Pinia 全局状态
import DefaultLayout from '@/layouts/DefaultLayout.vue' // 默认布局组件
// Element Plus 的中英文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

// ============================================================
// 使用 Pinia Store
// ============================================================
const appStore = useAppStore()

// ============================================================
// 计算属性：根据当前语言返回 Element Plus 对应的语言包
// computed 会自动追踪依赖，当 appStore.locale 变化时重新计算
// ============================================================
const elementLocale = computed(() => {
  return appStore.locale === 'zh-CN' ? zhCn : en
})
</script>

<!--
  style: 全局样式（不加 scoped 表示全局生效）
  根组件的样式建议不加 scoped，用于设置全局 CSS 变量等
-->
<style>
/* 重置默认边距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 全局字体和颜色 */
body {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #232323;
  background-color: #faf7f3;
}

/* 链接默认样式 */
a {
  color: #c8754a;
  text-decoration: none;
}
a:hover {
  color: #a85d36;
}
</style>
