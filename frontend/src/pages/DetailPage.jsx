import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { STATUS_MAP, TAG_CLASS } from '../constants'
import { getProjectDetail, claimTask, addComment, createTask, updateProject, createMilestone, updateMilestone, deleteMilestone } from '../api'

function TaskBoard({ milestones, projectId }) {
  const ms = milestones
  const { showToast: appToast } = useApp()
  const { users } = useData()

  // 防御性检查
  if (!ms || ms.length === 0 || !ms[0] || !ms[0].tasks || typeof ms[0].tasks[0] === 'string') {
    return <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>该项目尚未创建详细任务。请先在下方添加里程碑。</p>
  }

  const allTasks = ms.flatMap(m => m.tasks.map(t => ({ ...t, msStatus: m.status })))
  const openTasks = allTasks.filter(t => t.status === 'open')
  const progressTasks = allTasks.filter(t => t.status === 'progress')
  const doneTasks = allTasks.filter(t => t.status === 'done')

  function TaskCard({ t }) {
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
        appToast(`已认领「${t.name}」· +${t.xp} XP`, 'success')
      } catch (err) {
        appToast(err.message || '认领失败', 'error')
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

  /** 看板列底部的添加卡片 */
  function AddCard() {
    const [expanded, setExpanded] = useState(false)
    const [name, setName] = useState('')
    const [selMsId, setSelMsId] = useState(ms[0]?.id?.toString() || '')
    const [xp, setXp] = useState(10)
    const [creating, setCreating] = useState(false)

    async function handleCreate() {
      if (!name.trim()) { appToast('请输入任务名称', 'info'); return }
      setCreating(true)
      try {
        await createTask(projectId, { name: name.trim(), milestoneId: Number(selMsId), xp })
        appToast('任务已创建', 'success')
        setExpanded(false); setName(''); setXp(10)
        window.location.reload()
      } catch (err) {
        appToast(err.message || '创建失败', 'error')
      } finally { setCreating(false) }
    }

    if (!expanded) {
      return (
        <div className="add-task-card" onClick={() => setExpanded(true)}>
          <span className="add-task-plus">＋</span> 添加任务
        </div>
      )
    }

    return (
      <div className="add-task-form" onClick={e => e.stopPropagation()}>
        <input
          className="add-task-input"
          placeholder="输入任务名称…"
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setExpanded(false); setName('') } }}
        />
        <div className="add-task-options">
          <select className="add-task-select" value={selMsId} onChange={e => setSelMsId(e.target.value)}>
            {ms.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <label className="add-task-xp-label">
            <span>+{xp} XP</span>
            <input type="range" min="5" max="50" step="5" value={xp}
              onChange={e => setXp(Number(e.target.value))} />
          </label>
        </div>
        <div className="add-task-actions">
          <button className="add-task-submit" onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? '创建中…' : '添加'}
          </button>
          <button className="add-task-cancel" onClick={() => { setExpanded(false);setName('') }}>取消</button>
        </div>
      </div>
    )
  }

  const columns = [
    { key: 'open', label: '待认领', tasks: openTasks },
    { key: 'progress', label: '进行中', tasks: progressTasks },
    { key: 'done', label: '已完成', tasks: doneTasks },
  ]

  return (
    <div className="task-board">
      <div className="task-board-columns">
        {columns.map(col => (
          <div key={col.key} className={`task-column ${col.key}-col`}>
            <div className="task-column-header">{col.label} <span className="tch-count">{col.tasks.length}</span></div>
            <div className="task-column-body">
              {col.tasks.map(t => <TaskCard key={t.id || t.name} t={t} />)}
              <AddCard />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CollabSpace({ p }) {
  const [activeTab, setActiveTab] = useState('comments')
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const hasComments = p.comments && p.comments.length > 0
  const hasFiles = p.files && p.files.length > 0
  const { showToast } = useApp()

  async function handleSubmit() {
    if (!commentText.trim()) {
      showToast('请输入评论内容', 'info')
      return
    }
    setSending(true)
    try {
      await addComment(p.id, commentText.trim())
      setCommentText('')
      showToast('评论已发送', 'success')
      // TODO: 刷新评论列表（可从详情页重新获取或乐观更新）
    } catch (err) {
      showToast(err.message || '发送失败', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="collab-tabs">
        <button className={`collab-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
          💬 讨论 {hasComments ? `(${p.comments.length})` : ''}
        </button>
        <button className={`collab-tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
          📂 文件 {hasFiles ? `(${p.files.length})` : ''}
        </button>
        <button className={`collab-tab ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>📋 项目日志</button>
      </div>

      <div className={`collab-panel ${activeTab === 'comments' ? 'active' : ''}`} id={`comments-${p.id}`}>
        {hasComments ? (
          <div className="comment-list">
            {p.comments.map((c, i) => (
              <div key={i} className="comment-item">
                <div className="cm-avatar" style={{ background: c.color }}>{c.user[0]}</div>
                <div className="cm-body">
                  <div className="cm-header"><span className="cm-name">{c.user}</span><span className="cm-time">{c.time}</span></div>
                  <div className="cm-text">{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        ) : <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>还没有讨论，来说点什么吧。</p>}
        <div className="comment-input-wrap">
          <div className="ci-avatar">你</div>
          <textarea className="comment-input" rows={2} placeholder="写下你的想法…" value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
          <button className="comment-submit" onClick={handleSubmit} disabled={sending}>
            {sending ? '发送中...' : '发送'}
          </button>
        </div>
      </div>

      <div className={`collab-panel ${activeTab === 'files' ? 'active' : ''}`} id={`files-${p.id}`}>
        {hasFiles ? (
          <div className="file-list">
            {p.files.map((f, i) => (
              <div key={i} className="file-item">
                <span className="fi-icon">{f.icon}</span>
                <div className="fi-info"><h4>{f.name}</h4><p>{f.uploader} · {f.time}</p></div>
                <span className="fi-arrow">↓</span>
              </div>
            ))}
          </div>
        ) : <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>还没有共享文件。</p>}
      </div>

      <div className={`collab-panel ${activeTab === 'log' ? 'active' : ''}`} id={`log-${p.id}`}>
        {p.activities ? (
          <div className="activity-feed">
            {p.activities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="act-avatar" style={{ background: a.color }}>{a.user[0]}</div>
                <div><strong>{a.user}</strong> {a.text}<span className="act-time">{a.time}</span></div>
              </div>
            ))}
          </div>
        ) : <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>暂无项目动态。</p>}
      </div>
    </>
  )
}

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast, openJoinModal } = useApp()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  // 项目编辑状态
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', duration: '' })
  const [saving, setSaving] = useState(false)

  // 里程碑管理状态
  const [msCreating, setMsCreating] = useState(false)
  const [msNewTitle, setMsNewTitle] = useState('')
  const [msSaving, setMsSaving] = useState(false)
  const [editingMsId, setEditingMsId] = useState(null)
  const [msEditTitle, setMsEditTitle] = useState('')

  useEffect(() => {
    getProjectDetail(id).then(data => {
      setDetail(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  async function handleSaveProject() {
    if (!editForm.title.trim()) {
      showToast('项目名称不能为空', 'info')
      return
    }
    setSaving(true)
    try {
      await updateProject(id, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        duration: editForm.duration ? Number(editForm.duration) : null,
      })
      showToast('项目信息已更新', 'success')
      setEditing(false)
      // 刷新数据
      getProjectDetail(id).then(data => setDetail(data)).catch(() => {})
    } catch (err) {
      showToast(err.message || '保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  function openEdit() {
    const p = detail?.project || {}
    setEditForm({
      title: p.title || '',
      description: p.description || '',
      category: p.category || 'other',
      duration: p.duration?.toString() || '',
    })
    setEditing(true)
  }

  /* ── 里程碑操作 ── */

  async function handleCreateMs() {
    if (!msNewTitle.trim()) return
    setMsSaving(true)
    try {
      await createMilestone(id, { title: msNewTitle.trim() })
      showToast('里程碑已创建', 'success')
      setMsCreating(false); setMsNewTitle('')
      getProjectDetail(id).then(data => setDetail(data)).catch(() => {})
    } catch (err) {
      showToast(err.message || '创建失败', 'error')
    } finally { setMsSaving(false) }
  }

  async function handleSaveMs(msId) {
    if (!msEditTitle.trim()) { setEditingMsId(null); return }
    try {
      await updateMilestone(msId, { title: msEditTitle.trim() })
      showToast('里程碑已更新', 'success')
      setEditingMsId(null); setMsEditTitle('')
      getProjectDetail(id).then(data => setDetail(data)).catch(() => {})
    } catch (err) {
      showToast(err.message || '更新失败', 'error')
    }
  }

  async function handleDeleteMs(msId) {
    try {
      await deleteMilestone(msId)
      showToast('里程碑已删除', 'warning')
      getProjectDetail(id).then(data => setDetail(data)).catch(() => {})
    } catch (err) {
      showToast(err.message || '删除失败', 'error')
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>加载中...</div>
  }

  if (!detail) {
    return (
      <div className="page active" id="page-detail">
        <div style={{ textAlign: 'center', padding: '5rem' }}><h2>项目不存在</h2><p style={{ color: 'var(--warm-gray)', marginTop: '1rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/home')} style={{ marginTop: '1rem' }}>返回首页</button>
        </p></div>
      </div>
    )
  }

  const p = detail.project || {}
  p.roles = detail.roles || []
  p.milestones = detail.milestones || []
  p.tasks = detail.tasks || []
  p.comments = (detail.comments || []).map(c => ({
    user: c.authorName || c.author || c.userName || '匿名',
    text: c.content || c.text || '',
    time: c.time || c.createdAt || '',
    color: c.authorColor || c.color || c.userColor || '#999',
  }))
  p.files = (detail.files || []).map(f => ({
    name: f.fileName || f.name || '文件',
    icon: '📄',
    uploader: f.uploaderName || f.uploader || '未知',
    time: f.time || f.createdAt || '',
  }))

  return (
    <div className="page active" id="page-detail">
      <div className="detail-page" id="detail-content">
        <div className="detail-hero">
          <div className="detail-hero-inner">
            <div className="detail-breadcrumb">
              <span onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>首页</span> / <span onClick={() => { navigate('/home'); setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>探索项目</span> / <strong>{p.title}</strong>
            </div>
            <div className="detail-title-row">
              <h1><span className={`card-tag ${TAG_CLASS[p.status]}`} style={{ marginRight: '0.8rem' }}>{STATUS_MAP[p.status]}</span>{p.title}</h1>
              <div className="detail-actions">
                {!editing && <button className="btn-secondary" onClick={openEdit} title="编辑项目信息">✏️ 编辑</button>}
                {p.status === 'done' ? <button className="btn-secondary" onClick={() => showToast('已 Fork 该项目', 'success')}>🍴 Fork 项目</button> : <button className="btn-secondary" onClick={() => showToast('已收藏该项目', 'info')}>♡ 收藏</button>}
                {p.status !== 'done' && <button className="btn-primary" onClick={() => openJoinModal(p.id)}>🤝 加入项目</button>}
              </div>
            </div>
            <div className="detail-meta">
              <div className="detail-meta-item">👤 发起人：<strong style={{ cursor: 'pointer', color: 'var(--red)' }} onClick={() => navigate(`/profile/${p.authorName || p.author}`)}>{p.authorName || p.author}</strong></div>
              <div className="detail-meta-item">📅 创建于：<strong>{p.createdAt}</strong></div>
              {p.completedAt && <div className="detail-meta-item">🎉 上线于：<strong>{p.completedAt}</strong></div>}
              <div className="detail-meta-item">⏱ {p.completedAt ? '总用时' : '预计周期'}：<strong>{p.totalHours ? p.totalHours + ' 小时' : p.duration}</strong></div>
              <div className="detail-meta-item">📜 协议：<strong>{p.license}</strong></div>
              <div className="detail-meta-item">👥 团队：<strong>{p.roles.reduce((a,r)=>a+(r.filled||0),0)} / {p.roles.reduce((a,r)=>a+r.needed,0)} 人</strong></div>
            </div>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-main">
            <div className="detail-section"><h2>项目描述</h2>
              {editing ? (
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', background: 'var(--card-bg)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--ink-light)', display: 'block', marginBottom: '0.25rem' }}>项目名称</label>
                      <input className="auth-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--ink-light)', display: 'block', marginBottom: '0.25rem' }}>项目描述</label>
                      <textarea className="auth-input" rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--ink-light)', display: 'block', marginBottom: '0.25rem' }}>类别</label>
                        <select className="auth-input" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                          <option value="app">应用</option>
                          <option value="web">网页</option>
                          <option value="ai">AI</option>
                          <option value="tool">工具</option>
                          <option value="game">游戏</option>
                          <option value="other">其他</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--ink-light)', display: 'block', marginBottom: '0.25rem' }}>周期（天）</label>
                        <input type="number" className="auth-input" value={editForm.duration} onChange={e => setEditForm({ ...editForm, duration: e.target.value })} placeholder="30" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.3rem' }}>
                      <button className="btn-secondary" onClick={() => setEditing(false)}>取消</button>
                      <button className="btn-primary" onClick={handleSaveProject} disabled={saving}>{saving ? '保存中...' : '保存修改'}</button>
                    </div>
                  </div>
                </div>
              ) : (
                <p>{p.description || p.desc || '暂无描述'}</p>
              )}
            </div>

            {p.status === 'done' && p.contributors && (
              <div className="detail-section contrib-ranking">
                <h2>🏆 贡献者排行</h2>
                <div className="contrib-summary">
                  {[
                    [p.totalHours || 0, '总用时（小时）'],
                    [p.totalCommits || 0, '总提交次数'],
                    [p.contributors?.length || 0, '贡献者人数'],
                    ['100%', '完成度'],
                  ].map(([val, label]) => (
                    <div key={label} className="contrib-summary-item"><div className="csi-num">{val}</div><div className="csi-label">{label}</div></div>
                  ))}
                </div>
                <div className="contrib-list">
                  {p.contributors.map((c, i) => {
                    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal'
                    const barClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal'
                    return (
                      <div key={c.name} className="contrib-item">
                        <div className={`contrib-rank ${rankClass}`}>{i + 1}</div>
                        <div className="contrib-avatar" style={{ background: c.color }} onClick={() => navigate(`/profile/${c.name}`)}>{c.name[0]}</div>
                        <div className="contrib-info">
                          <div className="ci-top"><span className="ci-name" onClick={() => navigate(`/profile/${c.name}`)}>{c.name}</span><span className="ci-role">{c.role}</span></div>
                          <div className="ci-stats"><span>⭐ {c.xp} XP</span><span>⏱ {c.hours}h</span><span>📝 {c.commits}次提交</span></div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--warm-gray)', marginTop: '0.15rem' }}>{c.details}</div>
                        </div>
                        <div className="contrib-bar-wrap">
                          <div className="contrib-bar-label"><span>贡献占比</span><span className="cb-value">{c.pct}%</span></div>
                          <div className="contrib-bar"><div className={`contrib-bar-fill ${barClass}`} style={{ width: `${c.pct}%` }}></div></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {p.status === 'done' && p.deliverables && (
              <div className="detail-section">
                <h2>📦 交付物</h2>
                <div className="deliverables">
                  {p.deliverables.map((d, i) => (
                    <div key={i} className="deliverable-item">
                      <div className="dl-icon" style={{ background: d.bg }}>{d.icon}</div>
                      <div className="dl-info"><h4>{d.name}</h4><p>{d.desc}</p></div>
                      <span className="dl-arrow">→</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section"><h2>📋 任务看板</h2><TaskBoard milestones={p.milestones} projectId={Number(id)} /></div>

            <div className="detail-section"><h2>💬 协作空间</h2><CollabSpace p={p} /></div>

            <div className="detail-section">
              <div className="ms-header-row">
                <h2>📍 里程碑</h2>
                <button className="ms-add-btn" onClick={() => setMsCreating(true)}>＋ 新建里程碑</button>
              </div>
              {msCreating && (
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.2rem', marginBottom: '1rem', background: 'var(--card-bg)', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <input className="ms-edit-input" placeholder="输入里程碑名称…" value={msNewTitle}
                    onChange={e => setMsNewTitle(e.target.value)} autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleCreateMs(); if (e.key === 'Escape') { setMsCreating(false); setMsNewTitle('') } }} />
                  <button className="btn-primary" onClick={handleCreateMs} disabled={!msNewTitle.trim() || msSaving}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.9rem', whiteSpace: 'nowrap' }}>
                    {msSaving ? '创建中…' : '创建'}
                  </button>
                  <button className="btn-secondary" onClick={() => { setMsCreating(false); setMsNewTitle('') }}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}>取消</button>
                </div>
              )}
              <div className="milestone-list">
                {p.milestones.map((ms, mi) => {
                  const iconClass = ms.status === 'done' ? 'done' : ms.status === 'current' ? 'current' : 'pending'
                  const icon = ms.status === 'done' ? '✓' : ms.status === 'current' ? '→' : '○'
                  const tasksHtml = Array.isArray(ms.tasks) && typeof ms.tasks[0] === 'object'
                    ? ms.tasks.map(t => <span key={t.id || t.name} className={`ms-task ${ms.status === 'done' ? 'done' : ''}`}>{t.name}</span>)
                    : (Array.isArray(ms.tasks) ? ms.tasks.map((t, ti) => <span key={ti} className={`ms-task ${ms.status === 'done' ? 'done' : ''}`}>{t}</span>) : null)

                  const isEditing = editingMsId === ms.id

                  return (
                    <div key={mi} className="milestone-item-wrap">
                      <div className={`milestone-icon ${iconClass}`}>{icon}</div>
                      <div className="milestone-content">
                        {isEditing ? (
                          <input className="ms-edit-input" value={msEditTitle} autoFocus
                            onChange={e => setMsEditTitle(e.target.value)}
                            onBlur={() => handleSaveMs(ms.id)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveMs(ms.id); if (e.key === 'Escape') { setEditingMsId(null) } }}
                          />
                        ) : (
                          <h3>{ms.title}</h3>
                        )}
                        <div className="ms-date">{ms.date}</div>
                        <div className="ms-tasks">{tasksHtml}</div>
                      </div>
                      <div className="milestone-actions">
                        <button className="ms-action-btn" onClick={() => { setEditingMsId(ms.id); setMsEditTitle(ms.title) }}>编辑</button>
                        <button className="ms-action-btn danger" onClick={() => handleDeleteMs(ms.id)}>删除</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {p.activities && (
              <div className="detail-section">
                <h2>📋 项目动态</h2>
                <div className="activity-feed">
                  {p.activities.map((a, i) => (
                    <div key={i} className="activity-item">
                      <div className="act-avatar" style={{ background: a.color }}>{a.user[0]}</div>
                      <div><strong onClick={() => navigate(`/profile/${a.user}`)}>{a.user}</strong> {a.text}<span className="act-time">{a.time}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h2>团队成员</h2>
              <div className="team-list">
                {p.roles.map(r => {
                  const members = r.members || []
                  const filledHtml = members.length > 0 ? members.map(m => (
                    <div key={m.name} className="team-member">
                      <div className="tm-avatar" style={{ background: m.color, cursor: 'pointer' }} onClick={() => navigate(`/profile/${m.name}`)}>{m.name[0]}</div>
                      <div className="tm-info"><h4 style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${m.name}`)}>{m.name}</h4><p>{r.name}</p></div>
                      <span className="tm-status active">活跃</span>
                    </div>
                  )) : (r.filled > 0 ? Array(r.filled).fill(0).map((_, idx) => (
                    <div key={`filled-${idx}`} className="team-member">
                      <div className="tm-avatar" style={{ background: 'var(--green)', opacity: 0.6 }}>✓</div>
                      <div className="tm-info"><h4>成员</h4><p>{r.name}</p></div>
                      <span className="tm-status active">活跃</span>
                    </div>
                  )) : null)
                  const openSlots = r.needed - r.filled
                  const openHtml = openSlots > 0 ? Array(openSlots).fill(0).map((_, idx) => (
                    <div key={`open-${idx}`} className="team-member" onClick={() => openJoinModal(p.id, r.name)}>
                      <div className="tm-avatar" style={{ background: 'var(--cream)', color: 'var(--warm-gray)', border: '1px dashed var(--border)' }}>?</div>
                      <div className="tm-info"><h4>等待加入</h4><p>{r.name}</p></div>
                      <span className="tm-status open-slot">申请</span>
                    </div>
                  )) : null
                  return <>{filledHtml}{openHtml}</>
                })}
              </div>
            </div>
          </div>

          <div className="detail-sidebar">
            {p.status === 'done' && (
              <div className="sidebar-card" style={{ borderColor: 'var(--gold)', background: 'linear-gradient(135deg,rgba(212,168,67,0.05),white)' }}>
                <h3>🏆 项目成就</h3>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--ink-light)' }}>
                  {p.contributors ? p.contributors.slice(0, 2).map(c => (
                    <div key={c.name} style={{ marginBottom: '0.3rem' }}>{c.name} 解锁了「{c.role === '产品经理' ? '领航者' : c.role === '前端开发' ? '代码之力' : '设计之眼'}」徽章</div>
                  )) : null}
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--warm-gray)' }}>所有成员获得「造物参与者」纪念徽章</div>
                </div>
              </div>
            )}
            <div className="sidebar-card">
              <h3>角色招募</h3>
              <div className="role-slots">
                {p.roles.map(r => {
                  const openSlots = r.needed - r.filled
                  return openSlots > 0 ? (
                    <div key={r.name} className="role-slot open">
                      <div className="slot-left"><span>{r.emoji}</span><span>{r.name}</span></div>
                      <button className="slot-btn" onClick={() => openJoinModal(p.id, r.name)}>申请</button>
                    </div>
                  ) : (
                    <div key={r.name} className="role-slot filled">
                      <div className="slot-left"><span>{r.emoji}</span><span>{r.name}</span></div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>已满</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="sidebar-card">
              <h3>项目信息</h3>
              <div className="info-row"><span className="label">类别</span><span className="value">{p.category}</span></div>
              <div className="info-row"><span className="label">周期</span><span className="value">{p.duration}</span></div>
              <div className="info-row"><span className="label">协议</span><span className="value">{p.license}</span></div>
              <div className="info-row"><span className="label">创建</span><span className="value">{p.createdAt}</span></div>
            </div>
            <div className="sidebar-card">
              <h3>贡献记录</h3>
              <div className="info-row"><span className="label">总提交</span><span className="value">{p.totalCommits || 0}</span></div>
              <div className="info-row"><span className="label">总工时</span><span className="value">{p.totalHours ? p.totalHours + 'h' : '—'}</span></div>
              <div className="info-row"><span className="label">完成度</span>
                <span className="value" style={{ color: p.status === 'done' ? 'var(--green)' : p.status === 'progress' ? 'var(--gold)' : 'var(--warm-gray)' }}>
                  {p.status === 'done' ? '100%' : p.status === 'progress' ? '进行中' : '招募中'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
