import { useApp } from '../context/AppContext'
import { useEffect } from 'react'

export default function BadgeModal() {
  const { badgeModalOpen, selectedBadge, closeBadgeModal } = useApp()

  useEffect(() => {
    if (!badgeModalOpen) return
    function handleKey(e) { if (e.key === 'Escape') closeBadgeModal() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [badgeModalOpen, closeBadgeModal])

  if (!badgeModalOpen || !selectedBadge) return null

  return (
    <div className={`modal-overlay badge-detail-modal ${badgeModalOpen ? 'active' : ''}`} id="badge-modal" onClick={(e) => { if (e.target === e.currentTarget) closeBadgeModal() }}>
      <div className="modal">
        <div className="badge-detail-icon">{selectedBadge.icon}</div>
        <div className="badge-detail-series">{selectedBadge.series}</div>
        <div className="badge-detail-name">{selectedBadge.name}</div>
        <div className="badge-detail-desc">{selectedBadge.desc}</div>
        <div className="badge-detail-condition">获得条件：<strong>{selectedBadge.condition}</strong></div>
        <div className="badge-earned-date">
          {selectedBadge.earned ? `✅ 已于 ${selectedBadge.date} 解锁` : `🔒 尚未解锁 — 继续努力！`}
        </div>
        <div className="modal-actions" style={{ justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={closeBadgeModal}>关闭</button>
        </div>
      </div>
    </div>
  )
}
