# 架构设计文档

## 总体架构

```
┌──────────────────────────────────────────────────────┐
│                    用户浏览器                          │
│               http://your-domain.com                  │
└────────────┬────────────────────────────┬────────────┘
             │                            │
             ▼                            ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   Nginx (Frontend)   │    │    Gin (Backend)          │
│   Port: 80           │◄───│    Port: 8080             │
│   Vue3 SPA 静态托管   │    │    RESTful API            │
│   /api/* → backend   │    │    JWT 认证               │
│   /uploads/* → backend│   │    图片上传               │
└──────────────────────┘    └──────┬────────┬──────────┘
                                   │        │
                                   ▼        ▼
                          ┌──────────┐ ┌──────────┐
                          │PostgreSQL│ │  Redis   │
                          │ Port:5432│ │Port:6379 │
                          │ 主业务库  │ │  缓存    │
                          └──────────┘ └──────────┘
```

## 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 前端框架 | Vue 3 + TypeScript | 3.4+ | 严格类型 SPA |
| 构建工具 | Vite | 5.0+ | HMR 开发 + 生产构建 |
| UI 库 | Element Plus | 2.4+ | 组件库 |
| 路由 | Vue Router 4 | 4.2+ | SPA 路由 |
| 状态管理 | Pinia | 2.1+ | 全局状态 |
| HTTP 客户端 | Axios | 1.6+ | 封装泛型请求 |
| 国际化 | vue-i18n | 9.8+ | 中英双语 |
| Markdown | md-editor-v3 | 3.0+ | 文章编辑器 |
| Markdown 解析 | marked | latest | 文章渲染 |
| 后端框架 | Gin | 1.9+ | HTTP 路由 |
| ORM | GORM v2 | 1.25+ | 数据库操作 |
| 认证 | golang-jwt | 5.2+ | JWT Token |
| 数据库 | PostgreSQL | 16 | 主存储 |
| 缓存 | Redis | 7 | 热点数据 |
| 反向代理 | Nginx | 1.25 | 生产部署 |

## 前端分层架构

```
src/
├── api/           # API 层
│   ├── index.ts           # Axios 实例 + 拦截器
│   └── modules/           # 按业务模块拆分
│       ├── article.ts     # 文章 CRUD
│       ├── auth.ts        # 登录认证
│       └── upload.ts      # 图片上传
├── stores/        # 状态管理层（Pinia）
│   ├── app.ts             # 语言/主题
│   └── auth.ts            # 登录态
├── router/        # 路由层
│   └── index.ts           # 路由配置 + 守卫
├── views/         # 视图层（页面）
│   ├── Home/              # 首页
│   ├── Article/           # 文章CRUD
│   ├── Category/          # 分类/专栏
│   └── Login/             # 登录
├── components/    # 通用组件
├── i18n/          # 国际化
├── types/         # TS 类型定义
└── utils/         # 工具函数
```

## 后端分层架构

```
Backend/
├── main.go        # 入口：DB 连接 → 迁移 → 路由 → 启动
├── config/        # 配置层（环境变量）
├── router/        # 路由注册层
├── controller/    # 控制层（HTTP 处理）
├── service/       # 业务逻辑层
├── model/         # 数据模型层（GORM）
├── middleware/     # 中间件（CORS/JWT）
└── utils/         # 工具（统一返回格式）
```

## 数据流

```
用户操作 → Vue 组件 → API 模块 → Axios → HTTP
    → Gin Router → Middleware(CORS/JWT) → Controller
        → Service → GORM → PostgreSQL
                     ↓
                  返回 JSON → 响应拦截器 → 组件更新
```

## 认证流程

```
POST /api/v1/login { username, password }
    → 校验 ADMIN_USERNAME/ADMIN_PASSWORD 环境变量
    → 签发 JWT（24h 过期）
    → 前端存 localStorage

后续请求:
    Axios 拦截器自动附加 Authorization: Bearer <token>
    → JWTAuthMiddleware 验证
    → 放行 /admin/* 路由
```
