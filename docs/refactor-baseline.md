# 重构现状审计

日期：2026-09-08。范围：主博客的受版本控制代码；未访问生产站点和数据库，未进行浏览器截图或 Lighthouse 测试。视觉判断来自模板与 CSS，不是线上截图评审。

## 实际技术栈

前端为 Vue 3、TypeScript、Vite 5、Vue Router、Pinia、Axios、Element Plus、vue-i18n、marked、md-editor-v3；后端为 Go、Gin、GORM、JWT；存储为 PostgreSQL，部署为 Docker Compose/Nginx。版本范围来自两个 package.json 和 go.mod，不能等同于依赖锁定的实际版本。

Node.js 是当前前端构建环境，不是博客业务 API 运行时。没有“Node.js 中最好”的统一技术；视觉质量也不是换语言可以解决的。

## 证据与优先级

| 优先级 | 发现 | 代码证据（绝对路径） | 对策 |
| --- | --- | --- | --- |
| P0 | 匿名详情只检查 is_public，没有同时检查 is_published；存在公开草稿泄漏风险，需构造数据复现 | `/home/hy/work/other/openpanda/Backend/controller/article_controller.go`，GetArticleDetail | 先写权限矩阵回归测试，再统一公开内容策略 |
| P0 | Markdown 解析后直接进入 v-html，当前渲染路径未见清洗 | `/home/hy/work/other/openpanda/Frontend/src/views/Article/Detail.vue` | 定义 HTML/URL 白名单；覆盖 XSS 样例；清洗方案选型后才引依赖 |
| P1 | 分类更新接收 URL ID，却按输入 slug 查询实体 | `/home/hy/work/other/openpanda/Backend/controller/article_controller.go`，UpdateCategory | 按 ID 定位、校验 slug 唯一性，覆盖跨记录更新场景 |
| P1 | 管理列表依然过滤 is_published=true | `/home/hy/work/other/openpanda/Backend/service/article_service.go`，GetAdminList | 定义并验证完整草稿工作流 |
| P1 | Service 直接持有公开的 GORM DB，文章与分类服务同文件 | `/home/hy/work/other/openpanda/Backend/service/article_service.go` | 按业务模块组织；用例依赖窄接口 |
| P1 | 启动时 AutoMigrate 与种子写入 | `/home/hy/work/other/openpanda/Backend/main.go` | 生产改为独立版本化迁移及显式初始化 |
| P1 | 前端全局注册 Element Plus，公开阅读与管理共用入口 | `/home/hy/work/other/openpanda/Frontend/src/main.ts` | 区分布局和业务包，公开页不加载编辑器与管理 UI |
| P1 | 内容 onMounted 请求，路由标题是通用标题；localStorage 直接在 store 初始化读取 | `/home/hy/work/other/openpanda/Frontend/src/views/Article/Detail.vue`、`/home/hy/work/other/openpanda/Frontend/src/stores/app.ts` | SSR 候选验证；隔离浏览器 API、每请求状态 |
| P1 | CI 构建推送后部署 latest，无测试任务；force-recreate 不能证明零停机 | `/home/hy/work/other/openpanda/.github/workflows/deploy.yml` | PR 门禁、固定 SHA 发布、健康检查和回滚演练 |
| P2 | 大面积渐变、通用卡片、单行截断摘要，首页 h1 被注释 | `/home/hy/work/other/openpanda/Frontend/src/views/Home/index.vue` | 内容优先排版、语义链接、恢复标题层级 |
| P2 | 全局主题变量与页面硬编码 #333/#666/#999 并存 | `/home/hy/work/other/openpanda/Frontend/src/styles/index.css`、`/home/hy/work/other/openpanda/Frontend/src/views/Article/Detail.vue` | 语义 token、双主题完整验收 |
| P2 | Redis 在 Compose 声明，但 go.mod 无 Redis 客户端，阅读量直接写 PostgreSQL | `/home/hy/work/other/openpanda/Backend/go.mod`、`/home/hy/work/other/openpanda/Backend/service/article_service.go` | 不把计划中的缓存写成已实现 |
| P2 | 根构建脚本含 Windows set/server.exe | `/home/hy/work/other/openpanda/package.json` | 阶段一统一跨平台命令 |

## 实际检查

环境：Linux，Node v24.18.1，npm 11.16.0，Go 1.26.3；使用已有依赖，没有重新安装或升级。

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| Vite 生产构建 | `cd /home/hy/work/other/openpanda/Frontend && npm run build -- --outDir /tmp/openpanda-refactor-baseline-dist` | 复验退出码 0，built in 6.68s；存在大 chunk 警告 |
| 类型检查 | `cd /home/hy/work/other/openpanda/Frontend && ./node_modules/.bin/vue-tsc --noEmit` | 退出码 1，vue-tsc 报 supportedTSExtensions 搜索失败；工具链兼容性问题，不能据此判断业务类型是否通过 |
| Go 测试入口 | `cd /home/hy/work/other/openpanda/Backend && go test ./...` | 退出码 0，但所有包均为 [no test files]，不代表业务测试通过 |

构建日志最大 index JS chunk 为 1,184.92 kB，gzip 395.83 kB；Editor chunk gzip 264.95 kB。它们是产物体积，不是页面首次加载总量，后续需浏览器网络测量。日志位于 `/tmp/openpanda-refactor-build.log`、`/tmp/openpanda-refactor-types.log`、`/tmp/openpanda-refactor-go.log`，临时文件不作为长期验收存档。

当前没有可报告的覆盖率、线上 CWV、RPS、恢复时间或视觉评分。未启动后端，避免连接未知数据库并触发 AutoMigrate。已存在 sitemap 路由，后续是验证和完善，而非从零增加。