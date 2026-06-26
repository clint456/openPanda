<!--
  文件: views/Article/Editor.vue
  说明: Markdown 文章编辑器（创建 + 编辑文章）
        左右分栏：左侧 Markdown 编辑，右侧实时预览
        使用 md-editor-v3 组件实现所见即所得
-->
<template>
  <div class="editor-page">
    <!-- 返回按钮 -->
    <el-button text :icon="ArrowLeftIcon" @click="router.back()" class="back-btn">
      {{ isEdit ? '返回' : '返回列表' }}
    </el-button>

    <h2 class="page-title">{{ isEdit ? '编辑文章' : '撰写新文章' }}</h2>

    <!-- ============================================================
    文章基本信息表单
    ============================================================ -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="article-form"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="100" show-word-limit />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类" prop="category_id">
            <el-select v-model="form.category_id" placeholder="选择分类">
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="语言">
            <el-select v-model="form.language" placeholder="文章语言">
              <el-option label="中文" value="zh" />
              <el-option label="English" value="en" />
              <el-option label="中英双语" value="both" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="摘要">
        <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="文章摘要（可选）" />
      </el-form-item>

      <el-form-item label="封面图">
        <el-input v-model="form.cover_image" placeholder="封面图链接（可选）" />
      </el-form-item>

      <!-- ============================================================
      Markdown 编辑器（核心）
      md-editor-v3 组件说明：
        v-model: 双向绑定 Markdown 文本内容
        theme: 编辑器主题（light / dark）
        language: 编辑器界面语言
        preview-theme: 预览区主题
        toolbars: 工具栏按钮配置
      ============================================================ -->
      <el-form-item label="正文" prop="content">
        <div class="editor-wrapper">
          <MdEditor
            v-model="form.content"
            :language="editorLang"
            :toolbars="toolbars"
            :preview-theme="'github'"
            style="height: 500px"
            placeholder="开始撰写你的技术文章...&#10;&#10;支持 Markdown 语法：&#10;- # 标题&#10;- **加粗**&#10;- `代码`&#10;- ```代码块```&#10;- ![图片](url)"
          />
        </div>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '更新文章' : '发布文章' }}
        </el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button @click="router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft as ArrowLeftIcon } from '@element-plus/icons-vue'
// md-editor-v3: Vue3 专用 Markdown 编辑器（默认导出）
import MdEditor from 'md-editor-v3'
import type { ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

import { getCategories, createArticle, updateArticle, getArticleById } from '@/api/modules/article'
import { useAppStore } from '@/stores/app'
import type { Category, ArticleFormData } from '@/types'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// ============================================================
// 判断是编辑模式还是新建模式
// ============================================================

/** 是否是编辑模式（URL 带 :id 参数则为编辑） */
const isEdit = computed<boolean>(() => !!route.params.id)
/** 编辑模式下的文章ID（新建时不需要） */
const editId = computed<number>(() => (isEdit.value ? Number(route.params.id) : 0))

// ============================================================
// 表单数据
// reactive: 创建响应式对象（适合表单这种多字段场景）
// ============================================================
const form = reactive<ArticleFormData>({
  title: '',
  content: '',
  summary: '',
  cover_image: '',
  category_id: 0,
  tag_ids: [],
  language: 'zh',
})

// ============================================================
// 表单校验规则
// ============================================================
const formRef = ref<FormInstance>()  // 表单实例引用
const rules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度 2~100 字符', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入文章正文', trigger: 'blur' },
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' },
  ],
}

// ============================================================
// 其他数据
// ============================================================
const categories = ref<Category[]>([])
const submitting = ref<boolean>(false)

/** Markdown 编辑器工具栏配置 */
const toolbars: ToolbarNames[] = [
  'bold', 'italic', 'strikethrough', 'title', '-',
  'unorderedList', 'orderedList', 'task', '-',
  'code', 'codeRow', 'quote', 'link', 'image', 'table', '-',
  'preview', 'fullscreen', 'catalog',
]

/** 编辑器界面语言（跟随全局语言设置） */
const editorLang = computed<string>(() => (appStore.locale === 'zh-CN' ? 'zh-CN' : 'en-US'))

// ============================================================
// 生命周期
// ============================================================
onMounted(async () => {
  await fetchCategories()

  // 编辑模式：加载已有文章数据
  if (isEdit.value && editId.value > 0) {
    await loadArticle(editId.value)
  }
})

// ============================================================
// 方法
// ============================================================

/** 获取分类列表 */
async function fetchCategories(): Promise<void> {
  try {
    const { data } = await getCategories()
    if (data.data) {
      categories.value = data.data
    }
  } catch {
    ElMessage.warning('分类列表加载失败')
  }
}

/** 加载文章数据（编辑模式） */
async function loadArticle(id: number): Promise<void> {
  try {
    const { data } = await getArticleById(id)
    if (data.data) {
      const article = data.data
      form.title = article.title
      form.content = article.content
      form.summary = article.summary || ''
      form.cover_image = article.cover_image || ''
      form.category_id = article.category_id
      form.language = (article.language as 'zh' | 'en' | 'both') || 'zh'
    }
  } catch {
    ElMessage.error('文章加载失败')
    router.back()
  }
}

/** 提交表单（发布/更新） */
async function handleSubmit(): Promise<void> {
  // 表单校验
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateArticle(editId.value, form)
      ElMessage.success('文章更新成功')
    } else {
      await createArticle(form)
      ElMessage.success('文章发布成功')
    }
    router.push('/articles')
  } catch {
    ElMessage.error(isEdit.value ? '更新失败' : '发布失败')
  } finally {
    submitting.value = false
  }
}

/** 保存草稿（不强制校验） */
async function handleSaveDraft(): Promise<void> {
  if (!form.title.trim()) {
    ElMessage.warning('至少需要输入标题')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateArticle(editId.value, form)
      ElMessage.success('草稿已保存')
    } else {
      await createArticle(form)
      ElMessage.success('草稿已保存')
    }
    router.push('/articles')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.editor-page {
  max-width: 1100px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
}

.article-form {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.editor-wrapper {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

/* 响应式 */
@media (max-width: 768px) {
  .article-form {
    padding: 16px;
  }
}
</style>
