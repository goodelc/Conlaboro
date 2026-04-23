import request from './request'

export function getUserProfile(id) {
  return request.get(`/users/${id}`)
}

export function getAllUsers() {
  return request.get('/users')
}
