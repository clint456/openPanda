<template>
  <div>
    <section class="intro">
      <p class="eyebrow">OPENPANDA / FIELD NOTES</p>
      <h1>{{ zh ? '在软硬件之间，' : 'Between hardware' }}<br /><span>{{ zh ? '把探索写下来。' : 'and possibility.' }}</span></h1>
      <p class="intro__description">{{ zh ? '关于嵌入式 Linux、硬件电路与单片机的实践手记。从一个问题出发，记录每一次理解与构建。' : 'Field notes on embedded Linux, circuits, and microcontrollers. One question, one experiment, one deeper understanding at a time.' }}</p>
      <router-link to="/about" class="intro__link">{{ zh ? '认识作者' : 'Meet the author' }} <span aria-hidden="true">↗</span></router-link>
      <div class="intro__mark" aria-hidden="true">{<span>p</span>}</div>
    </section>
    <div class="home-grid">
      <section aria-labelledby="latest-heading">
        <div class="section-heading"><h2 id="latest-heading">{{ zh ? '最近的记录' : 'Latest writing' }}</h2><router-link to="/articles">{{ zh ? '全部文章' : 'All writing' }} →</router-link></div>
        <div v-if="loading" class="state-panel" role="status">{{ zh ? '正在翻开手记…' : 'Loading notes…' }}</div>
        <div v-else-if="error" class="state-panel" role="alert"><p>{{ zh ? '暂时无法加载文章。' : 'Unable to load writing.' }}</p><button class="quiet-button" @click="load">{{ zh ? '重新加载' : 'Try again' }}</button></div>
        <template v-else><ArticleRow v-for="article in articles" :key="article.id" :article="article" /><p v-if="!articles.length" class="state-panel">{{ zh ? '新的记录，即将开始。' : 'New notes are on their way.' }}</p></template>
      </section>
      <aside class="topics" aria-labelledby="topics-heading">
        <p class="eyebrow">EXPLORE</p><h2 id="topics-heading">{{ zh ? '沿着兴趣探索' : 'Follow your curiosity' }}</h2>
        <router-link v-for="(category, index) in categories" :key="category.id" :to="`/category/${category.slug}`"><span class="topics__number">{{ String(index + 1).padStart(2, '0') }}</span><span>{{ category.name }}<small>{{ category.description }}</small></span><span aria-hidden="true">↗</span></router-link>
        <div class="topics__note"><span aria-hidden="true">⌘</span><p>{{ zh ? '理解原理，动手验证，保持好奇。' : 'Understand the fundamentals. Build to learn. Stay curious.' }}</p><router-link to="/tools">{{ zh ? '打开工具箱' : 'Open the toolbox' }} →</router-link></div>
      </aside>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ArticleRow from '@/modules/content/components/ArticleRow.vue'
import { useHomeContent } from '@/modules/content/composables/useHomeContent'
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const { articles, categories, loading, error, load } = useHomeContent()
</script>
<style scoped>
.intro { position: relative; padding: 32px 0 72px; border-bottom: 1px solid var(--border-color); margin-bottom: 56px; }
.intro h1 { font-size: clamp(34px, 5.5vw, 62px); letter-spacing: -.045em; line-height: 1.25; margin: 24px 0; max-width: 800px; position: relative; z-index: 1; }.intro h1 span { color: var(--color-primary); }
.intro__description { max-width: 560px; color: var(--text-secondary); font-size: 16px; line-height: 1.9; }.intro__link { display: inline-block; margin-top: 24px; font-size: 14px; }
.intro__mark { position: absolute; right: 24px; top: 30px; font: 170px/1.3 ui-monospace, monospace; color: var(--border-color); letter-spacing: -.15em; }.intro__mark span { color: var(--color-primary); opacity: .3; }
.home-grid { display: grid; grid-template-columns: minmax(0,1fr) 260px; gap: 64px; }.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; }.section-heading h2 { font-size: 20px; }.section-heading a { font-size: 12px; }
.topics h2 { font-size: 18px; margin: 12px 0 24px; }.topics > a { display: flex; align-items: start; gap: 12px; padding: 20px 0; border-top: 1px solid var(--border-color); color: var(--text-primary); font-size: 14px; }.topics small { display: block; margin-top: 6px; color: var(--text-secondary); font-size: 12px; }.topics__number { font: 11px/2 monospace; color: var(--color-primary); }
.topics__note { padding: 24px; margin-top: 24px; background: var(--bg-white); border: 1px solid var(--border-color); border-radius: 8px; }.topics__note > span { font-size: 28px; color: var(--color-primary); }.topics__note p { color: var(--text-secondary); font-size: 14px; margin: 12px 0; }.topics__note a { font-size: 12px; }
@media(max-width:900px) { .intro__mark { display: none; }.home-grid { grid-template-columns: 1fr; gap: 48px; }.intro { padding-top: 8px; padding-bottom: 40px; margin-bottom: 32px; } }
</style>