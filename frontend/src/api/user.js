import request from './request'

export function getUserProfile(id) {
  return request.get(`/users/${id}`)
}

export function getAllUsers() {
  return request.get('/users')
}

/** 更新个人资料 */
export function updateProfile(data) {
  return request.put('/users/profile', data)
}
