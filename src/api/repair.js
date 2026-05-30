import request from '@/utils/request'

// 获取维修列表
export const getRepairListService = () => {
  return request.get('/repairs')
}

// 新增维修
export const addRepairService = (data) => {
  return request.post('/repairs', data)
}

// 更新维修状态
export const updateRepairStatusService = (id, status) => {
  return request.put(`/repairs/${id}/status`, { status })
}

// 管理员回复维修
export const replyRepairService = (id, content) => {
  return request.put(`/repairs/${id}/reply`, { content })
}
