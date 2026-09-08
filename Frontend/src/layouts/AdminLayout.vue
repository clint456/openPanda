<template>
  <DefaultLayout>
    <nav class="studio-nav" :aria-label="zh ? '创作管理' : 'Studio navigation'">
      <span>STUDIO</span>
      <router-link to="/articles">{{ zh ? '管理文章' : 'Articles' }}</router-link>
      <router-link to="/articles/new">{{ zh ? '写文章' : 'Write' }}</router-link>
      <router-link to="/admin/categories">{{ zh ? '分类' : 'Categories' }}</router-link>
      <router-link to="/admin/ai">{{ zh ? 'AI 助手' : 'AI assistant' }}</router-link>
    </nav>
    <slot />
  </DefaultLayout>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultLayout from './DefaultLayout.vue'
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
</script>
<style scoped>
.studio-nav { display: flex; gap: 24px; flex-wrap: wrap; align-items: center; padding: 16px 0; margin-bottom: 32px; border-bottom: 1px solid var(--border-color); font-size: 14px; }.studio-nav span { font-size: 11px; letter-spacing: .15em; color: var(--text-muted); }
</style>