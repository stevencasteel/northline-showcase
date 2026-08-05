import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const referenceWidth = 1440

type ScaledArtboardProps = {
  children: ReactNode
}

export function ScaledArtboard({ children }: ScaledArtboardProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState({ artboardWidth: referenceWidth, scale: 1, height: 0 })

  useLayoutEffect(() => {
    const host = hostRef.current
    const inner = innerRef.current
    if (!host || !inner) return

    let resizeFrame = 0

    const update = () => {
      const hostWidth = Math.max(host.getBoundingClientRect().width, 1)
      const artboardWidth = Math.max(referenceWidth, hostWidth)
      const scale = hostWidth / artboardWidth
      const height = inner.scrollHeight * scale
      setLayout((current) => current.artboardWidth === artboardWidth && Math.abs(current.scale - scale) < 0.0001 && Math.abs(current.height - height) < 0.5 ? current : { artboardWidth, scale, height })
    }

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(update)
    }

    scheduleUpdate()
    let resizeObserver: ResizeObserver | null = null
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(scheduleUpdate)
      resizeObserver.observe(host)
      resizeObserver.observe(inner)
    }
    window.addEventListener('resize', scheduleUpdate)
    const imageListeners: HTMLImageElement[] = []
    inner.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      if (image.complete) return
      image.addEventListener('load', scheduleUpdate)
      imageListeners.push(image)
    })
    const fontReady = document.fonts?.ready.then(scheduleUpdate)
    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', scheduleUpdate)
      imageListeners.forEach((image) => image.removeEventListener('load', scheduleUpdate))
      window.cancelAnimationFrame(resizeFrame)
      void fontReady
    }
  }, [])

  const innerStyle = {
    width: `${layout.artboardWidth}px`,
    maxWidth: 'none',
    transform: `scale(${layout.scale})`,
    transformOrigin: 'top left',
  } as CSSProperties

  return (
    <div className="scaled-artboard" ref={hostRef} style={{ height: layout.height || undefined }}>
      <div className="scaled-artboard-inner" ref={innerRef} style={innerStyle}>
        {children}
      </div>
    </div>
  )
}
