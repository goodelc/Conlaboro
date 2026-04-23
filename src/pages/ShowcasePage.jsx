import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'

export default function ShowcasePage() {
  const navigate = useNavigate()
  const { projects } = useData()

  const doneProjects = projects.filter(p => p.status === 'done')
  const featured = doneProjects[0]
  const rest = doneProjects.slice(1)

  return (
    <div className="page active" id="page-showcase">
      <div className="showcase-page" id="showcase-content">
        <div className="showcase-inner">
          <div className="showcase-header"><h1>🏆 成果展厅</h1><p>每一个完成的项目，都是一群人共同的荣耀</p></div>

          {featured && (
            <div className="showcase-featured" onClick={() => navigate(`/detail/${featured.id}`)}>
              <h2>{featured.title}</h2>
              <p className="sf-desc">{featured.desc}</p>
              <div className="sf-meta">
                <span>👤 发起人：<strong>{featured.author}</strong></span>
                <span>👥 团队：<strong>{featured.contributors ? featured.contributors.length : featured.roles.reduce((a,r)=>a+r.members.length,0)} 人</strong></span>
                <span>⏱ 总用时：<strong>{featured.totalHours || 0} 小时</strong></span>
                <span>📅 上线：<strong>{featured.completedAt || ''}</strong></span>
              </div>
              <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem' }}>查看完整项目 →</button>
            </div>
          )}

          {rest.length > 0 && (
            <div className="showcase-grid">
              {rest.map(p => (
                <div key={p.id} className="showcase-card" onClick={() => navigate(`/detail/${p.id}`)}>
                  <span className="sc-badge">✅ 已完成</span>
                  <h3>{p.title}</h3>
                  <p className="sc-desc">{p.desc.substring(0, 80)}…</p>
                  <div className="sc-stats">
                    <span>发起人：<strong>{p.author}</strong></span>
                    <span>用时：<strong>{p.totalHours || '?'}h</strong></span>
                    <span>提交：<strong>{p.totalCommits || '?'}次</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {doneProjects.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--warm-gray)', padding: '4rem' }}>暂无已完成的项目。成为第一个完成项目的人吧！</p>
          )}
        </div>
      </div>
    </div>
  )
}
