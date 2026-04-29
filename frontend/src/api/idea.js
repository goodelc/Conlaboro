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

// ========== 参与意愿相关 ==========

export function expressInterest(id) {
  return request.post(`/ideas/${id}/interest`)
}

export function cancelInterest(id) {
  return request.delete(`/ideas/${id}/interest`)
}

export function getInterestedUsers(id, limit = 10) {
  return request.get(`/ideas/${id}/interested-users`, { params: { limit } })
}

export function checkInterested(id) {
  return request.get(`/ideas/${id}/interested`)
}

// ========== AI分析相关 ==========

export function analyzeProject(content) {
  return request.post('/ai/analyze-project', { content })
}