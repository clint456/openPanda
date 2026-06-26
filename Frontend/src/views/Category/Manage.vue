<!--
  文件: views/Category/Manage.vue
  说明: 分类管理页面（管理员专用）
        支持：查看所有分类 / 新建 / 编辑 / 删除
        此处管理的分类会同步到「写文章」的分类下拉框和首页专栏卡片
-->
<template>
  <div class="category-manage">
    <div class="page-header">
      <h2>专栏分类管理</h2>
      <el-button type="primary" :icon="PlusIcon" @click="openDialog(null)">
        新建专栏
      </el-button>
    </div>

    <p class="page-tip">
      此处管理的分类会自动出现在「写文章」的分类选择框和首页专栏卡片中。
      删除分类前请确保该分类下没有文章。
    </p>

    <!-- ============================================================
    分类表格
    ============================================================ -->
    <el-table :data="categories" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="专栏名称" min-width="140" />
      <el-table-column prop="slug" label="URL标识(slug)" min-width="140">
        <template #default="{ row }">
          <el-tag size="small">{{ row.slug }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="sort_order" label="排序" width="70" align="center" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除此专栏？请确保该分类下没有文章"
            @confirm="handleDelete(row.id)"
          >
            <template #reference>
              <el-button plain type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- ============================================================
    编辑/新建 弹窗
    ============================================================ -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑专栏' : '新建专栏'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="专栏名称" prop="name">
          <el-input v-model="form.name" placeholder="如：FPGA开发" />
        </el-form-item>
        <el-form-item label="URL标识" prop="slug">
          <el-input v-model="form.slug" placeholder="如：fpga-dev（英文+连字符）">
            <template #prepend>/category/</template>
          </el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="简短描述该专栏的内容方向"
          />
        </el-form-item>
        <el-form-item label="排序序号">
          <el-input-number v-model="form.sort_order" :min="0" :max="99" />
          <span class="form-tip">数字越小越靠前</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus as PlusIcon } from '@element-plus/icons-vue'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryFormData,
} from '@/api/modules/article'
import type { Category } from '@/types'

// ============================================================
// 数据
// ============================================================
const categories = ref<Category[]>([])
const loading = ref(false)

// ============================================================
// 弹窗
// ============================================================
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number>(0)
const saving = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<CategoryFormData>({
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入专栏名称', trigger: 'blur' }],
  slug: [
    { required: true, message: '请输入URL标识', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '仅允许小写字母、数字、连字符', trigger: 'blur' },
  ],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
}

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  fetchCategories()
})

// ============================================================
// 方法
// ============================================================
async function fetchCategories(): Promise<void> {
  loading.value = true
  try {
    const { data } = await getCategories()
    if (data.data) {
      categories.value = data.data
    }
  } catch {
    ElMessage.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

/** 打开弹窗（新建或编辑） */
function openDialog(row: Category | null): void {
  if (row) {
    // 编辑模式
    isEdit.value = true
    editId.value = row.id
    form.name = row.name
    form.slug = row.slug
    form.description = row.description
    form.sort_order = row.sort_order
  } else {
    // 新建模式
    isEdit.value = false
    editId.value = 0
    form.name = ''
    form.slug = ''
    form.description = ''
    form.sort_order = categories.value.length + 1 // 默认排最后
  }
  dialogVisible.value = true
}

/** 保存（新建或更新） */
async function handleSave(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isEdit.value) {
      await updateCategory(editId.value, form)
      ElMessage.success('专栏已更新')
    } else {
      await createCategory(form)
      ElMessage.success('专栏已创建')
    }
    dialogVisible.value = false
    await fetchCategories() // 刷新列表
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

/** 删除 */
async function handleDelete(id: number): Promise<void> {
  try {
    await deleteCategory(id)
    ElMessage.success('专栏已删除')
    await fetchCategories()
  } catch {
    ElMessage.error('删除失败，请确保该分类下没有文章')
  }
}
</script>

<style scoped>
.category-manage {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.page-header h2 {
  font-size: 22px;
}

.page-tip {
  color: #999;
  font-size: 13px;
  margin-bottom: 20px;
}

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
}
</style>
