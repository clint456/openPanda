<!--
  文件: views/Article/Detail.vue
  说明: 文章详情页
        展示文章标题、分类、标签、正文（富文本）、阅读量等
-->
<template>
  <div class="article-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 文章内容 -->
    <template v-else-if="article">
      <!-- 返回按钮 + 操作按钮 -->
      <div class="article__actions">
        <el-button text :icon="ArrowLeftIcon" @click="router.back()">
          {{ $t('article.backToList') }}
        </el-button>
        <div v-if="authStore.isLoggedIn" class="article__admin-actions">
          <el-switch
            :model-value="article.is_public"
            size="small"
            active-text="公开"
            inactive-text="隐藏"
            inline-prompt
            @change="handleToggleVisibility"
          />
          <el-button text type="primary" :icon="EditIcon" @click="goEdit">
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除这篇文章？"
            @confirm="handleDelete"
          >
            <template #reference>
              <el-button text type="danger" :icon="DeleteIcon">删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>

      <!-- 文章头部信息 -->
      <div class="article__header">
        <h1>{{ article.title }}</h1>
        <div class="article__info">
          <el-tag v-if="article.category" type="primary">{{ article.category.name }}</el-tag>
          <el-tag
            v-for="tag in article.tags"
            :key="tag.id"
            class="tag__item"
          >
            {{ tag.name }}
          </el-tag>
        </div>
        <div class="article__meta">
          <span>{{ formatDate(article.created_at) }}</span>
          <span>{{ $t('common.viewCount') }}: {{ article.view_count }}</span>
          <span v-if="article.language !== 'zh'">
            {{ article.language === 'en' ? 'English' : '中英双语' }}
          </span>
        </div>
      </div>

      <!-- 封面图 -->
      <div v-if="article.cover_image" class="article__cover">
        <img :src="article.cover_image" :alt="article.title" />
      </div>

      <div class="article-reading-layout">
        <aside v-if="toc.length" class="article-toc" :class="{ 'article-toc--open': tocOpen }">
          <button class="article-toc__toggle" :aria-expanded="tocOpen" @click="tocOpen = !tocOpen">
            <span>{{ zh ? '文章目录' : 'On this page' }}</span><span aria-hidden="true">{{ tocOpen ? '−' : '+' }}</span>
          </button>
          <nav v-show="tocOpen || !isMobile" :aria-label="zh ? '文章目录' : 'Table of contents'">
            <a v-for="item in toc" :key="item.id" :href="`#${item.id}`" :class="{ 'is-active': activeHeading === item.id, [`toc-level-${item.level}`]: true }" @click="handleTocClick(item.id)">{{ item.text }}</a>
          </nav>
        </aside>
        <div class="article__body prose" v-html="renderedContent" />
      </div>

      <!-- 底部操作 -->
      <div class="article__footer">
        <el-divider />
        <p>{{ $t('common.publishedAt') }} {{ formatDate(article.created_at) }}</p>
      </div>
    </template>

    <!-- 文章不存在 -->
    <div v-else-if="loadError" class="state-panel" role="alert">
      <p>{{ zh ? '文章加载失败，请重试。' : 'Unable to load this article.' }}</p>
      <button class="quiet-button" @click="fetchArticle(parseArticleId(String(route.params.slug)))">{{ zh ? '重试' : 'Retry' }}</button>
    </div>
    <el-empty v-else :description="$t('common.noData')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isAxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { ArrowLeft as ArrowLeftIcon, Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue'
import { getArticleById, deleteArticle, setArticleVisibility } from '@/api/modules/article'
import { useAuthStore } from '@/stores/auth'
import { renderMarkdownWithToc, type MarkdownHeading } from '@/shared/lib/markdown'
import { parseArticleId } from '@/utils'
import type { Article } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const loadError = ref(false)
const toc = ref<MarkdownHeading[]>([])
const activeHeading = ref('')
const tocOpen = ref(false)
const isMobile = ref(false)
let observer: IntersectionObserver | null = null
let requestVersion = 0

// ============================================================
// 响应式数据
// ============================================================
const article = ref<Article | null>(null)
const loading = ref<boolean>(true)

/** 将 Markdown 内容转换为 HTML（用于 v-html 渲染） */
const readingContent = computed(() => article.value?.content ? renderMarkdownWithToc(article.value.content) : { html: '', headings: [] as MarkdownHeading[] })
const renderedContent = computed<string>(() => readingContent.value.html)
watch(() => readingContent.value.headings, value => { toc.value = value }, { immediate: true })

function updateViewport(): void { isMobile.value = window.innerWidth <= 900 }
function observeHeadings(): void {
  observer?.disconnect()
  const elements = toc.value.map(item => document.getElementById(item.id)).filter((element): element is HTMLElement => Boolean(element))
  if (!elements.length) return
  observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
    if (visible) activeHeading.value = visible.target.id
  }, { rootMargin: '-96px 0px -65% 0px', threshold: [0, 1] })
  elements.forEach(element => observer?.observe(element))
  activeHeading.value = window.location.hash.slice(1) || activeHeading.value || elements[0].id
}
function handleTocClick(id: string): void {
  tocOpen.value = false
  activeHeading.value = id
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`)
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ============================================================
// 生命周期
// ============================================================
watch(() => route.params.slug, async () => {
  requestVersion++
  article.value = null
  loadError.value = false
  // 从路由参数提取数字ID（兼容 /articles/123 和 /articles/123-slug）
  const id = parseArticleId(route.params.slug as string)
  if (id) {
    await fetchArticle(id)
  } else {
    loading.value = false
  }
}, { immediate: true })
watch(renderedContent, async () => { await nextTick(); observeHeadings() })
window.addEventListener('resize', updateViewport)
updateViewport()
onBeforeUnmount(() => { observer?.disconnect(); window.removeEventListener('resize', updateViewport) })

// ============================================================
// 方法
// ============================================================

/** 获取文章详情 */
async function fetchArticle(id: number): Promise<void> {
  const version = ++requestVersion
  loading.value = true
  loadError.value = false
  try {
    const { data } = await getArticleById(id)
    if (version !== requestVersion) return
    if (data.data) {
      article.value = data.data
      document.title = `${data.data.title} - OpenPanda`
    }
  } catch (error) {
    if (version === requestVersion) {
      loadError.value = !(isAxiosError(error) && error.response?.status === 404)
    }
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

/** 格式化日期 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** 跳转到编辑页 */
function goEdit(): void {
  if (!article.value) return
  router.push(`/articles/${article.value.id}-${article.value.slug || article.value.id}/edit`)
}

/** 删除文章 */
async function handleDelete(): Promise<void> {
  if (!article.value) return
  try {
    await deleteArticle(article.value.id)
    ElMessage.success('文章已删除')
    router.push('/articles')
  } catch {
    ElMessage.error('删除失败')
  }
}

/** 切换文章可见性 */
async function handleToggleVisibility(value: string | number | boolean): Promise<void> {
  const isPublic = value === true
  if (!article.value) return
  try {
    await setArticleVisibility(article.value.id, isPublic)
    article.value.is_public = isPublic
    ElMessage.success(isPublic ? '已设为公开' : '已设为隐藏')
  } catch {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.article-detail {
  max-width: 740px;
  margin: 0 auto;
  background: var(--newsprint-bg);
}

.loading {
  padding: 40px 0;
}

.article__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.article__admin-actions {
  display: flex;
  gap: 8px;
}

.article__header {
  margin: 20px 0;
}
.article__header h1 {
  font-family: var(--font-heading);
  letter-spacing: var(--heading-tracking);
  font-size: clamp(30px, 5vw, 46px);
  line-height: 1.5;
  margin-bottom: 16px;
}
.article__info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.tag__item {
  margin-left: 0 !important;
}
.article__meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

.article__cover {
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
}
.article__cover img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.article-reading-layout { position: relative; }
.article-toc {
  position: absolute;
  left: calc(100% + 48px);
  top: 0;
  width: 220px;
  max-height: calc(100vh - 128px);
  overflow: auto;
  position: sticky;
  float: right;
  transform: translateX(calc(100% + 48px));
  margin-bottom: -400px;
}
.article-toc__toggle { display: flex; justify-content: space-between; width: 100%; padding: 0 0 12px; border: 0; border-bottom: 1px solid var(--border-subtle); background: transparent; color: var(--text-primary); font: 600 14px/1.5 var(--font-heading); text-align: left; }
.article-toc nav { display: flex; flex-direction: column; padding-top: 8px; }
.article-toc nav a { padding: 6px 0 6px 12px; border-left: 2px solid transparent; color: var(--text-secondary); font-size: 12px; line-height: 1.55; }
.article-toc nav a:hover, .article-toc nav a.is-active { border-left-color: var(--link-foreground); color: var(--link-foreground); text-decoration: none; }
.article-toc .toc-level-3 { padding-left: 24px; font-size: 11px; }
.article-toc__toggle { cursor: default; }
@media (min-width: 901px) { .article-toc__toggle span:last-child { display: none; } }
@media (max-width: 1200px) and (min-width: 901px) { .article-toc { left: auto; transform: translateX(0); right: 0; width: 180px; } .article-detail { max-width: 740px; margin-left: max(24px, calc((100% - 1120px) / 2)); margin-right: 220px; } }
@media (max-width: 900px) {
  .article-toc { position: static; width: 100%; max-height: none; margin: 0 0 24px; transform: none; overflow: visible; }
  .article-toc__toggle { cursor: pointer; padding: 12px 0; }
  .article-toc nav { max-height: 280px; overflow: auto; border-bottom: 1px solid var(--border-subtle); padding: 8px 0 12px; }
}

/* 文章正文富文本样式 */
.article__body {
  color: var(--text-primary);
}
/* :deep() 穿透 scoped 样式，作用于 v-html 渲染的内容 */
.article__body :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}
.article__body :deep(pre) {
  background: var(--surface-code);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}
.article__body :deep(code) {
  font-family: var(--font-mono);
  font-size: 14px;
}
.article__body :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  padding-left: 16px;
  color: var(--text-secondary);
  margin: 16px 0;
}

.article__footer {
  margin-top: 40px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
