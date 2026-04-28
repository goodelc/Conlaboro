import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATUS_MAP, TAG_CLASS } from '../constants'
import styles from './ProjectCard.module.css'
import * as tags from '../assets/shared/Tags.module.css'

export default memo(function ProjectCard({ p }) {
  const navigate = useNavigate()
  const project = p.project || p
  const roles = p.roles || []
  const allMembers = roles.flatMap(r => r.members || [])

  return (
    <div className={`${styles.card} reveal visible`} data-testid="project-card" onClick={() => navigate(`/detail/${project.id}`)}>
      <span className={`${tags.tag} ${tags[TAG_CLASS[project.status]] || ''}`}>{STATUS_MAP[project.status]}</span>
      <h3 className={styles.title}>{project.title}</h3>
      <p className={styles.desc}>{project.description || project.desc}</p>
      <div className={styles.roles}>
        {roles.map(r => (
          <span key={r.name} className={`${tags.badge} ${r.filled >= r.needed ? tags.filled : tags.openBadge}`}>
            <span className={`${tags.dot} ${r.filled >= r.needed ? tags.dotGreen : tags.dotRed}`}></span>{r.name}
          </span>
        ))}
      </div>
      <div className={styles.footer}>
        <div className={styles.members}>
          {allMembers.length > 0 ? (
            <>
              {allMembers.slice(0, 3).map(m => (
                <div key={m.name} className={styles.memberAvatar} style={{ background: m.color }}>{m.name[0]}</div>
              ))}
              {allMembers.length > 3 && (
                <div className={styles.moreCount}>+{allMembers.length - 3}</div>
              )}
            </>
          ) : roles.length > 0 ? (
            <span className={styles.noMembers}>等待加入</span>
          ) : null}
        </div>
        <span className={styles.joinBtn}>{project.status === 'done' ? '查看成果 →' : '查看详情 →'}</span>
      </div>
    </div>
  )
})
