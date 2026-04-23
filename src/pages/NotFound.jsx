import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '5rem', color: 'var(--warm-gray)', margin: 0 }}>404</h1>
        <h2 style={{ color: 'var(--ink-light)', marginTop: '0.5rem' }}>页面走丢了</h2>
        <p style={{ color: 'var(--warm-gray)', margin: '1rem 0 2rem' }}>你访问的页面不存在，可能已被移除或地址有误。</p>
        <button className="btn-primary" onClick={() => navigate('/home')}>返回首页</button>
        {' '}<Link to="/home" style={{ marginLeft: '1rem', color: 'var(--red)' }} onClick={() => window.location.reload()}>刷新重试</Link>
      </div>
    </div>
  )
}
