import { useState } from 'react'
import { claimTask } from '../../api'

function TaskCard({ t, users, onTaskClaimed, showToast }) {
  const isDone = t.status === 'done'
  const [claimed, setClaimed] = useState(!!t.assignee)
  const [loading, setLoading] = useState(false)

  async function handleClaim(e) {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      await claimTask(t.id)
      setClaimed(true)
      showToast(`已认领「${t.name}」· +${t.xp} XP`, 'success')
      if (onTaskClaimed) {
        onTaskClaimed()
      }
    } catch (err) {
      showToast(err.message || '认领失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`task-card ${isDone ? 'done-card' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="tc-name">{t.name}</div>
      <div className="tc-meta">
        <span className="tc-assignee" style={{ color: t.assignee ? undefined : 'var(--red)' }}>
          {t.assignee
            ? <><span className="ta-avatar" style={{ background: users[t.assignee]?.color || '#999' }}>{t.assignee[0]}</span>{t.assignee}</>
            : '待认领'}
        </span>
        <span className="tc-xp">+{t.xp} XP</span>
      </div>
      {!t.assignee && !isDone && !claimed && (
        <button className="tc-claim-btn" onClick={handleClaim} disabled={loading}>
          {loading ? '处理中...' : `认领 · +${t.xp} XP`}
        </button>
      )}
      {!t.assignee && !isDone && claimed && (
        <button className="tc-claim-btn claimed">✓ 已认领</button>
      )}
    </div>
  )
}

export default TaskCard