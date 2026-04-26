import { useState } from 'react'
import { addComment } from '../../api'

function CollabSpace({ p, showToast }) {
  const [activeTab, setActiveTab] = useState('comments')
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const hasComments = p.comments && p.comments.length > 0
  const hasFiles = p.files && p.files.length > 0

  async function handleSubmit() {
    if (!commentText.trim()) {
      showToast('请输入评论内容', 'info')
      return
    }
    setSending(true)
    try {
      await addComment(p.id, commentText.trim())
      setCommentText('')
      showToast('评论已发送', 'success')
      // TODO: 刷新评论列表（可从详情页重新获取或乐观更新）
    } catch (err) {
      showToast(err.message || '发送失败', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="collab-tabs">
        <button className={`collab-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
          💬 讨论 {hasComments ? `(${p.comments.length})` : ''}
        </button>
        <button className={`collab-tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
          📂 文件 {hasFiles ? `(${p.files.length})` : ''}
        </button>
        <button className={`collab-tab ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>📋 项目日志</button>
      </div>

      <div className={`collab-panel ${activeTab === 'comments' ? 'active' : ''}`} id={`comments-${p.id}`}>
        {hasComments ? (
          <div className="comment-list">
            {p.comments.map((c, i) => (
              <div key={i} className="comment-item">
                <div className="cm-avatar" style={{ background: c.color }}>{c.user[0]}</div>
                <div className="cm-body">
                  <div className="cm-header"><span className="cm-name">{c.user}</span><span className="cm-time">{c.time}</span></div>
                  <div className="cm-text">{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        ) : <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>还没有讨论，来说点什么吧。</p>}
        <div className="comment-input-wrap">
          <div className="ci-avatar">你</div>
          <textarea className="comment-input" rows={2} placeholder="写下你的想法…" value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
          <button className="comment-submit" onClick={handleSubmit} disabled={sending}>
            {sending ? '发送中...' : '发送'}
          </button>
        </div>
      </div>

      <div className={`collab-panel ${activeTab === 'files' ? 'active' : ''}`} id={`files-${p.id}`}>
        {hasFiles ? (
          <div className="file-list">
            {p.files.map((f, i) => (
              <div key={i} className="file-item">
                <span className="fi-icon">{f.icon}</span>
                <div className="fi-info"><h4>{f.name}</h4><p>{f.uploader} · {f.time}</p></div>
                <span className="fi-arrow">↓</span>
              </div>
            ))}
          </div>
        ) : <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>还没有共享文件。</p>}
      </div>

      <div className={`collab-panel ${activeTab === 'log' ? 'active' : ''}`} id={`log-${p.id}`}>
        {p.activities ? (
          <div className="activity-feed">
            {p.activities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="act-avatar" style={{ background: a.color }}>{a.user[0]}</div>
                <div><strong>{a.user}</strong> {a.text}<span className="act-time">{a.time}</span></div>
              </div>
            ))}
          </div>
        ) : <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>暂无项目动态。</p>}
      </div>
    </>
  )
}

export default CollabSpace