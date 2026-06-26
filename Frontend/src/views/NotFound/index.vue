<!--
  文件: views/NotFound/index.vue
  说明: 404 页面（路由未匹配时显示）
-->
<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="goHome">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome(): void {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 100px 20px;
}
.not-found h1 {
  font-size: 72px;
  color: #dcdfe6;
  margin-bottom: 16px;
}
.not-found p {
  font-size: 18px;
  color: #999;
  margin-bottom: 24px;
}
</style>
