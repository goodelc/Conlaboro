import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { createProject } from '../api'
import styles from './CreatePage.module.css'
import form from '../assets/shared/Forms.module.css'
import btn from '../assets/shared/Buttons.module.css'

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

function analyzeProjectDescription(description) {
  const lowerDesc = description.toLowerCase()

  let category = 'other'
  if (lowerDesc.includes('app') || lowerDesc.includes('移动') || lowerDesc.includes('手机')) category = 'app'
  else if (lowerDesc.includes('web') || lowerDesc.includes('网站') || lowerDesc.includes('网页')) category = 'web'
  else if (lowerDesc.includes('game') || lowerDesc.includes('游戏')) category = 'game'
  else if (lowerDesc.includes('tool') || lowerDesc.includes('工具')) category = 'tool'
  else if (lowerDesc.includes('ai') || lowerDesc.includes('人工智能') || lowerDesc.includes('机器学习')) category = 'ai'

  let duration = '1个月'
  if (lowerDesc.includes('快速') || lowerDesc.includes('短期') || lowerDesc.includes('两周')) duration = '2 周'
  else if (lowerDesc.includes('长期') || lowerDesc.includes('三个月') || lowerDesc.includes('多个月')) duration = '3 个月+'
  else if (lowerDesc.includes('两个月')) duration = '2 个月'

  const roleCounts = [1, 1, 1, 1, 0]
  if (lowerDesc.includes('设计') || lowerDesc.includes('ui') || lowerDesc.includes('ux')) roleCounts[1] = 1
  if (lowerDesc.includes('前端') || lowerDesc.includes('react') || lowerDesc.includes('vue')) roleCounts[2] = 1
  if (lowerDesc.includes('后端') || lowerDesc.includes('server') || lowerDesc.includes('api')) roleCounts[3] = 1
  if (lowerDesc.includes('测试') || lowerDesc.includes('qa')) roleCounts[4] = 1

  const nameMatch = description.match(/^([^。,，!！?？]+)/)
  const name = nameMatch ? nameMatch[1].trim() : '新项目'
  const tagline = description.length > 50 ? description.substring(0, 50) + '...' : description

  return { name, tagline, description, category, duration, roleCounts, milestones: ['需求分析与原型设计', '核心功能开发', '测试与上线'] }
}

export default function CreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useApp()

  const [version, setVersion] = useState('manual')
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState('app')
  const [duration, setDuration] = useState('1个月')
  const [roleCounts, setRoleCounts] = useState(roleSetupData.map(r => r.defaultCount))
  const [msTitles, setMsTitles] = useState(['', '', ''])

  const [aiDescription, setAiDescription] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

  async function handleAIGenerate() {
    if (!aiDescription.trim()) { showToast('请输入项目描述', 'info'); return }
    setAiLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const result = analyzeProjectDescription(aiDescription)
      setName(result.name); setTagline(result.tagline); setDesc(result.description)
      setCategory(result.category); setDuration(result.duration)
      setRoleCounts(result.roleCounts); setMsTitles(result.milestones); setAiGenerated(true)
      showToast('🎉 AI分析完成，已生成项目信息', 'success')
    } catch (err) { showToast('AI分析失败，请重试', 'error') }
    finally { setAiLoading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !tagline.trim() || !desc.trim()) { showToast('请填写所有必填项', 'info'); return }
    setSubmitting(true)
    try {
      const roles = roleSetupData.map((r, i) => ({ name: r.name, emoji: r.emoji, needed: roleCounts[i] })).filter(r => r.needed > 0)
      const milestones = msTitles.map(t => t.trim()).filter(t => t.length > 0).map(t => ({ title: t }))
      await createProject({ title: name.trim(), tagline: tagline.trim(), description: desc.trim(), category, duration: durationMap[duration] || 30, roles, milestones })
      showToast('🎉 项目发布成功！等待队友加入...', 'success')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) { showToast(err.message || '发布失败，请重试', 'error') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page active" id="page-create">
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <h1>💡 发起你的想法</h1>
            <p>把你的创意变成一个真实的项目，找到志同道合的队友一起实现。</p>

            <div className={styles.versionSwitcher}>
              <button onClick={() => setVersion('manual')} className={`${styles.versionBtn} ${version === 'manual' ? styles.versionBtnActive : ''}`}>
                📝 手动创建
              </button>
              <button onClick={() => setVersion('ai')} className={`${styles.versionBtn} ${version === 'ai' ? styles.versionBtnActive : ''}`}>
                🤖 AI辅助创建
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {version === 'ai' && (
              <div className={styles.fadeIn}>
                <div className={form.section}>
                  <h2><span className={styles.stepBadge}>1</span> 描述你的项目</h2>
                  <p className={styles.sectionDesc}>详细描述你的项目想法，AI会帮你分析并生成项目信息</p>
                  <div className={form.group}>
                    <label>项目描述 <span className={styles.required}>*</span></label>
                    <textarea className={`${form.input} ${styles.textareaMinHeight}`} value={aiDescription} onChange={e => setAiDescription(e.target.value)} placeholder="描述你的项目想法、目标用户、核心功能、技术栈等...越详细越好" />
                  </div>
                  <button type="button" className={`${btn.primary} ${styles.aiBtnMargin}`} onClick={handleAIGenerate} disabled={aiLoading || !aiDescription.trim()}>
                    {aiLoading ? '分析中...' : '🤖 分析项目'}
                  </button>
                </div>

                {aiGenerated && (
                  <div className={styles.fadeIn}>
                    <div className={form.section}>
                      <h2><span className={styles.stepBadge}>2</span> AI生成结果</h2>
                      <p className={styles.sectionDesc}>可以编辑AI生成的信息</p>
                      <div className={form.group}><label>项目名称 <span className={styles.required}>*</span></label><input type="text" className={form.input} value={name} onChange={e => setName(e.target.value)} placeholder="给你的项目起个名字" /></div>
                      <div className={form.group}><label>一句话描述 <span className={styles.required}>*</span></label><input type="text" className={form.input} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="用一句话说明这个项目做什么" /></div>
                      <div className={form.group}><label>详细描述 <span className={styles.required}>*</span></label><textarea className={form.input} value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述你想解决的问题、目标用户、核心功能、你的愿景……" /></div>
                      <div className={form.row}>
                        <div className={form.group}><label>项目类别</label><select className={form.input} value={category} onChange={e => setCategory(e.target.value)}><option value="app">移动应用</option><option value="web">Web 应用</option><option value="game">游戏</option><option value="tool">工具</option><option value="ai">AI / 机器学习</option><option value="other">其他</option></select></div>
                        <div className={form.group}><label>预计周期</label><select className={form.input} value={duration} onChange={e => setDuration(e.target.value)}><option value="2 周">2 周</option><option value="1 个月">1 个月</option><option value="2 个月">2 个月</option><option value="3 个月+">3 个月+</option></select></div>
                      </div>
                    </div>

                    <div className={form.section}>
                      <h2><span className={styles.stepBadge}>3</span> 团队角色配置</h2>
                      <p className={styles.sectionDesc}>设置每个角色需要多少人。你需要先认领一个角色作为发起人。</p>
                      <div className={styles.roleSetup}>
                        {roleSetupData.map((r, i) => (
                          <div key={r.name} className={styles.roleSetupItem}>
                            <span className={styles.rsEmoji}>{r.emoji}</span>
                            <span className={styles.rsName}>{r.name}</span>
                            <div className={styles.rsCount}>
                              <button type="button" className={styles.rsCountBtn} onClick={() => changeRoleCount(i, -1)}>−</button>
                              <span className={styles.rsCountSpan}>{roleCounts[i]}</span>
                              <button type="button" className={styles.rsCountBtn} onClick={() => changeRoleCount(i, 1)}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={form.section}>
                      <h2><span className={styles.stepBadge}>4</span> 里程碑规划</h2>
                      <p className={styles.sectionDesc}>设定项目的关键节点，让参与者了解整体节奏。</p>
                      {[1, 2, 3].map(n => (
                        <div key={n} className={form.group}>
                          <label>里程碑 {n}</label>
                          <input type="text" className={form.input} placeholder={n === 1 ? '例：完成需求文档和原型设计' : n === 2 ? '例：完成核心功能开发' : '例：测试、修复、上线'} value={msTitles[n - 1]} onChange={e => changeMilestoneTitle(n - 1, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {version === 'manual' && (
              <div className={styles.fadeIn}>
                <div className={form.section}>
                  <h2><span className={styles.stepBadge}>1</span> 项目基本信息</h2>
                  <div className={form.group}><label>项目名称 <span className={styles.required}>*</span></label><input type="text" className={form.input} value={name} onChange={e => setName(e.target.value)} placeholder="给你的项目起个名字" /></div>
                  <div className={form.group}><label>一句话描述 <span className={styles.required}>*</span></label><input type="text" className={form.input} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="用一句话说明这个项目做什么" /></div>
                  <div className={form.group}><label>详细描述 <span className={styles.required}>*</span></label><textarea className={form.input} value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述你想解决的问题、目标用户、核心功能、你的愿景……越详细越好，这样别人更容易理解并加入。" /></div>
                  <div className={form.row}>
                    <div className={form.group}><label>项目类别</label><select className={form.input} value={category} onChange={e => setCategory(e.target.value)}><option value="app">移动应用</option><option value="web">Web 应用</option><option value="game">游戏</option><option value="tool">工具</option><option value="ai">AI / 机器学习</option><option value="other">其他</option></select></div>
                    <div className={form.group}><label>预计周期</label><select className={form.input} value={duration} onChange={e => setDuration(e.target.value)}><option value="2 周">2 周</option><option value="1 个月">1 个月</option><option value="2 个月">2 个月</option><option value="3 个月+">3 个月+</option></select></div>
                  </div>
                </div>

                <div className={form.section}>
                  <h2><span className={styles.stepBadge}>2</span> 团队角色配置</h2>
                  <p className={styles.sectionDesc}>设置每个角色需要多少人。你需要先认领一个角色作为发起人。</p>
                  <div className={styles.roleSetup}>
                    {roleSetupData.map((r, i) => (
                      <div key={r.name} className={styles.roleSetupItem}>
                        <span className={styles.rsEmoji}>{r.emoji}</span>
                        <span className={styles.rsName}>{r.name}</span>
                        <div className={styles.rsCount}>
                          <button type="button" className={styles.rsCountBtn} onClick={() => changeRoleCount(i, -1)}>−</button>
                          <span className={styles.rsCountSpan}>{roleCounts[i]}</span>
                          <button type="button" className={styles.rsCountBtn} onClick={() => changeRoleCount(i, 1)}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={form.section}>
                  <h2><span className={styles.stepBadge}>3</span> 里程碑规划</h2>
                  <p className={styles.sectionDesc}>设定项目的关键节点，让参与者了解整体节奏。</p>
                  {[1, 2, 3].map(n => (
                    <div key={n} className={form.group}>
                      <label>里程碑 {n}</label>
                      <input type="text" className={form.input} placeholder={n === 1 ? '例：完成需求文档和原型设计' : n === 2 ? '例：完成核心功能开发' : '例：测试、修复、上线'} value={msTitles[n - 1]} onChange={e => changeMilestoneTitle(n - 1, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(version === 'manual' || (version === 'ai' && aiGenerated)) && (
              <div className={form.actions}>
                <button type="button" className={btn.secondary} onClick={() => navigate('/home')}>取消</button>
                <button type="submit" className={btn.primary} disabled={submitting}>{submitting ? '发布中...' : '🚀 发布项目'}</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
