import { memo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getComments, createComment } from '../../api/idea'
import styles from './IdeaCard.module.css'

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

export default memo(function IdeaCard({ idea, onLike, onUnlike, liked, onConvertToProject, isLoggedIn: propIsLoggedIn }) {
  const navigate = useNavigate()
  const { isLoggedIn: ctxIsLoggedIn, showToast } = useApp()
  const isLoggedIn = propIsLoggedIn ?? ctxIsLoggedIn

  const [comments, setComments] = useState([])
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (showComments) fetchComments()
  }, [showComments, idea.id])

  const fetchComments = async () => {
    try {
      const response = await getComments(idea.id)
      setComments(response.data || [])
    } catch (err) { showToast('获取评论失败', 'error') }
  }

  // 点击卡片 → 跳转到详情页
  const handleCardClick = (e) => {
    // 排除按钮和交互区域的点击
    if (e.target.closest('.idea-footer') || e.target.closest('.idea-convert-btn') || e.target.closest('.idea-comments')) return
    navigate(`/idea/${idea.id}`)
  }

  const handleLikeClick = (e) => {
    e.stopPropagation()
    if (!isLoggedIn) { showToast('请先登录后再点赞', 'warning'); return }
    if (liked) onUnlike(idea.id)
    else onLike(idea.id)
  }

  const handleCommentClick = (e) => {
    e.stopPropagation()
    // 点击评论按钮 → 跳转到详情页
    navigate(`/idea/${idea.id}`)
  }

  const handleCommentSubmit = async (e) => {
    e.stopPropagation()
    if (!isLoggedIn) { showToast('请先登录后再评论', 'warning'); return }
    if (!commentContent.trim()) { showToast('请输入评论内容', 'warning'); return }
    setSubmitting(true)
    try {
      await createComment(idea.id, { content: commentContent.trim() })
      setCommentContent('')
      await fetchComments()
      showToast('评论成功！', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || '评论失败，请重试', 'error')
    } finally { setSubmitting(false) }
  }

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <p className={styles.content}>{idea.content}</p>
      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.author}>{idea.authorName}</span>
          <span className={styles.time}>{formatRelativeTime(idea.createdAt)}</span>
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${liked ? styles.liked : ''}`}
            onClick={handleLikeClick}
            title={isLoggedIn ? (liked ? '取消点赞' : '点赞') : '登录后点赞'}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{idea.likeCount || 0}</span>
          </button>
          <button
            className={styles.actionBtn}
            onClick={handleCommentClick}
            title="查看详情和评论"
          >
            <span>💬</span>
            <span>{idea.commentCount || 0}</span>
          </button>
        </div>
      </div>

      {/* 转为项目按钮 */}
      {onConvertToProject && (
        <button className={styles.convertBtn} onClick={(e) => { e.stopPropagation(); onConvertToProject(); }} title="将此想法发起为项目">
          ✦ 发起项目
        </button>
      )}
    </div>
  )
})