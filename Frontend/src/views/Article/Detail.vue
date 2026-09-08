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

      <!-- 文章正文（Markdown → HTML 渲染） -->
      <div class="article__body prose" v-html="renderedContent" />

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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isAxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { ArrowLeft as ArrowLeftIcon, Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue'
import { getArticleById, deleteArticle, setArticleVisibility } from '@/api/modules/article'
import { useAuthStore } from '@/stores/auth'
import { renderMarkdown } from '@/shared/lib/markdown'
import { parseArticleId } from '@/utils'
import type { Article } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const loadError = ref(false)
let requestVersion = 0

// ============================================================
// 响应式数据
// ============================================================
const article = ref<Article | null>(null)
const loading = ref<boolean>(true)

/** 将 Markdown 内容转换为 HTML（用于 v-html 渲染） */
const renderedContent = computed<string>(() => {
  if (!article.value?.content) return ''
  return renderMarkdown(article.value.content)
})

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
  font-size: clamp(30px, 5vw, 46px);
  line-height: 1.4;
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

/* 文章正文富文本样式 */
.article__body {
  font-size: 18px;
  line-height: 1.8;
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
  font-family: 'Fira Code', monospace;
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
