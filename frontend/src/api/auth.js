import request from './request'

export function loginApi(data) {
  return request.post('/auth/login', data)
}

export function registerApi(data) {
  return request.post('/auth/register', data)
}

export function getCurrentUser() {
  return request.get('/auth/me')
}

/** 密码重置 */
export function resetPassword(data) {
  return request.post('/auth/reset-password', data)
}
