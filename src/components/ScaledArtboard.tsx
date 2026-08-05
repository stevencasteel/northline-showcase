import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const referenceWidth = 1440

type ScaledArtboardProps = {
  children: ReactNode
}

export function ScaledArtboard({ children }: ScaledArtboardProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState({ scale: 1, height: 0 })

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return

    const update = () => {
      const viewportWidth = Math.max(document.documentElement.clientWidth, 320)
      const scale = Math.min(1, viewportWidth / referenceWidth)
      const inverseZoom = scale < 1 ? 1 / scale : 1
      const height = inner.getBoundingClientRect().height * scale
      setLayout((current) => current.scale === scale && Math.abs(current.height - height) < 0.5 ? current : { scale, height })
      inner.style.setProperty('--artboard-zoom', `${inverseZoom}`)
      inner.style.setProperty('--artboard-vw', `${viewportWidth / 100 / scale}px`)
    }

    update()
    let resizeObserver: ResizeObserver | null = null
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(update)
      resizeObserver.observe(inner)
    }
    window.addEventListener('resize', update)
    const imageListeners: HTMLImageElement[] = []
    inner.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      if (image.complete) return
      image.addEventListener('load', update)
      imageListeners.push(image)
    })
    const fontReady = document.fonts?.ready.then(update)
    const initialFrame = window.requestAnimationFrame(update)
    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', update)
      imageListeners.forEach((image) => image.removeEventListener('load', update))
      window.cancelAnimationFrame(initialFrame)
      void fontReady
    }
  }, [])

  const innerStyle = {
    '--artboard-scale': layout.scale,
    width: '100%',
    zoom: 'var(--artboard-zoom, 1)',
    transform: `scale(${layout.scale})`,
    transformOrigin: 'top left',
  } as CSSProperties

  return (
    <div className="scaled-artboard" style={{ height: layout.height || undefined }}>
      <div className="scaled-artboard-inner" ref={innerRef} style={innerStyle}>
        {children}
      </div>
    </div>
  )
}
