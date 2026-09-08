# OpenPanda 文档入口

## 本轮重构（2026-09-08）

本轮先交付设计与验收计划，不代表业务重构已经实现。阅读顺序：

1. [重构设计](/home/hy/work/other/openpanda/docs/refactor-design.md)：产品、视觉、架构和技术选型。
2. [阶段与验收](/home/hy/work/other/openpanda/docs/refactor-roadmap.md)：阶段依赖、交付物、量化门槛和回滚。
3. [现状审计](/home/hy/work/other/openpanda/docs/refactor-baseline.md)：代码证据与实际检查结果。
4. [Modern 主题设计](/home/hy/work/other/openpanda/docs/theme-design.md)：VS Code 配色参考、主题状态与验收，替代原暖色方案。

以上采用当前工作区绝对路径。当前已开始实施，最新实际进度见 [第一轮实施记录](/home/hy/work/other/openpanda/docs/reports/2026-09-08-implementation.md)；设计路线图中的初始状态不代表实时进度。涉及新框架的内容是候选方案，不是已安装依赖。

## 文档优先级

新一轮实施以本轮设计和验收计划为准；描述当前行为时以代码及实测为准。历史文档继续保留，不能把历史勾选项当作本轮验收证据。

- `/home/hy/work/other/openpanda/docs/requirements.md`：历史需求；其中“技术栈固定不变”不再作为本轮选型约束。
- `/home/hy/work/other/openpanda/docs/architecture.md`：历史架构；Redis 在部署中存在，但未发现当前后端实际缓存调用。
- `/home/hy/work/other/openpanda/docs/design.md`：历史功能说明，路由及字段有漂移。
- `/home/hy/work/other/openpanda/docs/backend-api.md` 与 `/home/hy/work/other/openpanda/docs/frontend-api.md`：接口参考，阶段一需逐项对齐实现。
- `/home/hy/work/other/openpanda/docs/build-and-deploy.md` 与 `/home/hy/work/other/openpanda/docs/data-safety.md`：历史运维参考，真实恢复演练前不得认为备份可靠。

本轮不修改环境密钥、生产数据或未跟踪的 `/home/hy/work/other/openpanda/monkeytype/`。