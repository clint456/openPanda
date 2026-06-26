// ============================================================
// 文件: router/index.ts
// 说明: Vue Router 路由配置
//       管理所有页面路由，支持懒加载（按需加载页面组件）
//
// 拓展方式：
//   1. 在 src/views/ 下新建页面组件
//   2. 在 routes 数组中添加路由配置
//   3. 如需路由守卫（如登录验证），在 router.beforeEach 中添加
//
// TypeScript 知识点：
//   RouteRecordRaw: Vue Router 的路由配置类型
//   () => import('...') 是动态导入，实现路由懒加载（减小首屏体积）
// ============================================================
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// ============================================================
// 路由配置
// meta 字段用于存储路由元信息（标题、是否需要认证等）
// ============================================================
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    // 路由懒加载：只有访问首页时才下载该组件代码
    component: () => import('@/views/Home/index.vue'),
    meta: {
      title: '首页', // 页面标题
    },
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('@/views/Article/List.vue'),
    meta: { title: '技术文章' },
  },
  {
    path: '/articles/new',       // 新建文章（必须放在 /:id 之前）
    name: 'ArticleCreate',
    component: () => import('@/views/Article/Editor.vue'),
    meta: { title: '撰写文章' },
  },
  {
    path: '/articles/:id/edit',  // 编辑文章（必须放在 /:id 之前）
    name: 'ArticleEdit',
    component: () => import('@/views/Article/Editor.vue'),
    meta: { title: '编辑文章' },
  },
  {
    path: '/articles/:id',  // :id 是动态路由参数
    name: 'ArticleDetail',
    component: () => import('@/views/Article/Detail.vue'),
    meta: { title: '文章详情' },
  },
  // 后续拓展示例：
  // {
  //   path: '/categories/:slug',
  //   name: 'CategoryArticles',
  //   component: () => import('@/views/Category/index.vue'),
  //   meta: { title: '分类文章' },
  // },
  // {
  //   path: '/admin/dashboard',
  //   name: 'AdminDashboard',
  //   component: () => import('@/views/Admin/Dashboard.vue'),
  //   meta: { title: '管理后台', requiresAuth: true },
  // },
  {
    // 404 页面：匹配所有未定义的路径
    path: '/:pathMatch(.*)*', // Vue Router 4 的 catch-all 写法
    name: 'NotFound',
    component: () => import('@/views/NotFound/index.vue'),
    meta: { title: '404' },
  },
]

// 创建路由实例
const router = createRouter({
  // history: 路由模式
  // createWebHistory: HTML5 History 模式（URL 干净，如 /articles/1）
  // createWebHashHistory: Hash 模式（URL 带 #，如 /#/articles/1）
  history: createWebHistory(),
  routes,
  // scrollBehavior: 路由切换时的滚动行为
  scrollBehavior(_to, _from, _savedPosition) {
    // 始终滚动到顶部
    return { top: 0 }
  },
})

// ============================================================
// 全局路由守卫
// beforeEach: 每次路由跳转前执行
// 用途：权限验证、页面标题更新等
// ============================================================
router.beforeEach((to, _from, next) => {
  // --- 更新页面标题 ---
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - OpenPanda`
  }

  // --- 后续可在此添加登录验证 ---
  // const token = localStorage.getItem('token')
  // if (to.meta.requiresAuth && !token) {
  //   // 需要登录但未登录，跳转登录页
  //   next('/login')
  //   return
  // }

  // next() 必须调用，否则路由不会生效
  next()
})

export default router
