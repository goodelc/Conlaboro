import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { STATUS_MAP, STATUS_COLORS, LEVEL_COLORS, NEXT_LEVEL_XP } from '../constants'

export default function ProfilePage() {
  const { name } = useParams()
  const navigate = useNavigate()
  const { users: userData, projects, badges, dataLoading } = useData()
  const { openBadgeModal } = useApp()

  if (dataLoading) {
    return (
      <div className="page active" id="page-profile">
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  const u = userData[name]
  if (!u) {
    return (
      <div className="page active" id="page-profile">
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <h2>用户不存在</h2>
          <p style={{ color: 'var(--warm-gray)', marginTop: '1rem' }}>
            <button className="btn-secondary" onClick={() => navigate('/home')} style={{ marginTop: '1rem' }}>返回首页</button>
          </p>
        </div>
      </div>
    )
  }

  const userProjects = (projects || []).filter(item => {
    const p = item.project || item
    const roles = item.roles || []
    return roles.some(role => role.members && role.members.some(m => m.name === u.name))
  })

  return (
    <div className="page active" id="page-profile">
      <div className="profile-page" id="profile-content">
        <div className="profile-inner">
          <div className="detail-breadcrumb" style={{ marginBottom: '2rem' }}>
            <Link to="/home" style={{ cursor: 'pointer' }}>首页</Link> / <strong>{u.name} 的主页</strong>
          </div>

          <div className="profile-hero">
            <div className="ph-avatar" style={{ background: u.color }}>{u.name[0]}</div>
            <div className="ph-info">
              <h1>{u.name}</h1>
              <div className="ph-meta">
                <span>{u.role}</span><span>·</span>
                <span style={{ color: LEVEL_COLORS[u.level] || 'var(--red)', fontWeight: 700 }}>{u.levelName} · Lv.{u.level}</span>
                <span>·</span><span>加入于 {u.joined}</span>
              </div>
              <p className="ph-bio">{u.bio}</p>
            </div>
            <div className="ph-stats">
              <div className="ph-stat"><div className="num">{u.xp.toLocaleString()}</div><div className="label">贡献值</div></div>
              <div className="ph-stat"><div className="num">{u.projects}</div><div className="label">项目</div></div>
              <div className="ph-stat"><div className="num">{u.badges}</div><div className="label">徽章</div></div>
            </div>
          </div>

          <div className="profile-body">
            <div>
              <div className="profile-section">
                <div className="profile-section-header"><h3>📋 参与项目</h3><span className="count">{userProjects.length}</span></div>
                <ul className="dash-list">
                  {userProjects.map(item => {
                    const p = item.project || item
                    const roles = item.roles || []
                    const role = roles[0] || null
                    return (
                      <li key={p.id} className="dash-list-item" onClick={() => navigate(`/detail/${p.id}`)}>
                        <div className="dli-icon" style={{ background: `rgba(${parseInt(u.color.slice(1,3),16)},${parseInt(u.color.slice(3,5),16)},${parseInt(u.color.slice(5,7),16)},0.1)` }}>{role ? (role.emoji || '📋') : '📋'}</div>
                        <div className="dli-info"><h4>{p.title}</h4><p>{role ? role.name : '成员'} · {STATUS_MAP[p.status]}</p></div>
                        <span className="dli-status" style={STATUS_COLORS[p.status]}>{STATUS_MAP[p.status]}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <div>
              <div className="profile-sidebar-section">
                <h3>🏅 徽章 ({u.badges}/{badges.length})</h3>
                <div className="profile-badge-wall">
                  {badges.map(b => {
                    const isEarned = u.earnedBadges && u.earnedBadges.includes(b.id)
                    return (
                      <div key={b.id} className={`profile-badge-item ${isEarned ? 'earned' : 'locked'}`} onClick={() => openBadgeModal(b)}>
                        <div className="pbi-icon">{b.icon}</div>
                        <div className="pbi-name">{b.name}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="profile-sidebar-section">
                <h3>📊 技能</h3>
                <div className="profile-skill-list">
                  {(u.skills || []).map(s => (
                    <div key={s.name} className="profile-skill-row">
                      <span className="psr-label">{s.name}</span>
                      <div className="psr-bar"><div className="psr-bar-fill" style={{ width: `${s.pct}%` }}></div></div>
                      <span className="psr-val">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-sidebar-section">
                <h3>📈 等级进度</h3>
                <div className="xp-bar-label">
                  <span>{u.xp.toLocaleString()} / {NEXT_LEVEL_XP[u.level].toLocaleString()}</span>
                  <span>Lv.{u.level + 1}</span>
                </div>
                <div className="xp-bar"><div className="xp-bar-fill" style={{ width: `${Math.min(100, (u.xp / NEXT_LEVEL_XP[u.level]) * 100)}%` }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
