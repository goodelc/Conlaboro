import request from './request'

export function getAllProjects() {
  return request.get('/projects')
}

export function getProjectDetail(id) {
  return request.get(`/projects/${id}`)
}

/** 创建项目 */
export function createProject(data) {
  return request.post('/projects', data)
}

/** 申请加入项目 */
export function applyJoin(projectId, data) {
  return request.post(`/projects/${projectId}/apply`, data)
}

/** 获取项目的申请列表 */
export function getApplications(projectId) {
  return request.get(`/projects/${projectId}/applications`)
}

/** 审批申请 */
export function reviewApplication(applicationId, action) {
  return request.put(`/projects/applications/${applicationId}/${action}`)
}

/** 发送评论 */
export function addComment(projectId, text) {
  return request.post(`/projects/${projectId}/comments`, { text })
}

/** 认领任务 */
export function claimTask(taskId) {
  return request.put(`/projects/tasks/${taskId}/claim`)
}

/** 释放/退回任务 */
export function releaseTask(taskId) {
  return request.put(`/projects/tasks/${taskId}/release`)
}

/** 完成任务 */
export function completeTask(taskId) {
  return request.put(`/projects/tasks/${taskId}/done`)
}

/** 创建任务 */
export function createTask(projectId, data) {
  return request.post(`/projects/${projectId}/tasks`, data)
}

/** 编辑项目信息 */
export function updateProject(projectId, data) {
  return request.put(`/projects/${projectId}`, data)
}

/** 创建里程碑 */
export function createMilestone(projectId, data) {
  return request.post(`/projects/${projectId}/milestones`, data)
}

/** 编辑里程碑 */
export function updateMilestone(milestoneId, data) {
  return request.put(`/projects/milestones/${milestoneId}`, data)
}

/** 删除里程碑 */
export function deleteMilestone(milestoneId) {
  return request.delete(`/projects/milestones/${milestoneId}`)
}
