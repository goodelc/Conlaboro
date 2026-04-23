import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATUS_MAP, TAG_CLASS } from '../constants'

export default memo(function ProjectCard({ p }) {
  const navigate = useNavigate()
  const allMembers = p.roles.flatMap(r => r.members)

  return (
    <div className="project-card reveal visible" onClick={() => navigate(`/detail/${p.id}`)}>
      <span className={`card-tag ${TAG_CLASS[p.status]}`}>{STATUS_MAP[p.status]}</span>
      <h3>{p.title}</h3>
      <p className="desc">{p.desc}</p>
      <div className="roles">
        {p.roles.map(r => (
          <span key={r.name} className={`role-badge ${r.filled >= r.needed ? 'filled' : 'open'}`}>
            <span className={`role-dot ${r.filled >= r.needed ? 'green' : 'red'}`}></span>{r.name}
          </span>
        ))}
      </div>
      <div className="card-footer">
        <div className="members">
          {allMembers.slice(0, 3).map(m => (
            <div key={m.name} className="member-avatar" style={{ background: m.color }}>{m.name[0]}</div>
          ))}
          {allMembers.length > 3 && (
            <div className="member-avatar" style={{ background: 'var(--warm-gray)' }}>+{allMembers.length - 3}</div>
          )}
        </div>
        <span className="join-btn">{p.status === 'done' ? '查看成果 →' : '查看详情 →'}</span>
      </div>
    </div>
  )
})
