import { useApp } from '../context/AppContext'
import { useEffect, useRef } from 'react'

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()
  const timers = useRef(new Map())

  useEffect(() => {
    // 为每个 toast 设置独立定时器
    toasts.forEach(t => {
      if (!timers.current.has(t.id)) {
        const timer = setTimeout(() => removeToast(t.id), 3000)
        timers.current.set(t.id, timer)
      }
    })
    // 清理已移除 toast 的定时器
    const activeIds = new Set(toasts.map(t => t.id))
    for (const [id, timer] of timers.current) {
      if (!activeIds.has(id)) {
        clearTimeout(timer)
        timers.current.delete(id)
      }
    }
  }, [toasts, removeToast])

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || ''}`}>{t.msg}</div>
      ))}
    </div>
  )
}
