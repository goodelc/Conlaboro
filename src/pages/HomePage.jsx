import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ProjectCard from '../components/ProjectCard'

export default function HomePage() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const { projects } = useData()
  const pageRef = useScrollReveal()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const categories = [
    { key: 'all', label: '全部' },
    { key: 'app', label: '📱 移动应用' },
    { key: 'web', label: '🌐 Web 应用' },
    { key: 'game', label: '🎮 游戏' },
    { key: 'ai', label: '🤖 AI' },
    { key: 'tool', label: '🔧 工具' },
  ]

  let filtered = projects
  if (categoryFilter !== 'all') filtered = filtered.filter(p => p.category === categoryFilter)
  if (statusFilter !== 'all') filtered = filtered.filter(p => p.status === statusFilter)
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) ||
      p.roles.some(r => r.name.toLowerCase().includes(q))
    )
  }

  return (
    <div className="page active" ref={pageRef}>
      <section className="hero">
        <div className="hero-badge"><span className="dot"></span>开放 · 共享 · 协作</div>
        <h1>每个人都有<br /><span className="highlight">创造力</span></h1>
        <p className="hero-sub">你有一个想法，这里有和你一样的人。<br />不需要公司，不需要投资，不需要简历。<br />一起把想法变成真实的产品。</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>浏览项目</button>
          <button className="btn-secondary" onClick={() => navigate('/create')}>发起你的想法</button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="num">1,247</div><div className="label">创客</div></div>
          <div className="hero-stat"><div className="num">386</div><div className="label">项目</div></div>
          <div className="hero-stat"><div className="num">89</div><div className="label">已完成</div></div>
        </div>
      </section>

      <section className="manifesto reveal">
        <div className="manifesto-inner">
          <div className="manifesto-label">我们的信念</div>
          <div className="manifesto-quote">"各尽所能，<span className="em">按需协作</span>。<br />每个人的创造力都值得被看见。"</div>
          <div className="manifesto-divider"></div>
          <p className="manifesto-text">我们相信，好的想法不应该因为"没有团队"而死掉。<br />我们相信，有能力的人不应该因为"没有经验"而被拒绝。<br />我们相信，当一群陌生人为了同一个目标聚在一起，奇迹就会发生。</p>
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-header reveal"><span className="label">How it works</span><h2>四个步骤，从想法到产品</h2></div>
        <div className="how-grid">
          {[
            { num: '01', icon: '💡', title: '发布想法', desc: '写下你想做什么，越具体越好。描述问题、用户、愿景。不需要完美，只需要真实。' },
            { num: '02', icon: '🤝', title: '组建团队', desc: '产品、设计、开发、测试……每个角色都有人来认领。志同道合的人自动匹配。' },
            { num: '03', icon: '🔨', title: '协作共建', desc: '按里程碑推进，每个阶段有明确交付物。透明协作，贡献实时可见。' },
            { num: '04', icon: '🚀', title: '共享成果', desc: '产品上线，所有参与者获得贡献记录。这就是你的作品集，这就是你的经验。' },
          ].map(s => (
            <div key={s.num} className="how-step reveal">
              <div className="step-num">{s.num}</div><div className="step-icon">{s.icon}</div><h3>{s.title}</h3><p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="projects" id="projects">
        <div className="section-header reveal"><span className="label">Explore Projects</span><h2>正在招募队友的项目</h2></div>
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" className="search-input" placeholder="搜索项目名称、描述、角色…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="search-filters">
            {categories.map(c => (
              <button key={c.key} className={`search-filter-chip ${categoryFilter === c.key ? 'active' : ''}`} onClick={() => setCategoryFilter(c.key)}>{c.label}</button>
            ))}
            <span className="search-filter-divider">|</span>
            {[{key:'all',label:'全部'},{key:'open',label:'招募中'},{key:'progress',label:'进行中'},{key:'done',label:'已完成'}].map(s => (
              <button key={s.key} className={`search-filter-chip ${statusFilter === s.key ? 'active' : ''}`} onClick={() => setStatusFilter(s.key)}>{s.label}</button>
            ))}
            <span className="search-results-info">{filtered.length > 0 && (searchQuery || statusFilter !== 'all') ? `找到 ${filtered.length} 个项目` : ''}</span>
          </div>
        </div>
        <div className="projects-grid" id="projects-grid">
          {filtered.length > 0 ? filtered.map(p => <ProjectCard key={p.id} p={p} />) : null}
        </div>
        {filtered.length === 0 && (
          <div className="no-results" style={{ display: 'block' }}>
            <div className="nr-icon">🔍</div><h3>没有找到匹配的项目</h3><p>试试其他关键词或筛选条件</p>
          </div>
        )}
      </section>

      <section className="roles-section" id="roles">
        <div className="section-header reveal"><span className="label">Find Your Role</span><h2>找到你的位置</h2></div>
        <div className="roles-grid">
          {[
            { emoji: '🎯', name: '产品经理', count: 128 },
            { emoji: '🎨', name: '设计师', count: 96 },
            { emoji: '💻', name: '开发者', count: 234 },
            { emoji: '🧪', name: '测试工程师', count: 67 },
            { emoji: '📣', name: '运营 / 增长', count: 89 },
          ].map(r => (
            <div key={r.name} className="role-card reveal"><span className="role-emoji">{r.emoji}</span><h3>{r.name}</h3><p className="role-count"><span>{r.count}</span> 人在线</p></div>
          ))}
        </div>
      </section>

      <section className="principles" id="principles">
        <div className="section-header reveal"><span className="label">Our Principles</span><h2>公社原则</h2></div>
        <div className="principles-grid">
          {[
            { num: '01', title: '贡献即权力', desc: '不靠头衔说话，靠贡献说话。谁做的事情多，谁就有更大的话语权。代码、文档、设计——一切贡献都被记录。' },
            { num: '02', title: '成果共享', desc: '项目成果属于所有参与者。默认采用开源协议，任何人都可以使用、改进、再创造。知识不应该被垄断。' },
            { num: '03', title: '透明协作', desc: '所有讨论、决策、进度都公开可见。没有暗箱操作，没有办公室政治。每个人都能看到项目的全貌。' },
            { num: '04', title: '自愿加入', desc: '没有人被强迫做任何事。你选择感兴趣的项目，你选择适合自己的角色。随时可以退出，没有负担。' },
            { num: '05', title: '失败自由', desc: '项目失败了？没关系。你获得的协作经验、作品集素材、结识的伙伴——这些永远不会消失。' },
            { num: '06', title: '多元包容', desc: '不论你的背景、经验、年龄、地域。只要你愿意创造，你就是公社的一员。零经验也能参与。' },
          ].map(pr => (
            <div key={pr.num} className="principle reveal"><div className="p-num">{pr.num}</div><h3>{pr.title}</h3><p>{pr.desc}</p></div>
          ))}
        </div>
      </section>

      <section className="cta" id="cta">
        <h2>你的想法，值得被实现</h2>
        <p>不要让好想法烂在脑子里。发出来，找到你的队友，一起做点什么。</p>
        <button className="btn-white" onClick={() => navigate('/create')}>免费加入共创公社</button>
      </section>

      <footer><p>共创公社 · Where Ideas Find Their Team · <a href="#">GitHub</a> · <a href="#">Twitter</a> · <a href="#">Discord</a></p></footer>
    </div>
  )
}
