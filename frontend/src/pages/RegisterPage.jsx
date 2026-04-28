import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import auth from './AuthPages.module.css'
import sharedAuth from '../assets/shared/Auth.module.css'
import btn from '../assets/shared/Buttons.module.css'
import form from '../assets/shared/Forms.module.css'
import tags from '../assets/shared/Tags.module.css'

const roleOptions = ['🎯 产品经理', '🎨 设计师', '💻 开发者', '🧪 测试', '📣 运营']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { showToast, register, loading } = useApp()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', roles: [] })

  function updateField(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function toggleRole(role) {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role]
    }))
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      showToast('请填写必填项（带 * 的字段）', 'error')
      return
    }
    if (formData.password.length < 6) {
      showToast('密码至少需要 6 位', 'error')
      return
    }
    try {
      await register(formData.name, formData.email, formData.password)
      showToast(`注册成功！欢迎加入共创公社，${formData.name}`, 'success')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message || '注册失败，请稍后重试', 'error')
    }
  }

  return (
    <div className="page active" id="page-register">
      <div className={sharedAuth.page}>
        <div className={`${sharedAuth.card} ${auth.cardWide}`}>
          <div className={sharedAuth.logo}>
            <span className={auth.star}></span> 共创公社
          </div>
          <p className={sharedAuth.subtitle}>创建你的创客身份</p>
          <form className={sharedAuth.form} onSubmit={handleRegister}>
            <div className={form.group}><label>昵称 <span className={auth.required}>*</span></label><input type="text" className={form.input} placeholder="你的公社昵称" value={formData.name} onChange={e => updateField('name', e.target.value)} /></div>
            <div className={form.group}><label>邮箱 <span className={auth.required}>*</span></label><input type="email" className={form.input} placeholder="your@email.com" value={formData.email} onChange={e => updateField('email', e.target.value)} /></div>
            <div className={form.group}><label>密码 <span className={auth.required}>*</span></label><input type="password" className={form.input} placeholder="至少6位" value={formData.password} onChange={e => updateField('password', e.target.value)} /></div>
            <div className={form.group}>
              <label>你的角色</label>
              <div className={`${tags.roleTags} ${auth.roleTags}`}>
                {roleOptions.map(role => (
                  <span
                    key={role}
                    className={`${tags.roleTag} ${formData.roles.includes(role) ? tags.active : ''}`}
                    onClick={() => toggleRole(role)}
                  >{role}</span>
                ))}
              </div>
            </div>
            <button type="submit" className={`${btn.primary} ${auth.btnFullWidth}`} disabled={loading}>
              {loading ? '创建中...' : '创建账号'}
            </button>
          </form>
          <div className={sharedAuth.switchText}>已有账号？<span onClick={() => navigate('/login')} className={auth.link}>立即登录</span></div>
        </div>
      </div>
    </div>
  )
}
