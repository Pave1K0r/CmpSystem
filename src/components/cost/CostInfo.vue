<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, } from 'element-plus'
import { Plus, Edit } from '@element-plus/icons-vue'
import {
  getCostListService,
  addCostService,
  updateCostService,
} from '@/api/cost'
import { getUserListService } from '@/api/user'

const route = useRoute()

// 根据路由判断是否为管理员
const isAdmin = computed(() => route.path.startsWith('/admin'))

// 费用列表数据
const costList = ref([])
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
  propertyFee: '',
  waterFee: '',
  electricityFee: '',
})

const formRef = ref()
const tableRef = ref()
const selectedRows = ref([])

// 表单校验规则
const rules = {
  username: [{ required: true, message: '请选择用户', trigger: 'change' }],
  propertyFee: [
    { required: true, message: '请输入物业费', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
  waterFee: [
    { required: true, message: '请输入水费', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
  electricityFee: [
    { required: true, message: '请输入电费', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'blur' },
  ],
}

// 获取费用列表
const fetchCostList = async () => {
  loading.value = true
  try {
    const res = await getCostListService()
    costList.value = res.data || []
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
  form.propertyFee = ''
  form.waterFee = ''
  form.electricityFee = ''
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
  form.propertyFee = String(row.propertyFee)
  form.waterFee = String(row.waterFee)
  form.electricityFee = String(row.electricityFee)
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
    propertyFee: Number(form.propertyFee),
    waterFee: Number(form.waterFee),
    electricityFee: Number(form.electricityFee),
  }

  if (isEdit.value) {
    await updateCostService(editId.value, payload)
    ElMessage.success('更新成功')
  } else {
    await addCostService(payload)
    ElMessage.success('新增成功')
  }

  await fetchCostList()
  handleClose()
}

onMounted(() => {
  fetchCostList()
})
</script>

<template>
  <el-card class="cost-card">
    <div class="cost-header">
      <span class="title">费用信息</span>
      <div v-if="isAdmin" class="header-btns">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增费用</el-button>
      </div>
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="costList"
      style="width: 100%"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="isAdmin" type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column v-if="isAdmin" prop="username" label="用户" min-width="120" align="center" />
      <el-table-column prop="propertyFee" label="物业费(元)" min-width="150" align="center" />
      <el-table-column prop="waterFee" label="水费(元)" min-width="150" align="center" />
      <el-table-column prop="electricityFee" label="电费(元)" min-width="150" align="center" />
      <el-table-column prop="createdAt" label="记录时间" min-width="180" align="center" />
      <el-table-column v-if="isAdmin" label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" :icon="Edit" @click="handleEdit(row)"
            >编辑</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新增/编辑费用弹窗（仅管理员可见） -->
  <el-dialog
    v-if="isAdmin"
    v-model="dialogVisible"
    :title="isEdit ? '编辑费用' : '新增费用'"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
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
      <el-form-item label="物业费" prop="propertyFee">
        <el-input v-model="form.propertyFee" placeholder="请输入物业费">
          <template #append>元</template>
        </el-input>
      </el-form-item>
      <el-form-item label="水费" prop="waterFee">
        <el-input v-model="form.waterFee" placeholder="请输入水费">
          <template #append>元</template>
        </el-input>
      </el-form-item>
      <el-form-item label="电费" prop="electricityFee">
        <el-input v-model="form.electricityFee" placeholder="请输入电费">
          <template #append>元</template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.cost-card {
  margin: 0;
}

.cost-header {
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
