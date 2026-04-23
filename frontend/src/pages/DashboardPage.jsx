import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { STATUS_MAP, STATUS_COLORS, NEXT_LEVEL_XP, getProjectEmoji, LEVEL_COLORS } from '../constants'

function BadgeItem({ badge }) {
  const { openBadgeModal } = useApp()

  return (
    <div className={`badge-item ${badge.earned ? 'earned' : 'locked'}`} onClick={() => openBadgeModal(badge)}>
      <div className="badge-icon">{badge.icon}</div>
      <div className="badge-name">{badge.name}</div>
    </div>
  )
}

/** 默认 timeline 占位 — 后端对接时替换为 API 数据 */
const DEFAULT_TIMELINE = [
  { type: 'badge', icon: '🏅', title: '解锁徽章「第一把火」', time: '2 小时前' },
  { type: 'xp', icon: '+30', title: '完成里程碑任务「用户调研报告」', xpGain: '+30 XP', sub: '社交做饭 App · 5 小时前' },
  { type: 'project', icon: '🤝', title: '加入「AI 知识图谱工具」担任设计师', xpGain: '+10 XP', time: '1 天前' },
  { type: 'xp', icon: '+15', title: '提交竞品分析报告', xpGain: '+15 XP', sub: '社交做饭 App · 3 天前' },
  { type: 'badge', icon: '🏅', title: '解锁徽章「初心者」', time: '2025年3月15日' },
  { type: 'project', icon: '🔥', title: '发起项目「社交做饭 App」', xpGain: '+50 XP', time: '2025年4月10日' },
]

/** 技能 emoji 映射 */
const SKILL_EMOJIS = {
  '需求分析':'🎯','PRD撰写':'📝','PRD 撰写':'📝','UI设计':'🎨','UI 设计':'🎨',
  '团队协作':'🤝','竞品分析':'📊','用户调研':'🧪','数据分析':'📈',
  'React':'⚛️','Vue':'💚','Node.js':'🟢','CSS':'🎨','TypeScript':'🔷',
  'Go':'🐹','Python':'🐍','PostgreSQL':'🐘','系统设计':'🏗️','API设计':'🔌','API 设计':'🔌',
  '交互设计':'✨','Figma':'🎨','用户研究':'🔍','品牌设计':'🏷️',
  'AI产品':'🤖','AI 产品':'🤖','产品设计':'📐','适老化设计':'👴',
  '数据可视化':'📊','插画':'🖌️','JavaScript':'🟨',
  '游戏设计':'🎮','关卡设计':'🗺️','像素美术':'👾','像素角色':'🧑‍🎨','像素场景':'🏞️',
  '动画':'🎬','Godot':'🎮','GDScript':'📜','游戏物理':'⚙️',
  'MongoDB':'🍃','CSS动画':'🎞️','CSS 动画':'🎞️','Three.js':'🌐','项目管理':'📋',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { isLoggedIn, currentUser } = useApp()
  const { badges, projects, users } = useData()

  /* ── 未登录保护（RequireAuth 已拦截，双重保险）── */
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="page active" id="page-dashboard">
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <h2>请先登录</h2>
          <p style={{ color: 'var(--warm-gray)', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={() => navigate('/login')} style={{ marginTop: '1rem' }}>前往登录</button>
          </p>
        </div>
      </div>
    )
  }

  /* ── 从 users 数据补全 currentUser 的完整字段 ── */
  const raw = users[currentUser.name] || currentUser
  const u = {
    name: raw.name || '用户',
    color: raw.color || '#D4213D',
    role: raw.role || '新社员',
    level: raw.level ?? 1,
    levelName: raw.levelName || '新社员',
    xp: raw.xp ?? 0,
    projects: raw.projects ?? 0,
    badges: raw.badges ?? 0,
    joined: raw.joined || '刚刚',
    bio: raw.bio || '',
    skills: raw.skills || [],
    earnedBadges: raw.earnedBadges || [],
  }
  const userProjects = projects.filter(p =>
    p.roles.some(r => r.members.some(m => m.name === currentUser.name))
  )
  const nextXp = NEXT_LEVEL_XP[u.level] || 1500
  const xpPct = Math.min(100, Math.round((u.xp / nextXp) * 100))
  const earnedBadgeCount = (u.earnedBadges || []).length

  /** 下一个等级名称 */
  const nextLevelNames = { 1:'创客', 2:'建设者', 3:'骨干', 4:'引领者', 5:'先驱', 6:'传奇' }
  const nextLevelName = nextLevelNames[u.level + 1] || '传奇'

  return (
    <div className="page active" id="page-dashboard">
      <div className="dashboard-page">
        <div className="dashboard-inner">
          <div className="dash-header">
            <h1>{u.name} 的公社</h1>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="btn-secondary" onClick={() => navigate('/settings')} style={{ padding: '0.7rem 1.5rem', fontSize: '0.85rem' }}>⚙️ 设置</button>
              <button className="btn-primary" onClick={() => navigate('/create')}>+ 发起新项目</button>
            </div>
          </div>

          {/* ── 荣誉栏：全部动态化 ── */}
          <div className="honor-bar">
            <div className="honor-level">
              <div className="hl-icon">{u.level}</div>
              <div className="hl-text"><h4>{u.levelName}</h4><p>LEVEL {u.level} · Lv.{u.level}</p></div>
            </div>
            <div className="honor-stats">
              <div className="honor-stat"><div className="hs-num">{u.xp.toLocaleString()}</div><div className="hs-label">贡献值</div></div>
              <div className="honor-stat"><div className="hs-num">{userProjects.length}</div><div className="hs-label">参与项目</div></div>
              <div className="honor-stat"><div className="hs-num">{u.projects}</div><div className="hs-label">贡献次数</div></div>
              <div className="honor-stat"><div className="hs-num">{earnedBadgeCount}<span className="hs-plus">/{badges.length}</span></div><div className="hs-label">徽章</div></div>
            </div>
            <div className="xp-bar-wrap">
              <div className="xp-bar-label"><span>{u.xp.toLocaleString()} / {nextXp.toLocaleString()}</span><span>→ {nextLevelName}</span></div>
              <div className="xp-bar"><div className="xp-bar-fill" style={{ width: `${xpPct}%` }}></div></div>
            </div>
          </div>

          <div className="dash-grid">
            <div className="dash-section" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-section-header"><h3>🏅 成就徽章墙</h3><span className="count">{earnedBadgeCount} / {badges.length} 已解锁</span></div>
              <div className="badge-wall" id="badge-wall">
                {badges.map(b => {
                  const isEarned = u.earnedBadges && u.earnedBadges.includes(b.id)
                  return <BadgeItem key={b.id} badge={{ ...b, earned: isEarned }} />
                })}
              </div>
            </div>

            {/* 我的项目：只显示当前用户参与的 */}
            <div className="dash-section">
              <div className="dash-section-header"><h3>📋 我的项目</h3><span className="count">{userProjects.length}</span></div>
              <ul className="dash-list">
                {userProjects.length > 0 ? userProjects.map(p => {
                  const role = p.roles.find(r => r.members.some(m => m.name === currentUser.name))
                  const rgb = parseInt((u.color || '#D4213d').slice(1), 16)
                  const r = (rgb >> 16) & 255, g = (rgb >> 8) & 255, b = rgb & 255
                  return (
                    <li key={p.id} className="dash-list-item" onClick={() => navigate(`/detail/${p.id}`)}>
                      <div className="dli-icon" style={{ background: `rgba(${r},${g},${b},0.1)` }}>{getProjectEmoji(p.id)}</div>
                      <div className="dli-info"><h4>{p.title}</h4><p>{role ? role.name : '成员'} · {STATUS_MAP[p.status]}</p></div>
                      <span className={`dli-status tag-${p.status}`} style={STATUS_COLORS[p.status]}>{STATUS_MAP[p.status]}</span>
                    </li>
                  )
                }) : (
                  <li style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--warm-gray)' }}>
                    还没有参与任何项目，<Link to="/create" style={{ color: 'var(--red)' }}>去发起一个</Link>
                  </li>
                )}
              </ul>
            </div>

            {/* 贡献记录：暂时用默认数据（后端对接时替换） */}
            <div className="dash-section">
              <div className="dash-section-header"><h3>📜 贡献记录</h3><span className="count">最近动态</span></div>
              <div className="timeline">
                {DEFAULT_TIMELINE.map((t, i) => (
                  <div key={i} className="timeline-item">
                    <div className={`timeline-dot ${t.type}`}>{t.icon}</div>
                    <div className="timeline-content">
                      <h4>{t.title} {t.xpGain && <span className="xp-gain">{t.xpGain}</span>}</h4>
                      <p>{t.time || t.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 能力图谱：从用户技能数据动态渲染 */}
            <div className="dash-section" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-section-header"><h3>📊 能力图谱</h3></div>
              <div className="skills-grid">
                {(u.skills || []).map(s => {
                  const lvl = s.pct >= 80 ? '高级' : s.pct >= 50 ? '中级' : '初级'
                  return (
                    <div key={s.name} className="skill-item">
                      <div className="skill-emoji">{SKILL_EMOJIS[s.name] || '📌'}</div>
                      <div className="skill-name">{s.name}</div>
                      <div className="skill-level">{lvl}</div>
                      <div className="skill-bar"><div className="skill-bar-fill" style={{ width: `${s.pct}%` }}></div></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
