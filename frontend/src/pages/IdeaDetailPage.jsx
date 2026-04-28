import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getIdeaById, likeIdea, unlikeIdea, getComments, createComment } from '../api/idea'

function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

export default function IdeaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, showToast } = useApp()

  const [idea, setIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 加载想法详情
  const loadIdea = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getIdeaById(id)
      setIdea(data)
      setLiked(false)
    } catch (err) {
      showToast('加载失败', 'error')
      setIdea(null)
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  // 加载评论
  const loadComments = useCallback(async () => {
    try {
      const res = await getComments(id)
      setComments(res.data || [])
    } catch (err) {
      // 静默失败
    }
  }, [id])

  useEffect(() => { loadIdea() }, [loadIdea])
  useEffect(() => { if (!loading) loadComments() }, [loading, loadComments])

  // 点赞
  const handleLike = async () => {
    if (!isLoggedIn) { showToast('请先登录后再点赞', 'warning'); return }
    try {
      await likeIdea(id)
      setLiked(true)
      setIdea(prev => prev ? { ...prev, likeCount: (prev.likeCount || 0) + 1 } : prev)
    } catch (err) {
      showToast(err.response?.data?.message || '点赞失败', 'error')
    }
  }

  // 取消点赞
  const handleUnlike = async () => {
    try {
      await unlikeIdea(id)
      setLiked(false)
      setIdea(prev => prev ? { ...prev, likeCount: Math.max((prev.likeCount || 0) - 1, 0) } : prev)
    } catch (err) {
      showToast('取消点赞失败', 'error')
    }
  }

  // 提交评论
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { showToast('请先登录后再评论', 'warning'); return }
    if (!commentContent.trim()) return
    setSubmitting(true)
    try {
      await createComment(id, { content: commentContent.trim() })
      setCommentContent('')
      await loadComments()
      setIdea(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev)
      showToast('评论成功！', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || '评论失败，请重试', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="idea-detail-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner">加载中...</div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="idea-detail-page">
        <section className="idea-detail-section">
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <h2>想法不存在</h2>
            <p style={{ color: 'var(--warm-gray)', marginTop: '1rem' }}>该想法可能已被删除</p>
            <button className="btn-primary" onClick={() => navigate('/idea-wall')} style={{ marginTop: '1.5rem' }}>
              返回想法墙
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="idea-detail-page">
      <section className="idea-detail-section">
        {/* 返回导航 */}
        <div className="idea-detail-nav">
          <button className="idea-back-btn" onClick={() => navigate('/idea-wall')}>
            <span>←</span>
            <span>返回想法墙</span>
          </button>
          <time className="idea-detail-time">{formatRelativeTime(idea.createdAt)}</time>
        </div>

        {/* 想法主体 */}
        <article className="idea-detail-card">
          {/* 作者信息 */}
          <div className="idea-detail-author">
            <span className="author-avatar">{(idea.authorName || '匿').charAt(0)}</span>
            <div className="idea-detail-author-info">
              <span className="author-name">{idea.authorName || '匿名用户'}</span>
              <span className="author-label">想法发布者</span>
            </div>
          </div>

          {/* 想法内容 */}
          <div className="idea-detail-content">
            <p>{idea.content}</p>
          </div>

          {/* 互动栏 */}
          <div className="idea-detail-actions">
            <button
              className={`detail-like-btn ${liked ? 'liked' : ''}`}
              onClick={liked ? handleUnlike : handleLike}
            >
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{liked ? '已点赞' : '点赞'}</span>
              <span className="like-num">{idea.likeCount || 0}</span>
            </button>
            <div className="detail-stat">
              <span>💬</span>
              <span>{idea.commentCount || 0} 条评论</span>
            </div>
          </div>
        </article>

        {/* 评论区 */}
        <aside className="idea-comments-section">
          <h3 className="comments-title">评论 ({comments.length})</h3>

          {comments.length === 0 && (
            <div className="no-comments-hint">
              <span className="nch-icon">💭</span>
              <p>还没有评论，来发表第一条吧~</p>
            </div>
          )}

          {comments.length > 0 && (
            <div className="detail-comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="detail-comment-item">
                  <span className="dci-avatar">{String(comment.authorName || '匿').charAt(0)}</span>
                  <div className="dci-body-wrap">
                    <div className="dci-header">
                      <span className="dci-author">{comment.authorName || '匿名用户'}</span>
                      <time className="dci-time">{formatRelativeTime(comment.createdAt)}</time>
                    </div>
                    <p className="dci-body">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 评论输入 */}
          <form className="detail-comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              className="detail-comment-input"
              placeholder={isLoggedIn ? '写下你的评论...' : '登录后可发表评论'}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={3}
              disabled={!isLoggedIn}
            />
            <div className="dcf-footer">
              {!isLoggedIn && (
                <Link to="/login" className="login-prompt-link">去登录 →</Link>
              )}
              <button
                type="submit"
                className={`btn-primary btn-small ${!isLoggedIn ? 'btn-disabled' : ''}`}
                disabled={submitting || !isLoggedIn}
              >
                {submitting ? '发布中...' : '发布评论'}
              </button>
            </div>
          </form>
        </aside>
      </section>
    </div>
  )
}
