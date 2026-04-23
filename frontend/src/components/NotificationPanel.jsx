import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const notifications = [
  { type: '🎉 申请通过', text: '恭喜！你已被接受加入「面向独居青年的社交做饭 App」担任产品经理角色。', time: '2 小时前', link: '/detail/0' },
  { type: '🤝 新成员加入', text: 'Ming 加入了「AI 驱动的个人知识图谱工具」担任前端开发。', time: '5 小时前', link: '/detail/1' },
  { type: '📢 项目更新', text: '「像素风农场经营」项目完成了里程碑 M1：核心玩法设计。', time: '1 天前', link: null },
  { type: '💡 新项目推荐', text: '有一个新项目「老年人健康打卡小程序」正在招募产品经理，与你的技能匹配。', time: '2 天前', link: null },
  { type: '🏆 成就解锁', text: '你已完成第一个里程碑贡献！获得「初出茅庐」成就徽章。', time: '3 天前', link: null },
]

export default function NotificationPanel() {
  const { notifOpen, toggleNotif } = useApp()
  const navigate = useNavigate()

  return (
    <>
      <div className={`notif-overlay ${notifOpen ? 'active' : ''}`} id="notif-overlay" onClick={toggleNotif}></div>
      <div className={`notif-panel ${notifOpen ? 'active' : ''}`} id="notif-panel">
        <div className="notif-header">
          <h3>通知</h3>
          <button className="notif-close" onClick={toggleNotif}>✕</button>
        </div>
        <div className="notif-list">
          {notifications.map((n, i) => (
            <div
              key={i}
              className={`notif-item ${i < 3 ? 'unread' : ''}`}
              onClick={() => { if (n.link) { navigate(n.link); toggleNotif() } }}
            >
              <div className="ni-type">{n.type}</div>
              <div className="ni-text">{n.text}</div>
              <div className="ni-time">{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
