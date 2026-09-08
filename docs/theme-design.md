# Modern 主题设计与管理

日期：2026-09-08。本设计替代重构设计中暖色主题的初稿，保留阅读排版。

## 来源与范围

参考 VS Code 官方仓库 main 分支的 Dark Modern / Light Modern（本次读取，不声称是独立的“2026 版”或固定发布版本）：

- https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_modern.json
- https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/light_modern.json
- https://code.visualstudio.com/docs/configure/themes

参考的是 UI 语义颜色与主题偏好管理，不复制编辑器布局、语法主题或扩展系统。官方文件还继承 dark_plus/light_plus，本轮仅使用 Modern 文件中明确声明的 UI 颜色。

## 颜色层次

| 语义 | Light Modern | Dark Modern |
| --- | --- | --- |
| 正文背景 | #FFFFFF | #1F1F1F |
| 面板背景 | #F8F8F8 | #181818 |
| 正文文字 | #3B3B3B | #CCCCCC |
| 次文字（博客适配） | #616161 | #9D9D9D |
| 装饰边框 | #E5E5E5 | #2B2B2B |
| 输入框背景 | #FFFFFF | #313131 |
| 链接 | #005FB8 | #4DAAFC |
| 按钮背景 / 文字 | #005FB8 / #FFFFFF | #0078D4 / #FFFFFF |
| 焦点 | #005FB8 | #0078D4 |

链接与按钮使用不同 token，不能用链接色作为深色按钮背景再套页面背景色文字。装饰边框不承担交互识别；表单边框和焦点需单独处理。主题注册在 `/home/hy/work/other/openpanda/Frontend/src/styles/themes.css`，布局只消费语义 token，旧变量作为兼容别名。Element Plus 和 Markdown 编辑器复用同一 resolved theme，不各存一套偏好。

## 状态与生命周期

- preference：system/light/dark；resolved theme：light/dark。明确选择优先于系统。
- 默认 system；旧 localStorage.theme=light/dark 继续有效；非法值退回 system。
- 监听 prefers-color-scheme 的 change；显式主题不受系统变化影响。
- storage 事件同步其他标签页设置，包括删除设置/清空存储；存储不可用时使用本页内存，不阻断渲染。
- 运行时统一写 html[data-theme]、color-scheme、Element Plus 的 dark class；监听器可注销，重复初始化先清理。
- HTML head 的小型同步脚本在应用加载前设置首屏主题，CSS 在脚本不可用时也按系统偏好兜底。该脚本只负责启动快照，不能另存第二套主题状态。
- CSP 若将来禁用 inline script，应提供 nonce/hash 或独立同步脚本，不放宽整个 CSP。

## 验收

1. 三个选项可键盘选择、有中英文可访问名称；不新增主题库。
2. 测试覆盖默认/非法/历史值、显式覆盖、系统变化、跨标签页、存储异常、注销及首屏脚本。
3. 对主题定义中的正文、次文字、链接、按钮进行自动对比度检查，普通文字目标 ≥4.5:1。
4. 类型检查、测试、lint、生产构建通过；浏览器截图与全站历史硬编码颜色清理另行记录，不把单元测试当成全站视觉验收。

当前不提供任意 JSON 导入、自定义颜色编辑器、任意数量主题的首选深浅配对；只有一对 Modern 主题，保留可扩展 token 边界而不预建复杂设置系统。

## 本轮实测与限制

后续修复：About 页不是 Markdown 渲染，而是独立 Vue 模板；其内容分区、技能卡片、文字和边框原先硬编码浅色。现已全部使用语义主题变量，并增加源码级回归检查，禁止该页重新引入固定颜色。此检查不能代替浏览器截图验收。

同步修复 Markdown 编辑页表单背景、编辑器边框与全屏容器的固定白色，增加对应主题绑定检查。

已实现三选项主题选择、系统监听、跨标签页同步、首屏脚本、生命周期清理、CSS token 与 Element Plus 深色适配；Markdown 编辑器绑定 resolvedTheme，AI 代码块使用统一语义颜色。

Node 24 环境下类型检查、8 项测试（含原有 3 项 Markdown 测试）、生产构建通过；lint 0 error、8 个已有 warning。对比度检查读取实际主题 CSS，覆盖两套主题的正文/次文字/链接在页面和面板上的组合及按钮常态/悬停，均 ≥4.5:1。未进行浏览器截图和全站交互验收；历史页面仍可能存在硬编码样式。现有大包警告与依赖安全问题不在本轮主题变更中解决。

存储异常兜底保证的是主题控制器本身；认证和语言模块仍有历史 localStorage 直接访问，不能据此宣称整个应用在禁用存储时已验收。首屏脚本减少主题闪烁，但真实浏览器闪烁测量尚未进行。