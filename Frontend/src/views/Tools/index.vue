<!--
  文件: views/Tools/index.vue
  说明: 工具库首页 — 以卡片形式展示所有可用工具
        点击卡片进入对应工具的页面
-->
<template>
  <div class="tools-page">
    <div class="tools__container">
      <!-- 页面标题 -->
      <header class="tools__header">
        <h1 class="tools__title">{{ $t('tools.title') }}</h1>
        <p class="tools__subtitle">{{ $t('tools.subtitle') }}</p>
      </header>

      <!-- 工具卡片网格 -->
      <div class="tools__grid">
        <el-card
          v-for="tool in tools"
          :key="tool.id"
          class="tool__card"
          shadow="hover"
          @click="openTool(tool.id)"
        >
          <div class="tool__card-inner">
            <!-- 图标 -->
            <div class="tool__icon-wrapper">
              <el-icon :size="36">
                <component :is="getIcon(tool.icon)" />
              </el-icon>
            </div>
            <!-- 信息 -->
            <div class="tool__info">
              <h3 class="tool__name">{{ isZh ? tool.name : tool.nameEn }}</h3>
              <p class="tool__desc">{{ isZh ? tool.description : tool.descriptionEn }}</p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 无工具时 -->
      <el-empty v-if="tools.length === 0" :description="$t('tools.empty')" />
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 导入
// ============================================================
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { tools } from './toolsData'
import {
  Document,
  Key,
  Clock,
  Search,
  Files,
  Brush,
  Reading,
} from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()

/** 当前是否中文 */
const isZh = computed(() => appStore.locale === 'zh-CN')

/** 图标名称 → 组件映射 */
const iconMap: Record<string, any> = {
  Document,
  Key,
  Clock,
  Search,
  Files,
  Brush,
  Reading,
}

/** 根据字符串名获取图标组件 */
function getIcon(name: string) {
  return iconMap[name] || Document
}

/** 点击卡片跳转到指定工具页 */
function openTool(id: string) {
  router.push(`/tools/${id}`)
}
</script>

<style scoped>
.tools-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.tools__header {
  text-align: center;
  margin-bottom: 48px;
}

.tools__title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.tools__subtitle {
  font-size: 16px;
  color: var(--text-muted);
}

/* ---- 卡片网格 ---- */
.tools__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* ---- 单张工具卡片 ---- */
.tool__card {
  cursor: pointer;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tool__card:hover {
  transform: translateY(-4px);
}

.tool__card-inner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 4px;
}

.tool__icon-wrapper {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #fdf2ea;
  color: var(--color-primary);
}

.tool__info {
  flex: 1;
  min-width: 0;
}

.tool__name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.tool__desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ---- 响应式 ---- */
@media (max-width: 640px) {
  .tools-page {
    padding: 24px 16px 60px;
  }

  .tools__title {
    font-size: 24px;
  }

  .tools__grid {
    grid-template-columns: 1fr;
  }
}
</style>
