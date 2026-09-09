<template><section class="transfer"><p class="eyebrow">STUDIO / CONTENT TRANSFER</p><h1 class="page-heading">内容导入导出</h1><p class="muted intro">导出全部文章、元数据和本地图片；也可以导入 OpenPanda ZIP 或单个 Markdown 文件。</p><div class="cards"><article><span>01</span><h2>导出全部内容</h2><p>下载包含 manifest、文章 Markdown 和图片资源的 ZIP 包。</p><button class="action-button" :disabled="!!busy" @click="download">{{ busy === 'export' ? '正在打包…' : '下载 ZIP' }}</button></article><article><span>02</span><h2>导入 ZIP</h2><p>导入 OpenPanda 导出包，图片路径会自动恢复。</p><label class="action-button">{{ busy === 'zip' ? '正在导入…' : '选择 ZIP' }}<input type="file" accept=".zip" :disabled="!!busy" @change="chooseZip" /></label></article><article><span>03</span><h2>导入 Markdown</h2><p>先预览并补充文章信息，确认后才会创建草稿。</p><label class="action-button">选择 Markdown<input type="file" accept=".md,text/markdown" :disabled="!!busy" @change="chooseMarkdown" /></label></article></div><div v-if="message" class="result" role="status">{{ message }}</div><div v-if="markdownPreview" class="markdown-dialog" role="dialog" aria-labelledby="markdown-title"><div class="dialog-header"><h2 id="markdown-title">确认导入 Markdown</h2><button class="quiet-button" @click="markdownPreview = null">×</button></div><div class="preview"><h3>{{ markdownForm.title || '无标题' }}</h3><pre>{{ markdownForm.content.slice(0, 1200) }}</pre></div><div class="form-grid"><label>标题<input v-model="markdownForm.title" /></label><label>Slug<input v-model="markdownForm.slug" placeholder="留空自动生成" /></label><label>摘要<textarea v-model="markdownForm.summary" rows="2" /></label><label>分类<select v-model="markdownForm.category"><option value="">请选择分类</option><option v-for="category in categories" :key="category.id" :value="String(category.id)">{{ category.name }}</option></select></label><label>标签<input v-model="markdownForm.tags" placeholder="用逗号分隔" /></label><label>语言<select v-model="markdownForm.language"><option value="zh">中文</option><option value="en">English</option><option value="both">中英双语</option></select></label></div><p class="muted">导入后默认为草稿且仅管理员可见。</p><button class="action-button" :disabled="busy === 'md' || !markdownForm.title.trim() || !markdownForm.category" @click="confirmMarkdown">{{ busy === 'md' ? '正在导入…' : '确认导入' }}</button></div></section></template>
<script setup lang="ts">
import { ref } from 'vue'
import { isAxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { exportContent, importMarkdown, importZip, previewMarkdown, type TransferResult } from '@/api/modules/contentTransfer'
import { getCategories } from '@/api/modules/article'
import type { Category } from '@/types'
const busy = ref<'export' | 'zip' | 'md' | null>(null); const message = ref('')
const categories = ref<Category[]>([])
const markdownPreview = ref<string | null>(null)
const markdownFile = ref<File | null>(null)
function errorText(error: unknown): string { return isAxiosError(error) ? (error.response?.data?.message || `请求失败 (${error.response?.status || '网络异常'})`) : '文件处理失败' }
const markdownForm = ref({ title: '', slug: '', summary: '', category: '', tags: '', language: 'zh' as 'zh' | 'en' | 'both', content: '' })
void getCategories().then(response => { categories.value = response.data.data || [] }).catch(() => { categories.value = [] })
async function download() { busy.value = 'export'; try { const r = await exportContent(); const url = URL.createObjectURL(r.data); const a = document.createElement('a'); a.href = url; a.download = `openpanda-export-${new Date().toISOString().slice(0, 10)}.zip`; a.click(); URL.revokeObjectURL(url); ElMessage.success('导出完成') } catch { ElMessage.error('导出失败') } finally { busy.value = null } }
async function chooseZip(event: Event) { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; busy.value = 'zip'; message.value = ''; try { const r = await importZip(file); const result: TransferResult = r.data.data; message.value = `导入完成：新增 ${result.articles_created} 篇文章，导入 ${result.resources_imported} 个资源。`; ElMessage.success('导入完成') } catch (error) { message.value = errorText(error) } finally { busy.value = null; input.value = '' } }
async function chooseMarkdown(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file || busy.value) return
  busy.value = 'md'; message.value = ''; markdownPreview.value = null; markdownFile.value = null
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error('Markdown不能超过10MB')
    const { data } = await previewMarkdown(file); const { article, content } = data.data
    const response = await getCategories(); categories.value = response.data.data || []
    const category = categories.value.find(item => item.slug === article.category?.slug)
    markdownForm.value = { title: article.title, slug: article.slug, summary: article.summary, category: category ? String(category.id) : '', tags: (article.tags || []).map(tag => tag.name).join(', '), language: article.language, content }
    markdownFile.value = file; markdownPreview.value = file.name
  } catch (error) { message.value = error instanceof Error && !isAxiosError(error) ? error.message : errorText(error) }
  finally { busy.value = null; input.value = '' }
}
async function confirmMarkdown() {
  if (busy.value || !markdownFile.value) return
  const form = markdownForm.value; const category = categories.value.find(item => String(item.id) === String(form.category))
  if (!category || !form.title.trim()) { message.value = '请填写标题并选择分类'; return }
  busy.value = 'md'
  try {
    const { data } = await importMarkdown(markdownFile.value, { ...form, title: form.title.trim(), category: category.slug })
    message.value = `导入完成：新增 ${data.data.articles_created} 篇私有草稿。`
    markdownPreview.value = null; markdownFile.value = null
  } catch (error) { message.value = errorText(error) }
  finally { busy.value = null }
}
</script>
<style scoped>.transfer{max-width:960px;margin:auto}.intro{max-width:620px;font-size:17px;line-height:1.9}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}.cards article{min-height:280px;padding:24px;display:flex;flex-direction:column;align-items:flex-start;border:1px solid var(--border-subtle);background:var(--surface-panel);border-radius:8px}.cards article>span{color:var(--link-foreground);font:12px var(--font-mono)}.cards h2{margin:28px 0 12px;font-family:var(--font-heading);font-size:22px;line-height:1.5}.cards p{color:var(--foreground-secondary);font-size:14px;line-height:1.8}.cards .action-button{margin-top:auto}.action-button{cursor:pointer}.action-button input{position:absolute;width:1px;height:1px;opacity:0}.result,.markdown-dialog{margin-top:28px;padding:16px 20px;border:1px solid var(--border-subtle);background:var(--surface-panel);border-radius:8px}.dialog-header{display:flex;justify-content:space-between;align-items:center}.preview{margin:16px 0}.preview pre{max-height:220px;overflow:auto;padding:16px;background:var(--surface-code);white-space:pre-wrap}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}.form-grid label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--foreground-secondary)}.form-grid input,.form-grid textarea,.form-grid select{padding:10px;color:var(--foreground);background:var(--surface-input);border:1px solid var(--border-input);border-radius:6px}@media(max-width:800px){.cards{grid-template-columns:1fr}.cards article{min-height:0}.cards .action-button{margin-top:24px}.form-grid{grid-template-columns:1fr}}</style>