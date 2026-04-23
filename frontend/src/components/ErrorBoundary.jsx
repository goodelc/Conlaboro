import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', textAlign: 'center'
        }}>
            <div>
            <h1 style={{ fontSize: '3rem', color: 'var(--red)', margin: 0 }}>{'\u26A0'}</h1>
            <h2 style={{ marginTop: '1rem' }}>{'出了点问题'}</h2>
            <p style={{ color: 'var(--warm-gray)', margin: '0.5rem 0 1.5rem' }}>
              {this.state.error?.message || '\u9875\u9762\u6E32\u67D3\u51FA\u95FF\uFF0C\u8BF7\u5237\u65B0\u91CD\u8BD5'}
            </p>
            <button
              className="btn-primary"
              onClick={() => window.location.reload()}
            >刷新页面</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
