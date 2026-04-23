import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { showToast } = useApp()

  return (
    <div className="page active" id="page-login">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="star" style={{ width: '18px', height: '18px', background: 'var(--red)', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', display: 'inline-block' }}></span> 共创公社
          </div>
          <p className="auth-subtitle">加入公社，和志同道合的人一起创造</p>
          <div className="auth-oauth">
            <button className="auth-oauth-btn" onClick={() => { navigate('/home'); showToast('GitHub 登录演示', 'success') }}>🐙 使用 GitHub 登录</button>
            <button className="auth-oauth-btn" onClick={() => { navigate('/home'); showToast('Google 登录演示', 'success') }}>📧 使用 Google 登录</button>
          </div>
          <div className="auth-divider">或</div>
          <div className="auth-form">
            <div className="form-group"><label>邮箱</label><input type="email" className="form-input" placeholder="your@email.com" /></div>
            <div className="form-group"><label>密码</label><input type="password" className="form-input" placeholder="输入密码" /></div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => { navigate('/home'); showToast('登录成功，欢迎回来！', 'success') }}>登录</button>
          </div>
          <div className="auth-switch">还没有账号？<span onClick={() => navigate('/register')} style={{ cursor: 'pointer', color: 'var(--red)' }}>立即注册</span></div>
        </div>
      </div>
    </div>
  )
}
