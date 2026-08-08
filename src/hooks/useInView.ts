import { useEffect, useState, type RefObject } from 'react'

function expandRootMargin(rootMargin = '0px', referenceWidth: number) {
  const values = rootMargin.trim().split(/\s+/).map((value) => {
    const number = Number.parseFloat(value) || 0
    return value.endsWith('%') ? number / 100 * referenceWidth : number
  })
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
    const checkPosition = () => {
      frame = 0
      const bounds = element.getBoundingClientRect()
      const rootBounds = root instanceof Element
        ? root.getBoundingClientRect()
        : { top: 0, right: window.innerWidth, bottom: window.innerHeight, left: 0 }
      const [marginTop, marginRight, marginBottom, marginLeft] = expandRootMargin(rootMargin, rootBounds.right - rootBounds.left)
      const intersectionWidth = Math.max(0, Math.min(bounds.right, rootBounds.right + marginRight) - Math.max(bounds.left, rootBounds.left - marginLeft))
      const intersectionHeight = Math.max(0, Math.min(bounds.bottom, rootBounds.bottom + marginBottom) - Math.max(bounds.top, rootBounds.top - marginTop))
      const area = Math.max(1, bounds.width * bounds.height)
      const ratio = intersectionWidth * intersectionHeight / area
      const requiredRatio = Array.isArray(threshold) ? Math.min(...threshold) : threshold ?? 0
      setInView(requiredRatio === 0 ? ratio > 0 : ratio >= requiredRatio)
    }

    const schedulePositionCheck = () => {
      if (frame) return
      frame = window.requestAnimationFrame(checkPosition)
    }

    let settleFrame = 0
    let settlePass = 0
    const settleLayout = () => {
      schedulePositionCheck()
      settlePass += 1
      if (settlePass < 12) settleFrame = window.requestAnimationFrame(settleLayout)
    }
    const layoutHost = element.closest('.scaled-artboard')
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(schedulePositionCheck) : null
    resizeObserver?.observe(layoutHost ?? element)

    schedulePositionCheck()
    settleFrame = window.requestAnimationFrame(settleLayout)
    window.addEventListener('scroll', schedulePositionCheck, { passive: true })
    window.addEventListener('resize', schedulePositionCheck)
    return () => {
      window.removeEventListener('scroll', schedulePositionCheck)
      window.removeEventListener('resize', schedulePositionCheck)
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(settleFrame)
      resizeObserver?.disconnect()
    }
  }, [ref, root, rootMargin, threshold])

  return inView
}
