import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function ToggleSwitch({ defaultActive }) {
  const [active, setActive] = useState(defaultActive)
  return <div className={`toggle-switch ${active ? 'active' : ''}`} onClick={() => setActive(!active)}></div>
}

function RoleTag({ children, defaultActive }) {
  const [active, setActive] = useState(defaultActive)
  return <span className={`role-tag ${active ? 'active' : ''}`} onClick={() => setActive(!active)}>{children}</span>
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { showToast } = useApp()

  return (
    <div className="page active" id="page-settings">
      <div className="settings-page">
        <div className="settings-inner">
          <div className="settings-header"><h1>⚙️ 个人设置</h1><p>管理你的资料、偏好和通知</p></div>

          <div className="settings-section">
            <div className="settings-section-title">👤 个人资料</div>
            <div className="settings-row">
              <div className="sr-label"><h4>昵称</h4><p>你在公社的显示名称</p></div>
              <div className="sr-value"><span>你</span><button className="edit-btn" onClick={() => showToast('编辑功能演示', 'info')}>修改</button></div>
            </div>
            <div className="settings-row">
              <div className="sr-label"><h4>个人简介</h4><p>让别人了解你</p></div>
              <div className="sr-value"><span>产品经理 / 设计师</span><button className="edit-btn" onClick={() => showToast('编辑功能演示', 'info')}>修改</button></div>
            </div>
            <div className="settings-row">
              <div className="sr-label"><h4>技能标签</h4><p>展示你的专业能力</p></div>
              <div className="sr-value"><span>需求分析、PRD撰写、UI设计</span><button className="edit-btn" onClick={() => showToast('编辑功能演示', 'info')}>修改</button></div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">🎯 角色偏好</div>
            <div className="settings-row">
              <div className="sr-label"><h4>你想担任的角色</h4><p>项目推荐会优先匹配这些角色</p></div>
              <div className="sr-value">
                <div className="role-tags">
                  <RoleTag defaultActive>🎯 产品经理</RoleTag>
                  <RoleTag defaultActive>🎨 设计师</RoleTag>
                  <RoleTag>💻 开发者</RoleTag>
                  <RoleTag>🧪 测试</RoleTag>
                  <RoleTag>📣 运营</RoleTag>
                </div>
              </div>
            </div>
            <div className="settings-row">
              <div className="sr-label"><h4>偏好项目类别</h4><p>你感兴趣的项目类型</p></div>
              <div className="sr-value">
                <div className="role-tags">
                  <RoleTag defaultActive>📱 App</RoleTag>
                  <RoleTag defaultActive>🌐 Web</RoleTag>
                  <RoleTag>🎮 游戏</RoleTag>
                  <RoleTag defaultActive>🤖 AI</RoleTag>
                  <RoleTag>🔧 工具</RoleTag>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">🔔 通知设置</div>
            {[
              ['申请状态更新', '你的项目申请被接受或拒绝时通知'],
              ['项目动态', '你参与的项目有新动态时通知'],
              ['新成员加入', '有人加入你发起的项目时通知'],
              ['项目推荐', '有匹配你技能的新项目时通知'],
              ['成就解锁', '获得新徽章或等级提升时通知'],
            ].map(([title, desc]) => (
              <div key={title} className="settings-row">
                <div className="sr-label"><h4>{title}</h4><p>{desc}</p></div>
                <div className="sr-value"><ToggleSwitch defaultActive={title !== '项目推荐'} /></div>
              </div>
            ))}
          </div>

          <div className="settings-section">
            <div className="settings-section-title">🔒 隐私设置</div>
            {[
              ['公开个人主页', '其他用户可以查看你的资料和贡献'],
              ['显示在线状态', '其他用户可以看到你是否在线'],
              ['显示贡献值', '在排行榜和个人主页上展示你的贡献值'],
            ].map(([title, desc]) => (
              <div key={title} className="settings-row">
                <div className="sr-label"><h4>{title}</h4><p>{desc}</p></div>
                <div className="sr-value"><ToggleSwitch defaultActive /></div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-secondary" onClick={() => navigate('/dashboard')}>← 返回我的公社</button>
          </div>
        </div>
      </div>
    </div>
  )
}
