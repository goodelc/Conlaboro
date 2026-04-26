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

  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [likedIds, setLikedIds] = useState(new Set())
  const loadingRef = useRef(false)

  const fetchIdeas = useCallback(async (pageNum) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const data = await getIdeas(pageNum + 1, 20)
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

  useEffect(() => {
    fetchIdeas(0)
  }, [fetchIdeas])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 200) {
        if (!loadingRef.current && hasMore && !loading) {
          setPage(prev => prev + 1)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading])

  useEffect(() => {
    if (page > 0) {
      fetchIdeas(page)
    }
  }, [page])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      showToast('请输入想法内容', 'warning')
      return
    }
    if (!authorName.trim()) {
      showToast('请输入作者昵称', 'warning')
      return
    }

    setSubmitting(true)
    try {
      await createIdea({ content: content.trim(), authorName: authorName.trim() })
      setContent('')
      setPage(0)
      setHasMore(true)
      fetchIdeas(0)
      showToast('发布成功！', 'success')
    } catch (err) {
      showToast('发布失败，请重试', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (id) => {
    try {
      await likeIdea(id)
      setIdeas(prev => prev.map(idea =>
        idea.id === id ? { ...idea, likeCount: (idea.likeCount || 0) + 1 } : idea
      ))
      setLikedIds(prev => new Set([...prev, id]))
    } catch (err) {
      showToast('点赞失败', 'error')
    }
  }

  const handleUnlike = async (id) => {
    try {
      await unlikeIdea(id)
      setIdeas(prev => prev.map(idea =>
        idea.id === id ? { ...idea, likeCount: Math.max((idea.likeCount || 0) - 1, 0) } : idea
      ))
      setLikedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (err) {
      showToast('取消点赞失败', 'error')
    }
  }

  return (
    <div className="page active" ref={pageRef}>
      <section className="hero">
        <h1>想法墙</h1>
        <p className="hero-sub">分享你的想法，发现有趣的灵魂</p>
      </section>

      <section className="idea-form-section reveal">
        <form className="idea-form" onSubmit={handleSubmit}>
          <h3>发布想法</h3>
          <textarea
            className="idea-textarea"
            placeholder="写下你的想法..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="idea-form-row">
            <input
              type="text"
              className="idea-author-input"
              placeholder="你的昵称"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '发布中...' : '发布'}
            </button>
          </div>
        </form>
      </section>

      <section className="ideas-section">
        <h2 className="section-title">最新想法</h2>
        <div className="ideas-list">
          {ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onLike={handleLike}
              onUnlike={handleUnlike}
              liked={likedIds.has(idea.id)}
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
    </div>
  )
}