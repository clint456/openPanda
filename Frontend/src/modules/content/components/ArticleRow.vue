<template>
  <article class="article-row">
    <div class="article-row__date"><time :datetime="article.created_at">{{ date }}</time><span>{{ article.category?.name }}</span></div>
    <div class="article-row__body">
      <h2><router-link :to="getArticleUrl(article)">{{ article.title }}</router-link></h2>
      <p>{{ article.summary || article.content.replace(/<[^>]*>/g, '').slice(0, 160) }}</p>
      <span v-if="!article.is_published" class="eyebrow">{{ zh ? '草稿' : 'Draft' }}</span>
      <span v-else-if="!article.is_public" class="eyebrow">{{ zh ? '仅自己可见' : 'Private' }}</span>
    </div>
    <span class="article-row__arrow" aria-hidden="true">↗</span>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Article } from '@/types'
import { getArticleUrl } from '@/utils'
const props = defineProps<{ article: Article }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const date = computed(() => new Date(props.article.created_at).toLocaleDateString(locale.value, { year: 'numeric', month: 'short', day: 'numeric' }))
</script>
<style scoped>
.article-row { display: grid; grid-template-columns: 130px minmax(0,1fr) 24px; gap: 28px; padding: 32px 0; border-bottom: 1px solid var(--border-color); }
.article-row__date { display: flex; flex-direction: column; gap: 8px; color: var(--text-secondary); font-size: 12px; padding-top: 5px; }
.article-row h2 { font-size: 23px; letter-spacing: -.02em; }.article-row h2 a { color: var(--text-primary); }.article-row h2 a:hover { color: var(--color-primary); }
.article-row p { margin-top: 12px; color: var(--text-secondary); font-size: 15px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.article-row__arrow { color: var(--color-primary); font-size: 22px; }
@media(max-width:640px) { .article-row { grid-template-columns: minmax(0,1fr) 20px; gap: 12px; padding: 24px 0; }.article-row__date { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; }.article-row h2 { font-size: 21px; } }
</style>