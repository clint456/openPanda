<template>
  <div class="site-layout">
    <AppHeader />
    <main id="main-content" class="site-main" tabindex="-1"><slot /></main>
    <footer class="site-footer">
      <div><strong>OpenPanda.</strong><p>{{ zh ? '记录技术，也记录思考。' : 'Notes on building, learning, and thinking.' }}</p></div>
      <div class="footer-links">
        <router-link :to="auth.isLoggedIn ? '/articles/new' : '/login'">{{ zh ? '创作空间' : 'Studio' }}</router-link>
        <button v-if="auth.isLoggedIn" class="quiet-button" @click="logout">{{ zh ? '退出登录' : 'Sign out' }}</button>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">蜀ICP备2025151206号</a>
      </div>
    </footer>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const auth = useAuthStore()
const router = useRouter()
function logout() { auth.logout(); router.push('/') }
</script>
<style scoped>
.site-layout { min-height: 100vh; display: flex; flex-direction: column; }
.site-main { width: 100%; max-width: 1120px; padding: 56px 24px 96px; margin: auto; flex: 1; }
.site-footer { max-width: 1120px; width: calc(100% - 48px); margin: auto; padding: 32px 0; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; gap: 24px; color: var(--text-secondary); font-size: 12px; }
.site-footer strong { color: var(--text-primary); font-size: 16px; }.site-footer p { margin-top: 8px; }.footer-links { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; }
@media(max-width:640px) { .site-main { padding: 32px 16px 64px; }.site-footer { flex-direction: column; width: calc(100% - 32px); } }
</style>