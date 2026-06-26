# 详细功能设计文档

## 平台定位

面向嵌入式、硬件开发、单片机技术爱好者的个人技术博客与交流站点。

三大核心内容板块：
1. **嵌入式 Linux** — 驱动开发、系统移植、内核调试
2. **硬件电路设计** — 原理图、PCB、信号完整性
3. **单片机开发** — STM32、ESP32、外设驱动

---

## 已实现功能清单

### 文章系统
- [x] Markdown 撰写文章（md-editor-v3 编辑器）
- [x] 粘贴/拖入图片自动上传
- [x] 文章列表（分页、按分类筛选、搜索）
- [x] 文章详情（Markdown → HTML 渲染）
- [x] 编辑文章
- [x] 删除文章（弹窗确认）
- [x] 热门文章（按阅读量排序）
- [x] 阅读量统计

### 专栏分类
- [x] 首页动态加载分类卡片
- [x] 分类文章列表页 `/category/:slug`
- [x] 后台分类管理（增删改查）
- [x] 写文章时选择分类

### 用户认证
- [x] JWT 登录/登出
- [x] 路由守卫（未登录拦截）
- [x] Token 自动附加 + 过期处理
- [x] 管理员凭据环境变量配置

### 国际化
- [x] 全站中英文切换
- [x] 语言偏好持久化
- [x] Element Plus 组件语言同步

### 主题
- [x] 暖橙主色调（`#c8754a`）
- [x] 夜间模式（一键切换 + 持久化）
- [x] 高对比度文字

### 部署
- [x] Docker 镜像（前端 Nginx + 后端 Alpine）
- [x] docker-compose 一键编排
- [x] npm 脚本自动化构建推送
- [x] 生产环境部署配置

---

## 数据库表结构

### articles（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PK | 主键 |
| title | VARCHAR(255) | 标题（索引） |
| slug | VARCHAR(255) | URL 标识（唯一） |
| content | TEXT | Markdown 正文 |
| summary | VARCHAR(500) | 摘要 |
| cover_image | VARCHAR(500) | 封面图 URL |
| category_id | INT | 分类外键（索引） |
| view_count | INT | 阅读量 |
| is_published | BOOL | 是否发布（索引） |
| language | VARCHAR(10) | zh/en/both |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### categories（分类）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PK | 主键 |
| name | VARCHAR(100) | 名称（唯一） |
| slug | VARCHAR(100) | URL 标识（唯一） |
| description | VARCHAR(500) | 描述 |
| sort_order | INT | 排序 |

### tags（标签）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PK | 主键 |
| name | VARCHAR(100) | 名称（唯一） |
| slug | VARCHAR(100) | URL 标识（唯一） |

### article_tags（文章-标签关联）

| 字段 | 类型 |
|------|------|
| article_id | FK → articles |
| tag_id | FK → tags |

---

## 路由结构

### 前端路由

| 路径 | 页面 | 认证 |
|------|------|------|
| `/` | 首页 | 否 |
| `/articles` | 文章列表 | 否 |
| `/articles/:id` | 文章详情 | 否 |
| `/articles/new` | 新建文章 | **是** |
| `/articles/:id/edit` | 编辑文章 | **是** |
| `/category/:slug` | 分类文章 | 否 |
| `/login` | 登录 | 否 |
| `/admin/categories` | 分类管理 | **是** |

### 后端路由

| 方法 | 路径 | 认证 |
|------|------|------|
| POST | `/api/v1/login` | 否 |
| GET | `/api/v1/auth/me` | 是 |
| GET | `/api/v1/articles` | 否 |
| GET | `/api/v1/articles/hot` | 否 |
| GET | `/api/v1/articles/search` | 否 |
| GET | `/api/v1/articles/:id` | 否 |
| POST | `/api/v1/admin/articles` | 是 |
| PUT | `/api/v1/admin/articles/:id` | 是 |
| DELETE | `/api/v1/admin/articles/:id` | 是 |
| POST | `/api/v1/admin/upload/image` | 是 |
| GET | `/api/v1/categories` | 否 |
| POST | `/api/v1/admin/categories` | 是 |
| PUT | `/api/v1/admin/categories/:id` | 是 |
| DELETE | `/api/v1/admin/categories/:id` | 是 |
| GET | `/health` | 否 |

---

## 后续可拓展功能

- [ ] 用户注册/多用户系统
- [ ] 评论系统
- [ ] 点赞/收藏
- [ ] RSS 订阅
- [ ] 全文搜索（Elasticsearch）
- [ ] 访问统计面板
- [ ] 资源下载/附件
- [ ] 项目作品集展示
