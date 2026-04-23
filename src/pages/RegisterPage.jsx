import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const roleOptions = ['🎯 产品经理', '🎨 设计师', '💻 开发者', '🧪 测试', '📣 运营']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [selectedRoles, setSelectedRoles] = useState([])

  function toggleRole(role) {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  return (
    <div className="page active" id="page-register">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="star" style={{ width: '18px', height: '18px', background: 'var(--red)', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', display: 'inline-block' }}></span> 共创公社
          </div>
          <p className="auth-subtitle">创建你的创客身份</p>
          <div className="auth-form">
            <div className="form-group"><label>昵称 <span style={{ color: 'var(--red)' }}>*</span></label><input type="text" className="form-input" placeholder="你的公社昵称" /></div>
            <div className="form-group"><label>邮箱 <span style={{ color: 'var(--red)' }}>*</span></label><input type="email" className="form-input" placeholder="your@email.com" /></div>
            <div className="form-group"><label>密码 <span style={{ color: 'var(--red)' }}>*</span></label><input type="password" className="form-input" placeholder="至少8位" /></div>
            <div className="form-group">
              <label>你的角色</label>
              <div className="role-tags" style={{ marginTop: '0.3rem' }}>
                {roleOptions.map(role => (
                  <span
                    key={role}
                    className={`role-tag ${selectedRoles.includes(role) ? 'active' : ''}`}
                    onClick={() => toggleRole(role)}
                  >{role}</span>
                ))}
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => { navigate('/home'); showToast('🎉 注册成功！欢迎加入共创公社', 'success') }}>创建账号</button>
          </div>
          <div className="auth-switch">已有账号？<span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: 'var(--red)' }}>立即登录</span></div>
        </div>
      </div>
    </div>
  )
}
