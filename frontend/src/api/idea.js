import request from './request'

export function getIdeas(page, size) {
  return request.get('/ideas', { params: { page, size } })
}

export function createIdea(data) {
  return request.post('/ideas', data)
}

export function likeIdea(id) {
  return request.post(`/ideas/${id}/like`)
}

export function unlikeIdea(id) {
  return request.delete(`/ideas/${id}/like`)
}

export function checkLiked(id) {
  return request.get(`/ideas/${id}/liked`)
}