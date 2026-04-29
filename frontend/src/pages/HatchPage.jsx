import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { analyzeProject } from '../api/idea'
import ProjectPreview from '../components/hatch/ProjectPreview'
import styles from './HatchPage.module.css'
import btn from '../assets/shared/Buttons.module.css'

const STEP_LABELS = ['描述想法', 'AI 评估', '创建项目']

const GUIDE_TIPS = [
  { icon: '💡', text: '描述越详细，AI 分析越精准——试着说明<strong>目标用户</strong>、<strong>核心功能</strong>和<strong>使用场景</strong>' },
  { icon: '🎯', text: '告诉 AI 你想<strong>解决什么问题</strong>，它能更好地评估项目可行性' },
  { icon: '⚡', text: '提及你熟悉的<strong>技术方向</strong>，AI 会据此推荐合适的技术栈' },
  { icon: '💰', text: '描述你的<strong>商业模式想法</strong>，AI 能帮你评估变现路径' },
]

const SCORE_LABELS = ['', '非常困难', '较困难', '需要努力', '较可行', '非常可行']
const SCORE_COLORS = ['', '#EF4444', '#F97316', '#D4A843', '#22C55E', '#16A34A']

/** 解析 JSON 字符串字段（兼容字符串或已解析对象） */
function parseJsonField(val) {
  if (!val) return []
  try {
    return typeof val === 'string' ? JSON.parse(val) : val
  } catch {
    return []
  }
}

export default function HatchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useApp()

  const sourceIdeaId = location.state?.ideaId
  const initialContent = location.state?.ideaContent || ''

  const [description, setDescription] = useState(initialContent)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [currentTip, setCurrentTip] = useState(0)
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [reportCollapsed, setReportCollapsed] = useState({})

  // 解析 analysis
  const analysis = useMemo(() => {
    if (!aiResult?.analysis) return null
    try {
      return typeof aiResult.analysis === 'string'
        ? JSON.parse(aiResult.analysis)
        : aiResult.analysis
    } catch {
      return null
    }
  }, [aiResult])

  // 解析各列表字段
  const techStackList = useMemo(() => parseJsonField(aiResult?.techStack), [aiResult])
  const coreFeaturesList = useMemo(() => parseJsonField(aiResult?.coreFeatures), [aiResult])
  const competitiveAdvList = useMemo(() => parseJsonField(aiResult?.competitiveAdvantage), [aiResult])
  const monetizationList = useMemo(() => parseJsonField(aiResult?.monetization), [aiResult])
  const riskMitList = useMemo(() => parseJsonField(aiResult?.riskMitigation), [aiResult])

  // 当前步骤
  const currentStep = useMemo(() => {
    if (aiResult) return 2
    if (aiLoading) return 1
    return 0
  }, [aiResult, aiLoading])

  // 自动触发首次评估
  useEffect(() => {
    if (initialContent.trim()) {
      handleAnalyze(initialContent)
    }
  }, [])

  // 引导提示轮播
  useEffect(() => {
    if (aiResult || aiLoading) return
    const timer = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % GUIDE_TIPS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [aiResult, aiLoading])

  /** 调用 AI 分析 */
  async function handleAnalyze(contentStr) {
    const content = contentStr || description
    if (!content.trim()) {
      showToast('请先描述你的项目想法', 'info')
      return
    }
    setAiLoading(true)
    setAiResult(null)
    try {
      const result = await analyzeProject(content)
      setAiResult(result)
      setReportCollapsed({})
      if (result.fallback) {
        showToast('AI 服务暂时不可用，已使用智能规则匹配', 'info')
      } else {
        showToast('AI 评估完成', 'success')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'AI 分析失败，请重试', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  /** 重新评估 */
  function handleReanalyze() {
    setAiResult(null)
    handleAnalyze()
  }

  /** 应用并创建项目 */
  function handleApplyAndCreate() {
    if (!aiResult) return
    navigate('/create', {
      state: {
        aiResult,
        sourceIdeaId,
        mode: 'ai-prefill',
      },
    })
  }

  /** 切换报告区块折叠 */
  function toggleBlock(key) {
    setReportCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const feasibilityScore = aiResult?.feasibilityScore || 0

  // 报告区块定义
  const reportBlocks = []

  if (analysis?.summary) {
    reportBlocks.push({ key: 'summary', icon: '📋', title: '项目理解', type: 'text', content: analysis.summary })
  }
  if (analysis?.highlights?.length) {
    reportBlocks.push({ key: 'highlights', icon: '✨', title: '亮点与机会', type: 'list', items: analysis.highlights })
  }
  if (coreFeaturesList.length) {
    reportBlocks.push({ key: 'coreFeatures', icon: '⚡', title: '核心功能', type: 'list', items: coreFeaturesList })
  }
  if (competitiveAdvList.length) {
    reportBlocks.push({ key: 'competitiveAdvantage', icon: '🏆', title: '竞争优势', type: 'list', items: competitiveAdvList })
  }
  if (analysis?.suggestions?.length) {
    reportBlocks.push({ key: 'suggestions', icon: '💡', title: '完善建议', type: 'list', items: analysis.suggestions })
  }
  if (analysis?.risks?.length) {
    reportBlocks.push({ key: 'risks', icon: '⚠️', title: '潜在风险', type: 'list', items: analysis.risks, variant: 'risk' })
  }
  if (riskMitList.length) {
    reportBlocks.push({ key: 'riskMitigation', icon: '🛡️', title: '风险应对', type: 'list', items: riskMitList, variant: 'green' })
  }
  if (monetizationList.length) {
    reportBlocks.push({ key: 'monetization', icon: '💰', title: '商业模式', type: 'list', items: monetizationList, variant: 'gold' })
  }
  if (aiResult?.targetUsers) {
    reportBlocks.push({ key: 'targetUsers', icon: '👥', title: '目标用户', type: 'text', content: aiResult.targetUsers })
  }
  if (aiResult?.userScenario) {
    reportBlocks.push({ key: 'userScenario', icon: '🎬', title: '使用场景', type: 'scenario', content: aiResult.userScenario })
  }
  if (techStackList.length) {
    reportBlocks.push({ key: 'techStack', icon: '🔧', title: '技术栈建议', type: 'tech', items: techStackList })
  }

  return (
    <div className="page active" id="page-hatch">
      <div className={styles.page}>
        {/* 顶部标题区 */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1>🥚 AI 孵化工作台</h1>
          </div>
          <p className={styles.headerSubtitle}>
            让 AI 深入分析你的想法，生成专业评估和项目方案，帮你把灵感变成可执行的计划
          </p>

          {/* 步骤进度条 */}
          <div className={styles.steps}>
            {STEP_LABELS.map((label, i) => (
              <span key={i} style={{ display: 'contents' }}>
                <div
                  className={`${styles.step} ${
                    i < currentStep ? styles.stepDone
                    : i === currentStep ? styles.stepActive
                    : ''
                  }`}
                >
                  <span className={styles.stepNum}>
                    {i < currentStep ? '✓' : i + 1}
                  </span>
                  {label}
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`${styles.stepConnector} ${
                      i < currentStep ? styles.stepConnectorDone : ''
                    }`}
                  />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* 双栏工作区 */}
        <div className={styles.workspace}>
          {/* ===== 左侧交互区 ===== */}
          <div className={styles.leftPanel}>
            {/* 描述输入区 */}
            <div className={styles.inputSection}>
              <div className={styles.inputSectionHeader}>
                <span className={styles.inputSectionIcon}>💭</span>
                <h2>描述你的项目想法</h2>
              </div>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="描述你想做什么、为谁解决什么问题、核心功能是什么……越详细 AI 分析越精准"
                rows={6}
              />
              {/* 引导提示 */}
              {!aiResult && !aiLoading && (
                <div className={styles.guideTip} key={currentTip}>
                  <span className={styles.guideTipIcon}>{GUIDE_TIPS[currentTip].icon}</span>
                  <span
                    className={styles.guideTipText}
                    dangerouslySetInnerHTML={{ __html: GUIDE_TIPS[currentTip].text }}
                  />
                </div>
              )}
              {/* 操作按钮 */}
              <div className={styles.inputActions}>
                <button
                  type="button"
                  className={btn.primary}
                  onClick={() => handleAnalyze()}
                  disabled={aiLoading || !description.trim()}
                >
                  {aiLoading ? '分析中...' : aiResult ? '🔄 重新评估' : '🧠 开始 AI 评估'}
                </button>
                {aiResult && (
                  <button
                    type="button"
                    className={btn.secondary}
                    onClick={handleReanalyze}
                  >
                    重新评估
                  </button>
                )}
              </div>
            </div>

            {/* AI 加载状态 */}
            {aiLoading && (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner} />
                <div className={styles.loadingTitle}>
                  AI 正在深入分析你的想法
                  <span className={styles.loadingDots}>
                    <span /><span /><span />
                  </span>
                </div>
                <div className={styles.loadingDesc}>
                  正在评估可行性、挖掘核心价值、分析竞争优势、识别潜在风险……
                </div>
              </div>
            )}

            {/* AI 评估报告 */}
            {aiResult && analysis && (
              <div className={styles.reportCard}>
                {/* 报告头部 */}
                <div className={styles.reportHeader}>
                  <div className={styles.reportHeaderLeft}>
                    <span className={styles.reportIcon}>🧠</span>
                    <h3>AI 评估报告</h3>
                    {aiResult.fallback && (
                      <span className={styles.fallbackBadge}>智能规则匹配</span>
                    )}
                  </div>
                  <div className={styles.reportMeta}>
                    共 {reportBlocks.length} 个维度
                  </div>
                </div>

                {/* 可行性评分 */}
                {feasibilityScore > 0 && (
                  <div className={styles.scoreBar}>
                    <div className={styles.scoreLeft}>
                      <span className={styles.scoreLabel}>可行性评分</span>
                      <div className={styles.scoreStars}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <span
                            key={s}
                            className={`${styles.scoreStar} ${
                              s <= feasibilityScore ? styles.scoreStarActive : ''
                            }`}
                            style={{ color: s <= feasibilityScore ? SCORE_COLORS[feasibilityScore] : '#D4CFC5' }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className={styles.scoreNum} style={{ color: SCORE_COLORS[feasibilityScore] }}>
                        {feasibilityScore}/5
                      </span>
                    </div>
                    <span
                      className={styles.scoreDesc}
                      style={{ color: SCORE_COLORS[feasibilityScore] }}
                    >
                      {SCORE_LABELS[feasibilityScore]}
                    </span>
                  </div>
                )}

                {/* 报告主体 — 可折叠区块 */}
                <div className={styles.reportBody}>
                  {reportBlocks.map(block => {
                    const collapsed = reportCollapsed[block.key]
                    return (
                      <div
                        key={block.key}
                        className={`${styles.analysisBlock} ${block.variant ? styles[`block_${block.variant}`] : ''}`}
                      >
                        <div
                          className={styles.blockHeader}
                          onClick={() => toggleBlock(block.key)}
                          role="button"
                          tabIndex={0}
                        >
                          <span className={styles.blockIcon}>{block.icon}</span>
                          <h4>{block.title}</h4>
                          <span className={styles.blockToggle}>{collapsed ? '▸' : '▾'}</span>
                          {block.items && (
                            <span className={styles.blockCount}>{block.items.length}</span>
                          )}
                        </div>
                        {!collapsed && (
                          <div className={styles.blockContent}>
                            {block.type === 'text' && (
                              <p className={styles.blockText}>{block.content}</p>
                            )}
                            {block.type === 'scenario' && (
                              <div className={styles.scenarioCard}>
                                <p className={styles.scenarioText}>{block.content}</p>
                              </div>
                            )}
                            {block.type === 'list' && (
                              <ul className={`${styles.blockList} ${block.variant ? styles[`list_${block.variant}`] : ''}`}>
                                {block.items.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                            )}
                            {block.type === 'tech' && (
                              <div className={styles.techTags}>
                                {block.items.map((t, i) => (
                                  <span key={i} className={styles.techTag}>
                                    {getTechEmoji(t)} {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* 报告操作栏 */}
                <div className={styles.reportActions}>
                  <button
                    type="button"
                    className={btn.primary}
                    onClick={handleApplyAndCreate}
                  >
                    ✨ 应用并创建项目
                  </button>
                  <button
                    type="button"
                    className={btn.secondary}
                    onClick={handleReanalyze}
                  >
                    🔄 重新评估
                  </button>
                </div>
              </div>
            )}

            {/* 底部操作 */}
            <div className={styles.bottomActions}>
              <button
                type="button"
                className={btn.secondary}
                onClick={() => navigate('/idea-wall')}
              >
                ← 返回想法墙
              </button>
            </div>
          </div>

          {/* ===== 右侧预览区 ===== */}
          <div className={styles.rightPanel}>
            <div className={styles.previewContainer}>
              <div className={styles.previewHeader}>
                <div className={styles.previewHeaderLeft}>
                  <span className={styles.previewIcon}>👁</span>
                  <h3>项目 Demo 预览</h3>
                </div>
                <div className={styles.previewDeviceToggle}>
                  <button
                    type="button"
                    className={`${styles.deviceBtn} ${previewDevice === 'desktop' ? styles.deviceBtnActive : ''}`}
                    onClick={() => setPreviewDevice('desktop')}
                    title="桌面视图"
                  >
                    🖥
                  </button>
                  <button
                    type="button"
                    className={`${styles.deviceBtn} ${previewDevice === 'mobile' ? styles.deviceBtnActive : ''}`}
                    onClick={() => setPreviewDevice('mobile')}
                    title="手机视图"
                  >
                    📱
                  </button>
                </div>
              </div>
              <div className={styles.previewBody}>
                {aiResult ? (
                  <ProjectPreview
                    aiResult={aiResult}
                    analysis={analysis}
                    techStack={techStackList}
                    coreFeatures={coreFeaturesList}
                    competitiveAdvantage={competitiveAdvList}
                    monetization={monetizationList}
                    device={previewDevice}
                  />
                ) : (
                  <div className={styles.previewEmpty}>
                    <span className={styles.previewEmptyIcon}>🥚</span>
                    <p className={styles.previewEmptyText}>
                      AI 评估完成后<br />这里将展示项目实现后的 Demo 效果
                    </p>
                  </div>
                )}
              </div>
              {aiResult && (
                <div className={styles.previewHint}>
                  💡 这是项目实现后官网的预览效果，非最终设计
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 根据技术名称返回对应的 emoji */
function getTechEmoji(tech) {
  const t = tech.toLowerCase()
  if (t.includes('react')) return '⚛️'
  if (t.includes('vue')) return '💚'
  if (t.includes('node')) return '🟢'
  if (t.includes('python')) return '🐍'
  if (t.includes('java')) return '☕'
  if (t.includes('docker')) return '🐳'
  if (t.includes('postgres') || t.includes('mysql')) return '🐘'
  if (t.includes('redis')) return '🔴'
  if (t.includes('mongo')) return '🍃'
  if (t.includes('kubernetes') || t.includes('k8s')) return '☸️'
  if (t.includes('aws')) return '☁️'
  if (t.includes('flutter')) return '💙'
  if (t.includes('swift')) return '🍎'
  if (t.includes('go') || t.includes('golang')) return '🔵'
  if (t.includes('rust')) return '🦀'
  if (t.includes('typescript')) return '🔷'
  if (t.includes('tailwind')) return '🌊'
  return '📦'
}
