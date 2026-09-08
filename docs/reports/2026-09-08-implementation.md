# 第一轮实施记录

状态：部分交付，不能视为六阶段全部完成。日期：2026-09-08。工作区未提交，无发布 SHA；未访问生产数据库或执行部署。

## 已实施

- 修复详情匿名草稿泄漏风险，领域函数统一详情可读策略；详情响应 no-store。
- JWT 固定 HS256、强制过期声明、验证用户 ID 类型/范围，拒绝无 user_id 的签名 token，不再 panic。
- 分类更新按 URL ID 定位，slug 冲突返回 409；管理列表包含草稿。
- controller 使用用例接口，新增无数据库 HTTP 回归测试；新增独立内容领域包。这是模块化起点，不是完整 repository 重构。
- TypeScript 固定 5.3.3，修复现有编辑器类型解析及 strikeThrough 工具栏拼写；增加 typecheck/test/check 命令。
- 文章和 AI 输出共用安全 Markdown 渲染，拒绝危险 URL；使用现有 marked 和 Node 内置测试，无新增框架依赖。
- 新首页、导航、可展开移动菜单、跳转正文链接、页脚、独立管理导航、语义主题 token、正文排版。
- 文章/分类共用 ArticleCollection、ArticleRow；查询与分页进入 URL；处理过期请求、加载/错误/空状态；首页请求逻辑抽为 composable。
- CI 增加质量检查，部署工作流必须等待检查成功才能构建推送。
- 根后端启动/构建脚本改为跨平台 Go 命令。

## 明确的兼容性变化

原始 HTML 在文章和 AI Markdown 中显示为转义文本，不继续执行内嵌 HTML。这是保守安全策略，不是通用 HTML 白名单清洗器。Markdown 标题、代码、列表、表格、安全链接和图片继续可用。旧文章如依赖 HTML 排版需迁移审核。

公开列表登录后仍显示管理文章（延续原行为），搜索仍只检索公开已发布文章，UI 已注明。隐藏开关保留在详情页。前端新模块仍引用旧 API/types，尚未完成全部模块边界迁移。

## 本地验证

环境 Linux、Node 24.18.1、Go 1.26.3；已有依赖基础上安装固定 TypeScript 版本并更新锁文件。

- `cd /home/hy/work/other/openpanda/Frontend && npm run typecheck`：通过。
- `cd /home/hy/work/other/openpanda/Frontend && npm test`：3 项 Markdown 测试通过。
- `cd /home/hy/work/other/openpanda/Frontend && npm run lint`：0 error，8 warning（包含历史属性顺序、any 与受控 v-html 提示）。
- `cd /home/hy/work/other/openpanda/Frontend && npm run build -- --outDir /tmp/openpanda-implementation-dist`：通过；最大 index JS gzip 394.92 kB，仍有大包警告，未达到 200KiB 首屏预算。
- `cd /home/hy/work/other/openpanda/Backend && go test -race ./...`：通过；包含 15 个详情权限子场景及分类定位/冲突测试。
- `cd /home/hy/work/other/openpanda/Backend && go vet ./...`：通过。
- `npm audit --omit=dev`：6 项（3 moderate、3 high），不能宣称依赖安全验收通过；不能直接执行 force 升级绕过兼容验证。

日志临时位置：`/tmp/openpanda-implementation-build.log`、`/tmp/openpanda-lint.log`、`/tmp/openpanda-audit.json`。本报告保存摘要；完整 CI 证据待提交后生成。

## 阶段状态与剩余项

| 阶段 | 状态 | 仍需完成 |
| --- | --- | --- |
| 0 | 待确认 | 用户视觉方向确认、原版浏览器截图与性能基线 |
| 1 | 进行中 | 依赖漏洞处置、真实 PostgreSQL 集成测试、迁移与恢复演练、上传安全审查 |
| 2 | 进行中 | 36 组浏览器截图、对比度实测、用户评分、目录/代码复制、更多页面双语主题整理 |
| 3 | 进行中 | repository 边界、其他业务模块、契约、迁移命令、数据对账及覆盖率门槛 |
| 4 | 未开始 | SSR PoC/ADR、HTML SEO、公开入口移除全局管理组件包、真实性能测试 |
| 5 | 未开始 | 固定 SHA 切流、监控、24h 观察、数据库与上传恢复及回滚演练 |

当前环境未发现 Chrome/Chromium 命令；没有执行浏览器视觉验收。不能把 CSS 阅读和 Vite 编译替代真实浏览器交互验证。未安装 Nuxt、未实现 SSR、未修改数据库 schema，未声称生产可发布。

## 回退

按代码变更回退前端可恢复旧界面；数据库和上传文件未变更。后端安全修复应保留，不能把旧草稿泄漏行为作为正常回退基线。未跟踪的第三方 `/home/hy/work/other/openpanda/monkeytype/` 未修改。