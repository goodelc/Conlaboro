import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'

function useEscClose(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])
}

export default function JoinModal() {
  const { joinModalOpen, closeJoinModal, currentJoinProject, preselectedRole, showToast } = useApp()
  useEscClose(joinModalOpen, closeJoinModal)
  const { projects } = useData()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('')
  const [intro, setIntro] = useState('')

  const project = currentJoinProject !== null ? projects[currentJoinProject] : null
  const openRoles = project ? project.roles.filter(r => r.filled < r.needed) : []

  useEffect(() => {
    if (joinModalOpen && openRoles.length > 0) {
      setSelectedRole(preselectedRole || openRoles[0].name)
    }
    setIntro('')
  }, [joinModalOpen, preselectedRole, openRoles])

  function handleSubmit() {
    if (!intro.trim()) {
      showToast('请填写自我介绍', 'info')
      return
    }
    showToast(`已申请「${selectedRole}」角色，等待审核`, 'success')
    closeJoinModal()
  }

  if (!joinModalOpen || !project) return null

  return (
    <div className={`modal-overlay ${joinModalOpen ? 'active' : ''}`} id="join-modal" onClick={(e) => { if (e.target === e.currentTarget) closeJoinModal() }}>
      <div className="modal">
        <h2>🤝 申请加入项目</h2>
        <p>申请加入「{project.title}」</p>
        <div className="form-group">
          <label>选择角色 <span className="required">*</span></label>
          <select
            className="form-input"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {openRoles.map((r) => (
              <option key={r.name} value={r.name}>{r.emoji} {r.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>自我介绍 <span className="required">*</span></label>
          <textarea
            className="form-input"
            placeholder="简单介绍你自己，为什么想加入这个项目，你能贡献什么……"
            style={{ minHeight: '100px' }}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
          ></textarea>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={closeJoinModal}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>提交申请</button>
        </div>
      </div>
    </div>
  )
}
