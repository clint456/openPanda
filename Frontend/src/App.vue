<template>
  <el-config-provider :locale="elementLocale">
    <component :is="layout"><router-view /></component>
  </el-config-provider>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
const app = useAppStore()
const route = useRoute()
const elementLocale = computed(() => app.locale === 'zh-CN' ? zhCn : en)
const layout = computed(() => route.meta.requiresAuth ? AdminLayout : DefaultLayout)
</script>