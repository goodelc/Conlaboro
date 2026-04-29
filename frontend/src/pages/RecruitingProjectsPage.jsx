import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ProjectCard from '../components/ProjectCard'
import styles from './RecruitingProjectsPage.module.css'

export default function RecruitingProjectsPage() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const { projects } = useData()
  const pageRef = useScrollReveal()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')

  const categories = [
    { key: 'all', label: '全部' }, { key: 'app', label: '📱 移动应用' }, { key: 'web', label: '🌐 Web 应用' },
    { key: 'game', label: '🎮 游戏' }, { key: 'ai', label: '🤖 AI' }, { key: 'tool', label: '🔧 工具' },
  ]

  let filtered = projects || []
  if (categoryFilter !== 'all') filtered = filtered.filter(item => (item.project || item).category === categoryFilter)
  if (statusFilter !== 'all') filtered = filtered.filter(item => (item.project || item).status === statusFilter)
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase()
    filtered = filtered.filter(item => {
      const p = item.project || item; const roles = item.roles || []
      return p.title.toLowerCase().includes(q) || (p.description || p.desc || '').toLowerCase().includes(q) || roles.some(r => r.name.toLowerCase().includes(q))
    })
  }

  if (sortBy === 'latest') filtered.sort((a, b) => new Date((b.project || b).createdAt || 0) - new Date((a.project || a).createdAt || 0))
  else if (sortBy === 'roles') filtered.sort((a, b) => (b.roles || []).filter(r => r.status === 'open').length - (a.roles || []).filter(r => r.status === 'open').length)

  return (
    <div className="page active" ref={pageRef}>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.breadcrumb}>
            <span onClick={() => navigate('/')} className={styles.breadcrumbLink}>首页</span>
            <span className={styles.breadcrumbSep}>/</span>
            <span>招募项目</span>
          </div>
          <h1>正在招募队友的项目</h1>
          <p className={styles.subTitle}>找到适合你的项目，加入志同道合的团队</p>
        </div>

        <div className={styles.content}>
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input type="text" className={styles.searchInput} placeholder="搜索项目名称、描述、角色…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className={styles.filters}>
              {categories.map(c => (
                <button key={c.key} className={`${styles.filterChip} ${categoryFilter === c.key ? styles.filterChipActive : ''}`} onClick={() => setCategoryFilter(c.key)}>{c.label}</button>
              ))}
              <span className={styles.filterDivider}>|</span>
              {[{key:'all',label:'全部'}, {key:'open',label:'招募中'}, {key:'progress',label:'进行中'}, {key:'done',label:'已完成'}].map(s => (
                <button key={s.key} className={`${styles.filterChip} ${statusFilter === s.key ? styles.filterChipActive : ''}`} onClick={() => setStatusFilter(s.key)}>{s.label}</button>
              ))}
              <span className={styles.filterDivider}>|</span>
              {[{key:'latest',label:'最新发布'}, {key:'roles',label:'角色数量'}].map(s => (
                <button key={s.key} className={`${styles.filterChip} ${sortBy === s.key ? styles.filterChipActive : ''}`} onClick={() => setSortBy(s.key)}>{s.label}</button>
              ))}
              <span className={styles.resultsInfo}>{filtered.length > 0 ? `找到 ${filtered.length} 个项目` : ''}</span>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}><span className={styles.statNum}>{filtered.length}</span><span className={styles.statLabel}>个项目</span></div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}><span className={styles.statNum}>{filtered.reduce((total, item) => total + ((item.roles || []).filter(r => r.status === 'open').length), 0)}</span><span className={styles.statLabel}>个开放角色</span></div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}><span className={styles.statNum}>{new Set(filtered.map(item => (item.project || item).category)).size}</span><span className={styles.statLabel}>个分类</span></div>
          </div>

          <div className="projects-grid" id="projects-grid">
            {filtered.length > 0 ?
              filtered.map(item => <ProjectCard key={(item.project || item).id} p={item} />) :
              (<div className={styles.noResults} style={{ display: 'block' }}><div className={styles.nrIcon}>🔍</div><h3>没有找到匹配的项目</h3><p>试试其他关键词或筛选条件</p></div>)
            }
          </div>
        </div>
      </div>
    </div>
  )
}
