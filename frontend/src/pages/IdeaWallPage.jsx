import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import IdeaCard from '../components/idea-wall/IdeaCard'
import { getIdeas, createIdea, likeIdea, unlikeIdea } from '../api/idea'
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
  const [searchKeyword, setSearchKeyword] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const loadingRef = useRef(false)

  // 搜索/排序变化后重新加载（显式传参，避免闭包循环依赖）
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
      loadingRef.current = false
    }
  }, [showToast])

  // 初始加载
  useEffect(() => { fetchIdeas(0, searchKeyword, sortBy) }, [])

  // 滚动加载更多（节流）
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

  // page 变化时加载下一页（使用最新 keyword/sortBy）
  useEffect(() => { if (page > 0) fetchIdeas(page, searchKeyword, sortBy) }, [page])

  // 搜索处理：回车触发
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      doSearch()
    }
  }

  // 排序变化处理
  const handleSortChange = (e) => {
    const val = e.target.value
    setSortBy(val)
    setPage(0)
    setHasMore(true)
    fetchIdeas(0, searchKeyword, val)
  }

  // 统一执行搜索/刷新
  const doSearch = useCallback(() => {
    setPage(0)
    setHasMore(true)
    fetchIdeas(0, searchKeyword, sortBy)
  }, [searchKeyword, sortBy, fetchIdeas])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) { showToast('请输入想法内容', 'warning'); return }
    setSubmitting(true)
    try {
      await createIdea({
        content: content.trim(),
        authorName: isLoggedIn ? (currentUser?.name || '匿名用户') : '匿名用户'
      })
      setContent('')
      setShowCreateModal(false)
      setPage(0); setHasMore(true)
      fetchIdeas(0, searchKeyword, sortBy)
      showToast('发布成功！', 'success')
    } catch (err) {
      showToast('发布失败，请重试', 'error')
    } finally { setSubmitting(false) }
  }

  const handleLike = async (id) => {
    if (!isLoggedIn) { showToast('请先登录后再操作', 'warning'); return }
    try {
      await likeIdea(id)
      setIdeas(prev => prev.map(idea =>
        idea.id === id ? { ...idea, likeCount: (idea.likeCount || 0) + 1 } : idea
      ))
      setLikedIds(prev => new Set([...prev, id]))
    } catch (err) { showToast(err.response?.data?.message || '点赞失败', 'error') }
  }

  const handleUnlike = async (id) => {
    if (!isLoggedIn) return
    try {
      await unlikeIdea(id)
      setIdeas(prev => prev.map(idea =>
        idea.id === id ? { ...idea, likeCount: Math.max((idea.likeCount || 0) - 1, 0) } : idea
      ))
      setLikedIds(prev => { const next = new Set(prev); next.delete(id); return next })
    } catch (err) { showToast('取消点赞失败', 'error') }
  }

  const handleConvertToProject = (idea) => {
    navigate('/create', { state: { ideaContent: idea.content } })
  }

  return (
    <div className="page active">
      {/* Hero 区域 */}
      <section className={styles.hero}>
        <div className="hero-badge"><span className="dot"></span>想法 · 分享 · 交流</div>
        <h1>想法墙</h1>
        <p className="hero-sub">分享你的想法，发现有趣的灵魂</p>

        {/* 搜索 & 排序 */}
        <div className={styles.toolbar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="🔍 搜索想法..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="latest">最新发布</option>
            <option value="mostLikes">最多点赞</option>
            <option value="mostComments">最多评论</option>
          </select>
        </div>
      </section>

      {/* 想法列表 */}
      <section className={styles.ideasSection}>
        <div className={styles.ideasList}>
          {ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onLike={handleLike}
              onUnlike={handleUnlike}
              liked={likedIds.has(idea.id)}
              onConvertToProject={() => handleConvertToProject(idea)}
              isLoggedIn={isLoggedIn}
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

      {/* 悬浮发布按钮 */}
      <button className={styles.fab} onClick={() => setShowCreateModal(true)} title="发布新想法">
        ✏️
      </button>

      {/* 发布弹窗 */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>✨ 发布新想法</h3>
              <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <textarea
                className={styles.modalTextarea}
                placeholder="写下你的想法..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                autoFocus
              />
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
    </div>
  )
}
