import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import styles from './NotFound.module.css'
import btn from '../assets/shared/Buttons.module.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className={`page active ${styles.container}`}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>页面走丢了</h2>
        <p className={styles.desc}>你访问的页面不存在，可能已被移除或地址有误。</p>
        <button className={btn.primary} onClick={() => navigate('/home')}>返回首页</button>
        {' '}<Link to="/home" className={styles.refreshLink} onClick={() => window.location.reload()}>刷新重试</Link>
      </div>
    </div>
  )
}
