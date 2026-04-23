import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getNotifications, markAsRead, markAllAsRead } from '../api'

/** 格式化时间为相对时间 */
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export default function NotificationPanel() {
  const { notifOpen, toggleNotif, isLoggedIn, fetchUnreadCount } = useApp()
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  // 打开面板时拉取通知 + 全部标已读
  useEffect(() => {
    if (!notifOpen || !isLoggedIn) return
    setLoading(true)
    getNotifications()
      .then((data) => setList(data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))

    // 打开时全部标记已读
    markAllAsRead().then(() => fetchUnreadCount()).catch(() => {})
  }, [notifOpen, isLoggedIn])

  const handleClick = useCallback((item) => {
    if (!item.isRead) {
      markAsRead(item.id).catch(() => {})
    }
    if (item.link) {
      navigate(item.link)
      toggleNotif()
    }
  }, [navigate, toggleNotif])

  const unreadCount = list.filter(n => !n.isRead).length

  return (
    <>
      <div className={`notif-overlay ${notifOpen ? 'active' : ''}`} id="notif-overlay" onClick={toggleNotif}></div>
      <div className={`notif-panel ${notifOpen ? 'active' : ''}`} id="notif-panel">
        <div className="notif-header">
          <h3>通知{unreadCount > 0 ? <span style={{ color: 'var(--primary)' }}>({unreadCount}条未读)</span> : ''}</h3>
          <button className="notif-close" onClick={toggleNotif}>✕</button>
        </div>
        <div className="notif-list">
          {!isLoggedIn ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--warm-gray)' }}>
              登录后查看通知
            </div>
          ) : loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--warm-gray)' }}>
              加载中...
            </div>
          ) : list.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--warm-gray)' }}>
              暂无通知 🎉
            </div>
          ) : (
            list.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.is_read ? '' : 'unread'}`}
                onClick={() => handleClick(n)}
              >
                <div className="ni-type">{n.type_icon || '📢'} {n.title}</div>
                <div className="ni-text">{n.content}</div>
                <div className="ni-time">{timeAgo(n.created_at)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
