import request from './request'

/** 收藏 / 取消收藏（切换） */
export function toggleFavorite(projectId) {
  return request.put(`/favorites/${projectId}`)
}

/** 检查是否已收藏 */
export function isFavorited(projectId) {
  return request.get(`/favorites/${projectId}`)
}
