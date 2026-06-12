<script setup>
import { ref, reactive } from 'vue'
import { Lock } from '@element-plus/icons-vue'
import { resetPasswordService } from '@/api/user'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

const formRef = ref()
const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const validateConfirm = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await resetPasswordService({ password: form.newPassword })
    ElMessage.success('密码重置成功，请重新登录')
    userStore.removeToken()
    router.push('/login')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>

<template>
  <el-card class="password-card">
    <div class="password-header">
      <el-icon size="24"><Lock /></el-icon>
      <span class="title">重置密码</span>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="password-form">
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码（至少6位）"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确认重置</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.password-card {
  max-width: 500px;
  margin: 40px auto;
}

.password-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #1e3c72;
}

.password-form {
  padding: 0 20px;
}
</style>
