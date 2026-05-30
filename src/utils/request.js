import axios from 'axios'
import router from '@/router'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'

const baseURL = '/api'

const instance = axios.create({
  baseURL,
  timeout: 10000,
})

// 请求拦截器
instance.interceptors.request.use(
  function (config) {
    const useStore = useUserStore()
    if (useStore.token) {
      config.headers.Authorization = useStore.token
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  function (response) {
    if (response.data.code && response.data.code !== 0 && response.data.code !== 200) {
      ElMessage.error(response.data.message || '服务异常')
      return Promise.reject(response.data)
    }
    return response.data
  },
  function (error) {
    // 1. 处理 401 Token 失效/未授权
    if (error.response.status === 401) {
      const userStore = useUserStore()
      // 清除本地过期的 token
      userStore.removeToken()
      // 跳转到登录页
      router.push('/login')
      ElMessage.error(error.response.data?.message)
      return Promise.reject(error)
    }

    // 2. 处理 403 账号被禁用
    if (error.response.status === 403) {
      const userStore = useUserStore()
      userStore.removeToken()
      router.push('/login')
      ElMessage.error(error.response.data?.message)
      return Promise.reject(error)
    }

    // 3. 处理其他常见的 HTTP 错误
    const msg = error.response.data.message || '网络请求失败'
    ElMessage.error(msg)
    return Promise.reject(error)
  },
)

export default instance
export { baseURL }
