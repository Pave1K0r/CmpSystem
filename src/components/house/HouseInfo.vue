<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import {
  getHouseListService,
  addHouseService,
  updateHouseService,
  deleteHouseService,
  batchDeleteHouseService,
} from '@/api/house'
import { getUserListService } from '@/api/user'

const route = useRoute()

// 根据路由判断是否为管理员
const isAdmin = computed(() => route.path.startsWith('/admin'))

// 房屋列表数据
const houseList = ref([])
const loading = ref(false)

// 用户列表（管理员用）
const userOptions = ref([])
const userLoading = ref(false)

// 弹窗显示状态
const dialogVisible = ref(false)
// 是否为编辑模式
const isEdit = ref(false)
// 当前编辑的ID
const editId = ref(null)

// 表单数据
const form = reactive({
  username: '',
  location: '',
  totalArea: '',
  sharedArea: '',
  info: '',
})

const formRef = ref()
const tableRef = ref()
const selectedRows = ref([])

// 表单校验规则
const rules = {
  username: [{ required: true, message: '请选择用户', trigger: 'change' }],
  location: [{ required: true, message: '请输入房屋位置', trigger: 'blur' }],
  totalArea: [{ required: true, message: '请输入房屋总面积', trigger: 'blur' }],
  sharedArea: [{ required: true, message: '请输入房屋公摊面积', trigger: 'blur' }],
  info: [{ required: true, message: '请输入房屋信息', trigger: 'blur' }],
}

// 获取房屋列表
const fetchHouseList = async () => {
  loading.value = true
  try {
    const res = await getHouseListService()
    houseList.value = res.data || []
  } finally {
    loading.value = false
  }
}

// 获取用户列表（管理员用）
const fetchUserOptions = async () => {
  if (!isAdmin.value) return
  userLoading.value = true
  try {
    const res = await getUserListService()
    // 只保留启用的用户
    userOptions.value = (res.data || []).filter((u) => Number(u.status) === 1)
  } finally {
    userLoading.value = false
  }
}

// 选中行变化
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// 重置表单
const resetForm = () => {
  form.username = ''
  form.location = ''
  form.totalArea = ''
  form.sharedArea = ''
  form.info = ''
  isEdit.value = false
  editId.value = null
}

// 打开新增弹窗
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
  fetchUserOptions()
}

// 打开编辑弹窗
const handleEdit = (row) => {
  resetForm()
  isEdit.value = true
  editId.value = row.id
  form.username = row.username || ''
  form.location = row.location
  form.totalArea = String(row.totalArea)
  form.sharedArea = String(row.sharedArea)
  form.info = row.info
  dialogVisible.value = true
  fetchUserOptions()
}

// 关闭弹窗时重置表单
const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
  dialogVisible.value = false
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const payload = {
    username: form.username,
    location: form.location,
    totalArea: Number(form.totalArea),
    sharedArea: Number(form.sharedArea),
    info: form.info,
  }

  if (isEdit.value) {
    await updateHouseService(editId.value, payload)
    ElMessage.success('更新成功')
  } else {
    await addHouseService(payload)
    ElMessage.success('新增成功')
  }

  await fetchHouseList()
  handleClose()
}

// 删除单行
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除 "${row.location}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteHouseService(row.id)
    ElMessage.success('删除成功')
    await fetchHouseList()
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const ids = selectedRows.value.map((row) => row.id)
    await batchDeleteHouseService(ids)
    ElMessage.success('删除成功')
    selectedRows.value = []
    await fetchHouseList()
  })
}

onMounted(() => {
  fetchHouseList()
})
</script>

<template>
  <el-card class="house-card">
    <div class="house-header">
      <span class="title">房屋信息</span>
      <div v-if="isAdmin" class="header-btns">
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="!selectedRows.length"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增房屋</el-button>
      </div>
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="houseList"
      style="width: 100%"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="isAdmin" type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column v-if="isAdmin" prop="username" label="用户" min-width="120" align="center" />
      <el-table-column prop="location" label="房屋位置" min-width="180" />
      <el-table-column prop="totalArea" label="房屋总面积(m²)" min-width="150" align="center" />
      <el-table-column prop="sharedArea" label="房屋公摊面积(m²)" min-width="150" align="center" />
      <el-table-column prop="info" label="房屋信息" min-width="150" align="center" />
      <el-table-column v-if="isAdmin" label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新增/编辑房屋弹窗（仅管理员可见） -->
  <el-dialog
    v-if="isAdmin"
    v-model="dialogVisible"
    :title="isEdit ? '编辑房屋' : '新增房屋'"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="选择用户" prop="username">
        <el-select
          v-model="form.username"
          placeholder="请选择用户"
          filterable
          clearable
          :loading="userLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.username"
            :value="item.username"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="房屋位置" prop="location">
        <el-input v-model="form.location" placeholder="请输入房屋位置，如：A栋x#xxx" />
      </el-form-item>
      <el-form-item label="房屋总面积" prop="totalArea">
        <el-input v-model="form.totalArea" placeholder="请输入房屋总面积（平方米）">
          <template #append>m²</template>
        </el-input>
      </el-form-item>
      <el-form-item label="房屋公摊面积" prop="sharedArea">
        <el-input v-model="form.sharedArea" placeholder="请输入房屋公摊面积（平方米）">
          <template #append>m²</template>
        </el-input>
      </el-form-item>
      <el-form-item label="房屋信息" prop="info">
        <el-input v-model="form.info" placeholder="请输入房屋信息，如：x室x厅x卫" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.house-card {
  margin: 0;
}

.house-header {
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

.header-btns {
  display: flex;
  gap: 10px;
}
</style>
