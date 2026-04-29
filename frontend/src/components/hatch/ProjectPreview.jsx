import { useMemo } from 'react'
import styles from './ProjectPreview.module.css'

const DURATION_MAP = { short: '2 周', normal: '1 个月', long: '2 个月' }
const CATEGORY_MAP = {
  app: '移动应用',
  web: 'Web 应用',
  game: '游戏',
  ai: 'AI / 机器学习',
  tool: '工具',
}

/**
 * 基于 AI 分析结果生成 HTML 预览
 */
export default function ProjectPreview({ aiResult, analysis, techStack, device }) {
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

    const starsHtml = Array.from({ length: 5 }, (_, i) =>
      `<span style="color:${i < score ? '#D4A843' : '#D4CFC5'};font-size:14px;">${i < score ? '★' : '☆'}</span>`
    ).join('')

    const highlightsHtml = highlights.map(h =>
      `<li style="margin-bottom:6px;padding-left:16px;position:relative;">
        <span style="position:absolute;left:0;color:#D4213D;font-weight:700;">·</span>${h}
      </li>`
    ).join('')

    const rolesHtml = roles.filter(r => r.needed > 0).map(r =>
      `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;background:#FAF7F0;border:1px solid #D4CFC5;border-radius:6px;font-size:13px;color:#3D3D3D;">
        <span>${r.emoji}</span>${r.name} ×${r.needed}
      </span>`
    ).join(' ')

    const milestonesHtml = milestones.map((m, i) => {
      const colors = ['#D4213D', '#D4A843', '#228B22']
      const color = colors[i % colors.length]
      return `<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
        <div style="width:24px;height:24px;border-radius:50%;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">${i + 1}</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:#1A1A1A;">${m.title}</div>
          <div style="font-size:12px;color:#8B8578;margin-top:2px;">阶段 ${i + 1}</div>
        </div>
      </div>`
    }).join('')

    const techHtml = techStack.map(t =>
      `<span style="display:inline-block;padding:3px 10px;background:#F5F0E8;border-radius:4px;font-size:12px;color:#3D3D3D;margin:2px;">${t}</span>`
    ).join('')

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans SC', sans-serif; color: #1A1A1A; background: #FAF7F0; }
</style>
</head>
<body>
<div style="max-width:100%;margin:0 auto;">

  <!-- Hero -->
  <div style="background:linear-gradient(135deg,#1A1A2E 0%,#16213E 100%);color:white;padding:2rem 1.5rem 1.75rem;">
    <div style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#D4A843;margin-bottom:0.75rem;">${category} · ${duration}</div>
    <h1 style="font-family:'Noto Serif SC',serif;font-size:22px;font-weight:900;margin-bottom:0.5rem;line-height:1.3;">${projectName}</h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.75);line-height:1.6;">${tagline}</p>
    <div style="margin-top:1rem;display:flex;align-items:center;gap:6px;">
      ${starsHtml}
      <span style="font-size:12px;color:rgba(255,255,255,0.5);margin-left:6px;">可行性评分</span>
    </div>
  </div>

  <!-- Summary -->
  ${summary ? `
  <div style="padding:1.25rem 1.5rem;background:white;border-bottom:1px solid #D4CFC5;">
    <div style="font-size:11px;font-weight:700;color:#8B8578;letter-spacing:0.08em;margin-bottom:0.5rem;">项目概述</div>
    <p style="font-size:14px;line-height:1.75;color:#3D3D3D;">${summary}</p>
  </div>` : ''}

  <!-- Target Users -->
  ${targetUsers ? `
  <div style="padding:1.25rem 1.5rem;background:white;border-bottom:1px solid #D4CFC5;">
    <div style="font-size:11px;font-weight:700;color:#8B8578;letter-spacing:0.08em;margin-bottom:0.5rem;">👥 目标用户</div>
    <p style="font-size:14px;line-height:1.75;color:#3D3D3D;">${targetUsers}</p>
  </div>` : ''}

  <!-- Highlights -->
  ${highlights.length > 0 ? `
  <div style="padding:1.25rem 1.5rem;background:white;border-bottom:1px solid #D4CFC5;">
    <div style="font-size:11px;font-weight:700;color:#8B8578;letter-spacing:0.08em;margin-bottom:0.5rem;">✨ 核心亮点</div>
    <ul style="list-style:none;padding:0;margin:0;font-size:14px;line-height:1.7;color:#3D3D3D;">
      ${highlightsHtml}
    </ul>
  </div>` : ''}

  <!-- Tech Stack -->
  ${techHtml ? `
  <div style="padding:1.25rem 1.5rem;background:white;border-bottom:1px solid #D4CFC5;">
    <div style="font-size:11px;font-weight:700;color:#8B8578;letter-spacing:0.08em;margin-bottom:0.5rem;">🔧 技术栈</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;">${techHtml}</div>
  </div>` : ''}

  <!-- Roles -->
  ${rolesHtml ? `
  <div style="padding:1.25rem 1.5rem;background:white;border-bottom:1px solid #D4CFC5;">
    <div style="font-size:11px;font-weight:700;color:#8B8578;letter-spacing:0.08em;margin-bottom:0.75rem;">🎯 团队角色</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">${rolesHtml}</div>
  </div>` : ''}

  <!-- Milestones -->
  ${milestonesHtml ? `
  <div style="padding:1.25rem 1.5rem;background:white;">
    <div style="font-size:11px;font-weight:700;color:#8B8578;letter-spacing:0.08em;margin-bottom:0.75rem;">📋 里程碑</div>
    ${milestonesHtml}
  </div>` : ''}

  <!-- Footer -->
  <div style="padding:1rem 1.5rem;background:#FAF7F0;text-align:center;">
    <p style="font-size:11px;color:#8B8578;">由 AI 孵化工作台生成 · 共创公社</p>
  </div>

</div>
</body>
</html>`
  }, [aiResult, analysis, techStack])

  if (!aiResult) return null

  return (
    <iframe
      className={`${styles.frame} ${device === 'mobile' ? styles.frameMobile : ''}`}
      srcDoc={html}
      title="项目预览"
      sandbox="allow-same-origin"
    />
  )
}
