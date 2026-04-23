import request from './request'

/** 获取当前用户通知列表 */
export function getNotifications() {
  return request.get('/notifications')
}

/** 获取未读数量 */
export function getUnreadCount() {
  return request.get('/notifications/unread-count')
}

/** 标记单条已读 */
export function markAsRead(id) {
  return request.put(`/notifications/${id}/read`)
}

/** 全部标已读 */
export function markAllAsRead() {
  return request.put('/notifications/read-all')
}
