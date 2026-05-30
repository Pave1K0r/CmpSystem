<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { getNoticeListService, addNoticeService, deleteNoticeService } from '@/api/notice'

// 公告列表数据
const noticeList = ref([])
const loading = ref(false)

// 表单数据
const form = reactive({
  content: '',
})

const formRef = ref()

// 表单校验规则
const rules = {
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
}

// 获取公告列表
const fetchNoticeList = async () => {
  loading.value = true
  try {
    const res = await getNoticeListService()
    noticeList.value = res.data || []
  } finally {
    loading.value = false
  }
}

// 发布公告
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  await addNoticeService({ content: form.content })
  ElMessage.success('发布成功')
  form.content = ''
  await fetchNoticeList()
}

// 删除公告
const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该条公告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteNoticeService(row.id)
    ElMessage.success('删除成功')
    await fetchNoticeList()
  })
}

onMounted(() => {
  fetchNoticeList()
})
</script>

<template>
  <el-card class="notice-card">
    <div class="notice-header">
      <span class="title">公告管理</span>
    </div>

    <!-- 发布公告表单 -->
    <el-form ref="formRef" :model="form" :rules="rules" class="notice-form">
      <el-form-item prop="content" style="flex: 1; margin-bottom: 0">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="3"
          placeholder="请输入要发布的公告内容"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
      <el-form-item style="margin-bottom: 0; margin-left: 12px">
        <el-button type="primary" :icon="Plus" @click="handleSubmit">
          发布公告
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 公告列表 -->
    <el-divider />
    <el-table
      v-loading="loading"
      :data="noticeList"
      style="width: 100%"
      border
    >
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="content" label="公告内容" min-width="400" show-overflow-tooltip />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="danger"
            size="small"
            :icon="Delete"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.notice-card {
  margin: 0;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1e3c72;
}

.notice-form {
  display: flex;
  align-items: flex-start;
}
</style>
