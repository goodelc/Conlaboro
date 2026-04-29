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
  { emoji: '🧚', name: '测试工程师', defaultCount: 0 },
]

const durationMap = { '2 周': 14, '1 个月': 30, '2 个月': 60, '3 个月+': 90 }

export default function CreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useApp()

  // 检测来源：AI预填充 或 手动创建 或 想法孵化(手动)
  const aiPrefill = location.state?.mode === 'ai-prefill' ? location.state?.aiResult : null
  const sourceIdeaId = location.state?.sourceIdeaId || location.state?.ideaId
  const isFromHatch = !!(sourceIdeaId || location.state?.ideaContent)

  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState('app')
  const [duration, setDuration] = useState('1 个月')
  const [roleCounts, setRoleCounts] = useState(roleSetupData.map(r => r.defaultCount))
  const [msTitles, setMsTitles] = useState(['', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [aiPrefilled, setAiPrefilled] = useState(false)

  // 初始化：处理来自想法墙的手动孵化 或 来自HatchPage的AI预填充
  useEffect(() => {
    if (aiPrefill) {
      // 来自HatchPage的AI预填充数据
      setName(aiPrefill.name || '')
      setTagline(aiPrefill.tagline || '')
      if (aiPrefill.category) setCategory(aiPrefill.category)
      if (aiPrefill.duration) {
        const durMap = { short: '2 周', normal: '1 个月', long: '2 个月' }
        setDuration(durMap[aiPrefill.duration] || '1 个月')
      }
      if (aiPrefill.roles && aiPrefill.roles.length > 0) {
        const newCounts = roleSetupData.map(rs => {
          const match = aiPrefill.roles.find(r => r.name === rs.name)
          return match ? match.needed : 0
        })
        setRoleCounts(newCounts)
      }
      if (aiPrefill.milestones && aiPrefill.milestones.length > 0) {
        setMsTitles(aiPrefill.milestones.slice(0, 3).map(m => m.title))
      }
      setAiPrefilled(true)
    } else if (location.state?.ideaContent) {
      // 来自想法墙的手动孵化
      const content = location.state.ideaContent
      setDesc(content)
      setName(content.length > 20 ? content.substring(0, 20) + '...' : content)
      setTagline(content.length > 50 ? content.substring(0, 50) + '...' : content)
    }
  }, [])

  function changeRoleCount(index, delta) {
    setRoleCounts(prev => prev.map((v, i) => i === index ? Math.max(0, Math.min(5, v + delta)) : v))
  }

  function changeMilestoneTitle(index, value) {
    setMsTitles(prev => prev.map((v, i) => i === index ? value : v))
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
      showToast(isFromHatch ? '🥚 孵化成功！' : '🚀 项目发布成功！', 'success')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) { showToast(err.message || '发布失败，请重试', 'error') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page active" id="page-create">
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <h1>{isFromHatch ? '🥚 孵化你的想法' : '💡 发起你的想法'}</h1>
            <p>
              {isFromHatch
                ? '让想法成长为真实的项目，找到志同道合的队友'
                : '把你的创意变成一个真实的项目，找到志同道合的队友一起实现。'}
            </p>
          </div>

          {aiPrefilled && (
            <div className={styles.aiPrefillBanner}>
              <span className={styles.aiPrefillIcon}>🧠</span>
              <span>AI 建议已填充到表单，你可以自由编辑调整</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.fadeIn}>
              <div className={form.section}>
                <h2><span className={styles.stepBadge}>1</span> 项目基本信息</h2>
                <div className={form.group}><label>项目名称 <span className={styles.required}>*</span></label><input type="text" className={form.input} value={name} onChange={e => setName(e.target.value)} placeholder="给你的项目起个名字" /></div>
                <div className={form.group}><label>一句话描述 <span className={styles.required}>*</span></label><input type="text" className={form.input} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="用一句话说明这个项目做什么" /></div>
                <div className={form.group}><label>详细描述 <span className={styles.required}>*</span></label><textarea className={`${form.input} ${styles.textareaMinHeight}`} value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述你想解决的问题、目标用户、核心功能、你的愿景......" /></div>
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

            <div className={form.actions}>
              <button type="button" className={btn.secondary} onClick={() => navigate('/home')}>取消</button>
              <button type="submit" className={btn.primary} disabled={submitting}>
                {submitting ? '发布中...' : isFromHatch ? '🥚 开始孵化' : '🚀 发布项目'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
