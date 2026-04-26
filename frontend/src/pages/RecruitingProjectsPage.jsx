import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import ProjectCard from '../components/ProjectCard'

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
    { key: 'all', label: '全部' },
    { key: 'app', label: '📱 移动应用' },
    { key: 'web', label: '🌐 Web 应用' },
    { key: 'game', label: '🎮 游戏' },
    { key: 'ai', label: '🤖 AI' },
    { key: 'tool', label: '🔧 工具' },
  ]

  let filtered = projects || []
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

  // 排序
  if (sortBy === 'latest') {
    filtered.sort((a, b) => {
      const dateA = new Date((a.project || a).createdAt || 0)
      const dateB = new Date((b.project || b).createdAt || 0)
      return dateB - dateA
    })
  } else if (sortBy === 'roles') {
    filtered.sort((a, b) => {
      const rolesA = (a.roles || []).filter(r => r.status === 'open').length
      const rolesB = (b.roles || []).filter(r => r.status === 'open').length
      return rolesB - rolesA
    })
  }

  return (
    <div className="page active" ref={pageRef}>
      <div className="recruiting-page">
        <div className="recruiting-header">
          <div className="recruiting-breadcrumb">
            <span onClick={() => navigate('/')}>首页</span>
            <span className="breadcrumb-separator">/</span>
            <span>招募项目</span>
          </div>
          <h1>正在招募队友的项目</h1>
          <p className="recruiting-sub">找到适合你的项目，加入志同道合的团队</p>
        </div>

        <div className="recruiting-content">
          <div className="search-bar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                className="search-input" 
                placeholder="搜索项目名称、描述、角色…" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="search-filters">
              {categories.map(c => (
                <button 
                  key={c.key} 
                  className={`search-filter-chip ${categoryFilter === c.key ? 'active' : ''}`} 
                  onClick={() => setCategoryFilter(c.key)}
                >
                  {c.label}
                </button>
              ))}
              <span className="search-filter-divider">|</span>
              {[
                {key:'all',label:'全部'},
                {key:'open',label:'招募中'},
                {key:'progress',label:'进行中'},
                {key:'done',label:'已完成'}
              ].map(s => (
                <button 
                  key={s.key} 
                  className={`search-filter-chip ${statusFilter === s.key ? 'active' : ''}`} 
                  onClick={() => setStatusFilter(s.key)}
                >
                  {s.label}
                </button>
              ))}
              <span className="search-filter-divider">|</span>
              {[
                {key:'latest',label:'最新发布'},
                {key:'roles',label:'角色数量'}
              ].map(s => (
                <button 
                  key={s.key} 
                  className={`search-filter-chip ${sortBy === s.key ? 'active' : ''}`} 
                  onClick={() => setSortBy(s.key)}
                >
                  {s.label}
                </button>
              ))}
              <span className="search-results-info">
                {filtered.length > 0 ? `找到 ${filtered.length} 个项目` : ''}
              </span>
            </div>
          </div>

          <div className="recruiting-stats">
            <div className="stat-item">
              <span className="stat-number">{filtered.length}</span>
              <span className="stat-label">个项目</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{filtered.reduce((total, item) => total + ((item.roles || []).filter(r => r.status === 'open').length), 0)}</span>
              <span className="stat-label">个开放角色</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">{new Set(filtered.map(item => (item.project || item).category)).size}</span>
              <span className="stat-label">个分类</span>
            </div>
          </div>

          <div className="projects-grid" id="projects-grid">
            {filtered.length > 0 ? 
              filtered.map(item => <ProjectCard key={(item.project || item).id} p={item} />) : 
              (
                <div className="no-results" style={{ display: 'block' }}>
                  <div className="nr-icon">🔍</div>
                  <h3>没有找到匹配的项目</h3>
                  <p>试试其他关键词或筛选条件</p>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}