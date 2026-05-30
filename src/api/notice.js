import request from '@/utils/request'

// 获取公告列表
export const getNoticeListService = () => {
  return request.get('/notices')
}

// 发布公告
export const addNoticeService = (data) => {
  return request.post('/notices', data)
}

// 删除公告
export const deleteNoticeService = (id) => {
  return request.delete(`/notices/${id}`)
}
