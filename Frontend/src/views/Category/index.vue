<!--
  文件: views/Category/index.vue
  说明: 分类文章列表页（按技术专栏筛选文章）
        URL: /category/:slug
-->
<template>
  <div class="category-page">
    <!-- 返回按钮 -->
    <el-button text :icon="ArrowLeftIcon" @click="router.push('/')">
      返回首页
    </el-button>

    <!-- 分类标题 -->
    <div class="category__header">
      <h1>{{ categoryName }}</h1>
      <p v-if="categoryDesc" class="category__desc">{{ categoryDesc }}</p>
    </div>

    <!-- 文章列表 -->
    <div v-loading="loading" class="articles__list">
      <el-card
        v-for="article in articles"
        :key="article.id"
        class="article__card"
        shadow="hover"
        @click="goToDetail(article.id)"
      >
        <div class="article__card-body">
          <div v-if="article.cover_image" class="article__cover">
            <img :src="article.cover_image" :alt="article.title" />
          </div>
          <div class="article__content">
            <h3>{{ article.title }}</h3>
            <p>{{ article.summary || stripHtml(article.content).slice(0, 150) + '...' }}</p>
            <div class="article__meta">
              <el-tag v-for="tag in article.tags" :key="tag.id" size="small">
                {{ tag.name }}
              </el-tag>
              <span>{{ formatDate(article.created_at) }}</span>
              <span>阅读 {{ article.view_count }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-empty v-if="!loading && articles.length === 0" description="该分类暂无文章" />
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchArticles"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft as ArrowLeftIcon } from '@element-plus/icons-vue'
import { getArticles, getCategories } from '@/api/modules/article'
import type { Article, Category } from '@/types'

const route = useRoute()
const router = useRouter()

// ============================================================
// 从 URL 获取分类 slug
// ============================================================
const slug = computed<string>(() => route.params.slug as string)

// ============================================================
// 响应式数据
// ============================================================
const articles = ref<Article[]>([])
const loading = ref<boolean>(false)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const total = ref<number>(0)
const categoryName = ref<string>('')
const categoryDesc = ref<string>('')
const categoryId = ref<number>(0)

// ============================================================
// 生命周期
// ============================================================
onMounted(async () => {
  await findCategory()
  await fetchArticles()
})

// ============================================================
// 方法
// ============================================================

/** 根据 slug 查找分类 */
async function findCategory(): Promise<void> {
  try {
    const { data } = await getCategories()
    if (data.data) {
      const found = data.data.find((c: Category) => c.slug === slug.value)
      if (found) {
        categoryId.value = found.id
        categoryName.value = found.name
        categoryDesc.value = found.description
      } else {
        categoryName.value = slug.value // fallback
      }
    }
  } catch {
    categoryName.value = slug.value
  }
}

/** 获取该分类下的文章 */
async function fetchArticles(): Promise<void> {
  if (!categoryId.value) return
  loading.value = true
  try {
    const { data } = await getArticles({
      page: currentPage.value,
      page_size: pageSize.value,
      category_id: categoryId.value,
    })
    if (data.data) {
      articles.value = data.data.list || []
      total.value = data.data.total || 0
    }
  } catch {
    console.error('加载分类文章失败')
  } finally {
    loading.value = false
  }
}

/** 跳转文章详情 */
function goToDetail(id: number): void {
  router.push(`/articles/${id}`)
}

/** 去除 HTML 标签 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/** 格式化日期 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.category-page {
  max-width: 1000px;
  margin: 0 auto;
}

.category__header {
  margin: 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #c8754a;
}
.category__header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}
.category__desc {
  color: #666;
  font-size: 15px;
}

.articles__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.article__card {
  cursor: pointer;
  transition: transform 0.2s;
}
.article__card:hover {
  transform: translateX(4px);
}
.article__card-body {
  display: flex;
  gap: 20px;
}
.article__cover {
  width: 180px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}
.article__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.article__content h3 {
  font-size: 18px;
  margin-bottom: 6px;
}
.article__content p {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.article__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .article__card-body {
    flex-direction: column;
  }
  .article__cover {
    width: 100%;
    height: 160px;
  }
}
</style>
