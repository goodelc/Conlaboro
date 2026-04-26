import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { notifCount, toggleNotif, isLoggedIn, currentUser, logout, fetchUnreadCount } = useApp()

  // 登录后自动拉取未读通知数
  useEffect(() => {
    if (isLoggedIn) fetchUnreadCount()
  }, [isLoggedIn])

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
          <li><Link to="/idea-wall">想法墙</Link></li>
          <li><Link to="/dashboard">我的公社</Link></li>
        </ul>
      </div>
      <div className="nav-right">
        {isLoggedIn && (
          <div className="nav-icon-btn" onClick={toggleNotif} title="通知">
            🔔
            {notifCount > 0 && <span className="badge" id="notif-badge">{notifCount}</span>}
          </div>
        )}
        {isLoggedIn && (
          <Link to="/showcase" className="nav-showcase-link">🏆 成果展厅</Link>
        )}

        {isLoggedIn ? (
          <>
            <div
              className="nav-avatar"
              onClick={() => navigate(`/profile/${currentUser?.name || '你'}`)}
              style={{ background: currentUser?.color || '#D4213d' }}
              title={currentUser?.name || '用户'}
            >{(currentUser?.name || '你')[0]}</div>
            <button className="btn-secondary nav-logout" onClick={() => { logout(); navigate('/home'); window.location.reload() }} style={{ marginLeft: '0.3rem', padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
              退出
            </button>
            <button className="nav-cta" onClick={() => navigate('/create')}>+ 发起项目</button>
          </>
        ) : (
          <>
            <button className="btn-secondary nav-login-btn" onClick={() => navigate('/login')} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              登录
            </button>
            <button className="nav-cta" onClick={() => navigate('/register')}>注册加入</button>
          </>
        )}
      </div>
    </nav>
  )
}
