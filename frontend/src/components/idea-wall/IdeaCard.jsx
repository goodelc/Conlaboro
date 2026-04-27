import { memo } from 'react'
import { useApp } from '../../context/AppContext'

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

export default memo(function IdeaCard({ idea, onLike, onUnlike, liked }) {
  const { isLoggedIn, showToast } = useApp()

  const handleLikeClick = (e) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      showToast('请先登录后再点赞', 'warning')
      return
    }
    if (liked) {
      onUnlike(idea.id)
    } else {
      onLike(idea.id)
    }
  }

  return (
    <div className="idea-card reveal">
      <p className="idea-content">{idea.content}</p>
      <div className="idea-footer">
        <div className="idea-meta">
          <span className="idea-author">{idea.authorName}</span>
          <span className="idea-time">{formatRelativeTime(idea.createdAt)}</span>
        </div>
        <button
          className={`idea-like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLikeClick}
          title={isLoggedIn ? (liked ? '取消点赞' : '点赞') : '登录后点赞'}
        >
          <span className="heart-icon">{liked ? '❤️' : '🤍'}</span>
          <span className="like-count">{idea.likeCount || 0}</span>
        </button>
      </div>
    </div>
  )
})