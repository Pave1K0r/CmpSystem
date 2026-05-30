import request from '@/utils/request'

// 获取当前登录用户信息
export const getUserInfoService = () => {
  return request.get('/user/info')
}

// 重置密码
export const resetPasswordService = (data) => {
  return request.put('/user/password', data)
}

// 管理员获取用户列表（支持搜索）
export const getUserListService = (params) => {
  return request.get('/admin/users', { params })
}

// 管理员修改用户状态（禁用/启用）
export const updateUserStatusService = (id, status) => {
  return request.put(`/admin/users/${id}/status`, { status })
}

// 管理员删除用户
export const deleteUserService = (id) => {
  return request.delete(`/admin/users/${id}`)
}

// 管理员重置用户密码
export const resetUserPasswordService = (id, data) => {
  return request.put(`/admin/users/${id}/password`, data)
}
