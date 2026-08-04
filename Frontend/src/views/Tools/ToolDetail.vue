<!--
  文件: views/Tools/ToolDetail.vue
  说明: 单个工具页面 — 通过 iframe 嵌入第三方工具
        路由: /tools/:toolId
-->
<template>
  <div class="tool-detail">
    <!-- 顶部工具栏：返回 + 工具名 -->
    <header class="tool-detail__header">
      <el-button text :icon="ArrowLeft" @click="router.back()">
        {{ $t('tools.backToList') }}
      </el-button>
      <h2 class="tool-detail__title">{{ toolTitle }}</h2>
      <!-- 占位保持居中 -->
      <div class="tool-detail__spacer" />
    </header>

    <!-- iframe 区域 -->
    <div class="tool-detail__frame-wrapper">
      <iframe
        v-if="tool"
        :src="tool.proxyPath"
        class="tool-detail__iframe"
        frameborder="0"
        allowfullscreen
      />
      <!-- 未找到工具 -->
      <el-empty v-else :description="$t('tools.notFound')">
        <el-button type="primary" @click="router.push('/tools')">
          {{ $t('tools.backToList') }}
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================================
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { tools } from './toolsData'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

/** 根据路由参数找到当前工具 */
const tool = computed(() => {
  const id = route.params.toolId as string
  return tools.find((t) => t.id === id)
})

/** 当前工具标题（中/英） */
const toolTitle = computed(() => {
  if (!tool.value) return ''
  return appStore.locale === 'zh-CN' ? tool.value.name : tool.value.nameEn
})
</script>

<style scoped>
/* 突破 DefaultLayout 的容器限制，撑满视口 */
.tool-detail {
  position: fixed;
  top: 64px;        /* 导航栏高度 */
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-white);
  z-index: 10;
}

.tool-detail__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-white);
  flex-shrink: 0;
}

.tool-detail__title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.tool-detail__spacer {
  width: 100px; /* 与返回按钮大约等宽，保持标题居中 */
}

.tool-detail__frame-wrapper {
  flex: 1;
  overflow: hidden;
}

.tool-detail__iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
