import { useState } from 'react'
import { createTask } from '../../api'
import styles from './AddCard.module.css'

function AddCard({ projectId, milestones, onTaskCreated, showToast }) {
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState('')
  const [selMsId, setSelMsId] = useState(milestones[0]?.id?.toString() || '')
  const [xp, setXp] = useState(10)
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!name.trim()) { showToast('请输入任务名称', 'info'); return }
    setCreating(true)
    try {
      await createTask(projectId, { name: name.trim(), milestoneId: Number(selMsId), xp })
      showToast('任务已创建', 'success')
      setExpanded(false); setName(''); setXp(10)
      if (onTaskCreated) {
        onTaskCreated()
      }
    } catch (err) {
      showToast(err.message || '创建失败', 'error')
    } finally { setCreating(false) }
  }

  if (!expanded) {
    return (
      <div className={styles.addTaskCard} data-testid="add-task-card" onClick={() => setExpanded(true)}>
        <span className={styles.addTaskPlus}>＋</span> 添加任务
      </div>
    )
  }

  return (
    <div className={styles.addTaskForm} data-testid="add-task-form" onClick={e => e.stopPropagation()}>
      <input
        className={styles.addTaskInput}
        data-testid="add-task-input"
        placeholder="输入任务名称…"
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setExpanded(false); setName('') } }}
      />
      <div className={styles.addTaskOptions}>
        <select className={styles.addTaskSelect} data-testid="add-task-select" value={selMsId} onChange={e => setSelMsId(e.target.value)}>
          {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <label className={styles.addTaskXpLabel}>
          <span>+{xp} XP</span>
          <input type="range" min="5" max="50" step="5" value={xp}
            onChange={e => setXp(Number(e.target.value))} />
        </label>
      </div>
      <div className={styles.addTaskActions}>
        <button className={styles.addTaskSubmit} data-testid="add-task-submit" onClick={handleCreate} disabled={creating || !name.trim()}>
          {creating ? '创建中…' : '添加'}
        </button>
        <button className={styles.addTaskCancel} data-testid="add-task-cancel" onClick={() => { setExpanded(false);setName('') }}>取消</button>
      </div>
    </div>
  )
}

export default AddCard