<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getRepairListService, addRepairService } from '@/api/repair'

// 维修列表数据
const repairList = ref([])
const loading = ref(false)

// 弹窗显示状态
const dialogVisible = ref(false)

// 表单数据
const form = reactive({
  repairsInfo: '',
})

const formRef = ref()

// 表单校验规则
const rules = {
  repairsInfo: [{ required: true, message: '请输入维修信息', trigger: 'blur' }],
}

// 状态标签类型映射
const statusType = (status) => {
  const map = {
    待处理: 'warning',
    处理中: 'primary',
    已完成: 'success',
  }
  return map[status] || 'info'
}

// 获取维修列表
const fetchRepairList = async () => {
  loading.value = true
  try {
    const res = await getRepairListService()
    repairList.value = res.data || []
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

  await addRepairService({
    repairsInfo: form.repairsInfo,
  })

  ElMessage.success('提交成功')
  await fetchRepairList()
  handleClose()
}

// 轮询定时器
let pollTimer = null

// 启动轮询
const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(() => {
    fetchRepairList()
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
  fetchRepairList()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <el-card class="repair-card">
    <div class="repair-header">
      <span class="title">报修物品</span>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增报修</el-button>
    </div>

    <el-table v-loading="loading" :data="repairList" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="repairsInfo" label="维修信息" min-width="200" />
      <el-table-column prop="repairsContent" label="管理员回复" min-width="200">
        <template #default="{ row }">
          <span v-if="row.repairsContent" style="color: #008c8c; font-weight: 500">{{
            row.repairsContent
          }}</span>
          <span v-else style="color: #909399">暂无回复</span>
        </template>
      </el-table-column>
      <el-table-column prop="repairsStatus" label="维修状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.repairsStatus)">
            {{ row.repairsStatus || '待处理' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新增报修弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    title="新增报修"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="维修信息" prop="repairsInfo">
        <el-input
          v-model="form.repairsInfo"
          type="textarea"
          :rows="4"
          placeholder="请描述需要维修的物品及问题"
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
.repair-card {
  margin: 0;
}

.repair-header {
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
