import request from '@/utils/request'

// 获取投诉列表
export const getComplaintListService = () => {
  return request.get('/complaints')
}

// 新增投诉
export const addComplaintService = (data) => {
  return request.post('/complaints', data)
}

// 更新投诉状态
export const updateComplaintStatusService = (id, status) => {
  return request.put(`/complaints/${id}/status`, { status })
}

// 管理员回复投诉
export const replyComplaintService = (id, content) => {
  return request.put(`/complaints/${id}/reply`, { content })
}
