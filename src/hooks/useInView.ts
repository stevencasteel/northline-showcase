import { useEffect, useState, type RefObject } from 'react'

export function useInView<T extends Element>(ref: RefObject<T | null>, options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false)
  const root = options?.root
  const rootMargin = options?.rootMargin
  const threshold = options?.threshold

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { root, rootMargin, threshold })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, root, rootMargin, threshold])

  return inView
}
