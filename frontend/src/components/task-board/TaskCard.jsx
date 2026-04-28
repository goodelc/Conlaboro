import { useState } from 'react'
import { claimTask, completeTask } from '../../api'
import styles from './TaskCard.module.css'

function TaskCard({ t, users, onTaskClaimed, onTaskCompleted, showToast }) {
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

  async function handleComplete(e) {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      await completeTask(t.id)
      showToast(`已完成「${t.name}」· +${t.xp} XP`, 'success')
      if (onTaskCompleted) onTaskCompleted()
    } catch (err) {
      showToast(err.message || '操作失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.taskCard} ${isDone ? styles.doneCard : ''}`} onClick={e => e.stopPropagation()}>
      <div className={styles.tcName}>{t.name}</div>
      <div className={styles.tcMeta}>
        <span className={styles.tcAssignee} style={{ color: t.assignee ? undefined : 'var(--red)' }}>
          {t.assignee
            ? <><span className={styles.taAvatar} style={{ background: users[t.assignee]?.color || '#999' }}>{t.assignee[0]}</span>{t.assignee}</>
            : '待认领'}
        </span>
        <span className={styles.tcXp}>+{t.xp} XP</span>
      </div>
      {!t.assignee && !isDone && !claimed && (
        <button className={styles.tcClaimBtn} onClick={handleClaim} disabled={loading}>
          {loading ? '处理中...' : `认领 · +${t.xp} XP`}
        </button>
      )}
      {!t.assignee && !isDone && claimed && (
        <button className={`${styles.tcClaimBtn} ${styles.claimedBtn}`}>✓ 已认领</button>
      )}
      {t.assignee && !isDone && (
        <button className={`${styles.tcClaimBtn} ${styles.doneBtn}`} onClick={handleComplete} disabled={loading}>
          {loading ? '处理中...' : `✓ 完成任务 · +${t.xp} XP`}
        </button>
      )}
    </div>
  )
}

export default TaskCard