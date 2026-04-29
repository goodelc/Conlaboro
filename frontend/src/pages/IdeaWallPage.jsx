import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import IdeaCard from '../components/idea-wall/IdeaCard'
import HatchPathSelector from '../components/idea-wall/HatchPathSelector'
import { getIdeas, createIdea, likeIdea, unlikeIdea, expressInterest, cancelInterest, getInterestedUsers } from '../api/idea'
import styles from './IdeaWallPage.module.css'

export default function IdeaWallPage() {
  const navigate = useNavigate()
  const { isLoggedIn, showToast, currentUser } = useApp()

  const [ideas, setIdeas] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  // 发布相关
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [likedIds, setLikedIds] = useState(new Set())
  const [interestedIds, setInterestedIds] = useState(new Set())
  const [interestedUsersMap, setInterestedUsersMap] = useState({})
  const [searchKeyword, setSearchKeyword] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const loadingRef = useRef(false)

  // 孵化路径选择弹窗
  const [hatchModal, setHatchModal] = useState(null)

  // 搜索/排序变化后重新加载
  const fetchIdeas = useCallback(async (pageNum, keyword, sort) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const data = await getIdeas(pageNum + 1, 20, keyword || '', sort || 'latest')
      const newIdeas = data.records || data.content || data.ideas || data || []
      setIdeas(prev => pageNum === 0 ? newIdeas : [...prev, ...newIdeas])
      const totalPages = data.pages || data.totalPages || 1
      setHasMore(pageNum < totalPages - 1)
    } catch (err) {
      showToast('获取想法列表失败', 'error')
    } finally {
      setLoading(false)
      loadingRef.current = false }
  }, [showToast])

  // 初始加载
  useEffect(() => { fetchIdeas(0, searchKeyword, sortBy) }, [])

  // 滚动加载更多
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 200) {
            if (!loadingRef.current && hasMore && !loading) setPage(prev => prev + 1)
          }
          ticking = false
        })
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading])

  useEffect(() => { if (page > 0) fetchIdeas(page, searchKeyword, sortBy) }, [page])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); doSearch() }
  }

  const handleSortChange = (e) => {
    const val = e.target.value; setSortBy(val); setPage(0); setHasMore(true); fetchIdeas(0, searchKeyword, val)
  }

  const doSearch = useCallback(() => {
    setPage(0); setHasMore(true); fetchIdeas(0, searchKeyword, sortBy)
  }, [searchKeyword, sortBy, fetchIdeas])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) { showToast('请输入想法内容', 'warning'); return }
    setSubmitting(true)
    try {
      await createIdea({ content: content.trim(), authorName: isLoggedIn ? (currentUser?.name || '匿名用户') : '匿名用户' })
      setContent(''); setShowCreateModal(false); setPage(0); setHasMore(true); fetchIdeas(0, searchKeyword, sortBy); showToast('发布成功！', 'success')
    } catch (err) { showToast('发布失败，请重试', 'error') }
    finally { setSubmitting(false) }
  }

  const handleLike = async (id) => {
    if (!isLoggedIn) { showToast('请先登录后再操作', 'warning'); return }
    try {
      await likeIdea(id)
      setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, likeCount: (idea.likeCount || 0) + 1 } : idea))
      setLikedIds(prev => new Set([...prev, id]))
    } catch (err) { showToast(err.response?.data?.message || '点赞失败', 'error') }
  }

  const handleUnlike = async (id) => {
    if (!isLoggedIn) return
    try {
      await unlikeIdea(id)
      setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, likeCount: Math.max((idea.likeCount || 0) - 1, 0) } : idea))
      setLikedIds(prev => { const next = new Set(prev); next.delete(id); return next })
    } catch (err) { showToast('取消点赞失败', 'error') }
  }

  // 孵化按钮点击 → 打开路径选择弹窗
  const handleHatchClick = (idea) => {
    setHatchModal({ ideaId: idea.id, ideaContent: idea.content })
  }

  // 路径选择后→跳转 /create
  const handlePathSelect = ({ mode, ideaContent }) => {
    setHatchModal(null)
    navigate('/create', {
      state: { ideaContent, ideaId: hatchModal.ideaId, mode }
    })
  }

  // 参与意愿切换
  const handleExpressInterest = async (ideaId, isInterested) => {
    // 乐观更新状态
    if (isInterested) {
      setInterestedIds(prev => new Set([...prev, ideaId]))
      setIdeas(prev => prev.map(idea =>
        idea.id === ideaId ? { ...idea, interestCount: (idea.interestCount || 0) + 1 } : idea
      ))
      // 加载头像
      try {
        const res = await getInterestedUsers(ideaId, 5)
        setInterestedUsersMap(prev => ({ ...prev, [ideaId]: res.data || [] }))
      } catch (_) { /* ignore */ }
    } else {
      setInterestedIds(prev => { const next = new Set(prev); next.delete(ideaId); return next })
      setIdeas(prev => prev.map(idea =>
        idea.id === ideaId ? { ...idea, interestCount: Math.max((idea.interestCount || 0) - 1, 0) } : idea
      ))
    }
  }

  return (
    <div className="page active">
      {/* Hero */}
      <section className={styles.hero}>
        <div className="hero-badge"><span className="dot"></span>想法 · 分享 ·交流</div>
        <h1>想法墙</h1>
        <p className="hero-sub">分享你的想法，发现有趣的灵魂</p>

        <div className={styles.toolbar}>
          <input type="text" className={styles.searchInput} placeholder="🔍 搜索想法..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={handleSearchKeyDown} />
          <select className={styles.sortSelect} value={sortBy} onChange={handleSortChange}>
            <option value="latest">最新发布</option>
            <option value="mostLikes">最多点赞</option>
            <option value="mostComments">最多评论</option>
          </select>
        </div>
      </section>

      {/* Ideas List */}
      <section className={styles.ideasSection}>
        <div className={styles.ideasList}>
          {ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onLike={handleLike}
              onUnlike={handleUnlike}
              liked={likedIds.has(idea.id)}
              onConvertToProject={() => handleHatchClick(idea)}
              isLoggedIn={isLoggedIn}
              onExpressInterest={handleExpressInterest}
              interested={interestedIds.has(idea.id)}
              interestedUsers={interestedUsersMap[idea.id]}
            />
          ))}
        </div>
        {loading && <div className={styles.loadingMore}>加载中...</div>}
        {!hasMore && ideas.length > 0 && <div className={styles.noMore}>没有更多了</div>}
        {ideas.length === 0 && !loading && (
          <div className={styles.noMore} style={{ display: 'block' }}>
            <div className="nr-icon">💡</div>
            <h3>还没有想法</h3>
            <p>做第一个分享想法的人吧</p>
          </div>
        )}
      </section>

      <footer><p>共创公社 · Where Ideas Find Their Team · <a href="#">GitHub</a> · <a href="#">Twitter</a> · <a href="#">Discord</a></p></footer>

      {/* FAB */}
      <button className={styles.fab} onClick={() => setShowCreateModal(true)} title="发布新想法">
        ✏️
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>✨ 发布新想法</h3>
              <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <textarea className={styles.modalTextarea} placeholder="写下你的想法..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} autoFocus />
              <div className={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>取消</button>
                <button type="submit" className="btn-primary" disabled={submitting || !content.trim()}>
                  {submitting ? '发布中...' : '发布'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hatch Path Selector Modal */}
      {hatchModal && (
        <HatchPathSelector
          ideaContent={hatchModal.ideaContent}
          onSelect={handlePathSelect}
          onClose={() => setHatchModal(null)}
        />
      )}
    </div>
  )
}
