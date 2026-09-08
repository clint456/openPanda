<template>
  <section class="collection">
    <p class="eyebrow">{{ categorySlug ? 'TOPIC / NOTES' : 'THE ARCHIVE' }}</p>
    <h1 class="page-heading">{{ category?.name || (zh ? '文章与手记' : 'Writing & notes') }}</h1>
    <p class="muted">{{ category?.description || (zh ? '实践中的问题，探索中的答案。' : 'Questions from practice. Answers through exploration.') }}</p>
    <form v-if="!categorySlug" class="search-form" role="search" @submit.prevent="search">
      <label for="article-search" class="eyebrow">{{ zh ? '搜索文章' : 'Search writing' }}</label>
      <div><input id="article-search" v-model="keyword" type="search" :placeholder="zh ? '输入关键词…' : 'Find a note…'" /><button class="action-button">{{ zh ? '搜索' : 'Search' }}</button></div>
    </form>
    <div v-if="auth.isLoggedIn && !categorySlug" class="admin-links"><router-link to="/articles/new">{{ zh ? '写文章' : 'Write' }}</router-link><router-link to="/admin/categories">{{ zh ? '管理分类' : 'Categories' }}</router-link><router-link to="/admin/ai">AI</router-link><span class="muted">{{ zh ? '搜索仅包含公开已发布文章' : 'Search includes public published writing only' }}</span></div>
    <div v-if="loading" class="state-panel" role="status">{{ zh ? '加载中…' : 'Loading…' }}</div>
    <div v-else-if="error" class="state-panel" role="alert"><p>{{ zh ? '加载失败，请重试。' : 'Unable to load writing.' }}</p><button class="quiet-button" @click="load">{{ zh ? '重试' : 'Retry' }}</button></div>
    <p v-else-if="missing" class="state-panel">{{ zh ? '专栏不存在。' : 'Topic not found.' }}</p>
    <template v-else><ArticleRow v-for="article in articles" :key="article.id" :article="article" /><p v-if="!articles.length" class="state-panel">{{ zh ? '没有找到文章，试试其他关键词。' : 'No writing found. Try another search.' }}</p></template>
    <nav v-if="total > 0 && !loading && !error" class="pagination" :aria-label="zh ? '文章分页' : 'Pagination'">
      <router-link v-if="page > 1" :to="pageLink(page - 1)">← {{ zh ? '上一页' : 'Previous' }}</router-link>
      <span>{{ page }} / {{ Math.max(1, Math.ceil(total / 10)) }} · {{ total }} {{ zh ? '篇' : 'notes' }}</span>
      <router-link v-if="page * 10 < total" :to="pageLink(page + 1)">{{ zh ? '下一页' : 'Next' }} →</router-link>
    </nav>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getArticles, getAdminArticles, getCategories, searchArticles } from '@/api/modules/article'
import { useAuthStore } from '@/stores/auth'
import type { Article, Category } from '@/types'
import ArticleRow from './ArticleRow.vue'
const props = defineProps<{ categorySlug?: string }>()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const page = computed(() => Math.max(1, Math.floor(Number(route.query.page) || 1)))
const keyword = ref('')
const articles = ref<Article[]>([])
const category = ref<Category>()
const total = ref(0)
const loading = ref(true)
const error = ref(false)
const missing = ref(false)
let request = 0
async function load() {
  const current = ++request
  loading.value = true; error.value = false; missing.value = false
  keyword.value = typeof route.query.q === 'string' ? route.query.q : ''
  try {
    let topic: Category | undefined
    if (props.categorySlug) {
      const result = await getCategories()
      topic = result.data.data.find(item => item.slug === props.categorySlug)
      if (current !== request) return
      category.value = topic
      if (!topic) { missing.value = true; articles.value = []; total.value = 0; return }
    }
    const params = { page: page.value, page_size: 10, category_id: topic?.id }
    const result = keyword.value && !props.categorySlug
      ? await searchArticles({ keyword: keyword.value, ...params })
      : await (auth.isLoggedIn && !props.categorySlug ? getAdminArticles : getArticles)(params)
    if (current !== request) return
    articles.value = result.data.data.list || []; total.value = result.data.data.total
  } catch { if (current === request) error.value = true }
  finally { if (current === request) loading.value = false }
}
function pageLink(value: number) { return { path: route.path, query: { ...route.query, page: String(value) } } }
function search() { router.push({ path: route.path, query: { q: keyword.value.trim() || undefined } }) }
watch([() => route.fullPath, () => auth.isLoggedIn, () => props.categorySlug], load, { immediate: true })
</script>
<style scoped>
.collection { max-width: 860px; margin: auto; }.search-form { margin: 32px 0; }.search-form label { display: block; margin-bottom: 8px; }.search-form > div { display: flex; gap: 12px; }.search-form input { min-width: 0; flex: 1; padding: 12px 16px; color: var(--text-primary); background: var(--surface-input); border: 1px solid var(--border-input); border-radius: 6px; }
.pagination { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; margin-top: 40px; font-size: 14px; }.pagination a { min-height: 44px; }.admin-links { display: flex; flex-wrap: wrap; gap: 16px; margin: 24px 0; font-size: 13px; }.state-panel { margin-top: 32px; }
</style>