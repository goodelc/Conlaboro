import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import IdeaCard from '../components/idea-wall/IdeaCard'
import { getIdeas, createIdea, likeIdea, unlikeIdea } from '../api/idea'

export default function IdeaWallPage() {
  const navigate = useNavigate()
  const { isLoggedIn, showToast } = useApp()
  const pageRef = useScrollReveal()

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

  const fetchIdeas = useCallback(async (pageNum) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const data = await getIdeas(pageNum + 1, 20, searchKeyword, sortBy)
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
  }, [showToast, searchKeyword, sortBy])

  useEffect(() => { fetchIdeas(0) }, [fetchIdeas])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 200) {
        if (!loadingRef.current && hasMore && !loading) setPage(prev => prev + 1)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading])

  useEffect(() => { if (page > 0) fetchIdeas(page) }, [page])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) { showToast('请输入想法内容', 'warning'); return }
    setSubmitting(true)
    try {
      await createIdea({ content: content.trim(), authorName: isLoggedIn ? '已登录用户' : '匿名用户' })
      setContent('')
      setShowCreateModal(false)
      setPage(0); setHasMore(true)
      fetchIdeas(0)
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
    <div className="page active" ref={pageRef}>
      {/* Hero 区域 */}
      <section className="hero idea-hero">
        <div className="hero-badge"><span className="dot"></span>想法 · 分享 · 交流</div>
        <h1>想法墙</h1>
        <p className="hero-sub">分享你的想法，发现有趣的灵魂</p>

        {/* 搜索 & 排序 */}
        <div className="idea-toolbar reveal">
          <input
            type="text"
            className="idea-search-input"
            placeholder="搜索想法..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (() => { setPage(0); setHasMore(true); fetchIdeas(0); })()}
          />
          <select
            className="idea-sort-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(0); setHasMore(true); fetchIdeas(0); }}
          >
            <option value="latest">最新发布</option>
            <option value="mostLikes">最多点赞</option>
            <option value="mostComments">最多评论</option>
          </select>
        </div>
      </section>

      {/* 想法列表 */}
      <section className="ideas-section">
        <div className="ideas-list">
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
        {loading && <div className="loading-more">加载中...</div>}
        {!hasMore && ideas.length > 0 && <div className="no-more">没有更多了</div>}
        {ideas.length === 0 && !loading && (
          <div className="no-results" style={{ display: 'block' }}>
            <div className="nr-icon">💡</div>
            <h3>还没有想法</h3>
            <p>做第一个分享想法的人吧</p>
          </div>
        )}
      </section>

      <footer><p>共创公社 · Where Ideas Find Their Team · <a href="#">GitHub</a> · <a href="#">Twitter</a> · <a href="#">Discord</a></p></footer>

      {/* 悬浮发布按钮 */}
      <button className="fab-create" onClick={() => setShowCreateModal(true)} title="发布新想法">
        ✏️
      </button>

      {/* 发布弹窗 */}
      {showCreateModal && (
        <div className="idea-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="idea-modal" onClick={e => e.stopPropagation()}>
            <div className="idea-modal-header">
              <h3>✨ 发布新想法</h3>
              <button className="idea-modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <textarea
                className="idea-modal-textarea"
                placeholder="写下你的想法..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                autoFocus
              />
              <div className="idea-modal-actions">
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