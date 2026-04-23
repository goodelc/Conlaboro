import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { showToast, login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      showToast('请填写邮箱和密码', 'error')
      return
    }
    // 模拟登录：从 users 数据中查找匹配用户
    login({ name: email.split('@')[0] || '新用户', email, color: '#D4213d' })
    showToast(`欢迎回来，${email.split('@')[0]}！`, 'success')
    navigate('/dashboard')
  }

  function handleOAuth(provider) {
    // 模拟 OAuth 登录
    const names = { GitHub: 'GitHub用户', Google: 'Google用户' }
    login({ name: names[provider] || `${provider}用户`, color: '#4A90D9' })
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
