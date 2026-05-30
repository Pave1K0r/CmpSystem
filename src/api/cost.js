import request from '@/utils/request'

// 获取费用列表
export const getCostListService = () => {
  return request.get('/costs')
}

// 新增费用
export const addCostService = (data) => {
  return request.post('/costs', data)
}

// 更新费用
export const updateCostService = (id, data) => {
  return request.put(`/costs/${id}`, data)
}
