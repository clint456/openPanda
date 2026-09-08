<template>
  <header class="site-header">
    <a class="skip-link" href="#main-content">{{ zh ? '跳转到正文' : 'Skip to content' }}</a>
    <div class="site-header__inner">
      <BrandLogo :label="zh ? 'OpenPanda 首页' : 'OpenPanda home'" />
      <nav class="desktop-nav" :aria-label="zh ? '主导航' : 'Main navigation'">
        <router-link v-for="item in links" :key="item.path" :to="item.path">{{ item.label }}</router-link>
      </nav>
      <div class="header-actions">
        <button class="quiet-button" @click="toggleLocale">{{ zh ? 'EN' : '中文' }}</button>
        <select class="theme-select" :value="app.themePreference" :aria-label="zh ? '颜色主题' : 'Color theme'" @change="changeTheme">
          <option value="system">{{ zh ? '跟随系统' : 'System' }}</option>
          <option value="light">{{ zh ? '现代浅色' : 'Light Modern' }}</option>
          <option value="dark">{{ zh ? '现代深色' : 'Dark Modern' }}</option>
        </select>
        <button class="quiet-button mobile-toggle" :aria-expanded="menuOpen" aria-controls="mobile-navigation" @click="menuOpen = !menuOpen">{{ zh ? '菜单' : 'Menu' }}</button>
      </div>
    </div>
    <nav v-if="menuOpen" id="mobile-navigation" class="mobile-nav" :aria-label="zh ? '移动导航' : 'Mobile navigation'" @keydown.esc="menuOpen = false">
      <router-link v-for="item in links" :key="item.path" :to="item.path">{{ item.label }}</router-link>
    </nav>
  </header>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { normalizeTheme } from '@/shared/lib/theme'
import BrandLogo from '@/components/BrandLogo.vue'
const app = useAppStore()
const route = useRoute()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const menuOpen = ref(false)
const links = computed(() => [
  { path: '/articles', label: zh.value ? '文章' : 'Writing' },
  { path: '/tools', label: zh.value ? '工具' : 'Tools' },
  { path: '/about', label: zh.value ? '关于' : 'About' },
])
watch(() => route.fullPath, () => { menuOpen.value = false })
function changeTheme(event: Event) {
  app.setThemePreference(normalizeTheme((event.target as HTMLSelectElement).value))
}
function toggleLocale() {
  locale.value = zh.value ? 'en-US' : 'zh-CN'
  app.setLocale(locale.value)
  document.documentElement.lang = locale.value
}
</script>
<style scoped>
.site-header { border-bottom: 1px solid var(--border-color); }
.site-header__inner { max-width: 1120px; margin: auto; padding: 20px 24px; display: flex; align-items: center; gap: 48px; }
.desktop-nav { display: flex; gap: 32px; margin-left: auto; }
.desktop-nav a, .mobile-nav a { color: var(--text-secondary); font-size: 14px; }
.desktop-nav .router-link-active, .mobile-nav .router-link-active { color: var(--color-primary); }
.header-actions { display: flex; gap: 4px; }.mobile-toggle { display: none; }
.theme-select { min-height: 44px; max-width: 132px; padding: 6px 8px; color: var(--text-primary); background: var(--surface-input); border: 1px solid var(--border-input); border-radius: 6px; font-size: 13px; }
@media(max-width:400px) { .site-header__inner { flex-wrap: wrap; }.header-actions { width: 100%; justify-content: flex-end; } }
.mobile-nav { padding: 8px 24px 24px; display: flex; flex-direction: column; gap: 8px; }.mobile-nav a { padding: 12px; }
@media(max-width: 640px) { .site-header__inner { gap: 8px; padding: 16px; }.desktop-nav { display: none; }.header-actions { margin-left: auto; }.mobile-toggle { display: inline-flex; } }
</style>