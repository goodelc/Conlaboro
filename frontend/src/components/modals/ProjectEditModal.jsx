import { useState, useEffect } from 'react'
import { updateProject } from '../../api'

const CATEGORIES = [
  { value: 'app', label: '📱 应用' },
  { value: 'web', label: '🌐 网页' },
  { value: 'ai', label: '🤖 AI' },
  { value: 'tool', label: '🔧 工具' },
  { value: 'game', label: '🎮 游戏' },
  { value: 'other', label: '📦 其他' },
]

const DURATION_OPTIONS = [
  { value: '7', label: '1 周' },
  { value: '14', label: '2 周' },
  { value: '30', label: '1 个月' },
  { value: '60', label: '2 个月' },
  { value: '90', label: '3 个月+' },
]

export default function ProjectEditModal({ project, onClose, onSave, showToast }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    duration: '30',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || project.desc || '',
        category: project.category || 'other',
        duration: project.duration?.toString() || '30',
      })
    }
  }, [project])

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!project) return null

  async function handleSubmit() {
    if (!form.title.trim()) {
      showToast('项目名称不能为空', 'info')
      return
    }
    setSaving(true)
    try {
      await updateProject(project.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        duration: form.duration ? Number(form.duration) : null,
      })
      showToast('项目信息已更新', 'success')
      if (onSave) onSave()
      if (onClose) onClose()
    } catch (err) {
      showToast(err.message || '保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay active" id="project-edit-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <h2>✏️ 编辑项目信息</h2>
        <p style={{ color: 'var(--warm-gray)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          修改「{project.title}」的项目信息
        </p>

        <div className="form-group">
          <label>项目名称 <span className="required">*</span></label>
          <input
            className="form-input"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="输入项目名称"
          />
        </div>

        <div className="form-group">
          <label>项目描述</label>
          <textarea
            className="form-input"
            style={{ minHeight: '100px' }}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="描述你的项目愿景、目标和核心价值..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>项目类别</label>
            <select
              className="form-input"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>预计周期</label>
            <select
              className="form-input"
              value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
            >
              {DURATION_OPTIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>取消</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  )
}