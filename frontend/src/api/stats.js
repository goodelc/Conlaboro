import request from './request'

/** 获取平台统计数据 */
export function getStats() {
  return request.get('/stats')
}
