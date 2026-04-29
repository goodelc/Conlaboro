import { memo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getComments, createComment, expressInterest, cancelInterest } from '../../api/idea'
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

export default memo(function IdeaCard({ idea, onLike, onUnlike, liked, onConvertToProject, isLoggedIn: propIsLoggedIn, onExpressInterest, interested, interestedUsers }) {
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

  const handleCardClick = (e) => {
    if (e.target.closest(`.${styles.footer}`) || e.target.closest(`.${styles.convertBtn}`) || e.target.closest(`.${styles.comments}`)) return
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

  const handleInterestClick = async (e) => {
    e.stopPropagation()
    if (!isLoggedIn) { showToast('请先登录后再操作', 'warning'); return }
    try {
      if (interested) {
        await cancelInterest(idea.id)
        onExpressInterest(idea.id, false)
        showToast('已取消参与意愿', 'info')
      } else {
        await expressInterest(idea.id)
        onExpressInterest(idea.id, true)
        showToast('已记录你的参与意愿 🥚', 'success')
      }
    } catch (err) {
      showToast(err.response?.data?.message || '操作失败，请重试', 'error')
    }
  }

  // 头像堆叠展示（最多5个）
  const displayUsers = (interestedUsers || []).slice(0, 5)
  const extraCount = (idea.interestCount || 0) - displayUsers.length
  const hasInterests = idea.interestCount && idea.interestCount > 0

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* 内容区 */}
      <p className={styles.content}>{idea.content}</p>

      {/* 参与意愿展示区 */}
      {hasInterests && (
        <div className={styles.interestBar}>
          <div className={styles.avatarStack}>
            {displayUsers.map((user, idx) => (
              <span
                key={user.userId || idx}
                className={styles.avatar}
                style={{ 
                  zIndex: displayUsers.length - idx,
                  left: idx * 22,
                  backgroundColor: user.color || '#D4A843',
                  transform: `translateX(${idx * -4}px)`
                }}
                title={user.name}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} />
                ) : (
                  (user.name || '?')[0]
                )}
              </span>
            ))}
            {extraCount > 0 && (
              <span className={styles.moreBadge} style={{ left: displayUsers.length * 18 }}>
                +{extraCount}
              </span>
            )}
          </div>
          <span className={styles.interestText}>
            <strong>{idea.interestCount}</strong>人想参与
          </span>
        </div>
      )}

      {/* Footer操作栏 */}
      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.author}>{idea.authorName}</span>
          <span className={styles.time}>{formatRelativeTime(idea.createdAt)}</span>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${liked ? styles.liked : ''}`} onClick={handleLikeClick} title={isLoggedIn ? (liked ? '取消点赞' : '点赞') : '登录后点赞'}>
            <span>{liked ? '❤️' : '🥝'}</span>
            <span>{idea.likeCount || 0}</span>
          </button>
          <button className={`${styles.actionBtn} ${styles.commentBtn}`} onClick={handleCommentClick} title="查看评论">
            <span>💬</span>
            <span>{idea.commentCount || 0}</span>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.interestBtn} ${interested ? styles.interestedActive : ''}`}
            onClick={handleInterestClick}
            title={interested ? '取消参与' : '我想参与'}
          >
            <span>🤝</span>
            <span>{interested ? '已参与' : '参与'}</span>
          </button>
        </div>
      </div>

      {/* 孵化成项目按钮 */}
      {onConvertToProject && (
        <button className={styles.convertBtn} onClick={(e) => { e.stopPropagation(); onConvertToProject(); }} title="将此想法孵化为项目">
          <span className={styles.hatchIcon}>🥚</span>
          孵化成项目
        </button>
      )}
    </div>
  )
})
