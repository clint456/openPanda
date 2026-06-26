// ============================================================
// 文件: types/index.ts
// 说明: 全局 TypeScript 类型/接口定义
//       项目中所有共用的数据类型都定义在这里
//       拓展方式：
//         1. 在此文件新增 interface
//         2. 或按模块拆分文件（如 types/article.ts），然后从此文件 re-export
// ============================================================

// ============================================================
// 基础类型
// ============================================================

/** 文章分类 */
export interface Category {
  id: number        // 分类ID
  name: string      // 分类名称
  slug: string      // URL友好标识（如 embedded-linux）
  description: string // 分类描述
  sort_order: number  // 排序序号（数字越小越靠前）
  created_at: string  // 创建时间（ISO格式字符串）
  updated_at: string  // 更新时间
}

/** 文章标签 */
export interface Tag {
  id: number
  name: string      // 标签名（如 STM32, ESP32, FreeRTOS）
  slug: string      // URL友好标识
  created_at: string
  updated_at: string
}

/** 文章 */
export interface Article {
  id: number
  title: string         // 标题
  slug: string          // URL标识
  content: string       // 正文（富文本HTML）
  summary: string       // 摘要
  cover_image: string   // 封面图URL
  category_id: number   // 所属分类ID
  view_count: number    // 阅读量
  is_published: boolean // 是否已发布
  language: 'zh' | 'en' | 'both'  // 语言（联合类型，只能是这三个值之一）
  created_at: string
  updated_at: string
  // 关联数据（后端预加载后返回）
  category?: Category   // ?: 表示可选属性
  tags?: Tag[]          // Tag[] 表示 Tag 类型的数组
}

// ============================================================
// 分页类型（泛型）
// 泛型<T> 表示可以适配任意数据类型
// 例如：PaginatedData<Article> 表示文章分页数据
//       PaginatedData<Comment> 表示评论分页数据
// ============================================================

/** 分页数据结构 */
export interface PaginatedData<T> {
  list: T[]       // T[] 泛型数组：当前页的数据列表
  total: number   // 总记录数
  page: number    // 当前页码
  page_size: number // 每页条数
}

// ============================================================
// API 请求参数类型
// ============================================================

/** 文章列表查询参数 */
export interface ArticleListParams {
  page?: number       // 页码（?: 表示可选参数）
  page_size?: number  // 每页条数
  category_id?: number // 分类ID筛选
  tag_id?: number     // 标签ID筛选
}

/** 文章搜索参数 */
export interface ArticleSearchParams {
  keyword: string     // 搜索关键词（必填）
  page?: number
  page_size?: number
}

/** 创建/更新文章参数 */
export interface ArticleFormData {
  title: string
  content: string
  summary?: string
  cover_image?: string
  category_id: number
  tag_ids?: number[]
  language?: 'zh' | 'en' | 'both'
}

// ============================================================
// API 响应类型
// ============================================================

/** 后端统一返回结构 */
export interface ApiResponse<T = unknown> {
  // <T = unknown> 泛型默认值，不指定类型时视为 unknown
  code: number      // 业务状态码（200 = 成功）
  message: string   // 提示信息
  data: T           // 实际数据，类型由调用者决定
}

// ============================================================
// 后续拓展示例（删除注释即可使用）：
// ============================================================

// /** 用户信息 */
// export interface User {
//   id: number
//   username: string
//   email: string
//   avatar: string
//   created_at: string
// }

// /** 评论 */
// export interface Comment {
//   id: number
//   article_id: number
//   content: string
//   user_id: number
//   user?: User         // 关联的用户信息
//   created_at: string
// }
