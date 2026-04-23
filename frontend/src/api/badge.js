import request from './request'

export function getAllBadges() {
  return request.get('/badges')
}

export function getMyBadges(userId) {
  return request.get(`/badges/mine?userId=${userId}`)
}
