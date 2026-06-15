<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ChatLineRound } from '@element-plus/icons-vue'
import {
  getComplaintListService,
  updateComplaintStatusService,
  replyComplaintService,
} from '@/api/complaint'

// 投诉列表数据
const complaintList = ref([])
const loading = ref(false)

// 状态标签类型映射
const statusType = (status) => {
  const map = {
    待处理: 'warning',
    处理中: 'primary',
    已完成: 'success',
  }
  return map[status] || 'info'
}

// 状态选项
const statusOptions = ['待处理', '处理中', '已完成']

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

// 更新状态
const handleStatusChange = async (row, newStatus) => {
  try {
    await ElMessageBox.confirm(`确定将状态改为 "${newStatus}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await updateComplaintStatusService(row.id, newStatus)
    row.complaintStatus = newStatus
    ElMessage.success('状态更新成功')
  } catch {
    // 取消则恢复原状态
  }
}

// 回复弹窗
const replyDialogVisible = ref(false)
const replyForm = reactive({
  id: null,
  content: '',
})
const replyFormRef = ref()
const replyRules = {
  content: [{ required: true, message: '请输入回复内容', trigger: 'blur' }],
}

// 打开回复弹窗
const handleOpenReply = (row) => {
  replyForm.id = row.id
  replyForm.content = row.complaintContent || ''
  replyDialogVisible.value = true
}

// 关闭回复弹窗
const handleCloseReply = () => {
  replyFormRef.value?.resetFields()
  replyForm.id = null
  replyForm.content = ''
  replyDialogVisible.value = false
}

// 提交回复
const handleSubmitReply = async () => {
  const valid = await replyFormRef.value.validate().catch(() => false)
  if (!valid) return

  await replyComplaintService(replyForm.id, replyForm.content)
  ElMessage.success('回复成功')
  await fetchComplaintList()
  handleCloseReply()
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
  fetchComplaintList(), 
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <el-card class="feedback-card">
    <div class="feedback-header">
      <span class="title">反馈处理</span>
    </div>

    <el-table v-loading="loading" :data="complaintList" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="username" label="用户" min-width="100" align="center" />
      <el-table-column prop="complaintInfo" label="反馈信息" min-width="200" />
      <el-table-column prop="complaintContent" label="管理员回复" min-width="200">
        <template #default="{ row }">
          <span v-if="row.complaintContent" style="color: #008c8c; font-weight: 500">{{
            row.complaintContent
          }}</span>
          <span v-else style="color: #909399">暂无回复</span>
        </template>
      </el-table-column>
      <el-table-column prop="complaintStatus" label="处理状态" width="150" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.complaintStatus)">
            {{ row.complaintStatus || '待处理' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <el-select
            v-model="row.complaintStatus"
            placeholder="更改状态"
            size="small"
            style="width: 90px; margin-right: 6px"
            @change="(val) => handleStatusChange(row, val)"
          >
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-button
            link
            type="primary"
            size="small"
            :icon="ChatLineRound"
            @click="handleOpenReply(row)"
          >
            回复
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 回复弹窗 -->
  <el-dialog
    v-model="replyDialogVisible"
    title="回复反馈"
    width="500px"
    :close-on-click-modal="false"
    @close="handleCloseReply"
  >
    <el-form ref="replyFormRef" :model="replyForm" :rules="replyRules" label-width="90px">
      <el-form-item label="回复内容" prop="content">
        <el-input
          v-model="replyForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入回复内容"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCloseReply">取消</el-button>
      <el-button type="primary" @click="handleSubmitReply">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.feedback-card {
  margin: 0;
}

.feedback-header {
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
