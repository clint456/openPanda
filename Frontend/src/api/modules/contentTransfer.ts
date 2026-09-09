import http from '@/api'
import type { ApiResponse } from '@/types'
export interface TransferResult { articles_created: number; resources_imported: number; warnings?: string[] }
export const exportContent = () => http.get('/admin/content/export', { responseType: 'blob' })
export function importZip(file: File) { const data = new FormData(); data.append('file', file); return http.post<ApiResponse<TransferResult>>('/admin/content/import/zip', data, { timeout: 120000 }) }
export function importMarkdown(file: File) { const data = new FormData(); data.append('file', file); return http.post<ApiResponse<TransferResult>>('/admin/content/import/markdown', data, { timeout: 120000 }) }