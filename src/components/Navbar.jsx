import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { notifCount, toggleNotif } = useApp()

  return (
    <nav>
      <div className="nav-left">
        <div className="nav-logo" onClick={() => navigate('/home')}>
          <span className="star"></span>
          共创公社
        </div>
        <ul className="nav-links">
          <li><Link to="/home">首页</Link></li>
          <li><span onClick={() => { navigate('/home'); setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>探索项目</span></li>
          <li><Link to="/leaderboard">排行榜</Link></li>
          <li><Link to="/dashboard">我的公社</Link></li>
        </ul>
      </div>
      <div className="nav-right">
        <div className="nav-icon-btn" onClick={toggleNotif} title="通知">
          🔔
          <span className="badge" id="notif-badge">{notifCount}</span>
        </div>
        <span className="nav-links" style={{ gap: '1rem' }}>
          <Link to="/showcase" style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', cursor: 'pointer', color: 'var(--ink-light)', transition: 'color 0.3s' }}>成果展厅</Link>
        </span>
        <div className="nav-avatar" onClick={() => navigate('/dashboard')}>你</div>
        <button className="nav-cta" onClick={() => navigate('/create')}>+ 发起项目</button>
      </div>
    </nav>
  )
}
