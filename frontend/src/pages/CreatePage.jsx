import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

// 模拟AI分析逻辑
function analyzeProjectDescription(description) {
  // 简单的关键词匹配
  const lowerDesc = description.toLowerCase()
  
  // 分析类别
  let category = 'other'
  if (lowerDesc.includes('app') || lowerDesc.includes('移动') || lowerDesc.includes('手机')) {
    category = 'app'
  } else if (lowerDesc.includes('web') || lowerDesc.includes('网站') || lowerDesc.includes('网页')) {
    category = 'web'
  } else if (lowerDesc.includes('game') || lowerDesc.includes('游戏')) {
    category = 'game'
  } else if (lowerDesc.includes('tool') || lowerDesc.includes('工具')) {
    category = 'tool'
  } else if (lowerDesc.includes('ai') || lowerDesc.includes('人工智能') || lowerDesc.includes('机器学习')) {
    category = 'ai'
  }
  
  // 分析周期
  let duration = '1个月'
  if (lowerDesc.includes('快速') || lowerDesc.includes('短期') || lowerDesc.includes('两周')) {
    duration = '2 周'
  } else if (lowerDesc.includes('长期') || lowerDesc.includes('三个月') || lowerDesc.includes('多个月')) {
    duration = '3 个月+'
  } else if (lowerDesc.includes('两个月')) {
    duration = '2 个月'
  }
  
  // 分析角色需求
  const roleCounts = [1, 1, 1, 1, 0] // 默认值
  if (lowerDesc.includes('设计') || lowerDesc.includes('ui') || lowerDesc.includes('ux')) {
    roleCounts[1] = 1
  }
  if (lowerDesc.includes('前端') || lowerDesc.includes('react') || lowerDesc.includes('vue')) {
    roleCounts[2] = 1
  }
  if (lowerDesc.includes('后端') || lowerDesc.includes('server') || lowerDesc.includes('api')) {
    roleCounts[3] = 1
  }
  if (lowerDesc.includes('测试') || lowerDesc.includes('qa')) {
    roleCounts[4] = 1
  }
  
  // 生成项目名称（从描述中提取）
  const nameMatch = description.match(/^([^。,，!！?？]+)/)
  const name = nameMatch ? nameMatch[1].trim() : '新项目'
  
  // 生成一句话描述
  const tagline = description.length > 50 ? description.substring(0, 50) + '...' : description
  
  return {
    name,
    tagline,
    description,
    category,
    duration,
    roleCounts,
    milestones: ['需求分析与原型设计', '核心功能开发', '测试与上线']
  }
}

export default function CreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useApp()

  // 版本切换
  const [version, setVersion] = useState('manual') // 'manual' 或 'ai'

  // 手动版本状态
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState('app')
  const [duration, setDuration] = useState('1个月')
  const [roleCounts, setRoleCounts] = useState(roleSetupData.map(r => r.defaultCount))
  const [msTitles, setMsTitles] = useState(['', '', ''])

  // AI版本状态
  const [aiDescription, setAiDescription] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(false)

  // 提交状态
  const [submitting, setSubmitting] = useState(false)

  // 接收从想法墙传入的内容
  useEffect(() => {
    if (location.state?.ideaContent) {
      setDesc(location.state.ideaContent)
      setName(location.state.ideaContent.length > 20 ? location.state.ideaContent.substring(0, 20) + '...' : location.state.ideaContent)
      setTagline(location.state.ideaContent.length > 50 ? location.state.ideaContent.substring(0, 50) + '...' : location.state.ideaContent)
    }
  }, [])

  function changeRoleCount(index, delta) {
    setRoleCounts(prev => prev.map((v, i) => i === index ? Math.max(0, Math.min(5, v + delta)) : v))
  }

  function changeMilestoneTitle(index, value) {
    setMsTitles(prev => prev.map((v, i) => i === index ? value : v))
  }

  // AI生成逻辑
  async function handleAIGenerate() {
    if (!aiDescription.trim()) {
      showToast('请输入项目描述', 'info')
      return
    }
    
    setAiLoading(true)
    try {
      // 模拟AI处理时间
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 分析描述并生成信息
      const result = analyzeProjectDescription(aiDescription)
      
      // 更新表单数据
      setName(result.name)
      setTagline(result.tagline)
      setDesc(result.description)
      setCategory(result.category)
      setDuration(result.duration)
      setRoleCounts(result.roleCounts)
      setMsTitles(result.milestones)
      setAiGenerated(true)
      
      showToast('🎉 AI分析完成，已生成项目信息', 'success')
    } catch (err) {
      showToast('AI分析失败，请重试', 'error')
    } finally {
      setAiLoading(false)
    }
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
            
            {/* 版本切换 */}
            <div className="version-switcher" style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '1.5rem',
              padding: '0.5rem',
              backgroundColor: 'var(--warm-gray-light)',
              borderRadius: '8px'
            }}>
              <button 
                onClick={() => setVersion('manual')}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: version === 'manual' ? 'var(--red)' : 'transparent',
                  color: version === 'manual' ? 'white' : 'var(--warm-gray)',
                  cursor: 'pointer',
                  fontWeight: version === 'manual' ? '600' : '400',
                  transition: 'all 0.3s ease'
                }}
              >
                📝 手动创建
              </button>
              <button 
                onClick={() => setVersion('ai')}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: version === 'ai' ? 'var(--red)' : 'transparent',
                  color: version === 'ai' ? 'white' : 'var(--warm-gray)',
                  cursor: 'pointer',
                  fontWeight: version === 'ai' ? '600' : '400',
                  transition: 'all 0.3s ease'
                }}
              >
                🤖 AI辅助创建
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* AI版本 */}
            {version === 'ai' && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>
                <div className="form-section">
                  <h2><span className="step-badge">1</span> 描述你的项目</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--warm-gray)', marginBottom: '1rem' }}>
                    详细描述你的项目想法，AI会帮你分析并生成项目信息
                  </p>
                  <div className="form-group">
                    <label>项目描述 <span className="required">*</span></label>
                    <textarea 
                      className="form-input"
                      style={{ minHeight: '120px' }}
                      value={aiDescription}
                      onChange={e => setAiDescription(e.target.value)}
                      placeholder="描述你的项目想法、目标用户、核心功能、技术栈等...越详细越好"
                    />
                  </div>
                  <button 
                    type="button"
                    className="btn-primary"
                    onClick={handleAIGenerate}
                    disabled={aiLoading || !aiDescription.trim()}
                    style={{ marginTop: '1rem' }}
                  >
                    {aiLoading ? '分析中...' : '🤖 分析项目'}
                  </button>
                </div>
                
                {aiGenerated && (
                  <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <div className="form-section">
                      <h2><span className="step-badge">2</span> AI生成结果</h2>
                      <p style={{ fontSize: '0.8rem', color: 'var(--warm-gray)', marginBottom: '1rem' }}>
                        可以编辑AI生成的信息
                      </p>
                      
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
                        <textarea className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述你想解决的问题、目标用户、核心功能、你的愿景……" />
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
                            <option value="2 周">2 周</option><option value="1 个月">1 个月</option>
                            <option value="2 个月">2 个月</option><option value="3 个月+">3 个月+</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-section">
                      <h2><span className="step-badge">3</span> 团队角色配置</h2>
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
                      <h2><span className="step-badge">4</span> 里程碑规划</h2>
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
                  </div>
                )}
              </div>
            )}

            {/* 手动版本 */}
            {version === 'manual' && (
              <div style={{ animation: 'fadeIn 0.5s ease' }}>
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
                        <option value="2 周">2 周</option><option value="1 个月">1 个月</option>
                        <option value="2 个月">2 个月</option><option value="3 个月+">3 个月+</option>
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
              </div>
            )}

            {(version === 'manual' || (version === 'ai' && aiGenerated)) && (
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate('/home')}>取消</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '发布中...' : '🚀 发布项目'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}