import { useEffect, useRef } from 'react'

export function useScrollReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const el = ref.current
    if (el) {
      el.querySelectorAll('.reveal:not(.visible)').forEach((node) => observer.observe(node))
    }

    return () => {
      if (el) el.querySelectorAll('.reveal').forEach((node) => observer.unobserve(node))
    }
  }, [])

  return ref
}
