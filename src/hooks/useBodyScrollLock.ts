import { useEffect } from 'react'

let activeScrollLocks = 0
type ScrollLockBaseline = {
  hadClass: boolean
  compensation: string
  scrollX: number
  scrollY: number
  bodyOverflow: string
  bodyPosition: string
  bodyTop: string
  bodyLeft: string
  bodyRight: string
  bodyWidth: string
  bodyPaddingRight: string
  rootOverflow: string
  rootScrollBehavior: string
}

let baseline: ScrollLockBaseline | null = null

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const body = document.body
    const root = document.documentElement
    if (activeScrollLocks === 0) {
      baseline = {
        hadClass: body.classList.contains('body-scroll-locked'),
        compensation: root.style.getPropertyValue('--scrollbar-compensation'),
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        bodyOverflow: body.style.overflow,
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyLeft: body.style.left,
        bodyRight: body.style.right,
        bodyWidth: body.style.width,
        bodyPaddingRight: body.style.paddingRight,
        rootOverflow: root.style.overflow,
        rootScrollBehavior: root.style.scrollBehavior,
      }
    }
    activeScrollLocks += 1
    if (activeScrollLocks > 1) return () => { activeScrollLocks = Math.max(0, activeScrollLocks - 1) }

    const scrollX = baseline?.scrollX ?? window.scrollX
    const scrollY = baseline?.scrollY ?? window.scrollY
    body.classList.add('body-scroll-locked')
    const scrollbarWidth = window.innerWidth - root.clientWidth

    root.style.setProperty('--scrollbar-compensation', `${scrollbarWidth}px`)
    root.style.overflow = 'hidden'
    root.style.scrollBehavior = 'auto'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `${-scrollY}px`
    body.style.left = `${-scrollX}px`
    body.style.right = '0'
    body.style.width = '100%'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      activeScrollLocks = Math.max(0, activeScrollLocks - 1)
      if (activeScrollLocks > 0 || !baseline) return
      const previous = baseline
      root.style.overflow = previous.rootOverflow
      root.style.scrollBehavior = 'auto'
      body.style.overflow = previous.bodyOverflow
      body.style.position = previous.bodyPosition
      body.style.top = previous.bodyTop
      body.style.left = previous.bodyLeft
      body.style.right = previous.bodyRight
      body.style.width = previous.bodyWidth
      body.style.paddingRight = previous.bodyPaddingRight
      if (!previous.hadClass) {
        body.classList.remove('body-scroll-locked')
      }
      if (previous.compensation) root.style.setProperty('--scrollbar-compensation', previous.compensation)
      else root.style.removeProperty('--scrollbar-compensation')
      baseline = null
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' })
      root.style.scrollBehavior = previous.rootScrollBehavior
    }
  }, [locked])
}
