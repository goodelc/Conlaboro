import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { createProject } from '../api'
import { analyzeProject } from '../api/idea'
import styles from './CreatePage.module.css'
import form from '../assets/shared/Forms.module.css'
import btn from '../assets/shared/Buttons.module.css'

const roleSetupData = [
  { emoji: '🎯', name: '产品经理', defaultCount: 1 },
  { emoji: '🎨', name: '设计师', defaultCount: 1 },
  { emoji: '💻', name: '前端开发', defaultCount: 1 },
  { emoji: '⚙️', name: '后端开发', defaultCount: 1 },
  { emoji: '🧚', name: '测试工程师', defaultCount: 0 },
]

const categoryMap = {
  '移动应用': 'app', 'Web 应用': 'web', '游戏': 'game',
  '工具': 'tool', 'AI / 机器学习': 'ai',
}
const durationMap = { '2 周': 14, '1 个月': 30, '2 个月': 60, '3 个月+': 90 }

/** 降级规则匹配（保留现有逻辑作为 fallback） */
function fallbackAnalyze(description) {
  const lower = description.toLowerCase()
  let category = 'other'
  if (lower.includes('app') || lower.includes('移动') || lower.includes('手机')) category = 'app'
  else if (lower.includes('web') || lower.includes('网站') || lower.includes('网页')) category = 'web'
  else if (lower.includes('游戏') || lower.includes('game')) category = 'game'
  else if (lower.includes('ai') || lower.includes('人工智能') || lower.includes('机器学习')) category = 'ai'

  const nameMatch = description.match(/^([^。，!！?？]+)/)
  const name = nameMatch ? nameMatch[1].trim() : '新项目'
  const tagline = description.length > 50 ? description.substring(0, 50) + '...' : description

  return { name, tagline, description, category, duration: '1 个月', roleCounts: [1, 1, 1, 1, 0], milestones: ['需求分析与原型设计', '核心功能开发', '测试与上线'] }
}

export default function CreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useApp()

  // 检测孵化模式
  const isHatchMode = location.state?.mode && location.state?.ideaContent
  const sourceIdeaId = location.state?.ideaId
  const hatchMode = isHatchMode ? location.state.mode : null

  const [version, setVersion] = useState(hatchMode === 'ai' ? 'ai' : 'manual')
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState('app')
  const [duration, setDuration] = useState('1 个月')
  const [roleCounts, setRoleCounts] = useState(roleSetupData.map(r => r.defaultCount))
  const [msTitles, setMsTitles] = useState(['', '', ''])

  const [aiDescription, setAiDescription] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (location.state?.ideaContent) {
      const content = location.state.ideaContent
      setDesc(content)
      setName(content.length > 20 ? content.substring(0, 20) + '...' : content)
      setTagline(content.length > 50 ? content.substring(0, 50) + '...' : content)
      // 孵化模式自动填入 AI 描述域
      if (isHatchMode) {
        setAiDescription(content)
        // AI模式下自动触发分析
        if (hatchMode === 'ai') {
          handleAIGenerateWithContent(content)
        }
      }
    }
  }, [])

  /** 使用指令内容直接触发 AI */
  async function handleAIGenerateWithContent(contentStr) {
    if (!contentStr.trim()) return
    setAiLoading(true); setAiGenerated(false)
    try {
      const result = await analyzeProject(contentStr)
      setName(result.name || name)
      setTagline(result.tagline || tagline)
      setDesc(result.description || desc)
      setCategory(result.category || category)
      if (result.duration) {
        const durMap = { short: '2 周', normal: '1 个月', long: '2 个月' }
        setDuration(durMap[result.duration] || '1 个月')
      }
      if (result.roles && result.roles.length > 0) {
        const newCounts = roleSetupData.map(rs => {
          const match = result.roles.find(r => r.name === rs.name)
          return match ? match.needed : 0
        })
        setRoleCounts(newCounts)
      }
      if (result.milestones && result.milestones.length > 0) {
        setMsTitles(result.milestones.slice(0, 3).map(m => m.title))
      }
      setAiGenerated(true)
      if (result.fallback) {
        showToast('💡 AI服务暂时不可用，已使用智能规则匹配', 'info')
      } else {
        showToast('🎉 AI分析完成，已生成项目信息', 'success')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'AI分析失败，请重试', 'error')
    } finally { setAiLoading(false) }
  }

  function changeRoleCount(index, delta) {
    setRoleCounts(prev => prev.map((v, i) => i === index ? Math.max(0, Math.min(5, v + delta)) : v))
  }

  function changeMilestoneTitle(index, value) {
    setMsTitles(prev => prev.map((v, i) => i === index ? value : v))
  }

  /** 手动 AI 分析按钮 */
  async function handleAIGenerate() {
    if (!aiDescription.trim()) { showToast('请输入项目描述', 'info'); return }
    await handleAIGenerateWithContent(aiDescription)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !tagline.trim() || !desc.trim()) { showToast('请填写所有必填项', 'info'); return }
    setSubmitting(true)
    try {
      const roles = roleSetupData.map((r, i) => ({ name: r.name, emoji: r.emoji, needed: roleCounts[i] })).filter(r => r.needed > 0)
      const milestones = msTitles.map(t => t.trim()).filter(t => t.length > 0).map(t => ({ title: t }))
      const payload = {
        title: name.trim(),
        tagline: tagline.trim(),
        description: desc.trim(),
        category,
        duration: durationMap[duration] || 30,
        roles,
        milestones,
        ...(sourceIdeaId ? { sourceIdeaId } : {})
      }
      await createProject(payload)
      showToast(isHatchMode ? '🥚 孵化成功！' : '🚀 项目发布成功！', 'success')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) { showToast(err.message || '发布失败，请重试', 'error') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page active" id="page-create">
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            {/* 孵化模式显示不同标题 */}
            <h1>{isHatchMode ? '🥚 孵化你的想法' : '💡 发起你的想法'}</h1>
            <p>
              {isHatchMode
                ? '让想法成长为真实的项目，找到志同道合的队友'
                : '把你的创意变成一个真实的项目，找到志同道合的队友一起实现。'}
            </p>

            {/* 非孵化模式显示版本切换 */}
            {!isHatchMode && (
              <div className={styles.versionSwitcher}>
                <button onClick={() => setVersion('manual')} className={`${styles.versionBtn} ${version === 'manual' ? styles.versionBtnActive : ''}`}>
                  📝 手动创建
                </button>
                <button onClick={() => setVersion('ai')} className={`${styles.versionBtn} ${version === 'ai' ? styles.versionBtnActive : ''}`}>
                  🧠 AI辅助创建
                </button>
              </div>
            )}
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
                  {!isHatchMode && (
                    <button type="button" className={`${btn.primary} ${styles.aiBtnMargin}`} onClick={handleAIGenerate} disabled={aiLoading || !aiDescription.trim()}>
                      {aiLoading ? '分析中...' : '🧠 分析项目'}
                    </button>
                  )}
                  {isHatchMode && aiLoading && (
                    <div className={styles.aiLoadingBar}>
                      <span className={styles.spinner}></span> AI 正在分析你的想法...
                    </div>
                  )}
                </div>

                {aiGenerated && (
                  <div className={styles.fadeIn}>
                    <div className={form.section}>
                      <h2><span className={styles.stepBadge}>2</span> AI生成结果</h2>
                      <p className={styles.sectionDesc}>可以编辑AI生成的信息</p>
                      <div className={form.group}><label>项目名称 <span className={styles.required}>*</span></label><input type="text" className={form.input} value={name} onChange={e => setName(e.target.value)} placeholder="给你的项目起个名字" /></div>
                      <div className={form.group}><label>一句话描述 <span className={styles.required}>*</span></label><input type="text" className={form.input} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="用一句话说明这个项目做什么" /></div>
                      <div className={form.group}><label>详细描述 <span className={styles.required}>*</span></label><textarea className={form.input} value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述你想解决的问题、目标用户、核心功能..." /></div>
                      <div className={form.row}>
                        <div className={form.group}><label>项目类别</label><select className={form.input} value={category} onChange={e => setCategory(e.target.value)}><option value="app">移动应用</option><option value="web">Web 应用</option><option value="game">游戏</option><option value="tool">工具</option><option value="ai">AI / 机器学习</option><option value="other">其他</option></select></div>
                        <div className={form.group}><label>预计周期</label><select className={form.input} value={duration} onChange={e => setDuration(e.target.value)}><option value="2 周">2 周</option><option value="1 个月">1 个月</option><option value="2 个月">2 个月</option><option value="3 个月+">3 个月+</option></select></div>
                      </div>
                    </div>

                    <div className={form.section}>
                      <h2><span className={styles.stepBadge}>3</span> 团队角色配置</h2>
                      <p className={styles.sectionDesc}>设置每个角色需要多少人</p>
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
                      <p className={styles.sectionDesc}>设定项目的关键节点</p>
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
                  <div className={form.group}><label>详细描述 <span className={styles.required}>*</span></label><textarea className={form.input} value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述你想解决的问题、目标用户、核心功能、你的愿景......" /></div>
                  <div className={form.row}>
                    <div className={form.group}><label>项目类别</label><select className={form.input} value={category} onChange={e => setCategory(e.target.value)}><option value="app">移动应用</option><option value="web">Web 应用</option><option value="game">游戏</option><option value="tool">工具</option><option value="ai">AI / 机器学习</option></select></div>
                    <div className={form.group}><label>预计周期</label><select className={form.input} value={duration} onChange={e => setDuration(e.target.value)}><option value="2 周">2 周</option><option value="1 个月">1 个月</option><option value="2 个月">2 个月</option><option value="3 个月+">3 个月+</option></select></div>
                  </div>
                </div>

                <div className={form.section}>
                  <h2><span className={styles.stepBadge}>2</span> 团队角色配置</h2>
                  <p className={styles.sectionDesc}>设置每个角色需要多少人</p>
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
                  <p className={styles.sectionDesc}>设定项目的关键节点</p>
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
                <button type="submit" className={btn.primary} disabled={submitting}>
                  {submitting ? '发布中...' : isHatchMode ? '🥚 开始孵化' : '🚀 发布项目'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
