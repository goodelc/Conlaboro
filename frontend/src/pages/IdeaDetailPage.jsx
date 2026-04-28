import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getIdeaById, likeIdea, unlikeIdea, getComments, createComment } from '../api/idea'
import styles from './IdeaDetailPage.module.css'

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
      <div className={styles.loadingCenter}>
        <div className={styles.spinner}>加载中...</div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className={styles.page}>
        <section className={styles.section}>
          <div className={styles.notFound}>
            <h2>想法不存在</h2>
            <p className={styles.notFoundText}>该想法可能已被删除</p>
            <button className={`btn-primary ${styles.notFoundBtn}`} onClick={() => navigate('/idea-wall')}>
              返回想法墙
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        {/* 返回导航 */}
        <div className={styles.nav}>
          <button className={styles.backBtn} onClick={() => navigate('/idea-wall')}>
            <span>←</span>
            <span>返回想法墙</span>
          </button>
          <time className={styles.time}>{formatRelativeTime(idea.createdAt)}</time>
        </div>

        {/* 想法主体 */}
        <article className={styles.card}>
          {/* 作者信息 */}
          <div className={styles.author}>
            <span className={styles.avatar}>{(idea.authorName || '匿').charAt(0)}</span>
            <div className={styles.authorInfo}>
              <span className={styles.name}>{idea.authorName || '匿名用户'}</span>
              <span className={styles.label}>想法发布者</span>
            </div>
          </div>

          {/* 想法内容 */}
          <div className={styles.content}>
            <p>{idea.content}</p>
          </div>

          {/* 互动栏 */}
          <div className={styles.actions}>
            <button
              className={`${styles.likeBtn} ${liked ? styles.likeBtnLiked : ''}`}
              onClick={liked ? handleUnlike : handleLike}
            >
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{liked ? '已点赞' : '点赞'}</span>
              <span className={styles.likeNum}>{idea.likeCount || 0}</span>
            </button>
            <div className={styles.stat}>
              <span>💬</span>
              <span>{idea.commentCount || 0} 条评论</span>
            </div>
          </div>
        </article>

        {/* 评论区 */}
        <aside className={styles.commentsSection}>
          <h3 className={styles.commentsTitle}>评论 ({comments.length})</h3>

          {comments.length === 0 && (
            <div className={styles.noCommentsHint}>
              <span className={styles.nchIcon}>💭</span>
              <p>还没有评论，来发表第一条吧~</p>
            </div>
          )}

          {comments.length > 0 && (
            <div className={styles.commentList}>
              {comments.map(comment => (
                <div key={comment.id} className={styles.commentItem}>
                  <span className={styles.ciAvatar}>{String(comment.authorName || '匿').charAt(0)}</span>
                  <div className={styles.ciBodyWrap}>
                    <div className={styles.ciHeader}>
                      <span className={styles.ciAuthor}>{comment.authorName || '匿名用户'}</span>
                      <time className={styles.ciTime}>{formatRelativeTime(comment.createdAt)}</time>
                    </div>
                    <p className={styles.ciBody}>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 评论输入 */}
          <form className={styles.form} onSubmit={handleCommentSubmit}>
            <textarea
              className={`${styles.input} ${!isLoggedIn ? styles.inputDisabled : ''}`}
              placeholder={isLoggedIn ? '写下你的评论...' : '登录后可发表评论'}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={3}
              disabled={!isLoggedIn}
            />
            <div className={styles.footer}>
              {!isLoggedIn && (
                <Link to="/login" className={styles.loginLink}>去登录 →</Link>
              )}
              <button
                type="submit"
                className={`btn-primary btn-small ${!isLoggedIn ? styles.btnDisabled : ''}`}
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
