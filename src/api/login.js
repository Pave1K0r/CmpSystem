import request from '@/utils/request'

// 登录接口
export const userLoginService = (loginData) => {
  return request.post('/login', loginData) // 前端将请求发给后端的 /login
}

