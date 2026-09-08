import { onMounted, ref } from 'vue'
import { getArticles, getCategories } from '@/api/modules/article'
import type { Article, Category } from '@/types'

export function useHomeContent() {
  const articles = ref<Article[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(true)
  const error = ref(false)
  async function load() {
    loading.value = true
    error.value = false
    try {
      const [posts, topics] = await Promise.all([getArticles({ page: 1, page_size: 6 }), getCategories()])
      articles.value = posts.data.data.list || []
      categories.value = topics.data.data || []
    } catch { error.value = true }
    finally { loading.value = false }
  }
  onMounted(load)
  return { articles, categories, loading, error, load }
}