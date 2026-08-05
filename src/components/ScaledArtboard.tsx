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
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(inner)
    window.addEventListener('resize', update)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', update)
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
