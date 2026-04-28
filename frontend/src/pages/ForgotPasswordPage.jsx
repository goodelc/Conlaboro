import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { resetPassword } from '../api/auth'
import styles from './ForgotPasswordPage.module.css'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    if (newPassword.length < 6) { alert('密码至少6位'); return }
    setLoading(true)
    try {
      await resetPassword({ email: email.trim(), newPassword })
      setSuccess(true)
    } catch (err) {
      alert(err.message || '重置失败，请检查邮箱是否正确')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className={`page active ${styles.page}`}>
        <div className={styles.box}>
          <h2>✅ 密码已重置</h2>
          <p>你的密码已成功更新，请使用新密码登录。</p>
          <button className="btn-primary" onClick={() => navigate('/login')} style={{ width: '100%', marginTop: '1rem' }}>前往登录</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`page active ${styles.page}`}>
      <div className={styles.box}>
        <h2>🔑 重置密码</h2>
        <p className={styles.desc}>输入注册邮箱和新密码即可重置</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>注册邮箱</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus />
          </div>
          <div className={styles.field}>
            <label>新密码（至少6位）</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="******" required minLength={6} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !email || !newPassword} style={{ width: '100%' }}>
            {loading ? '处理中...' : '确认重置'}
          </button>
        </form>
        <p className={styles.backLink}><Link to="/login">← 返回登录</Link></p>
      </div>
    </div>
  )
}
