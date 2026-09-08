<template><ArticleCollection :category-slug="String(route.params.slug)" /></template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import ArticleCollection from '@/modules/content/components/ArticleCollection.vue'
const route = useRoute()
</script>