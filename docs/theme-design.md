# Modern 主题设计与管理

## 纸感与中文排版增量设计

在 Modern 蓝色强调色和主题管理不变的基础上，浅色背景改为低饱和纸白，深色保留炭灰。背景以本地小尺寸 SVG 纸纹平铺，只放在内容后方，不覆盖文字或拦截点击；导航支持轻量 backdrop-filter，不支持时保持不透明底色。高对比偏好、强制颜色和打印模式关闭纹理与磨砂。

正文使用系统中文黑体栈（苹方、思源黑体/Noto CJK、微软雅黑回退），阅读标题使用宋体风格栈（思源宋体/Noto Serif CJK、宋体类回退），不强制下载外部字体。中文取消英文式负字距，标题采用 600 字重、正文约 1.9 倍行高；代码保持独立等宽字体。最终字体取决于设备安装情况，不能保证跨平台字形完全一致。

验证目标：现有对比度测试继续通过；检查纹理资产、装饰层不接管交互、辅助模式降级和代码字体隔离。源码检查不替代浏览器视觉评审。

本轮结果：字体与纸纹调整后，typecheck、12 项测试和生产构建通过；lint 为 0 error、8 个已有 warning。纸纹为本地 SVG，无外部字体请求；测试检查静态背景色对比度，不代表纹理合成后每个像素的对比度。环境未发现 Chrome/Chromium，尚未进行浏览器截图、纹理渲染性能或实际字形评审。构建仍有历史大 chunk 警告。

文章阅读页已增加自动目录：从 Markdown H1–H3 生成稳定唯一锚点；桌面端显示右侧目录，移动端可展开；滚动高亮当前标题，目录点击同步 URL hash。无标题的文章不显示目录，浏览器不支持 IntersectionObserver 时仍可使用锚点链接。

Markdown 语法主题现为自定义 `Newsprint`：编辑器通过 `preview-theme="newsprint"` 使用本地 `.newsprint-theme`，文章阅读区使用同一组变量。亮色为纸白/墨色/砖红，暗色为炭黑/暖灰/浅红；代码块、引用、表格和链接不复用亮色背景，且自动测试正文对比度 ≥4.5:1。

## 品牌标识更新

导航、页脚与 favicon 使用统一的「开合代码括号 + P」矢量标识：括号表达开放和技术，P 对应 Panda。标识颜色使用主题 token，深浅主题自动适配；浏览器图标使用独立的固定深色底色和浅蓝 P，确保小尺寸可识别。旧 `/panda.png` 保留为静态文件以避免破坏可能的外部直接链接，但站点代码不再引用它。

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
| 正文背景（纸感适配） | #F7F6F2 | #1F1F1F |
| 面板背景（纸感适配） | #F0EFEB | #181818 |
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