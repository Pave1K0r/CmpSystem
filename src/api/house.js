import request from '@/utils/request'

// 获取房屋列表
export const getHouseListService = () => {
  return request.get('/houses')
}

// 新增房屋
export const addHouseService = (data) => {
  return request.post('/houses', data)
}

// 更新房屋
export const updateHouseService = (id, data) => {
  return request.put(`/houses/${id}`, data)
}

// 删除单个房屋
export const deleteHouseService = (id) => {
  return request.delete(`/houses/${id}`)
}

// 批量删除房屋
export const batchDeleteHouseService = (ids) => {
  return request.post('/houses/batch-delete', { ids })
}
