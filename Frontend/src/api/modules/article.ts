// ============================================================
// 文件: api/modules/article.ts
// 说明: 文章相关的 API 接口函数
//       按业务模块拆分 API 文件，每个模块对应后端一组接口
//
// 拓展方式：
//   1. 新建 api/modules/comment.ts（评论API）
//   2. 仿照此文件编写接口函数
//   3. 在页面中：import { getArticles } from '@/api/modules/article'
//
// TypeScript 知识点：
//   http.get<ApiResponse<PaginatedData<Article>>> 中的尖括号是泛型
//   告诉 Axios 返回的 response.data 是什么类型，获得完整的类型提示
// ============================================================
import http from '@/api'  // 导入封装好的 Axios 实例
import type {
  ApiResponse,
  Article,
  Category,
  PaginatedData,
  ArticleListParams,
  ArticleSearchParams,
  ArticleFormData,
} from '@/types'  // 导入类型定义

// ============================================================
// 文章接口
// ============================================================

/**
 * 获取文章列表（分页）
 * @param params 查询参数（页码、分类筛选等）
 * @returns 分页的文章数据
 *
 * 调用示例：
 *   const result = await getArticles({ page: 1, page_size: 10 })
 *   console.log(result.data.list)  // 文章列表
 *   console.log(result.data.total) // 总条数
 */
export function getArticles(params: ArticleListParams = {}) {
  // http.get<泛型> 指定返回类型，.then 中可获得类型提示
  return http.get<ApiResponse<PaginatedData<Article>>>('/articles', { params })
}

/**
 * 获取文章详情
 * @param id 文章ID
 */
export function getArticleById(id: number) {
  return http.get<ApiResponse<Article>>(`/articles/${id}`)
}

/**
 * 获取热门文章
 * @param limit 返回条数，默认10
 */
export function getHotArticles(limit: number = 10) {
  return http.get<ApiResponse<Article[]>>('/articles/hot', {
    params: { limit },
  })
}

/**
 * 搜索文章
 * @param params 搜索关键词和分页参数
 */
export function searchArticles(params: ArticleSearchParams) {
  return http.get<ApiResponse<PaginatedData<Article>>>('/articles/search', { params })
}

// ============================================================
// 文章管理接口（需要登录态，请求头自动带 Token）
// ============================================================

/**
 * 创建文章
 * @param data 文章表单数据
 */
export function createArticle(data: ArticleFormData) {
  return http.post<ApiResponse<Article>>('/admin/articles', data)
}

/**
 * 更新文章
 * @param id 文章ID
 * @param data 需要更新的字段
 */
export function updateArticle(id: number, data: Partial<ArticleFormData>) {
  // Partial<T> 是 TS 内置类型，表示 T 的所有属性变为可选
  return http.put<ApiResponse<Article>>(`/admin/articles/${id}`, data)
}

/**
 * 删除文章
 * @param id 文章ID
 */
export function deleteArticle(id: number) {
  return http.delete<ApiResponse<null>>(`/admin/articles/${id}`)
}

// ============================================================
// 分类接口
// ============================================================

/**
 * 获取所有分类
 */
export function getCategories() {
  return http.get<ApiResponse<Category[]>>('/categories')
}
