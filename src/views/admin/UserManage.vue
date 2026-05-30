<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete, Key } from '@element-plus/icons-vue'
import {
  getUserListService,
  updateUserStatusService,
  deleteUserService,
  resetUserPasswordService,
} from '@/api/user'

// 搜索关键词
const keyword = ref('')

// 用户列表数据
const userList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 重置密码弹窗
const resetDialogVisible = ref(false)
const resetForm = reactive({
  id: null,
  username: '',
  password: '',
})
const resetFormRef = ref()
const resetRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
  ],
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserListService({ keyword: keyword.value || undefined })
    userList.value = res.data || []
    pagination.total = userList.value.length
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchUserList()
}

// 清空搜索
const handleClear = () => {
  keyword.value = ''
  handleSearch()
}

// 切换用户状态
const handleSwitchChange = async (row, val) => {
  const newStatus = val
  const actionText = newStatus === 1 ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确定要${actionText}用户 "${row.username}" 吗？`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await updateUserStatusService(row.id, newStatus)
    row.status = newStatus
    ElMessage.success(`${actionText}成功`)
  } catch {
    // 取消或失败，恢复原状态
    row.status = newStatus === 1 ? 0 : 1
  }
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteUserService(row.id)
    ElMessage.success('删除成功')
    await fetchUserList()
  })
}

// 打开重置密码弹窗
const openResetDialog = (row) => {
  resetForm.id = row.id
  resetForm.username = row.username
  resetForm.password = ''
  resetDialogVisible.value = true
}

// 关闭重置密码弹窗
const closeResetDialog = () => {
  resetFormRef.value?.resetFields()
  resetDialogVisible.value = false
}

// 提交重置密码
const handleResetPassword = async () => {
  const valid = await resetFormRef.value.validate().catch(() => false)
  if (!valid) return

  await resetUserPasswordService(resetForm.id, { password: resetForm.password })
  ElMessage.success('密码重置成功')
  closeResetDialog()
}

// 分页数据
const paginatedList = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return userList.value.slice(start, end)
})

onMounted(() => {
  fetchUserList()
})
</script>

<template>
  <el-card class="user-card">
    <div class="user-header">
      <span class="title">用户管理</span>
      <div class="search-box">
        <el-input
          v-model="keyword"
          placeholder="请输入用户名搜索"
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
          @clear="handleClear"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
    </div>

    <el-table v-loading="loading" :data="paginatedList" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="80" align="center" :index="(index) => (pagination.currentPage - 1) * pagination.pageSize + index + 1" />
      <el-table-column prop="username" label="用户名" min-width="150" align="center" />
      <el-table-column prop="createdAt" label="注册时间" min-width="180" align="center" />
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success">正常</el-tag>
          <el-tag v-else type="danger">已禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
            inline-prompt
            style="margin-right: 12px"
            @change="(val) => handleSwitchChange(row, val)"
          />
          <el-button link type="primary" size="small" :icon="Key" @click="openResetDialog(row)">
            重置密码
          </el-button>
          <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchUserList"
        @current-change="fetchUserList"
      />
    </div>
  </el-card>

  <!-- 重置密码弹窗 -->
  <el-dialog
    v-model="resetDialogVisible"
    title="重置密码"
    width="420px"
    :close-on-click-modal="false"
    @close="closeResetDialog"
  >
    <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="100px">
      <el-form-item label="用户名">
        <el-input v-model="resetForm.username" disabled />
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="resetForm.password" type="password" placeholder="请输入新密码" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeResetDialog">取消</el-button>
      <el-button type="primary" @click="handleResetPassword">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.user-card {
  margin: 0;
}

.user-header {
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

.search-box {
  display: flex;
  gap: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
