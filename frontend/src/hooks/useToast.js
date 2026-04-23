import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

export function useToast() {
  const { showToast, removeToast, toasts } = useApp()

  useEffect(() => {
    if (toasts.length === 0) return
    const latest = toasts[toasts.length - 1]
    const timer = setTimeout(() => removeToast(latest.id), 3000)
    return () => clearTimeout(timer)
  }, [toasts, removeToast])

  return { toasts, showToast, removeToast }
}
