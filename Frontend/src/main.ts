// ============================================================
// 文件: main.ts
// 说明: 前端入口文件（整个应用的启动点）
//       负责：创建 Vue 应用 → 注册插件 → 挂载到 HTML
//
// 执行顺序：
//   1. 引入并创建 Vue 应用
//   2. 注册路由（router）
//   3. 注册状态管理（pinia）
//   4. 注册国际化（i18n）
//   5. 注册 UI 框架（Element Plus）
//   6. 引入全局样式
//   7. 挂载到 #app
// ============================================================
import { createApp } from 'vue'          // Vue3 的核心创建函数
import App from './App.vue'             // 根组件
import router from './router'            // 路由配置
import { createPinia } from 'pinia'     // Pinia 状态管理
import i18n from './i18n'               // 国际化配置
import ElementPlus from 'element-plus'  // Element Plus UI 框架
import 'element-plus/dist/index.css'    // Element Plus 样式
import './styles/index.css'             // 全局自定义样式

// ============================================================
// 1. 创建 Vue 应用实例
// ============================================================
const app = createApp(App)

// ============================================================
// 2. 注册插件（use 是 Vue 的插件安装方法）
// ============================================================
app.use(createPinia())    // 状态管理（必须在 router 之前注册）
app.use(router)           // 路由
app.use(i18n)             // 国际化
app.use(ElementPlus)      // UI 组件库

// ============================================================
// 3. 挂载到 HTML 中的 #app 元素（index.html 中的 <div id="app">）
//    挂载后，Vue 会接管此元素内的所有内容
// ============================================================
app.mount('#app')
