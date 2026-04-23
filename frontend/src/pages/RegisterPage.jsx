import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const roleOptions = ['🎯 产品经理', '🎨 设计师', '💻 开发者', '🧪 测试', '📣 运营']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { showToast, register, loading } = useApp()
  const [form, setForm] = useState({ name: '', email: '', password: '', roles: [] })

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleRole(role) {
    setForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role]
    }))
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      showToast('请填写必填项（带 * 的字段）', 'error')
      return
    }
    if (form.password.length < 6) {
      showToast('密码至少需要 6 位', 'error')
      return
    }
    try {
      await register(form.name, form.email, form.password)
      showToast(`注册成功！欢迎加入共创公社，${form.name}`, 'success')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message || '注册失败，请稍后重试', 'error')
    }
  }

  return (
    <div className="page active" id="page-register">
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: '480px' }}>
          <div className="auth-logo">
            <span className="star" style={{ width: '18px', height: '18px', background: 'var(--red)', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', display: 'inline-block' }}></span> 共创公社
          </div>
          <p className="auth-subtitle">创建你的创客身份</p>
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group"><label>昵称 <span style={{ color: 'var(--red)' }}>*</span></label><input type="text" className="form-input" placeholder="你的公社昵称" value={form.name} onChange={e => updateField('name', e.target.value)} /></div>
            <div className="form-group"><label>邮箱 <span style={{ color: 'var(--red)' }}>*</span></label><input type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={e => updateField('email', e.target.value)} /></div>
            <div className="form-group"><label>密码 <span style={{ color: 'var(--red)' }}>*</span></label><input type="password" className="form-input" placeholder="至少6位" value={form.password} onChange={e => updateField('password', e.target.value)} /></div>
            <div className="form-group">
              <label>你的角色</label>
              <div className="role-tags" style={{ marginTop: '0.3rem' }}>
                {roleOptions.map(role => (
                  <span
                    key={role}
                    className={`role-tag ${form.roles.includes(role) ? 'active' : ''}`}
                    onClick={() => toggleRole(role)}
                  >{role}</span>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? '创建中...' : '创建账号'}
            </button>
          </form>
          <div className="auth-switch">已有账号？<span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: 'var(--red)' }}>立即登录</span></div>
        </div>
      </div>
    </div>
  )
}
