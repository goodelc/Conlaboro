import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { getMyBadges } from '../api/badge'
import { getMyActivities } from '../api/activity'
import { STATUS_MAP, STATUS_COLORS, NEXT_LEVEL_XP, getProjectEmoji, LEVEL_COLORS } from '../constants'
import styles from './DashboardPage.module.css'
import btn from '../assets/shared/Buttons.module.css'

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

function BadgeItem({ badge }) {
  const { openBadgeModal } = useApp()
  return (
    <div className={`${styles.badgeItem} ${badge.earned ? styles.badgeEarned : styles.badgeLocked}`} onClick={() => openBadgeModal(badge)}>
      <div className={styles.badgeIcon}>{badge.icon}</div>
      <div className={styles.badgeName}>{badge.name}</div>
    </div>
  )
}

const EMPTY_TIMELINE_MSG = '还没有贡献记录，去参加一个项目吧！'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { isLoggedIn, currentUser } = useApp()
  const { badges, projects, users } = useData()
  const [userBadges, setUserBadges] = useState([])
  const [activities, setActivities] = useState([])

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="page active" id="page-dashboard">
        <div className={styles.loginPrompt}>
          <h2>请先登录</h2>
          <p style={{ color: 'var(--warm-gray)', marginTop: '1rem' }}>
            <button className={`${btn.primary} ${styles.loginBtn}`} onClick={() => navigate('/login')}>前往登录</button>
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      getMyBadges(currentUser.id).then(data => {
        const earnedBadges = (data || []).filter(b => b.condition === 'true')
        setUserBadges(earnedBadges)
      }).catch(err => console.error('Failed to fetch user badges:', err))
    }
  }, [isLoggedIn, currentUser?.id])

  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      getMyActivities(10).then(data => {
        setActivities(data || [])
      }).catch(() => {})
    }
  }, [isLoggedIn, currentUser?.id])

  const raw = users[currentUser.name] || currentUser
  const u = {
    name: raw.name || '用户', color: raw.color || '#D4213D', role: raw.role || '新社员',
    level: raw.level ?? 1, levelName: raw.levelName || '新社员', xp: raw.xp ?? 0,
    projects: raw.projects ?? 0, badges: raw.badges ?? 0, joined: raw.joined || '刚刚',
    bio: raw.bio || '', skills: raw.skills || [], earnedBadges: raw.earnedBadges || [],
  }
  const userProjects = (projects || []).filter(item => {
    const p = item.project || item; const roles = item.roles || []
    return roles.some(role => role.members && role.members.includes(u.name))
  })
  const nextXp = NEXT_LEVEL_XP[u.level] || 1500
  const xpPct = Math.min(100, Math.round((u.xp / nextXp) * 100))
  const earnedBadgeCount = userBadges.length
  const nextLevelNames = { 1:'创客', 2:'建设者', 3:'骨干', 4:'引领者', 5:'先驱', 6:'传奇' }
  const nextLevelName = nextLevelNames[u.level + 1] || '传奇'

  return (
    <div className="page active" id="page-dashboard">
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <h1>{u.name} 的公社</h1>
            <div className={styles.headerActions}>
              <button className={`${btn.secondary} ${styles.settingsBtn}`} onClick={() => navigate('/settings')}>⚙️ 设置</button>
              <button className={btn.primary} onClick={() => navigate('/create')}>+ 发起新项目</button>
            </div>
          </div>

          <div className={styles.honorBar}>
            <div className={styles.honorLevel}>
              <div className={styles.hlIcon}>{u.level}</div>
              <div className={styles.hlText}><h4>{u.levelName}</h4><p>LEVEL {u.level} · Lv.{u.level}</p></div>
            </div>
            <div className={styles.honorStats}>
              <div className={styles.honorStat}><div className={styles.hsNum}>{u.xp.toLocaleString()}</div><div className={styles.hsLabel}>贡献值</div></div>
              <div className={styles.honorStat}><div className={styles.hsNum}>{userProjects.length}</div><div className={styles.hsLabel}>参与项目</div></div>
              <div className={styles.honorStat}><div className={styles.hsNum}>{u.projects}</div><div className={styles.hsLabel}>贡献次数</div></div>
              <div className={styles.honorStat}><div className={styles.hsNum}>{earnedBadgeCount}<span className={styles.hsPlus}>/{badges.length}</span></div><div className={styles.hsLabel}>徽章</div></div>
            </div>
            <div className={styles.xpBarWrap}>
              <div className={styles.xpBarLabel}><span>{u.xp.toLocaleString()} / {nextXp.toLocaleString()}</span><span>→ {nextLevelName}</span></div>
              <div className={styles.xpBar}><div className={styles.xpBarFill} style={{ width: `${xpPct}%` }}></div></div>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={`${styles.section} ${styles.sectionFullWidth}`}>
              <div className={styles.sectionHeader}><h3>🏅 成就徽章墙</h3><span className={styles.countBadge}>{earnedBadgeCount} / {badges.length} 已解锁</span></div>
              <div className={styles.badgeWall}>
                {badges.map(b => <BadgeItem key={b.id} badge={{ ...b, earned: userBadges.some(ub => ub.badgeId === b.id || ub.id === b.id) }} />)}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}><h3>📋 我的项目</h3><span className={styles.countBadge}>{userProjects.length}</span></div>
              <ul className={styles.list}>
                {userProjects.length > 0 ? userProjects.map(item => {
                  const p = item.project || item; const roles = item.roles || []
                  const userRole = roles.find(role => role.members && role.members.includes(u.name)); const role = userRole || null
                  const rgb = parseInt((u.color || '#D4213d').slice(1), 16)
                  const rVal = (rgb >> 16) & 255, gVal = (rgb >> 8) & 255, bVal = rgb & 255
                  return (
                    <li key={p.id} className={styles.listItem} onClick={() => navigate(`/detail/${p.id}`)}>
                      <div className={styles.listIcon} style={{ background: `rgba(${rVal},${gVal},${bVal},0.1)` }}>{getProjectEmoji(p)}</div>
                      <div className={styles.listInfo}><h4>{p.title}</h4><p>{role ? role.name : '成员'} · {STATUS_MAP[p.status]}</p></div>
                      <span className={`${styles.listStatus} tag-${p.status}`} style={STATUS_COLORS[p.status]}>{STATUS_MAP[p.status]}</span>
                    </li>
                  )
                }) : (
                  <li className={styles.emptyList}>还没有参与任何项目，<Link to="/create" className={styles.emptyLink}>去发起一个</Link></li>
                )}
              </ul>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}><h3>📜 贡献记录</h3><span className={styles.countBadge}>最近动态</span></div>
              <div className={!activities.length ? styles.timelineEmpty : styles.timeline}>
                {activities.length > 0 ? (
                  activities.map((a, i) => (
                    <div key={i} className={styles.timelineItem}>
                      <span className={styles.timelineAction}>{a.text || a.actionType}</span>
                      <span className={styles.timelineTime}>{a.createdAt || a.time}</span>
                    </div>))
                ) : (
                  <p className={styles.timelineText}>还没有贡献记录，去参加一个项目吧！</p>
                )}
              </div>
            </div>

            <div className={`${styles.section} ${styles.sectionFullWidth}`}>
              <div className={styles.sectionHeader}><h3>📊 能力图谱</h3></div>
              <div className={styles.skillsGrid}>
                {(u.skills || []).map(s => {
                  const lvl = s.pct >= 80 ? '高级' : s.pct >= 50 ? '中级' : '初级'
                  return (
                    <div key={s.name} className={styles.skillItem}>
                      <div className={styles.skillEmoji}>{SKILL_EMOJIS[s.name] || '📌'}</div>
                      <div className={styles.skillName}>{s.name}</div>
                      <div className={styles.skillLevel}>{lvl}</div>
                      <div className={styles.skillBar}><div className={styles.skillBarFill} style={{ width: `${s.pct}%` }}></div></div>
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
