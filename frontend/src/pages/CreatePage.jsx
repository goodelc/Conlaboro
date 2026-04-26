import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { createProject } from '../api'

const roleSetupData = [
  { emoji: '🎯', name: '产品经理', defaultCount: 1 },
  { emoji: '🎨', name: '设计师', defaultCount: 1 },
  { emoji: '💻', name: '前端开发', defaultCount: 1 },
  { emoji: '⚙️', name: '后端开发', defaultCount: 1 },
  { emoji: '🧪', name: '测试工程师', defaultCount: 0 },
]

const categoryMap = {
  '移动应用': 'app', 'Web 应用': 'web', '游戏': 'game',
  '工具': 'tool', 'AI / 机器学习': 'ai', '其他': 'other',
}
const durationMap = { '2 周': 14, '1 个月': 30, '2 个月': 60, '3 个月+': 90 }

export default function CreatePage() {
  const navigate = useNavigate()
  const { showToast } = useApp()

  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState('app')
  const [duration, setDuration] = useState('1个月')
  const [roleCounts, setRoleCounts] = useState(roleSetupData.map(r => r.defaultCount))
  const [msTitles, setMsTitles] = useState(['', '', ''])
  const [submitting, setSubmitting] = useState(false)

  function changeRoleCount(index, delta) {
    setRoleCounts(prev => prev.map((v, i) => i === index ? Math.max(0, Math.min(5, v + delta)) : v))
  }

  function changeMilestoneTitle(index, value) {
    setMsTitles(prev => prev.map((v, i) => i === index ? value : v))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !tagline.trim() || !desc.trim()) {
      showToast('请填写所有必填项', 'info')
      return
    }
    setSubmitting(true)
    try {
      // 构建角色列表（只提交 needed > 0 的）
      const roles = roleSetupData
        .map((r, i) => ({ name: r.name, emoji: r.emoji, needed: roleCounts[i] }))
        .filter(r => r.needed > 0)

      // 构建里程碑列表（只提交有标题的）
      const milestones = msTitles
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => ({ title: t }))

      await createProject({
        title: name.trim(),
        tagline: tagline.trim(),
        description: desc.trim(),
        category,
        duration: durationMap[duration] || 30,
        roles,
        milestones,
      })
      showToast('🎉 项目发布成功！等待队友加入...', 'success')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      showToast(err.message || '发布失败，请重试', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page active" id="page-create">
      <div className="create-page">
        <div className="create-inner">
          <div className="create-header">
            <h1>💡 发起你的想法</h1>
            <p>把你的创意变成一个真实的项目，找到志同道合的队友一起实现。</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2><span className="step-badge">1</span> 项目基本信息</h2>
              <div className="form-group">
                <label>项目名称 <span className="required">*</span></label>
                <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="给你的项目起个名字" />
              </div>
              <div className="form-group">
                <label>一句话描述 <span className="required">*</span></label>
                <input type="text" className="form-input" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="用一句话说明这个项目做什么" />
              </div>
              <div className="form-group">
                <label>详细描述 <span className="required">*</span></label>
                <textarea className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述你想解决的问题、目标用户、核心功能、你的愿景……越详细越好，这样别人更容易理解并加入。" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>项目类别</label>
                  <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="app">移动应用</option><option value="web">Web 应用</option>
                    <option value="game">游戏</option><option value="tool">工具</option>
                    <option value="ai">AI / 机器学习</option><option value="other">其他</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>预计周期</label>
                  <select className="form-input" value={duration} onChange={e => setDuration(e.target.value)}>
                    <option value="2weeks">2 周</option><option value="1month">selected>1 个月</option>
                    <option value="2months">2 个月</option><option value="3months">3 个月+</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2><span className="step-badge">2</span> 团队角色配置</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--warm-gray)', marginBottom: '1rem' }}>设置每个角色需要多少人。你需要先认领一个角色作为发起人。</p>
              <div className="role-setup" id="role-setup">
                {roleSetupData.map((r, i) => (
                  <div key={r.name} className="role-setup-item">
                    <span className="rs-emoji">{r.emoji}</span>
                    <span className="rs-name">{r.name}</span>
                    <div className="rs-count">
                      <button type="button" onClick={() => changeRoleCount(i, -1)}>−</button>
                      <span>{roleCounts[i]}</span>
                      <button type="button" onClick={() => changeRoleCount(i, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h2><span className="step-badge">3</span> 里程碑规划</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--warm-gray)', marginBottom: '1rem' }}>设定项目的关键节点，让参与者了解整体节奏。</p>
              {[1, 2, 3].map(n => (
                <div key={n} className="form-group">
                  <label>里程碑 {n}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={n === 1 ? '例：完成需求文档和原型设计' : n === 2 ? '例：完成核心功能开发' : '例：测试、修复、上线'}
                    value={msTitles[n - 1]}
                    onChange={e => changeMilestoneTitle(n - 1, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/home')}>取消</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? '发布中...' : '🚀 发布项目'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
