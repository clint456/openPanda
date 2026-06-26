<!--
  文件: views/Home/index.vue
  说明: 首页
        展示：Banner区域、三大技术专栏卡片、最新文章、热门文章
        这是用户访问网站看到的第一个页面

  后续拓展：替换为真实 API 数据、添加轮播图、添加更多内容区域
-->
<template>
  <div class="home">
    <!-- ============================================================
    Hero Banner（顶部横幅区域）
    ============================================================ -->
    <section class="home__hero">
      <h1 class="hero__title">{{ $t('homePage.title') }}</h1>
      <p class="hero__subtitle">{{ $t('homePage.subtitle') }}</p>
      <p class="hero__desc">{{ $t('homePage.description') }}</p>
    </section>

    <!-- ============================================================
    三大技术专栏卡片
    ============================================================ -->
    <section class="home__categories">
      <h2 class="section__title">{{ $t('common.categories') }}</h2>
      <div class="categories__grid">
        <!-- 使用 el-card 展示每个分类 -->
        <el-card
          v-for="cat in categories"
          :key="cat.slug"
          class="category__card"
          shadow="hover"
        >
          <h3>{{ $t(`category.${cat.slug}`) }}</h3>
          <p>{{ $t(`category.${cat.slug}Desc`) }}</p>
          <el-button type="primary" text>
            {{ $t('common.articles') }} →
          </el-button>
        </el-card>
      </div>
    </section>

    <!-- ============================================================
    最新文章列表
    ============================================================ -->
    <section class="home__latest">
      <h2 class="section__title">{{ $t('homePage.latestArticles') }}</h2>
      <div class="articles__list">
        <!-- v-for 遍历文章列表渲染 -->
        <el-card
          v-for="article in latestArticles"
          :key="article.id"
          class="article__card"
          shadow="hover"
          @click="goToArticle(article.id)"
        >
          <div class="article__info">
            <h3>{{ article.title }}</h3>
            <p class="article__summary">{{ article.summary || article.content.slice(0, 100) + '...' }}</p>
            <div class="article__meta">
              <span v-if="article.category">{{ article.category.name }}</span>
              <span>{{ $t('common.viewCount') }}: {{ article.view_count }}</span>
            </div>
          </div>
        </el-card>

        <!-- 数据为空时显示 -->
        <el-empty v-if="latestArticles.length === 0" :description="$t('common.noData')" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 导入
// ============================================================
import { ref, onMounted } from 'vue'  // ref: 响应式数据, onMounted: 生命周期钩子
import { useRouter } from 'vue-router' // 编程式导航
import { getArticles, getHotArticles } from '@/api/modules/article' // API 函数
import type { Article } from '@/types'  // 类型定义

// ============================================================
// 路由实例
// ============================================================
const router = useRouter()

// ============================================================
// 响应式数据
// ref<T>(初始值) 创建响应式变量，T 是类型，初始值需符合 T
// ============================================================

/** 三大分类（当前为静态数据，后续可从 API 获取） */
const categories = ref([
  { slug: 'embeddedLinux' },
  { slug: 'hardwareDesign' },
  { slug: 'mcuDevelopment' },
])

/** 最新文章列表 */
const latestArticles = ref<Article[]>([]) // <Article[]> 表示 Article 类型的数组

/** 热门文章列表（首页暂未显示，预留后续使用） */
// const hotArticles = ref<Article[]>([]) // 取消注释即可使用

// ============================================================
// 生命周期钩子
// onMounted: 组件挂载到 DOM 后执行（类似于以前的 mounted）
// 适合在此处发起 API 请求加载数据
// ============================================================
onMounted(async () => {
  await fetchLatestArticles()
  // 后续可同时加载热门文章：
  // await fetchHotArticles()
})

// ============================================================
// 方法
// ============================================================

/** 获取最新文章 */
async function fetchLatestArticles(): Promise<void> {
  try {
    // 发送 API 请求，解构取出 data.data.list
    const { data } = await getArticles({ page: 1, page_size: 6 })
    // data.data 是 ApiResponse<PaginatedData<Article>>
    // data.data.data.list 才是文章数组
    if (data.data && data.data.list) {
      latestArticles.value = data.data.list
    }
  } catch (error) {
    // 接口未启动时静默失败，页面显示空状态
    console.error('获取文章列表失败:', error)
  }
}

/** 跳转到文章详情页 */
function goToArticle(id: number): void {
  router.push(`/articles/${id}`)
}
</script>

<style scoped>
.home {
  /* 页面通用样式 */
}

/* Hero Banner */
.home__hero {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
  margin-bottom: 40px;
}
.hero__title {
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 12px;
}
.hero__subtitle {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 8px;
}
.hero__desc {
  font-size: 14px;
  opacity: 0.7;
}

/* 通用区块标题 */
.section__title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

/* 分类卡片网格 */
.categories__grid {
  display: grid;
  /* auto-fit: 自动填充列数，minmax: 每列最小280px最大1份 */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}
.category__card {
  cursor: pointer;
  transition: transform 0.2s; /* 悬停过渡动画 */
}
.category__card:hover {
  transform: translateY(-4px); /* 悬停时向上浮动4px */
}
.category__card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #409eff;
}
.category__card p {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

/* 文章列表 */
.articles__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.article__card {
  cursor: pointer;
  transition: transform 0.2s;
}
.article__card:hover {
  transform: translateX(4px); /* 悬停时向右移动 */
}
.article__info h3 {
  font-size: 18px;
  margin-bottom: 8px;
}
.article__summary {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  /* 单行省略号 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.article__meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

/* 响应式：手机端 */
@media (max-width: 768px) {
  .home__hero {
    padding: 40px 16px;
  }
  .hero__title {
    font-size: 28px;
  }
  .hero__subtitle {
    font-size: 16px;
  }
}
</style>
