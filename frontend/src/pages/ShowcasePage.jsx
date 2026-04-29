import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import styles from './ShowcasePage.module.css'
import btn from '../assets/shared/Buttons.module.css'

export default function ShowcasePage() {
  const navigate = useNavigate()
  const { projects } = useData()

  const getProject = (item) => item.project || item

  const doneProjects = projects.filter(p => getProject(p).status === 'done')
  const featured = doneProjects[0] ? getProject(doneProjects[0]) : null
  const rest = doneProjects.slice(1).map(getProject)

  return (
    <div className="page active" id="page-showcase">
      <div className={styles.page} id="showcase-content">
        <div className={styles.inner}>
          <div className={styles.header}><h1>🏆 成果展厅</h1><p>每一个完成的项目，都是一群人共同的荣耀</p></div>

          {featured && (
            <div className={styles.featured} onClick={() => navigate(`/detail/${featured.id}`)}>
              <h2>{featured.title}</h2>
              <p className={styles.featuredDesc}>{featured.desc}</p>
              <div className={styles.metaRow}>
                <span>👤 发起人：<strong>{featured.author || featured.authorName}</strong></span>
                <span>👥 团队：<strong>{featured.contributors ? featured.contributors.length : (featured.roles || []).reduce((a,r)=>a+(r.members||[]).length,0)} 人</strong></span>
                <span>⏱ 总用时：<strong>{featured.totalHours || 0} 小时</strong></span>
                <span>📅 上线：<strong>{featured.completedAt || ''}</strong></span>
              </div>
              <button className={`${btn.primary} ${styles.featuredBtn}`}>查看完整项目 →</button>
            </div>
          )}

          {rest.length > 0 && (
            <div className={styles.grid}>
              {rest.map(p => (
                <div key={p.id} className={styles.card} onClick={() => navigate(`/detail/${p.id}`)}>
                  <span className={styles.badge}>✅ 已完成</span>
                  <h3>{p.title}</h3>
                  <p className={styles.cardDesc}>{(p.desc || '').substring(0, 80)}…</p>
                  <div className={styles.stats}>
                    <span>发起人：<strong>{p.author || p.authorName}</strong></span>
                    <span>用时：<strong>{p.totalHours || '?'}h</strong></span>
                    <span>提交：<strong>{p.totalCommits || '?'}次</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {doneProjects.length === 0 && (
            <p className={styles.emptyState}>暂无已完成的项目。成为第一个完成项目的人吧！</p>
          )}
        </div>
      </div>
    </div>
  )
}
