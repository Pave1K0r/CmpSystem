<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getComplaintListService, addComplaintService } from '@/api/complaint'

// 投诉列表数据
const complaintList = ref([])
const loading = ref(false)

// 弹窗显示状态
const dialogVisible = ref(false)

// 表单数据
const form = reactive({
  complaintInfo: '',
})

const formRef = ref()

// 表单校验规则
const rules = {
  complaintInfo: [{ required: true, message: '请输入反馈信息', trigger: 'blur' }],
}

// 状态标签类型映射
const statusType = (status) => {
  const map = {
    '待处理': 'warning',
    '处理中': 'primary',
    '已完成': 'success',
  }
  return map[status] || 'info'
}

// 获取投诉列表
const fetchComplaintList = async () => {
  loading.value = true
  try {
    const res = await getComplaintListService()
    complaintList.value = res.data || []
  } finally {
    loading.value = false
  }
}

// 打开新增弹窗
const handleAdd = () => {
  dialogVisible.value = true
}

// 关闭弹窗时重置表单
const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  await addComplaintService({
    complaintInfo: form.complaintInfo,
  })

  ElMessage.success('提交成功')
  await fetchComplaintList()
  handleClose()
}

// 轮询定时器
let pollTimer = null

// 启动轮询
const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(() => {
    fetchComplaintList()
  }, 3000)
}

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  fetchComplaintList()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <el-card class="complaint-card">
    <div class="complaint-header">
      <span class="title">投诉意见</span>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增反馈</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="complaintList"
      style="width: 100%"
      border
    >
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="complaintInfo" label="反馈信息" min-width="200" />
      <el-table-column prop="complaintContent" label="管理员回复" min-width="200">
        <template #default="{ row }">
          <span v-if="row.complaintContent" style="color: #008c8c; font-weight: 500">{{ row.complaintContent }}</span>
          <span v-else style="color: #909399">暂无回复</span>
        </template>
      </el-table-column>
      <el-table-column prop="complaintStatus" label="反馈结果" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.complaintStatus)">
            {{ row.complaintStatus || '待处理' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新增反馈弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    title="新增反馈"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="反馈信息" prop="complaintInfo">
        <el-input
          v-model="form.complaintInfo"
          type="textarea"
          :rows="4"
          placeholder="请描述您的投诉或建议"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.complaint-card {
  margin: 0;
}

.complaint-header {
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
</style>
