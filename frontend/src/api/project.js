import request from './request'

export function getAllProjects() {
  return request.get('/projects')
}

export function getProjectDetail(id) {
  return request.get(`/projects/${id}`)
}
