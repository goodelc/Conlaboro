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

/** 上传头像 */
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
