import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { asResponsiveAsset, responsiveImage, responsiveSource, type ResponsiveAssetBase } from './responsiveImage'

export type AssetStage = 'hero' | 'badges' | 'services' | 'gallery' | 'associations' | 'protection' | 'reviews' | 'founder' | 'footer'

const stageOrder: AssetStage[] = ['hero', 'badges', 'services', 'gallery', 'associations', 'protection', 'reviews', 'founder', 'footer']
const stageSelectors: Record<AssetStage, string> = {
  hero: '#top', badges: '#about', services: '#services', gallery: '#work',
  associations: '#associations', protection: '#protection', reviews: '#reviews',
  founder: '#founder', footer: '#contact',
}

// Only assets needed to establish the first complete view of each section belong here.
// Rotating gallery images, association clones, hover art, and map tiles remain on demand.
const requiredAssets: Record<AssetStage, string[]> = {
  hero: ['/assets/hero/sky', '/assets/hero/foreground'],
  badges: ['/assets/badges/banner', '/assets/badges/badge-banner-workshirt', '/assets/badges/badge-banner-workshirt-full-hem'],
  services: ['/assets/services/services-cover-board', '/assets/services/residential-roofing', '/assets/services/commercial-roofing', '/assets/services/custom-metal', '/assets/services/repairs-inspections'],
  gallery: ['/assets/gallery/paper_texture', '/assets/gallery/material-library'],
  associations: ['/assets/associations/associations_bg_texture', '/assets/associations/badge_row-1_01_high_vale_roof_tile', '/assets/associations/badge_row-1_02_century_seal_roof_assurance', '/assets/associations/badge_row-2_01_ironmere', '/assets/associations/badge_row-2_02_stormglass'],
  protection: ['/assets/protection/copper_background_texture.jpg', '/assets/protection/protection-finished-roof', '/assets/protection/protection-underlayment', '/assets/ui/copper-sphere-etched-large-generated'],
  reviews: ['/assets/reviews/leaf_background_texture.jpg', '/assets/reviews/seris-rhuke', '/assets/reviews/nyaren-klourm', '/assets/reviews/baeloon-pluhng'],
  founder: ['/assets/founder/founder-jean-texture', '/assets/founder/founder_left_frame', '/assets/founder/founder_right_frame'],
  footer: ['/assets/footer/footer-roofscape-backdrop', '/assets/footer/footer-eaves-foreground', '/assets/footer/brand-plaque', '/assets/footer/map-frame'],
}

type AssetStageContextValue = {
  constrained: boolean
  enabled: (stage: AssetStage) => boolean
  style: CSSProperties
  stageClassName: string
}

const AssetStageContext = createContext<AssetStageContextValue | null>(null)

function loadAndDecodeImage(baseOrUrl: string, width: number) {
  const image = new Image()
  const source = baseOrUrl.endsWith('.jpg') || baseOrUrl.endsWith('.jpeg') || baseOrUrl.endsWith('.png')
    ? baseOrUrl
    : responsiveSource(asResponsiveAsset(baseOrUrl), width)
  return new Promise<void>((resolve) => {
    image.onload = () => {
      if (typeof image.decode === 'function') void image.decode().catch(() => undefined).finally(resolve)
      else resolve()
    }
    image.onerror = () => resolve()
    image.src = source
  })
}

export function AssetStageProvider({ children, galleryAssets = [] }: { children: ReactNode; galleryAssets?: string[] }) {
  const initialConstrained = typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches
  const [constrained, setConstrained] = useState(initialConstrained)
  const [enabledStages, setEnabledStages] = useState<AssetStage[]>(['hero'])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)')
    const update = () => {
      setConstrained(media.matches)
      setEnabledStages(['hero'])
    }
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    let cancelled = false
    const enableStage = async (stage: AssetStage) => {
      const assets = stage === 'gallery' ? [...requiredAssets.gallery, ...galleryAssets] : requiredAssets[stage]
      await Promise.allSettled(assets.map((base) => loadAndDecodeImage(base, constrained ? 640 : 1440)))
      if (cancelled) return
      setEnabledStages((current) => current.includes(stage) ? current : [...current, stage])
    }

    if (!('IntersectionObserver' in window)) {
      stageOrder.slice(1).forEach((stage) => { void enableStage(stage) })
      return () => { cancelled = true }
    }

    const pending = new Set<AssetStage>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const stage = (entry.target as HTMLElement).dataset.assetStage as AssetStage | undefined
        if (!stage || pending.has(stage)) return
        pending.add(stage)
        void enableStage(stage)
      })
    }, { rootMargin: '150% 0px' })

    stageOrder.slice(1).forEach((stage) => {
      const element = document.querySelector(stageSelectors[stage])
      if (element) {
        element.setAttribute('data-asset-stage', stage)
        observer.observe(element)
      } else void enableStage(stage)
    })

    return () => { cancelled = true; observer.disconnect() }
  }, [constrained, galleryAssets])

  const value = useMemo<AssetStageContextValue>(() => {
    return {
      constrained,
      enabled: (stage) => enabledStages.includes(stage),
      style: {},
      stageClassName: enabledStages.map((stage) => `asset-stage-${stage}`).join(' '),
    }
  }, [constrained, enabledStages])

  return <AssetStageContext.Provider value={value}>{children}</AssetStageContext.Provider>
}

export function useAssetStage() {
  return useContext(AssetStageContext) ?? { constrained: false, enabled: () => true, style: {}, stageClassName: '' }
}

type StageImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  base: ResponsiveAssetBase
  sizes: string
  defaultWidth?: number
  stage: AssetStage
}

export function StageImage({ base, sizes, defaultWidth = 1440, stage, style, ...props }: StageImageProps) {
  const { enabled } = useAssetStage()
  const metadata = responsiveImage(base, sizes, defaultWidth)
  if (!enabled(stage)) {
    return <span className={`asset-placeholder${props.className ? ` ${props.className}` : ''}`} aria-hidden="true" style={{ ...style, aspectRatio: `${metadata.width} / ${metadata.height}` }} />
  }
  return <img {...metadata} {...props} alt={props.alt ?? ''} style={style} />
}
