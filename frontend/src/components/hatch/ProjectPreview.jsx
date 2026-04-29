import { useMemo } from 'react'
import styles from './ProjectPreview.module.css'

const DURATION_MAP = { short: '2 周内', normal: '1 个月', long: '2 个月+' }
const CATEGORY_MAP = {
  app: '移动应用',
  web: 'Web 应用',
  game: '游戏',
  ai: 'AI / 机器学习',
  tool: '效率工具',
}

/**
 * 基于 AI 分析结果，生成真实的产品 Demo 落地页 HTML
 * 这是一个"如果项目实现了，官网会长什么样"的预览
 */
export default function ProjectPreview({ aiResult, analysis, techStack, coreFeatures, competitiveAdvantage, monetization, device }) {
  const html = useMemo(() => {
    if (!aiResult) return ''

    const projectName = aiResult.name || '未命名项目'
    const tagline = aiResult.tagline || ''
    const category = CATEGORY_MAP[aiResult.category] || aiResult.category || ''
    const duration = DURATION_MAP[aiResult.duration] || '1 个月'
    const summary = analysis?.summary || ''
    const highlights = analysis?.highlights || []
    const roles = aiResult.roles || []
    const milestones = aiResult.milestones || []
    const targetUsers = aiResult.targetUsers || ''
    const score = aiResult.feasibilityScore || 3
    const userScenario = aiResult.userScenario || ''

    // 安全转义
    const esc = (s) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

    const starsHtml = Array.from({ length: 5 }, (_, i) =>
      `<span style="color:${i < score ? '#FBBF24' : '#4B5563'};font-size:16px;">${i < score ? '★' : '☆'}</span>`
    ).join('')

    // 功能卡片
    const featureIcons = ['⚡', '🎯', '🔄', '📊', '🛡️', '🌐']
    const featuresHtml = coreFeatures.map((f, i) => {
      const parts = f.split(/[：:]/)
      const title = parts[0] || f
      const desc = parts.slice(1).join('：') || ''
      return `
        <div style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #E5E7EB;transition:transform 0.2s,box-shadow 0.2s;">
          <div style="font-size:1.5rem;margin-bottom:0.6rem;">${featureIcons[i % featureIcons.length]}</div>
          <div style="font-weight:700;font-size:14px;color:#111827;margin-bottom:0.35rem;">${esc(title)}</div>
          ${desc ? `<div style="font-size:12px;color:#6B7280;line-height:1.6;">${esc(desc)}</div>` : ''}
        </div>`
    }).join('')

    // 竞争优势
    const advIcons = ['🏆', '🚀', '💎']
    const advHtml = competitiveAdvantage.map((a, i) => {
      const parts = a.split(/[：:]/)
      const title = parts[0] || a
      const desc = parts.slice(1).join('：') || ''
      return `
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="font-size:1.25rem;flex-shrink:0;margin-top:2px;">${advIcons[i % advIcons.length]}</div>
          <div>
            <div style="font-weight:600;font-size:14px;color:#111827;">${esc(title)}</div>
            ${desc ? `<div style="font-size:12px;color:#6B7280;line-height:1.5;margin-top:2px;">${esc(desc)}</div>` : ''}
          </div>
        </div>`
    }).join('')

    // 里程碑时间线
    const msColors = ['#6366F1', '#8B5CF6', '#A855F7']
    const msHtml = milestones.map((m, i) => `
      <div style="display:flex;gap:14px;align-items:flex-start;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="width:28px;height:28px;border-radius:50%;background:${msColors[i % msColors.length]};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">${i + 1}</div>
          ${i < milestones.length - 1 ? '<div style="width:2px;height:24px;background:#E5E7EB;"></div>' : ''}
        </div>
        <div style="padding-bottom:${i < milestones.length - 1 ? '12px' : '0'};">
          <div style="font-weight:600;font-size:13px;color:#111827;">${esc(m.title)}</div>
          ${m.description ? `<div style="font-size:11px;color:#6B7280;line-height:1.5;margin-top:2px;">${esc(m.description)}</div>` : ''}
          ${m.deliverable ? `<div style="font-size:11px;color:#6366F1;margin-top:3px;">📦 ${esc(m.deliverable)}</div>` : ''}
        </div>
      </div>`).join('')

    // 团队角色
    const rolesHtml = roles.filter(r => r.needed > 0).map(r =>
      `<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:white;border:1px solid #E5E7EB;border-radius:8px;">
        <span style="font-size:1.1rem;">${r.emoji}</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:#111827;">${esc(r.name)}</div>
          <div style="font-size:11px;color:#6B7280;">${esc(r.description)}</div>
        </div>
      </div>`
    ).join('')

    // 技术栈
    const techHtml = techStack.map(t =>
      `<span style="display:inline-block;padding:4px 12px;background:#EEF2FF;border-radius:6px;font-size:12px;color:#4F46E5;font-weight:500;">${esc(t)}</span>`
    ).join(' ')

    // 商业模式
    const monetIcons = ['💰', '💎', '🤝']
    const monetHtml = monetization.map((m, i) => {
      const parts = m.split(/[：:]/)
      const title = parts[0] || m
      const desc = parts.slice(1).join('：') || ''
      return `
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <span style="font-size:1.1rem;">${monetIcons[i % monetIcons.length]}</span>
          <div>
            <div style="font-weight:600;font-size:13px;color:#111827;">${esc(title)}</div>
            ${desc ? `<div style="font-size:11px;color:#6B7280;line-height:1.5;">${esc(desc)}</div>` : ''}
          </div>
        </div>`
    }).join('')

    // CTA 按钮
    const ctaBtn = `<a href="#" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">立即体验 →</a>`

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans SC', sans-serif; color: #1F2937; background: #F9FAFB; -webkit-font-smoothing: antialiased; }
  a { text-decoration: none; color: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 2px; }
</style>
</head>
<body>
<div style="max-width:100%;margin:0 auto;overflow-x:hidden;">

  <!-- 导航栏 -->
  <nav style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:white;border-bottom:1px solid #E5E7EB;position:sticky;top:0;z-index:10;">
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:900;">${esc(projectName.charAt(0))}</div>
      <span style="font-family:'Noto Serif SC',serif;font-weight:900;font-size:15px;color:#111827;">${esc(projectName)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:16px;font-size:12px;color:#6B7280;">
      <span>功能</span>
      <span>团队</span>
      <span style="padding:6px 14px;background:#6366F1;color:white;border-radius:6px;font-weight:600;">加入我们</span>
    </div>
  </nav>

  <!-- Hero 区域 -->
  <div style="background:linear-gradient(135deg,#0F172A 0%,#1E1B4B 50%,#312E81 100%);padding:2.5rem 1.5rem 2rem;color:white;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;background:rgba(99,102,241,0.15);"></div>
    <div style="position:absolute;bottom:-30px;left:-30px;width:120px;height:120px;border-radius:50%;background:rgba(139,92,246,0.1);"></div>
    <div style="position:relative;z-index:1;">
      <div style="display:inline-block;padding:4px 12px;background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.3);border-radius:20px;font-size:11px;font-weight:600;color:#A5B4FC;margin-bottom:1rem;">${esc(category)} · 预计 ${esc(duration)}完成</div>
      <h1 style="font-family:'Noto Serif SC',serif;font-size:26px;font-weight:900;line-height:1.3;margin-bottom:0.6rem;">${esc(projectName)}</h1>
      <p style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:400px;margin-bottom:1.2rem;">${esc(tagline)}</p>
      <div style="display:flex;align-items:center;gap:8px;">
        ${starsHtml}
        <span style="font-size:11px;color:rgba(255,255,255,0.4);margin-left:4px;">可行性 ${score}/5</span>
      </div>
    </div>
  </div>

  <!-- 项目概述 -->
  ${summary ? `
  <div style="padding:1.5rem;background:white;border-bottom:1px solid #F3F4F6;">
    <h2 style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:800;color:#111827;margin-bottom:0.6rem;">📖 项目概述</h2>
    <p style="font-size:13px;line-height:1.8;color:#4B5563;">${esc(summary)}</p>
  </div>` : ''}

  <!-- 核心功能 -->
  ${coreFeatures.length > 0 ? `
  <div style="padding:1.5rem;background:#F9FAFB;border-bottom:1px solid #F3F4F6;">
    <h2 style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:800;color:#111827;margin-bottom:1rem;">⚡ 核心功能</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      ${featuresHtml}
    </div>
  </div>` : ''}

  <!-- 使用场景 -->
  ${userScenario ? `
  <div style="padding:1.5rem;background:white;border-bottom:1px solid #F3F4F6;">
    <h2 style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:800;color:#111827;margin-bottom:0.6rem;">🎬 使用场景</h2>
    <div style="padding:1rem;background:linear-gradient(135deg,#EEF2FF,#F5F3FF);border-radius:10px;border-left:3px solid #6366F1;">
      <p style="font-size:13px;line-height:1.8;color:#4B5563;font-style:italic;">"${esc(userScenario)}"</p>
    </div>
  </div>` : ''}

  <!-- 竞争优势 -->
  ${competitiveAdvantage.length > 0 ? `
  <div style="padding:1.5rem;background:#F9FAFB;border-bottom:1px solid #F3F4F6;">
    <h2 style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:800;color:#111827;margin-bottom:1rem;">🏆 竞争优势</h2>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${advHtml}
    </div>
  </div>` : ''}

  <!-- 里程碑 -->
  ${milestones.length > 0 ? `
  <div style="padding:1.5rem;background:white;border-bottom:1px solid #F3F4F6;">
    <h2 style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:800;color:#111827;margin-bottom:1rem;">🗺️ 开发路线</h2>
    ${msHtml}
  </div>` : ''}

  <!-- 目标用户 + 技术栈 -->
  ${(targetUsers || techStack.length > 0) ? `
  <div style="padding:1.5rem;background:#F9FAFB;border-bottom:1px solid #F3F4F6;">
    ${targetUsers ? `
    <div style="margin-bottom:1rem;">
      <h2 style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:800;color:#111827;margin-bottom:0.5rem;">👥 目标用户</h2>
      <p style="font-size:13px;line-height:1.8;color:#4B5563;">${esc(targetUsers)}</p>
    </div>` : ''}
    ${techStack.length > 0 ? `
    <div>
      <h2 style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:800;color:#111827;margin-bottom:0.5rem;">🔧 技术栈</h2>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">${techHtml}</div>
    </div>` : ''}
  </div>` : ''}

  <!-- 团队 + 商业模式 -->
  ${(roles.length > 0 || monetization.length > 0) ? `
  <div style="padding:1.5rem;background:white;border-bottom:1px solid #F3F4F6;">
    ${roles.length > 0 ? `
    <div style="margin-bottom:1rem;">
      <h2 style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:800;color:#111827;margin-bottom:0.75rem;">👤 团队角色</h2>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${rolesHtml}
      </div>
    </div>` : ''}
    ${monetization.length > 0 ? `
    <div>
      <h2 style="font-family:'Noto Serif SC',serif;font-size:16px;font-weight:800;color:#111827;margin-bottom:0.75rem;">💎 商业模式</h2>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${monetHtml}
      </div>
    </div>` : ''}
  </div>` : ''}

  <!-- CTA -->
  <div style="padding:2rem 1.5rem;background:linear-gradient(135deg,#0F172A,#1E1B4B);text-align:center;">
    <h3 style="font-family:'Noto Serif SC',serif;font-size:18px;font-weight:900;color:white;margin-bottom:0.5rem;">准备好开始了吗？</h3>
    <p style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:1.2rem;">加入 ${esc(projectName)}，一起把想法变为现实</p>
    ${ctaBtn}
  </div>

  <!-- Footer -->
  <div style="padding:1rem 1.5rem;background:#0F172A;text-align:center;">
    <p style="font-size:10px;color:rgba(255,255,255,0.3);">AI 孵化预览 · 共创公社 · ${new Date().getFullYear()}</p>
  </div>

</div>
</body>
</html>`
  }, [aiResult, analysis, techStack, coreFeatures, competitiveAdvantage, monetization])

  if (!aiResult) return null

  return (
    <iframe
      className={`${styles.frame} ${device === 'mobile' ? styles.frameMobile : ''}`}
      srcDoc={html}
      title="项目 Demo 预览"
      sandbox="allow-same-origin"
    />
  )
}
