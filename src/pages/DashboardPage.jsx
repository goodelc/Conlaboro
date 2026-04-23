import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { STATUS_MAP, STATUS_COLORS, getProjectEmoji } from '../constants'

function BadgeItem({ badge }) {
  const { openBadgeModal } = useApp()

  return (
    <div className={`badge-item ${badge.earned ? 'earned' : 'locked'}`} onClick={() => openBadgeModal(badge)}>
      <div className="badge-icon">{badge.icon}</div>
      <div className="badge-name">{badge.name}</div>
    </div>
  )
}

const timelineData = [
  { type: 'badge', icon: '🏅', title: '解锁徽章「第一把火」', time: '2 小时前' },
  { type: 'xp', icon: '+30', title: '完成里程碑任务「用户调研报告」', xpGain: '+30 XP', sub: '社交做饭 App · 5 小时前' },
  { type: 'project', icon: '🤝', title: '加入「AI 知识图谱工具」担任设计师', xpGain: '+10 XP', time: '1 天前' },
  { type: 'xp', icon: '+15', title: '提交竞品分析报告', xpGain: '+15 XP', sub: '社交做饭 App · 3 天前' },
  { type: 'badge', icon: '🏅', title: '解锁徽章「初心者」', time: '2025年3月15日' },
  { type: 'project', icon: '🔥', title: '发起项目「社交做饭 App」', xpGain: '+50 XP', time: '2025年4月10日' },
]

const skills = [
  { emoji: '🎯', name: '需求分析', level: '中级', pct: 65 },
  { emoji: '📝', name: 'PRD 撰写', level: '中级', pct: 55 },
  { emoji: '🎨', name: 'UI 设计', level: '初级', pct: 35 },
  { emoji: '🤝', name: '团队协作', level: '中级', pct: 70 },
  { emoji: '📊', name: '竞品分析', level: '中级', pct: 60 },
  { emoji: '🧪', name: '用户调研', level: '初级', pct: 25 },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { badges, projects } = useData()

  return (
    <div className="page active" id="page-dashboard">
      <div className="dashboard-page">
        <div className="dashboard-inner">
          <div className="dash-header">
            <h1>我的公社</h1>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="btn-secondary" onClick={() => navigate('/settings')} style={{ padding: '0.7rem 1.5rem', fontSize: '0.85rem' }}>⚙️ 设置</button>
              <button className="btn-primary" onClick={() => navigate('/create')}>+ 发起新项目</button>
            </div>
          </div>

          <div className="honor-bar">
            <div className="honor-level">
              <div className="hl-icon">3</div>
              <div className="hl-text"><h4>建设者</h4><p>LEVEL 3 · Lv.3</p></div>
            </div>
            <div className="honor-stats">
              <div className="honor-stat"><div className="hs-num">847</div><div className="hs-label">贡献值</div></div>
              <div className="honor-stat"><div className="hs-num">2</div><div className="hs-label">参与项目</div></div>
              <div className="honor-stat"><div className="hs-num">12</div><div className="hs-label">贡献次数</div></div>
              <div className="honor-stat"><div className="hs-num">6<span className="hs-plus">/16</span></div><div className="hs-label">徽章</div></div>
            </div>
            <div className="xp-bar-wrap">
              <div className="xp-bar-label"><span>847 / 1500</span><span>→ 引领者</span></div>
              <div className="xp-bar"><div className="xp-bar-fill" style={{ width: '56%' }}></div></div>
            </div>
          </div>

          <div className="dash-grid">
            <div className="dash-section" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-section-header"><h3>🏅 成就徽章墙</h3><span className="count">6 / 16 已解锁</span></div>
              <div className="badge-wall" id="badge-wall">
                {badges.map(b => <BadgeItem key={b.id} badge={b} />)}
              </div>
            </div>

            <div className="dash-section">
              <div className="dash-section-header"><h3>📋 我的项目</h3><span className="count">2</span></div>
              <ul className="dash-list">
                {projects.slice(0, 2).map(p => {
                  const r = parseInt((p.authorColor || '#D4213d').slice(1,3), 16);
                  const g = parseInt((p.authorColor || '#D4213d').slice(3,5), 16);
                  const b = parseInt((p.authorColor || '#D4213d').slice(5,7), 16);
                  return (
                  <li key={p.id} className="dash-list-item" onClick={() => navigate(`/detail/${p.id}`)}>
                    <div className="dli-icon" style={{ background: `rgba(${r},${g},${b},0.1)` }}>{getProjectEmoji(p.id)}</div>
                    <div className="dli-info"><h4>{p.title}</h4><p>成员 · {STATUS_MAP[p.status]}</p></div>
                    <span className={`dli-status tag-${p.status}`} style={STATUS_COLORS[p.status]}>{STATUS_MAP[p.status]}</span>
                  </li>
                  );
                })}
              </ul>
            </div>

            <div className="dash-section">
              <div className="dash-section-header"><h3>📜 贡献记录</h3><span className="count">最近动态</span></div>
              <div className="timeline">
                {timelineData.map((t, i) => (
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

            <div className="dash-section" style={{ gridColumn: '1 / -1' }}>
              <div className="dash-section-header"><h3>📊 能力图谱</h3></div>
              <div className="skills-grid">
                {skills.map(s => (
                  <div key={s.name} className="skill-item">
                    <div className="skill-emoji">{s.emoji}</div>
                    <div className="skill-name">{s.name}</div>
                    <div className="skill-level">{s.level}</div>
                    <div className="skill-bar"><div className="skill-bar-fill" style={{ width: `${s.pct}%` }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
