import { useEffect, useState, type RefObject } from 'react'

const expandRootMargin = (rootMargin = '0px') => {
  const values = rootMargin.trim().split(/\s+/).map((value) => Number.parseFloat(value) || 0)
  const [top = 0, right = top, bottom = top, left = right] = values
  if (values.length === 2) return [top, right, top, right] as const
  if (values.length === 3) return [top, right, bottom, right] as const
  return [top, right, bottom, left] as const
}

export function useInView<T extends Element>(ref: RefObject<T | null>, options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false)
  const root = options?.root
  const rootMargin = options?.rootMargin
  const threshold = options?.threshold

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let frame = 0
    let settleFrame = 0
    const checkRenderedPosition = () => {
      frame = 0
      const bounds = element.getBoundingClientRect()
      const [marginTop, marginRight, marginBottom, marginLeft] = expandRootMargin(rootMargin)
      const rootBounds = root instanceof Element
        ? root.getBoundingClientRect()
        : { top: 0, right: window.innerWidth, bottom: window.innerHeight, left: 0 }
      const intersectionWidth = Math.max(0, Math.min(bounds.right, rootBounds.right + marginRight) - Math.max(bounds.left, rootBounds.left - marginLeft))
      const intersectionHeight = Math.max(0, Math.min(bounds.bottom, rootBounds.bottom + marginBottom) - Math.max(bounds.top, rootBounds.top - marginTop))
      const area = Math.max(1, bounds.width * bounds.height)
      const ratio = intersectionWidth * intersectionHeight / area
      const requiredRatio = Array.isArray(threshold) ? Math.min(...threshold) : threshold ?? 0
      setInView(requiredRatio === 0 ? ratio > 0 : ratio >= requiredRatio)
    }
    const schedulePositionCheck = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(checkRenderedPosition)
    }

    let observer: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { root, rootMargin, threshold })
      observer.observe(element)
    }

    settleFrame = window.requestAnimationFrame(schedulePositionCheck)
    window.addEventListener('scroll', schedulePositionCheck, { passive: true })
    window.addEventListener('resize', schedulePositionCheck)
    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', schedulePositionCheck)
      window.removeEventListener('resize', schedulePositionCheck)
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(settleFrame)
    }
  }, [ref, root, rootMargin, threshold])

  return inView
}
