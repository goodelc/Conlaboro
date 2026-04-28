import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ProjectCard from '../components/ProjectCard'
import { getStats } from '../api'
import styles from './HomePage.module.css'
import * as btn from '../assets/shared/Buttons.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const { projects } = useData()
  const totalProjects = projects?.length || 0
  const doneProjects = projects?.filter(item => (item.project || item).status === 'done').length || 0
  // 从后端获取真实统计数据，失败时回退到前端估算
  const [statsData, setStatsData] = useState(null)
  useEffect(() => {
    getStats().then(data => setStatsData(data)).catch(() => {})
  }, [])
  const estimatedUsers = statsData?.totalUsers || Math.max(totalProjects * 4, totalProjects > 0 ? 16 : 0)
  const pageRef = useScrollReveal()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // 快速导航按钮状态
  const [showNavButtons, setShowNavButtons] = useState(false)
  
  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setShowNavButtons(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // 滚动到底部
  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const categories = [
    { key: 'all', label: '全部' },
    { key: 'app', label: '📱 移动应用' },
    { key: 'web', label: '🌐 Web 应用' },
    { key: 'game', label: '🎮 游戏' },
    { key: 'ai', label: '🤖 AI' },
    { key: 'tool', label: '🔧 工具' },
  ]

  let filtered = projects
  if (categoryFilter !== 'all') filtered = filtered.filter(item => (item.project || item).category === categoryFilter)
  if (statusFilter !== 'all') filtered = filtered.filter(item => (item.project || item).status === statusFilter)
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase()
    filtered = filtered.filter(item => {
      const p = item.project || item
      const roles = item.roles || []
      return p.title.toLowerCase().includes(q) || (p.description || p.desc || '').toLowerCase().includes(q) ||
        roles.some(r => r.name.toLowerCase().includes(q))
    })
  }

  return (
    <div className={`page active ${styles.pageActive}`} ref={pageRef}>
      <section className={styles.hero}>
        <div className={styles.badge}><span className={styles.badgeDot}></span>开放 · 共享 · 协作</div>
        <h1 className={styles.title}>每个人都有<br /><span className={styles.highlight}>创造力</span></h1>
        <p className={styles.subtitle}>你有一个想法，这里有和你一样的人。<br />不需要公司，不需要投资，不需要简历。<br />一起把想法变成真实的产品。</p>
        <div className={styles.actions}>
          <button className={btn.primary} onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>浏览项目</button>
          <button className={btn.secondary} onClick={() => navigate('/create')}>发起你的想法</button>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}><div className={styles.num}>{estimatedUsers.toLocaleString()}</div><div className={styles.label}>创客</div></div>
          <div className={styles.stat}><div className={styles.num}>{totalProjects}</div><div className={styles.label}>项目</div></div>
          <div className={styles.stat}><div className={styles.num}>{doneProjects}</div><div className={styles.label}>已完成</div></div>
        </div>
      </section>

      <section className={`${styles.manifesto} reveal`}>
        <div className={styles.inner}>
          <div className={styles.mLabel}>我们的信念</div>
          <div className={styles.quote}>"各尽所能，<span className={styles.em}>按需协作</span>。<br />每个人的创造力都值得被看见。"</div>
          <div className={styles.divider}></div>
          <p className={styles.text}>我们相信，好的想法不应该因为"没有团队"而死掉。<br />我们相信，有能力的人不应该因为"没有经验"而被拒绝。<br />我们相信，当一群陌生人为了同一个目标聚在一起，奇迹就会发生。</p>
        </div>
      </section>

      <section className={styles.how} id="how">
        <div className={`${styles.sectionHeader} reveal`}><span className={styles.secLabel}>How it works</span><h2 className={styles.secH2}>四个步骤，从想法到产品</h2></div>
        <div className={styles.howGrid}>
          {
            [
              { num: '01', icon: '💡', title: '发布想法', desc: '写下你想做什么，越具体越好。描述问题、用户、愿景。不需要完美，只需要真实。' },
              { num: '02', icon: '🤝', title: '组建团队', desc: '产品、设计、开发、测试……每个角色都有人来认领。志同道合的人自动匹配。' },
              { num: '03', icon: '🔨', title: '协作共建', desc: '按里程碑推进，每个阶段有明确交付物。透明协作，贡献实时可见。' },
              { num: '04', icon: '🚀', title: '共享成果', desc: '产品上线，所有参与者获得贡献记录。这就是你的作品集，这就是你的经验。' },
            ].map(s => (
              <div key={s.num} className={`${styles.step} reveal`}>
                <div className={styles.stepNum}>{s.num}</div><div className={styles.stepIcon}>{s.icon}</div><h3>{s.title}</h3><p>{s.desc}</p>
              </div>
            ))
          }
        </div>
      </section>

      <section className={styles.projects} id="projects">
        <div className={`${styles.sectionHeaderWithActions} reveal`}>
          <div className={styles.sectionHeaderContent}>
            <span className={styles.secLabel}>Explore Projects</span>
            <h2 className={styles.secH2}>正在招募队友的项目</h2>
          </div>
          <div className={styles.sectionHeaderActions}>
            <button className={btn.outline} onClick={() => navigate('/recruiting')}>
              查看全部 →
            </button>
          </div>
        </div>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input type="text" className={styles.searchInput} data-testid="search-input" placeholder="搜索项目名称、描述、角色…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className={styles.searchFilters}>
            {categories.map(c => (
              <button key={c.key} className={`${styles.filterChip} ${categoryFilter === c.key ? styles.filterChipActive : ''}`} onClick={() => setCategoryFilter(c.key)}>{c.label}</button>
            ))}
            <span className={styles.filterDivider}>|</span>
            {[{key:'all',label:'全部'},{key:'open',label:'招募中'},{key:'progress',label:'进行中'},{key:'done',label:'已完成'}].map(s => (
              <button key={s.key} className={`${styles.filterChip} ${statusFilter === s.key ? styles.filterChipActive : ''}`} onClick={() => setStatusFilter(s.key)}>{s.label}</button>
            ))}
            <span className={styles.resultsInfo}>{filtered.length > 0 && (searchQuery || statusFilter !== 'all') ? `找到 ${filtered.length} 个项目` : ''}</span>
          </div>
        </div>
        <div className={styles.projectsGrid} id="projects-grid">
          {filtered.length > 0 ? filtered.map(item => <ProjectCard key={(item.project || item).id} p={item} />) : null}
        </div>
        {filtered.length === 0 && (
          <div className={styles.noResults}>
            <div className={styles.nrIcon}>🔍</div><h3>没有找到匹配的项目</h3><p>试试其他关键词或筛选条件</p>
          </div>
        )}
      </section>

      <section className={styles.rolesSection} id="roles">
        <div className={`${styles.sectionHeader} reveal`}><span className={styles.secLabel}>Find Your Role</span><h2 className={styles.secH2}>找到你的位置</h2></div>
        <div className={styles.rolesGrid}>
          {
            [
              { emoji: '🎯', name: '产品经理', count: totalProjects > 0 ? Math.max(1, Math.round(totalProjects * 0.3)) : 0 },
              { emoji: '🎨', name: '设计师',   count: totalProjects > 0 ? Math.max(1, Math.round(totalProjects * 0.25)) : 0 },
              { emoji: '💻', name: '开发者',   count: totalProjects > 0 ? Math.max(2, Math.round(totalProjects * 0.5)) : 0 },
              { emoji: '🧪', name: '测试工程师',count: totalProjects > 0 ? Math.max(0, Math.round(totalProjects * 0.15)) : 0 },
              { emoji: '📣', name: '运营 / 增长',count: totalProjects > 0 ? Math.max(0, Math.round(totalProjects * 0.2)) : 0 },
            ].map(r => (
              <div key={r.name} className={`${styles.roleCard} reveal`}><span className={styles.roleEmoji}>{r.emoji}</span><h3>{r.name}</h3><p className={styles.roleCount}><span>{r.count}</span> 人在线</p></div>
            ))
          }
        </div>
      </section>

      <section className={styles.principles} id="principles">
        <div className={`${styles.sectionHeader} reveal`}><span className={styles.secLabel}>Our Principles</span><h2 className={styles.secH2}>公社原则</h2></div>
        <div className={styles.principlesGrid}>
          {
            [
              { num: '01', title: '贡献即权力', desc: '不靠头衔说话，靠贡献说话。谁做的事情多，谁就有更大的话语权。代码、文档、设计——一切贡献都被记录。' },
              { num: '02', title: '成果共享', desc: '项目成果属于所有参与者。默认采用开源协议，任何人都可以使用、改进、再创造。知识不应该被垄断。' },
              { num: '03', title: '透明协作', desc: '所有讨论、决策、进度都公开可见。没有暗箱操作，没有办公室政治。每个人都能看到项目的全貌。' },
              { num: '04', title: '自愿加入', desc: '没有人被强迫做任何事。你选择感兴趣的项目，你选择适合自己的角色。随时可以退出，没有负担。' },
              { num: '05', title: '失败自由', desc: '项目失败了？没关系。你获得的协作经验、作品集素材、结识的伙伴——这些永远不会消失。' },
              { num: '06', title: '多元包容', desc: '不论你的背景、经验、年龄、地域。只要你愿意创造，你就是公社的一员。零经验也能参与。' },
            ].map(pr => (
              <div key={pr.num} className={`${styles.principle} reveal`}><div className={styles.pNum}>{pr.num}</div><h3>{pr.title}</h3><p>{pr.desc}</p></div>
            ))
          }
        </div>
      </section>

      <section className={styles.cta} id="cta">
        <h2>你的想法，值得被实现</h2>
        <p>不要让好想法烂在脑子里。发出来，找到你的队友，一起做点什么。</p>
        <button className={styles.btnWhite} onClick={() => navigate('/create')}>免费加入共创公社</button>
      </section>

      <footer className={styles.footer}><p>共创公社 · Where Ideas Find Their Team · <a href="#">GitHub</a> · <a href="#">Twitter</a> · <a href="#">Discord</a></p></footer>
      
      {/* 快速导航按钮 */}
      {showNavButtons && (
        <div className={styles.quickNavButtons}>
          <button className={`${styles.navBtn} ${styles.topBtn}`} onClick={scrollToTop} title="回到顶部">
            ↑
          </button>
          <button className={styles.navBtn} onClick={scrollToBottom} title="到底部">
            ↓
          </button>
        </div>
      )}
    </div>
  )
}