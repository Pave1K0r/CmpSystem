<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { userLoginService } from '@/api/login'

const role = ref('user') // 'user' 或 'admin'
const loading = ref(false)
const loginFormRef = ref(null)
const router = useRouter()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: '',
})

const rules = reactive({
  username: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '至少6个数字或字母数字组合', trigger: 'blur' },
  ],
})

const handleLogin = () => {
  if (!loginFormRef.value) return
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const submitData = {
        role: role.value,
        username: loginForm.username,
        password: loginForm.password,
      }

      try {
        const res = await userLoginService(submitData)
        ElMessage.success(res.message + '！欢迎 ' + loginForm.username)
        // 存储 Token 和用户名
        if (res.token) userStore.setToken(res.token)
        userStore.setUser({ username: loginForm.username, role: role.value })
        // 根据角色跳转到对应页面
        router.push(role.value === 'admin' ? '/admin' : '/users')
      } finally {
        loading.value = false
      }
    } else {
      return false
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="glass-box">
        <h2>{{ role === 'user' ? '业主登录' : '物业登录' }}</h2>

        <div class="role-switch">
          <div class="switch-bg" :class="role"></div>
          <div class="switch-btn" :class="{ active: role === 'user' }" @click="role = 'user'">
            业主
          </div>
          <div class="switch-btn" :class="{ active: role === 'admin' }" @click="role = 'admin'">
            物业
          </div>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          @keyup.enter="handleLogin"
          size="large"
        >
          <el-form-item prop="username" class="spaced-item">
            <el-input
              v-model="loginForm.username"
              maxlength="11"
              placeholder="请输入手机号"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          <el-form-item prop="password" class="spaced-item">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item style="margin-top: 30px; margin-bottom: 15px">
            <el-button
              class="login-btn"
              type="primary"
              :loading="loading"
              @click.stop="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
        <p class="register-hint">无账号，登录即注册</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/loginbgc.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 毛玻璃登录窗口 (白色主题) */
.glass-box {
  width: 480px;
  padding: 60px 50px;
  /* 更明亮的半透明白色 */
  background: rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  /* 高斯模糊 */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  /* 字体颜色反转为深色以适配白底 */
  color: #333;
  text-align: center;
}

.glass-box h2 {
  margin-bottom: 30px;
  font-size: 28px;
  letter-spacing: 2px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 自定义滑动角色切换区 */
.role-switch {
  display: flex;
  position: relative;
  margin-bottom: 35px;
  background: rgba(0, 0, 0, 0.08);
  /* 深色沟槽底色 */
  border-radius: 25px;
  padding: 6px;
  cursor: pointer;
}

.switch-bg {
  position: absolute;
  top: 6px;
  left: 6px;
  width: calc(50% - 6px);
  height: calc(100% - 12px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 1;
}

/* 根据 role 值滑动白底块 */
.switch-bg.user {
  transform: translateX(0);
}

.switch-bg.admin {
  transform: translateX(100%);
}

.switch-btn {
  flex: 1;
  z-index: 2;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  transition: color 0.4s ease;
}

.switch-btn.active {
  color: #1e3c72;
  /* 激活时字体颜色变为深蓝 */
  font-weight: bold;
}

/* 增加输入框之间的合理空隙 */
.spaced-item {
  margin-bottom: 20px !important;
}
.el-form-item__error {
  font-size: 16px;
}

/* 表单输入区增强对比度 (适配白玻璃) */
:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) inset !important;
  border-radius: 12px;
}

:deep(.el-input__inner) {
  color: #333 !important;
  height: 48px;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(0, 0, 0, 0.4) !important;
}

:deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 0 0 1px #3a7bd5 inset !important;
}

:deep(.el-input__prefix-inner) {
  color: #666;
}

:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}

:deep(.el-form-item__error) {
  color: #ff7875;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(58, 123, 213, 0.5);
  background: linear-gradient(135deg, #4b8de8 0%, #467389 100%) !important;
}

.login-btn:active {
  transform: translateY(0);
}

.register-hint {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

/* --- 响应式适配 --- */
@media screen and (max-width: 768px) {
  .glass-box {
    width: 85%;
    padding: 40px 30px;
  }
}

@media screen and (max-width: 480px) {
  .glass-box {
    width: 90%;
    padding: 30px 20px;
  }

  .glass-box h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .role-switch {
    margin-bottom: 25px;
  }

  .switch-btn {
    padding: 8px 0;
    font-size: 14px;
  }

  :deep(.el-input__inner) {
    height: 40px;
  }

  .login-btn {
    height: 44px;
    font-size: 16px;
  }
}
</style>
