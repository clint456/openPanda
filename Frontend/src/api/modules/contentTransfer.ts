import http from '@/api'
import type { ApiResponse } from '@/types'
export interface TransferResult { articles_created: number; resources_imported: number; warnings?: string[] }
export const exportContent = () => http.get('/admin/content/export', { responseType: 'blob', timeout: 120000 })
const uploadOptions = { timeout: 120000, headers: { 'Content-Type': 'multipart/form-data' } }
export function importZip(file: File) { const data = new FormData(); data.append('file', file); return http.post<ApiResponse<TransferResult>>('/admin/content/import/zip', data, uploadOptions) }
export function importMarkdown(file: File, metadata: { title: string; slug: string; summary: string; category: string; tags: string; language: string }) { const data = new FormData(); data.append('file', file); Object.entries(metadata).forEach(([key, value]) => data.append(key, value)); return http.post<ApiResponse<TransferResult>>('/admin/content/import/markdown', data, uploadOptions) }
export interface MarkdownPreview {
  content: string
  article: { title: string; slug: string; summary: string; language: 'zh' | 'en' | 'both'; category: { slug: string }; tags: { name: string }[] | null }
}
export function previewMarkdown(file: File) { const data = new FormData(); data.append('file', file); return http.post<ApiResponse<MarkdownPreview>>('/admin/content/preview/markdown', data, uploadOptions) }