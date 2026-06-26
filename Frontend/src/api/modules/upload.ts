// ============================================================
// 文件: api/modules/upload.ts
// 说明: 文件上传 API（图片上传）
// ============================================================
import http from '@/api'
import type { ApiResponse } from '@/types'

/** 上传响应 */
export interface UploadData {
  url: string // 上传后的图片访问URL
}

/**
 * 上传图片
 * POST /api/v1/admin/upload/image
 * @param file 图片文件
 */
export function uploadImage(file: File) {
  // 使用 FormData 上传文件
  const formData = new FormData()
  formData.append('file', file)
  return http.post<ApiResponse<UploadData>>('/admin/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
