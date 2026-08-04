// ============================================================
// 文件: views/Tools/toolsData.ts
// 说明: 工具库配置 — 所有工具的定义集中管理
//       添加新工具只需在此数组中新增一项即可
// ============================================================

export interface ToolItem {
  /** 工具唯一标识（用于路由 /tools/:id） */
  id: string
  /** 工具名称 */
  name: string
  /** 工具名称（英文） */
  nameEn: string
  /** 简短描述 */
  description: string
  /** 简短描述（英文） */
  descriptionEn: string
  /** Element Plus 图标名称 */
  icon: string
  /** nginx 反向代理路径 */
  proxyPath: string
  /** 标签颜色 */
  tagColor?: string
}

export const tools: ToolItem[] = [
  {
    id: 'word-recite',
    name: '考研单词默写',
    nameEn: 'Word Recite',
    description: '看中文释义默写英文单词，支持错题收录与乱序刷题',
    descriptionEn: 'Recite English words from Chinese hints, with mistake tracking & shuffle',
    icon: 'Reading',
    proxyPath: '/tool/recite/',
    tagColor: '#e2b714',
  },
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    nameEn: 'JSON Formatter',
    description: '在线 JSON 格式化、压缩、校验工具',
    descriptionEn: 'Online JSON format, compress, and validate tool',
    icon: 'Document',
    proxyPath: '/tool/json-formatter/',
    tagColor: '#6b9b6e',
  },
  {
    id: 'base64',
    name: 'Base64 编解码',
    nameEn: 'Base64 Encoder/Decoder',
    description: 'Base64 编码与解码在线工具',
    descriptionEn: 'Online Base64 encode and decode tool',
    icon: 'Key',
    proxyPath: '/tool/base64/',
    tagColor: '#6a8fa8',
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    nameEn: 'Timestamp Converter',
    description: 'Unix 时间戳与日期互转',
    descriptionEn: 'Convert between Unix timestamp and date',
    icon: 'Clock',
    proxyPath: '/tool/timestamp/',
    tagColor: '#d4a24e',
  },
  {
    id: 'regex',
    name: '正则表达式测试',
    nameEn: 'Regex Tester',
    description: '在线正则表达式测试与调试',
    descriptionEn: 'Online regex test and debug tool',
    icon: 'Search',
    proxyPath: '/tool/regex/',
    tagColor: '#c8754a',
  },
  {
    id: 'diff',
    name: '文本对比',
    nameEn: 'Text Diff',
    description: '两段文本差异对比工具',
    descriptionEn: 'Compare differences between two texts',
    icon: 'Files',
    proxyPath: '/tool/diff/',
    tagColor: '#e05555',
  },
  {
    id: 'color-picker',
    name: '颜色选择器',
    nameEn: 'Color Picker',
    description: '颜色选取、调色板与色值转换',
    descriptionEn: 'Color picker, palette and value conversion',
    icon: 'Brush',
    proxyPath: '/tool/color-picker/',
    tagColor: '#8e6bb9',
  },
]
