import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'

/** 默认新用户数据（users.js 中不存在的用户用此兜底） */
function defaultUser(name) {
  return {
    name,
    color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'),
    role: '新社员',
    level: 1,
    levelName: '新社员',
    xp: 50,
    projects: 0,
    badges: 0,
    joined: '刚刚',
    bio: '还没有填写个人简介',
    skills: [],
    earnedBadges: [0],
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { showToast, login } = useApp()
  const { users } = useData()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      showToast('请填写邮箱和密码', 'error')
      return
    }
    const name = email.split('@')[0] || '新用户'
    // 尝试在 users 数据中匹配，否则用默认值
    const user = users[name] || defaultUser(name)
    login({ ...user, email })
    showToast(`欢迎回来，${user.name}！`, 'success')
    navigate('/dashboard')
  }

  function handleOAuth(provider) {
    const names = { GitHub: 'Jay', Google: 'Yuki' }   // 映射到已有用户，方便体验完整数据
    const name = names[provider] || `${provider}用户`
    const user = users[name] || defaultUser(name)
    login(user)
    showToast(`${provider} 登录成功！`, 'success')
    navigate('/dashboard')
  }

  return (
    <div className="page active" id="page-login">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="star" style={{ width: '18px', height: '18px', background: 'var(--red)', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', display: 'inline-block' }}></span> 共创公社
          </div>
          <p className="auth-subtitle">加入公社，和志同道合的人一起创造</p>
          <div className="auth-oauth">
            <button className="auth-oauth-btn" onClick={() => handleOAuth('GitHub')}>🐙 使用 GitHub 登录</button>
            <button className="auth-oauth-btn" onClick={() => handleOAuth('Google')}>📧 使用 Google 登录</button>
          </div>
          <div className="auth-divider">或</div>
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group"><label>邮箱</label><input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="form-group"><label>密码</label><input type="password" className="form-input" placeholder="输入密码" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>登录</button>
          </form>
          <div className="auth-switch">还没有账号？<span onClick={() => navigate('/register')} style={{ cursor: 'pointer', color: 'var(--red)' }}>立即注册</span></div>
        </div>
      </div>
    </div>
  )
}
