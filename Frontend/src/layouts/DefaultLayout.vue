<!--
  文件: layouts/DefaultLayout.vue
  说明: 默认布局组件（顶部导航栏 + 主体内容区 + 页脚）
        所有公开页面都使用此布局

  Vue 插槽(slot) 说明：
    <slot /> 是 Vue 的内容分发出口
    父组件在 <DefaultLayout>xxx</DefaultLayout> 中的内容
    会替换这里的 <slot />
-->
<template>
  <div class="layout">
    <!-- ============================================================
    顶部导航栏
    ============================================================ -->
    <AppHeader />

    <!-- ============================================================
    主体内容区
    <slot />: 这里会渲染 <router-view /> 过来的页面内容
    ============================================================ -->
    <main class="layout__main">
      <div class="layout__container">
        <slot />
      </div>
    </main>

    <!-- ============================================================
    页脚
    ============================================================ -->
    <footer class="layout__footer">
      <div class="layout__container">
        <p>{{ $t('footer.copyright') }}</p>
        <p class="footer__powered">{{ $t('footer.poweredBy') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 导入顶部导航组件
import AppHeader from '@/components/AppHeader.vue'
// 注意：layout 不需要导入 router-view，它由父组件(App.vue)传入
</script>

<style scoped>
/* scoped: 样式只在此组件内生效，不会泄漏到其他组件 */

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* vh = viewport height，100vh = 满屏高度 */
}

.layout__main {
  flex: 1; /* 让主体区域撑满剩余空间，把页脚推到底部 */
  padding: 20px 0;
}

.layout__container {
  max-width: 1200px;  /* 内容最大宽度 */
  margin: 0 auto;     /* 水平居中 */
  padding: 0 20px;    /* 左右留白 */
}

.layout__footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  text-align: center;
  padding: 20px 0;
  font-size: 14px;
}

.footer__powered {
  margin-top: 8px;
  color: #95a5a6;
  font-size: 12px;
}
</style>
