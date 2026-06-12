import { useUserStore } from '@/stores'
import { createRouter, createWebHistory } from 'vue-router'

const commonRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginPage.vue'),
  },
  {
    path: '/',
    redirect: '/login',
  },
]

// 按角色分组路由
const asyncRoutes = [
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    redirect: '/admin/usermanage',
    // 管理员页面
    meta: { role: ['admin'] },
    children: [
      {
        path: 'usermanage',
        name: 'UserManage',
        meta: { title: '用户管理', role: ['admin'] },
        component: () => import('@/views/admin/UserManage.vue'),
      },
      {
        path: 'houseinfo',
        name: 'AdminHouseInfo',
        meta: { title: '房屋信息', role: ['admin'] },
        component: () => import('@/components/house/HouseInfo.vue'),
      },
      {
        path: 'costinfo',
        name: 'AdminCostInfo',
        meta: { title: '费用信息', role: ['admin'] },
        component: () => import('@/components/cost/CostInfo.vue'),
      },
      {
        path: 'noticeboard',
        name: 'AdminNoticeBoard',
        meta: { title: '公告栏', role: ['admin'] },
        component: () => import('@/views/admin/NoticeBoard.vue'),
      },
      {
        path: 'repairprogress',
        name: 'RepairProgress',
        meta: { title: '报修处理', role: ['admin'] },
        component: () => import('@/views/admin/RepairProgress.vue'),
      },
      {
        path: 'feedback',
        name: 'FeedBack',
        meta: { title: '反馈处理', role: ['admin'] },
        component: () => import('@/views/admin/FeedBack.vue'),
      },
      {
        path: 'userpassword',
        name: 'AdminUserPassword',
        meta: { title: '重置密码', role: ['admin'] },
        component: () => import('@/components/user/UserPassword.vue'),
      },
    ],
  },
  {
    path: '/users',
    component: () => import('@/views/users/UserLayout.vue'),
    redirect: '/users/usernotice',
    // 用户界面
    meta: { role: ['user'] },
    children: [
      {
        path: 'usernotice',
        name: 'UserNotice',
        meta: { title: '公告栏', role: ['user'] },
        component: () => import('@/views/users/NoticeBoard.vue'),
      },
      {
        path: 'userhouse',
        name: 'UserHouse',
        meta: { title: '房屋信息', role: ['user'] },
        component: () => import('@/components/house/HouseInfo.vue'),
      },
      {
        path: 'usercost',
        name: 'UserCost',
        meta: { title: '费用信息', role: ['user'] },
        component: () => import('@/components/cost/CostInfo.vue'),
      },
      {
        path: 'userrepairs',
        name: 'UserRepairs',
        meta: { title: '报修物品', role: ['user'] },
        component: () => import('@/views/users/UserRepairs.vue'),
      },
      {
        path: 'usercomplaint',
        name: 'UserComplaint',
        meta: { title: '投诉意见', role: ['user'] },
        component: () => import('@/views/users/UserComplaint.vue'),
      },
      {
        path: 'userpassword',
        name: 'UserPassword',
        meta: { title: '重置密码', role: ['user'] },
        component: () => import('@/components/user/UserPassword.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...commonRoutes, ...asyncRoutes],
})
// 路由守卫(登录访问拦截)
router.beforeEach((to, from) => {
  const useStore = useUserStore()
  const token = useStore.token
  const role = useStore.role
  // A：未登录
  if (!token) {
    // 想去登录页
    if (to.path === '/login') {
      // 放行
      return true
    } else {
      // 想去其他页面
      return '/login'
    }
  }
  // B：已登录但角色无效（防止 localStorage 数据损坏导致死循环）
  if (!role) {
    useStore.logout()
    return '/login'
  }
  // C：已登录，想回登录页
  if (to.path === '/login') {
    return role === 'admin' ? '/admin' : '/users'
  }
  // D：已登录，只要目标路由中的role数组不含当前role则拦截
  if (to.meta.role && !to.meta.role.includes(role)) {
    return role === 'admin' ? '/admin' : '/users'
  }
  return true
})
export default router
