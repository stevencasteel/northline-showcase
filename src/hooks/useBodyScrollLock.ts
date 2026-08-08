import { useEffect } from 'react'

let activeScrollLocks = 0
let hadScrollLockClassBeforeFirstLock = false

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const body = document.body
    const root = document.documentElement
    if (activeScrollLocks === 0) {
      hadScrollLockClassBeforeFirstLock = body.classList.contains('body-scroll-locked')
    }
    activeScrollLocks += 1
    body.classList.add('body-scroll-locked')
    const previous = {
      bodyOverflow: body.style.overflow,
      rootOverflow: root.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
      rootScrollBehavior: root.style.scrollBehavior,
    }
    const scrollbarWidth = window.innerWidth - root.clientWidth

    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `${-scrollY}px`
    body.style.left = `${-scrollX}px`
    body.style.right = '0'
    body.style.width = '100%'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      activeScrollLocks = Math.max(0, activeScrollLocks - 1)
      root.style.scrollBehavior = 'auto'
      root.style.overflow = previous.rootOverflow
      body.style.overflow = previous.bodyOverflow
      body.style.position = previous.bodyPosition
      body.style.top = previous.bodyTop
      body.style.left = previous.bodyLeft
      body.style.right = previous.bodyRight
      body.style.width = previous.bodyWidth
      body.style.paddingRight = previous.bodyPaddingRight
      if (activeScrollLocks === 0 && !hadScrollLockClassBeforeFirstLock) {
        body.classList.remove('body-scroll-locked')
      }
      window.scrollTo(scrollX, scrollY)
      root.style.scrollBehavior = previous.rootScrollBehavior
    }
  }, [locked])
}
