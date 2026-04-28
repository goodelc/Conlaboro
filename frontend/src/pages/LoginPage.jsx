import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import auth from './AuthPages.module.css'
import sharedAuth from '../assets/shared/Auth.module.css'
import btn from '../assets/shared/Buttons.module.css'
import form from '../assets/shared/Forms.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { showToast, login, loading } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      showToast('请填写邮箱和密码', 'error')
      return
    }
    try {
      await login(email, password)
      showToast('登录成功，欢迎回来！', 'success')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message || '登录失败，请检查邮箱和密码', 'error')
    }
  }

  function handleOAuth(provider) {
    // TODO: OAuth2 接入（GitHub / Google）
    showToast(`${provider} 登录即将开放`, 'info')
  }

  return (
    <div className="page active" id="page-login">
      <div className={sharedAuth.page}>
        <div className={sharedAuth.card}>
          <div className={sharedAuth.logo}>
            <span className={auth.star}></span> 共创公社
          </div>
          <p className={sharedAuth.subtitle}>加入公社，和志同道合的人一起创造</p>
          <div className={sharedAuth.oauth}>
            <button className={sharedAuth.oauthBtn} onClick={() => handleOAuth('GitHub')}>🐙 使用 GitHub 登录</button>
            <button className={sharedAuth.oauthBtn} onClick={() => handleOAuth('Google')}>📧 使用 Google 登录</button>
          </div>
          <div className={sharedAuth.divider}>或</div>
          <form className={sharedAuth.form} onSubmit={handleLogin}>
            <div className={form.group}><label>邮箱</label><input type="email" className={form.input} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className={form.group}><label>密码</label><input type="password" className={form.input} placeholder="输入密码" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <button type="submit" className={`${btn.primary} ${auth.btnFullWidth}`} disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          <div className={sharedAuth.switchText}>还没有账号？<span onClick={() => navigate('/register')} className={auth.link}>立即注册</span> · <Link to="/forgot-password" className={auth.link}>忘记密码</Link></div>
        </div>
      </div>
    </div>
  )
}
