import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'

const medals = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const { users: userData } = useData()
  const [tab, setTab] = useState('xp')

  const allUsers = Object.values(userData).sort((a, b) => b.xp - a.xp)
  const top3 = allUsers.slice(0, 3)
  const rest = allUsers.slice(3)

  const tabs = [
    { key: 'xp', label: '贡献值总榜' },
    { key: 'weekly', label: '本周活跃' },
    { key: 'monthly', label: '月度新星' },
    { key: 'badges', label: '徽章收集' },
  ]

  return (
    <div className="page active" id="page-leaderboard">
      <div className="leaderboard-page" id="leaderboard-content">
        <div className="lb-inner">
          <div className="lb-header"><h1>🏆 排行榜</h1><p>致敬每一位为公社贡献力量的创客</p></div>
          <div className="lb-tabs">
            {tabs.map(t => (
              <button key={t.key} className={`lb-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>
          <div className="lb-podium">
            {top3.map((u, i) => (
              <div key={u.name} className={`lb-podium-item ${i === 0 ? 'first' : ''}`} onClick={() => navigate(`/profile/${u.name}`)}>
                <div className="podium-rank">{medals[i]}</div>
                <div className="podium-avatar" style={{ background: u.color }}>{u.name[0]}</div>
                <div className="podium-name">{u.name}</div>
                <div className="podium-role">{u.role} · {u.levelName}</div>
                <div className="podium-value">{tab === 'badges' ? u.badges : u.xp.toLocaleString()}</div>
                <div className="podium-label">{tab === 'badges' ? '枚徽章' : '贡献值'}</div>
              </div>
            ))}
          </div>
          <div className="lb-list">
            {rest.map((u, i) => (
              <div key={u.name} className="lb-list-item" onClick={() => navigate(`/profile/${u.name}`)}>
                <div className="lb-rank">{i + 4}</div>
                <div className="lb-avatar" style={{ background: u.color }}>{u.name[0]}</div>
                <div className="lb-info"><h4>{u.name}</h4><p>{u.role} · {u.levelName} · Lv.{u.level}</p></div>
                <div className="lb-value">{tab === 'badges' ? `${u.badges} 🏅` : u.xp.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
