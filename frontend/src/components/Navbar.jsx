import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import styles from './Navbar.module.css'
import * as btn from '../assets/shared/Buttons.module.css'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { notifCount, toggleNotif, isLoggedIn, currentUser, logout, fetchUnreadCount } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)

  // 登录后自动拉取未读通知数
  useEffect(() => {
    if (isLoggedIn) fetchUnreadCount()
  }, [isLoggedIn, fetchUnreadCount])

  // 路由变化时关闭移动菜单
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // 登录/注册页隐藏导航栏（必须在所有hooks之后）
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  if (isAuthPage) return null

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <div className={styles.logo} onClick={() => navigate('/home')}>
          <span className={styles.star}></span>
          共创公社
        </div>
        <ul className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
          <li><Link to="/home" className={styles.link}>首页</Link></li>
          <li><span className={styles.link} onClick={() => { navigate('/home'); setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>探索项目</span></li>
          <li><Link to="/leaderboard" className={styles.link}>排行榜</Link></li>
          <li><Link to="/idea-wall" className={styles.link}>想法墙</Link></li>
          <li><Link to="/dashboard" className={styles.link}>我的公社</Link></li>
        </ul>
      </div>
      <button className={styles.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="菜单">
        <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen : ''}`}></span>
        <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen : ''}`}></span>
        <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen : ''}`}></span>
      </button>
      <div className={`${styles.right} ${menuOpen ? styles.rightOpen : ''}`}>
        {isLoggedIn && (
          <div className={styles.iconBtn} onClick={toggleNotif} title="通知">
            🔔
            {notifCount > 0 && <span className={styles.notifBadge} id="notif-badge">{notifCount}</span>}
          </div>
        )}
        {isLoggedIn && (
          <Link to="/showcase" className={styles.showcaseLink}>🏆 成果展厅</Link>
        )}

        {isLoggedIn ? (
          <>
            <div
              className={styles.avatar}
              onClick={() => navigate(`/profile/${currentUser?.name || '你'}`)}
              style={{ background: currentUser?.color || '#D4213d' }}
              title={currentUser?.name || '用户'}
            >{(currentUser?.name || '你')[0]}</div>
            <button className={`${btn.secondary} ${styles.logoutBtn}`} onClick={() => { logout(); navigate('/home'); window.location.reload() }} style={{ marginLeft: '0.3rem', padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
              退出
            </button>
            <button className={styles.cta} onClick={() => navigate('/create')}>+ 发起项目</button>
          </>
        ) : (
          <>
            <button className={btn.secondary} onClick={() => navigate('/login')} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              登录
            </button>
            <button className={styles.cta} onClick={() => navigate('/register')}>注册加入</button>
          </>
        )}
      </div>
    </nav>
  )
}
