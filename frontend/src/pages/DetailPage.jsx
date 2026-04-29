import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { STATUS_MAP, TAG_CLASS } from '../constants'
import { getProjectDetail, createMilestone, updateMilestone, deleteMilestone } from '../api'
import { getProjectActivities } from '../api/activity'
import { toggleFavorite, isFavorited } from '../api/favorite'
const checkFavorited = isFavorited
import TaskBoard from '../components/task-board/TaskBoard'
import CollabSpace from '../components/collab-space/CollabSpace'
import ProjectEditModal from '../components/modals/ProjectEditModal'
import ContributionHeatmap from '../components/ContributionHeatmap'
import styles from './DetailPage.module.css'

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast, openJoinModal, isLoggedIn, currentUser } = useApp()
  const { users } = useData()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [isFavorited, setIsFavorited] = useState(null)

  const [editModalOpen, setEditModalOpen] = useState(false)

  const [msCreating, setMsCreating] = useState(false)
  const [msNewTitle, setMsNewTitle] = useState('')
  const [msSaving, setMsSaving] = useState(false)
  const [editingMsId, setEditingMsId] = useState(null)
  const [msEditTitle, setMsEditTitle] = useState('')

  function refreshData() {
    getProjectDetail(id).then(data => setDetail(data)).catch(() => {})
    getProjectActivities(id).then(data => {
      const transformedActivities = (data || []).map(activity => ({
        user: activity.userName || '匿名',
        color: activity.userColor || '#999',
        time: activity.createdAt || '',
        text: activity.text || ''
      }))
      setActivities(transformedActivities)
    }).catch(() => {})
  }

  const handleTaskCreated = refreshData
  const handleTaskClaimed = refreshData
  const handleCommented = refreshData

  async function handleFavoriteToggle() {
    if (!isLoggedIn) { showToast('请先登录后再操作', 'warning'); return }
    try {
      await toggleFavorite(Number(id))
      setIsFavorited(prev => !prev)
      showToast(isFavorited ? '已取消收藏' : '已收藏该项目', 'success')
    } catch (err) {
      showToast(err.message || '操作失败', 'error')
    }
  }

  // 检查收藏状态
  useEffect(() => {
    if (isLoggedIn && id && detail) {
      checkFavorited(Number(id)).then(setIsFavorited).catch(() => {})
    }
  }, [id, isLoggedIn, !!detail])

  useEffect(() => {
    Promise.all([
      getProjectDetail(id),
      getProjectActivities(id)
    ]).then(([detailRes, activitiesRes]) => {
      setDetail(detailRes)
      const transformedActivities = (activitiesRes || []).map(activity => ({
        user: activity.userName || '匿名',
        color: activity.userColor || '#999',
        time: activity.createdAt || '',
        text: activity.text || ''
      }))
      setActivities(transformedActivities)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  function handleProjectSaved() {
    getProjectDetail(id).then(data => setDetail(data)).catch(() => {})
  }

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

  const p = useMemo(() => {
    if (!detail) return {}
    const proj = detail.project || {}
    proj.roles = detail.roles || []
    proj.tasks = detail.tasks || []
    proj.comments = (detail.comments || []).map(c => ({
      user: c.authorName || c.author || c.userName || '匿名',
      text: c.content || c.text || '',
      time: c.time || c.createdAt || '',
      color: c.authorColor || c.color || c.userColor || '#999',
    }))
    proj.files = (detail.files || []).map(f => ({
      name: f.fileName || f.name || '文件',
      icon: '📄',
      uploader: f.uploaderName || f.uploader || '未知',
      time: f.time || f.createdAt || '',
    }))

    const tasksByMilestone = {}
    ;(detail.tasks || []).forEach(t => {
      if (!tasksByMilestone[t.milestoneId]) tasksByMilestone[t.milestoneId] = []
      tasksByMilestone[t.milestoneId].push(t)
    })
    proj.milestones = (detail.milestones || []).map(ms => ({
      ...ms,
      tasks: tasksByMilestone[ms.id] || []
    }))
    return proj
  }, [detail])

  if (loading) {
    return <div className={styles.loadingCenter}>加载中...</div>
  }

  if (!detail) {
    return (
      <div className={`${styles.page} active`}>
        <div className={styles.notFoundCenter}><h2>项目不存在</h2><p className={styles.notFoundText}>
          <button className={`btn-secondary ${styles.notFoundBtn}`} onClick={() => navigate('/home')}>返回首页</button>
        </p></div>
      </div>
    )
  }

  const msIconClass = (status) => status === 'done' ? styles.msIconDone : status === 'current' ? styles.msIconCurrent : styles.msIconPending
  const rankStyleClass = (rank) => rank === 'gold' ? styles.rankGold : rank === 'silver' ? styles.rankSilver : rank === 'bronze' ? styles.rankBronze : styles.rankNormal
  const barFillClass = (bar) => bar === 'gold' ? styles.contribBarFillGold : bar === 'silver' ? styles.contribBarFillSilver : bar === 'bronze' ? styles.contribBarFillBronze : styles.contribBarFillNormal

  return (
    <div className={`${styles.page} active`}>
      <div className={styles.page} id="detail-content">
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.breadcrumb}>
              <span onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>首页</span> / <span onClick={() => { navigate('/home'); setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>探索项目</span> / <strong>{p.title}</strong>
            </div>
            <div className={styles.titleRow}>
              <h1><span className={`card-tag ${TAG_CLASS[p.status]}`} style={{ marginRight: '0.8rem' }}>{STATUS_MAP[p.status]}</span>{p.title}</h1>
              <div className={styles.actions}>
                <button className="btn-secondary" onClick={() => setEditModalOpen(true)} title="编辑项目信息">✏️ 编辑</button>

                {p.status !== 'done' && isFavorited !== null && <button className="btn-secondary" onClick={handleFavoriteToggle}>{isFavorited ? '♥ 已收藏' : '♡ 收藏'}</button>}
                {p.status !== 'done' && <button className="btn-primary" onClick={() => openJoinModal(Number(p.id), '', p)}>🤝 加入项目</button>}
              </div>
            </div>
            <div className={styles.meta}>
              <div className={styles.metaItem}>👤 发起人：<strong style={{ cursor: 'pointer', color: 'var(--red)' }} onClick={() => navigate(`/profile/${p.authorName || p.author}`)}>{p.authorName || p.author}</strong></div>
              <div className={styles.metaItem}>📅 创建于：<strong>{p.createdAt}</strong></div>
              {p.completedAt && <div className={styles.metaItem}>🎉 上线于：<strong>{p.completedAt}</strong></div>}
              <div className={styles.metaItem}>⏱ {p.completedAt ? '总用时' : '预计周期'}：<strong>{p.totalHours ? p.totalHours + ' 小时' : p.duration}</strong></div>
              <div className={styles.metaItem}>📜 协议：<strong>{p.license}</strong></div>
              <div className={styles.metaItem}>👥 团队：<strong>{p.roles.reduce((a,r)=>a+(r.filled||0),0)} / {p.roles.reduce((a,r)=>a+r.needed,0)} 人</strong></div>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div>
            <div className={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2>项目描述</h2>
                <button className="btn-secondary" onClick={() => setEditModalOpen(true)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.9rem' }}>✏️ 编辑</button>
              </div>
              <p>{p.description || p.desc || '暂无描述'}</p>
            </div>

            {p.status === 'done' && p.contributors && (
              <div className={`${styles.section} ${styles.contribRanking}`}>
                <h2>🏆 贡献者排行</h2>
                <div className={styles.contribSummary}>
                  {
                    [
                      [p.totalHours || 0, '总用时（小时）'],
                      [p.totalCommits || 0, '总提交次数'],
                      [p.contributors?.length || 0, '贡献者人数'],
                      ['100%', '完成度'],
                    ].map(([val, label]) => (
                      <div key={label} className={styles.contribSummaryItem}><div className={styles.csiNum}>{val}</div><div className={styles.csiLabel}>{label}</div></div>
                    ))
                  }
                </div>
                <div className={styles.contribList}>
                  {p.contributors.map((c, i) => {
                    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal'
                    const barClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal'
                    return (
                      <div key={c.name} className={styles.contribItem}>
                        <div className={`${styles.contribRank} ${rankStyleClass(rankClass)}`}>{i + 1}</div>
                        <div className={styles.contribAvatar} style={{ background: c.color }} onClick={() => navigate(`/profile/${c.name}`)}>{c.name[0]}</div>
                        <div className={styles.contribInfo}>
                          <div className={styles.ciTop}><span className={styles.ciName} onClick={() => navigate(`/profile/${c.name}`)}>{c.name}</span><span className={styles.ciRole}>{c.role}</span></div>
                          <div className={styles.ciStats}><span>⭐ {c.xp} XP</span><span>⏱ {c.hours}h</span><span>📝 {c.commits}次提交</span></div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--warm-gray)', marginTop: '0.15rem' }}>{c.details}</div>
                        </div>
                        <div className={styles.contribBarWrap}>
                          <div className={styles.contribBarLabel}><span>贡献占比</span><span className={styles.cbValue}>{c.pct}%</span></div>
                          <div className={styles.contribBar}><div className={barFillClass(barClass)} style={{ width: `${c.pct}%` }}></div></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <ContributionHeatmap activities={activities || []} showToast={showToast} />

            {p.status === 'done' && p.deliverables && (
              <div className={styles.section}>
                <h2>📦 交付物</h2>
                <div className={styles.deliverables}>
                  {p.deliverables.map((d, i) => (
                    <div key={i} className={styles.deliverableItem}>
                      <div className={styles.dlIcon} style={{ background: d.bg }}>{d.icon}</div>
                      <div className={styles.dlInfo}><h4>{d.name}</h4><p>{d.desc}</p></div>
                      <span className={styles.dlArrow}>→</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.section}><h2>📋 任务看板</h2><TaskBoard milestones={p.milestones} projectId={Number(id)} onTaskCreated={handleTaskCreated} onTaskClaimed={handleTaskClaimed} onTaskCompleted={handleCommented} showToast={showToast} users={users} /></div>

            <div className={styles.section}><h2>💬 协作空间</h2><CollabSpace p={p} showToast={showToast} onCommented={handleCommented} /></div>

            <div className={styles.section}>
              <div className={styles.sectionHeaderRow}>
                <h2>📍 里程碑</h2>
                <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.9rem' }} onClick={() => setMsCreating(true)}>＋ 新建里程碑</button>
              </div>
              {msCreating && (
                <div className={styles.msCreateForm}>
                  <input className={styles.msEditInput} placeholder="输入里程碑名称…" value={msNewTitle}
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
              <div className={styles.milestoneList}>
                {p.milestones.map((ms, mi) => {
                  const icon = ms.status === 'done' ? '✓' : ms.status === 'current' ? '→' : '○'
                  const tasksHtml = Array.isArray(ms.tasks) && typeof ms.tasks[0] === 'object'
                    ? ms.tasks.map(t => <span key={t.id || t.name} className={`${styles.msTask} ${ms.status === 'done' ? styles.msTaskDone : ''}`}>{t.name}</span>)
                    : (Array.isArray(ms.tasks) ? ms.tasks.map((t, ti) => <span key={ti} className={`${styles.msTask} ${ms.status === 'done' ? styles.msTaskDone : ''}`}>{t}</span>) : null)

                  const isEditing = editingMsId === ms.id

                  return (
                    <div key={mi} className={styles.milestoneItemWrap}>
                      <div className={`${styles.msIcon} ${msIconClass(ms.status)}`}>{icon}</div>
                      <div className={styles.msContent}>
                        {isEditing ? (
                          <input className={styles.msEditInput} value={msEditTitle} autoFocus
                            onChange={e => setMsEditTitle(e.target.value)}
                            onBlur={() => handleSaveMs(ms.id)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveMs(ms.id); if (e.key === 'Escape') { setEditingMsId(null) } }}
                          />
                        ) : (
                          <h3>{ms.title}</h3>
                        )}
                        <div className={styles.msDate}>{ms.date}</div>
                        <div className={styles.msTasks}>{tasksHtml}</div>
                      </div>
                      <div className={styles.msActions}>
                        <button className={styles.msActionBtn} onClick={() => { setEditingMsId(ms.id); setMsEditTitle(ms.title) }}>编辑</button>
                        <button className={`${styles.msActionBtn} ${styles.msActionBtnDanger}`} onClick={() => handleDeleteMs(ms.id)}>删除</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {activities && activities.length > 0 && (
              <div className={styles.section}>
                <h2>📋 项目动态</h2>
                <div className={styles.activityFeed}>
                  {activities.map((a, i) => (
                    <div key={i} className={styles.activityItem}>
                      <div className={styles.actAvatar} style={{ background: a.color }}>{a.user[0]}</div>
                      <div><strong onClick={() => navigate(`/profile/${a.user}`)}>{a.user}</strong> {a.text}<span className={styles.actTime}>{a.time}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.section}>
              <h2>团队成员</h2>
              <div className={styles.teamList}>
                {p.roles.map((r, roleIndex) => {
                  const members = r.members || []
                  const filledHtml = members.length > 0 ? members.map(m => (
                    <div key={m.name} className={styles.teamMember}>
                      <div className={styles.tmAvatar} style={{ background: m.color, cursor: 'pointer' }} onClick={() => navigate(`/profile/${m.name}`)}>{m.name[0]}</div>
                      <div className={styles.tmInfo}><h4 style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${m.name}`)}>{m.name}</h4><p>{r.name}</p></div>
                      <span className={`${styles.tmStatus} ${styles.tmActive}`}>活跃</span>
                    </div>
                  )) : (r.filled > 0 ? Array(r.filled).fill(0).map((_, idx) => (
                    <div key={`filled-${idx}`} className={styles.teamMember}>
                      <div className={styles.tmAvatar} style={{ background: 'var(--green)', opacity: 0.6 }}>✓</div>
                      <div className={styles.tmInfo}><h4>成员</h4><p>{r.name}</p></div>
                      <span className={`${styles.tmStatus} ${styles.tmActive}`}>活跃</span>
                    </div>
                  )) : null)
                  const openSlots = r.needed - r.filled
                  const openHtml = openSlots > 0 ? Array(openSlots).fill(0).map((_, idx) => (
                    <div key={`open-${idx}`} className={styles.teamMember} onClick={() => openJoinModal(Number(p.id), r.name, p)}>
                      <div className={styles.tmAvatar} style={{ background: 'var(--cream)', color: 'var(--warm-gray)', border: '1px dashed var(--border)' }}>?</div>
                      <div className={styles.tmInfo}><h4>等待加入</h4><p>{r.name}</p></div>
                      <span className={`${styles.tmStatus} ${styles.tmOpenSlot}`}>申请</span>
                    </div>
                  )) : null
                  return <div key={roleIndex}>{filledHtml}{openHtml}</div>
                })}
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            {p.status === 'done' && (
              <div className={`${styles.sidebarCard} ${styles.achievementCard}`}>
                <h3>🏆 项目成就</h3>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--ink-light)' }}>
                  {p.contributors ? p.contributors.slice(0, 2).map(c => (
                    <div key={c.name} style={{ marginBottom: '0.3rem' }}>{c.name} 解锁了「{c.role === '产品经理' ? '领航者' : c.role === '前端开发' ? '代码之力' : '设计之眼'}」徽章</div>
                  )) : null}
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--warm-gray)' }}>所有成员获得「造物参与者」纪念徽章</div>
                </div>
              </div>
            )}
            <div className={styles.sidebarCard}>
              <h3>角色招募</h3>
              <div className={styles.roleSlots}>
                {p.roles.map((r, roleIndex) => {
                  const openSlots = r.needed - r.filled
                  return openSlots > 0 ? (
                    <div key={`${r.name}-${roleIndex}`} className={`${styles.roleSlot} ${styles.roleSlotOpen}`}>
                      <div className={styles.slotLeft}><span>{r.emoji}</span><span>{r.name}</span></div>
                      <button className={styles.slotBtn} onClick={() => openJoinModal(Number(p.id), r.name, p)}>申请</button>
                    </div>
                  ) : (
                    <div key={`${r.name}-${roleIndex}`} className={`${styles.roleSlot} ${styles.roleSlotFilled}`}>
                      <div className={styles.slotLeft}><span>{r.emoji}</span><span>{r.name}</span></div>
                      <span className={styles.filledLabel}>已满</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className={styles.sidebarCard}>
              <h3>项目信息</h3>
              <div className={styles.infoRow}><span className={styles.infoLabel}>类别</span><span className={styles.infoValue}>{p.category}</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>周期</span><span className={styles.infoValue}>{p.duration}</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>协议</span><span className={styles.infoValue}>{p.license}</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>创建</span><span className={styles.infoValue}>{p.createdAt}</span></div>
            </div>
            <div className={styles.sidebarCard}>
              <h3>贡献记录</h3>
              <div className={styles.infoRow}><span className={styles.infoLabel}>总提交</span><span className={styles.infoValue}>{p.totalCommits || 0}</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>总工时</span><span className={styles.infoValue}>{p.totalHours ? p.totalHours + 'h' : '—'}</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>完成度</span>
                <span className={styles.infoValue} style={{ color: p.status === 'done' ? 'var(--green)' : p.status === 'progress' ? 'var(--gold)' : 'var(--warm-gray)' }}>
                  {p.status === 'done' ? '100%' : p.status === 'progress' ? '进行中' : '招募中'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editModalOpen && (
        <ProjectEditModal
          project={p}
          onClose={() => setEditModalOpen(false)}
          onSave={handleProjectSaved}
          showToast={showToast}
        />
      )}
    </div>
  )
}
