import request from './request'

export function getIdeas(page, size, keyword, sortBy) {
  return request.get('/ideas', { params: { page, size, keyword, sortBy } })
}

export function getIdeaById(id) {
  return request.get(`/ideas/${id}`)
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

export function getComments(id) {
  return request.get(`/ideas/${id}/comments`)
}

export function createComment(id, data) {
  return request.post(`/ideas/${id}/comments`, data)
}