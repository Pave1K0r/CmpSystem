<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Tools, ChatDotRound, SwitchButton, Money, House, Bell, Lock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref(route.path)
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
})

// 图标映射：路径 -> 图标组件
const iconMap = {
  '/users/usernotice': Bell,
  '/users/userhouse': House,
  '/users/usercost': Money,
  '/users/userrepairs': Tools,
  '/users/usercomplaint': ChatDotRound,
  '/users/userpassword': Lock,
}

// 从路由配置动态生成侧边栏菜单，与 router/index.js 保持同步
const menuList = computed(() => {
  const userRoutes = router.getRoutes().filter((r) => {
    const p = r.path
    return p.startsWith('/users/')
  })
  return userRoutes.map((r) => ({
    path: r.path,
    title: r.meta?.title || r.name,
    icon: iconMap[r.path],
  })).filter((item) => item.icon)
})

const handleSelect = (path) => {
  router.push(path)
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.removeToken()
    ElMessage.success('退出成功')
    router.push('/login')
  })
}
</script>

<template>
  <el-container class="user-layout">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <span>业主服务中心</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        @select="handleSelect"
        background-color="transparent"
        active-text-color="#fff"
        text-color="#fff"
      >
        <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-bottom">
        <el-button type="danger" plain class="logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-title">欢迎回来，{{ userStore.username }}</div>
        <div class="user-avatar">
          <span class="avatar-text">U</span>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.user-layout {
  height: 100vh;
  width: 100vw;
}

.sidebar {
  background-color: rgb(0, 0, 0);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 2px;
}

.el-menu-vertical {
  border-right: none;
  flex: 1;
  padding-top: 12px;
}

:deep(.el-menu-item) {
  margin: 6px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #008c8c 0%, #006e6e 100%) !important;
  box-shadow: 0 4px 12px rgba(0, 140, 140, 0.4);
}

:deep(.el-icon) {
  margin-right: 8px;
}

.sidebar-bottom {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  height: 42px;
  font-size: 15px;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #64a7f8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 50px;
}

.avatar-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 64px;
  z-index: 10;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
  color: #000;
}

.main-content {
  background: #f5f7fa;
  padding: 24px;
  overflow-y: auto;
}

/* 响应式适配 */
@media screen and (max-width: 768px) {
  .sidebar {
    width: 180px !important;
  }

  .logo {
    font-size: 16px;
    letter-spacing: 1px;
  }
}
</style>
