import { useState } from 'react'
import { addComment } from '../../api'
import styles from './CollabSpace.module.css'

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
      <div className={styles.collabTabs}>
        <button className={`${styles.collabTab} ${activeTab === 'comments' ? styles.collabTabActive : ''}`} onClick={() => setActiveTab('comments')}>
          💬 讨论 {hasComments ? `(${p.comments.length})` : ''}
        </button>
        <button className={`${styles.collabTab} ${activeTab === 'files' ? styles.collabTabActive : ''}`} onClick={() => setActiveTab('files')}>
          📂 文件 {hasFiles ? `(${p.files.length})` : ''}
        </button>
        <button className={`${styles.collabTab} ${activeTab === 'log' ? styles.collabTabActive : ''}`} onClick={() => setActiveTab('log')}>📋 项目日志</button>
      </div>

      <div className={`${styles.collabPanel} ${activeTab === 'comments' ? styles.collabPanelActive : ''}`} id={`comments-${p.id}`}>
        {hasComments ? (
          <div className={styles.commentList}>
            {p.comments.map((c, i) => (
              <div key={i} className={styles.commentItem}>
                <div className={styles.cmAvatar} style={{ background: c.color }}>{c.user[0]}</div>
                <div className={styles.cmBody}>
                  <div className={styles.cmHeader}><span className={styles.cmName}>{c.user}</span><span className={styles.cmTime}>{c.time}</span></div>
                  <div className={styles.cmText}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        ) : <p className={styles.emptyText}>还没有讨论，来说点什么吧。</p>}
        <div className={styles.commentInputWrap}>
          <div className={styles.ciAvatar}>你</div>
          <textarea className={styles.commentInput} rows={2} placeholder="写下你的想法…" value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
          <button className={styles.commentSubmit} onClick={handleSubmit} disabled={sending}>
            {sending ? '发送中...' : '发送'}
          </button>
        </div>
      </div>

      <div className={`${styles.collabPanel} ${activeTab === 'files' ? styles.collabPanelActive : ''}`} id={`files-${p.id}`}>
        {hasFiles ? (
          <div className={styles.fileList}>
            {p.files.map((f, i) => (
              <div key={i} className={styles.fileItem}>
                <span className={styles.fiIcon}>{f.icon}</span>
                <div className={styles.fiInfo}><h4>{f.name}</h4><p>{f.uploader} · {f.time}</p></div>
                <span className={styles.fiArrow}>↓</span>
              </div>
            ))}
          </div>
        ) : <p className={styles.emptyText}>还没有共享文件。</p>}
      </div>

      <div className={`${styles.collabPanel} ${activeTab === 'log' ? styles.collabPanelActive : ''}`} id={`log-${p.id}`}>
        {p.activities ? (
          <div className={styles.activityFeed}>
            {p.activities.map((a, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.actAvatar} style={{ background: a.color }}>{a.user[0]}</div>
                <div><strong className={styles.activityItemStrong}>{a.user}</strong> {a.text}<span className={styles.actTime}>{a.time}</span></div>
              </div>
            ))}
          </div>
        ) : <p className={styles.emptyText}>暂无项目动态。</p>}
      </div>
    </>
  )
}

export default CollabSpace