import request from './request'

/** 获取当前用户的活动流（贡献记录） */
export function getMyActivities(limit = 20) {
  return request.get(`/activities?limit=${limit}`)
}

/** 获取指定项目的活动流 */
export function getProjectActivities(projectId, limit = 30) {
  return request.get(`/activities/project/${projectId}?limit=${limit}`)
}
