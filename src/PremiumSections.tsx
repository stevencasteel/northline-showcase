import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent as ReactFormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { useDocumentVisibility } from './hooks/useDocumentVisibility'
import { useInView } from './hooks/useInView'
import { siteConfig } from './config/site'

type BookHandler = { onBook: () => void }

const underlaymentImage = '/assets/source/protection-underlayment.png'
const protectionSphereImage = '/assets/ui/copper-sphere-etched-large-generated.png'
const protectionSphereLeftImage = '/assets/ui/copper-sphere-etched-large-hover-left.png'
const protectionSphereRightImage = '/assets/ui/copper-sphere-etched-large-hover-right.png'
const protectionHoverTransitionMs = 240

type AssociationBadgeKind = 'standard' | 'landscape' | 'wide' | 'ultrawide'

type AssociationBadge = {
  file: string
  width: number
  height: number
  kind: AssociationBadgeKind
  scale?: number
}

const associationRows: AssociationBadge[][] = [
  [
    { file: 'badge_row-1_01_high_vale_roof_tile.png', width: 1179, height: 1150, kind: 'standard' },
    { file: 'badge_row-1_02_century_seal_roof_assurance.png', width: 1210, height: 1206, kind: 'standard' },
    { file: 'badge_row-1_03_united_roofwrights.png', width: 1123, height: 1196, kind: 'standard' },
    { file: 'badge_row-1_04_aurelian_slate_council.png', width: 985, height: 1187, kind: 'standard' },
    { file: 'badge_row-1_05_royal_sheet_and_slate.png', width: 943, height: 1303, kind: 'standard' },
    { file: 'badge_row-1_06_crownwatch.png', width: 1127, height: 1247, kind: 'standard' },
    { file: 'badge_row-1_07_skyseer.png', width: 1181, height: 1439, kind: 'standard' },
    { file: 'badge_row-1_08_tempest.png', width: 1133, height: 1249, kind: 'standard' },
    { file: 'badge_row-1_09_emberward.png', width: 1136, height: 1316, kind: 'standard' },
    { file: 'badge_row-1_10_windmark.png', width: 1113, height: 1316, kind: 'standard' },
    { file: 'badge_row-1_11_hammerfall.png', width: 1254, height: 1310, kind: 'standard' },
    { file: 'badge_row-1_12_evergreen.png', width: 1159, height: 1226, kind: 'standard' },
    { file: 'badge_row-1_13_oldstone.png', width: 1137, height: 1237, kind: 'standard' },
    { file: 'badge_row-1_14_sunscale.png', width: 1063, height: 1254, kind: 'standard' },
    { file: 'badge_row-1_15_ironclad.png', width: 1254, height: 1198, kind: 'standard' },
    { file: 'badge_row-1_16_valeward.png', width: 1079, height: 1185, kind: 'standard' },
    { file: 'badge_row-1_17_verdant_peak.png', width: 1168, height: 1195, kind: 'standard' },
    { file: 'badge_row-1_18_everlight.png', width: 1098, height: 1303, kind: 'standard' },
    { file: 'badge_row-1_19_gildharbor.png', width: 1306, height: 961, kind: 'landscape' },
    { file: 'badge_row-1_20_cinderpeak.png', width: 1197, height: 1192, kind: 'standard' },
    { file: 'badge_row-1_21_highspire.png', width: 1133, height: 1172, kind: 'standard' },
    { file: 'badge_row-1_22_highmere.png', width: 1168, height: 1163, kind: 'standard' },
    { file: 'badge_row-1_23_embercrest.png', width: 1196, height: 1197, kind: 'standard' },
  ],
  [
    { file: 'badge_row-2_01_ironmere.png', width: 1347, height: 880, kind: 'landscape' },
    { file: 'badge_row-2_02_stormglass.png', width: 1523, height: 846, kind: 'landscape' },
    { file: 'badge_row-2_03_stonewake.png', width: 2035, height: 660, kind: 'wide' },
    { file: 'badge_row-2_04_ironpeak.png', width: 1226, height: 1205, kind: 'standard' },
    { file: 'badge_row-2_05_skyforge.png', width: 1331, height: 1032, kind: 'standard' },
    { file: 'badge_row-2_06_northreach.png', width: 1751, height: 431, kind: 'ultrawide' },
    { file: 'badge_row-2_07_celestial_canopy_co-op.png', width: 1194, height: 1199, kind: 'standard' },
    { file: 'badge_row-2_08_wyverns_nest.png', width: 1075, height: 1188, kind: 'standard' },
    { file: 'badge_row-2_09_aegis.png', width: 1429, height: 611, kind: 'wide' },
    { file: 'badge_row-2_10_stoneweather.png', width: 1153, height: 1098, kind: 'standard' },
    { file: 'badge_row-2_11_skyreach.png', width: 1448, height: 1032, kind: 'landscape' },
    { file: 'badge_row-2_12_thornwall.png', width: 1277, height: 928, kind: 'landscape' },
    { file: 'badge_row-2_13_aurelian.png', width: 1966, height: 629, kind: 'wide' },
    { file: 'badge_row-2_14_eldercape.png', width: 1046, height: 1194, kind: 'standard' },
    { file: 'badge_row-2_15_gryphon.png', width: 1284, height: 1021, kind: 'standard' },
    { file: 'badge_row-2_16_moonkeep.png', width: 1213, height: 1215, kind: 'standard' },
  ],
]

const associationLabel = (filename: string) => filename
  .replace(/^badge_row-[12]_\d+_/, '')
  .replace(/\.png$/, '')
  .replace(/[-_]/g, ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase())

const associationBadgeCount = associationRows.reduce((count, row) => count + row.length, 0)

type ProtectionDragDirection = 'left' | 'right' | null
type ProtectionPointerMode = 'idle' | 'pending' | 'dragging'

const clampProtectionSplit = (value: number) => Math.min(100, Math.max(0, Number(value.toFixed(1))))
const protectionIntentThreshold = 10

const reviews = [
  {
    name: 'Seris Rhuke',
    role: 'Lakeside homeowner',
    quote: 'The storm rolled across the lake before dawn. Northline had us dry, safe, and fully documented before lunch—and the new slate looks extraordinary.',
    portrait: '/assets/reviews/seris-rhuke.png',
    googlePlace: 'Illyrion Spire',
    googleUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Garden%2C%2026%20Gandalf%27s%20Cutting%2C%20Waikato%203472%2C%20New%20Zealand',
  },
  {
    name: 'Nyaren Klourm',
    role: 'Architect & property owner',
    quote: 'They found the ventilation problem everyone else missed, showed me every layer, and left the copper transitions cleaner than the original drawings.',
    portrait: '/assets/reviews/nyaren-klourm.png',
    googlePlace: 'Aestir Hollow',
    googleUrl: 'https://www.google.com/maps/search/?api=1&query=Green%20Dragon%20Inn%2C%20Hobbiton%20Movie%20Set%2C%20Waikato%2C%20New%20Zealand',
  },
  {
    name: 'Baeloon Pluhng',
    role: 'Mountain innkeeper',
    quote: 'Our roof has twelve valleys and not one simple line. The crew treated every seam like finish carpentry and left the grounds immaculate.',
    portrait: '/assets/reviews/baeloon-pluhng.png',
    googlePlace: 'The Goorough District',
    googleUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Shire%27s%20Rest%2C%20501%20Buckland%20Road%2C%20Hinuera%2C%20Matamata%203472%2C%20New%20Zealand',
  },
] as const

function usePremiumReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-premium-reveal]'))
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: .12 })

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}

function HowWeProtectSection() {
  const [split, setSplit] = useState(54)
  const [dragDirection, setDragDirection] = useState<ProtectionDragDirection>(null)
  const [dragIndicatorVisible, setDragIndicatorVisible] = useState(false)
  const [pointerFocusActive, setPointerFocusActive] = useState(false)
  const isDragging = useRef(false)
  const previousSplit = useRef(split)
  const releaseTimeout = useRef<number | null>(null)
  const pointerMode = useRef<ProtectionPointerMode>('idle')
  const activePointerId = useRef<number | null>(null)
  const pointerStart = useRef({ x: 0, y: 0, split })

  useEffect(() => () => {
    if (releaseTimeout.current !== null) window.clearTimeout(releaseTimeout.current)
  }, [])

  const updateSplitFromClientX = (input: HTMLInputElement, clientX: number) => {
    const bounds = input.getBoundingClientRect()
    if (bounds.width <= 0) return

    const nextSplit = clampProtectionSplit(((clientX - bounds.left) / bounds.width) * 100)
    const previous = previousSplit.current

    if (nextSplit !== previous) {
      setDragDirection(nextSplit > previous ? 'right' : 'left')
      setDragIndicatorVisible(true)
    }

    previousSplit.current = nextSplit
    setSplit(nextSplit)
  }

  const startSplitDrag = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    if (releaseTimeout.current !== null) {
      window.clearTimeout(releaseTimeout.current)
      releaseTimeout.current = null
    }

    pointerStart.current = { x: event.clientX, y: event.clientY, split }
    activePointerId.current = event.pointerId
    setDragIndicatorVisible(false)
    setPointerFocusActive(true)
    event.currentTarget.focus({ preventScroll: true })

    if (event.pointerType === 'mouse') {
      pointerMode.current = 'dragging'
      isDragging.current = true
      previousSplit.current = split
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Pointer capture is a robustness enhancement, not a reason to abort.
      }
      updateSplitFromClientX(event.currentTarget, event.clientX)
    } else {
      pointerMode.current = 'pending'
      isDragging.current = false
    }
  }

  const handleSplitInput = (event: ReactFormEvent<HTMLInputElement>) => {
    if (isDragging.current) return

    const nextSplit = clampProtectionSplit(Number(event.currentTarget.value))
    previousSplit.current = nextSplit
    setSplit(nextSplit)
  }

  const moveSplitDrag = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (activePointerId.current !== event.pointerId) return

    if (pointerMode.current === 'pending') {
      const dx = event.clientX - pointerStart.current.x
      const dy = event.clientY - pointerStart.current.y
      if (Math.abs(dx) < protectionIntentThreshold && Math.abs(dy) < protectionIntentThreshold) return
      if (Math.abs(dy) > Math.abs(dx)) {
        pointerMode.current = 'idle'
        activePointerId.current = null
        return
      }

      pointerMode.current = 'dragging'
      isDragging.current = true
      previousSplit.current = pointerStart.current.split
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Pointer capture is a robustness enhancement, not a reason to abort.
      }
    }

    if (!isDragging.current) return
    updateSplitFromClientX(event.currentTarget, event.clientX)
  }

  const finishSplitDrag = () => {
    if (pointerMode.current === 'idle' && !isDragging.current && activePointerId.current === null) return

    isDragging.current = false
    pointerMode.current = 'idle'
    activePointerId.current = null
    setDragIndicatorVisible(false)

    if (releaseTimeout.current !== null) window.clearTimeout(releaseTimeout.current)
    releaseTimeout.current = window.setTimeout(() => {
      setDragDirection(null)
      releaseTimeout.current = null
    }, protectionHoverTransitionMs)
  }

  const endSplitDrag = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (activePointerId.current !== event.pointerId) return

    const pointerId = event.pointerId
    const hasCapture = event.currentTarget.hasPointerCapture(pointerId)

    if (pointerMode.current === 'pending') {
      previousSplit.current = pointerStart.current.split
      updateSplitFromClientX(event.currentTarget, event.clientX)
      finishSplitDrag()
    } else if (isDragging.current) {
      updateSplitFromClientX(event.currentTarget, event.clientX)
      finishSplitDrag()
    } else {
      finishSplitDrag()
    }

    if (hasCapture) event.currentTarget.releasePointerCapture(pointerId)
  }

  const cancelSplitDrag = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (activePointerId.current !== event.pointerId) return
    const hasCapture = event.currentTarget.hasPointerCapture(event.pointerId)
    finishSplitDrag()
    if (hasCapture) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <section className="premium-protection premium-shell" id="protection">
      <div className="premium-protection-console" data-premium-reveal>
        <div
          className="premium-protection-stage"
          data-drag-direction={dragDirection ?? undefined}
          data-drag-indicator={dragIndicatorVisible && dragDirection ? 'visible' : undefined}
          style={{ '--premium-split': `${split}%` } as CSSProperties}
        >
          <img className="premium-protection-image" src="/assets/source/protection-finished-roof.jpg" alt="A completed premium slate and copper roof" />
          <img className="premium-protection-image premium-protection-layer" src={underlaymentImage} alt="The same roof with its underlayment construction exposed" />
          <input
            className="premium-protection-range"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={split}
            data-pointer-focus={pointerFocusActive ? 'true' : undefined}
            onInput={handleSplitInput}
            onPointerDown={startSplitDrag}
            onPointerMove={moveSplitDrag}
            onPointerUp={endSplitDrag}
            onPointerCancel={cancelSplitDrag}
            onLostPointerCapture={finishSplitDrag}
            onBlur={() => {
              if (document.hasFocus()) setPointerFocusActive(false)
            }}
            aria-label="Reveal underlayment"
            aria-valuetext={`${split}% finished roof, ${100 - split}% underlayment`}
          />
          <div className="premium-protection-divider" aria-hidden="true">
            <span className="premium-protection-thumb">
              <span className="premium-protection-thumb-surface">
                <img className="premium-protection-sphere premium-protection-sphere-default" src={protectionSphereImage} alt="" aria-hidden="true" />
                <img className="premium-protection-sphere premium-protection-sphere-left" src={protectionSphereLeftImage} alt="" aria-hidden="true" />
                <img className="premium-protection-sphere premium-protection-sphere-right" src={protectionSphereRightImage} alt="" aria-hidden="true" />
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function GoogleReviewsSection() {
  return (
    <section className="premium-reviews premium-shell" id="reviews">
      <div className="premium-reviews-heading" data-premium-reveal>
        <div className="premium-google-mark" aria-label="Reviews on Google"><img src="/assets/brand/google-g-logo.svg" alt="Google G" /><span>Reviews on Google</span></div>
      </div>
      <div className="premium-review-grid">
        {reviews.map((review, index) => (
          <article className="premium-review-card" data-premium-reveal key={review.name} style={{ '--premium-review-index': index } as CSSProperties}>
            <div className="premium-review-fasteners" aria-hidden="true"><i /><i /><i /><i /></div>
            <header><img src={review.portrait} alt={`${review.name}, ${review.role}`} /><div><h3>{review.name}</h3><p>{review.role}</p></div><span className="premium-review-rating" aria-label="Rated five out of five"><span>5</span><i>/</i><span>5</span></span></header>
            <blockquote>“{review.quote}”</blockquote>
            <footer><a className="premium-review-google-link" href={review.googleUrl} target="_blank" rel="noreferrer" aria-label={`Open ${review.googlePlace} on Google Maps`}><span>{review.googlePlace}</span><img src="/assets/brand/google-g-logo.svg" alt="" aria-hidden="true" /></a></footer>
          </article>
        ))}
      </div>
    </section>
  )
}

export function PremiumSections() {
  usePremiumReveal()
  return <div className="premium-sections"><HowWeProtectSection /><GoogleReviewsSection /></div>
}

export function AssociationsMarquee() {
  const sectionRef = useRef<HTMLElement>(null)
  const [loadedAssociationFiles, setLoadedAssociationFiles] = useState<Set<string>>(() => new Set())
  const inView = useInView(sectionRef, { rootMargin: '200px 0px' })
  const documentVisible = useDocumentVisibility()
  const isRunning = inView && documentVisible && loadedAssociationFiles.size >= associationBadgeCount

  const markAssociationFileReady = (file: string) => {
    setLoadedAssociationFiles((current) => {
      if (current.has(file)) return current
      const next = new Set(current)
      next.add(file)
      return next
    })
  }

  const renderGroup = (row: AssociationBadge[], clone: boolean) => (
    <div className="associations-marquee-group" aria-hidden={clone || undefined}>
      {row.map((badge) => (
        <div className="association-badge-cell" data-kind={badge.kind} key={`${badge.file}-${clone ? 'clone' : 'original'}`}>
          <img
            src={`/assets/associations/${badge.file}`}
            alt={clone ? '' : associationLabel(badge.file)}
            aria-hidden={clone || undefined}
            width={badge.width}
            height={badge.height}
            decoding="async"
            loading="eager"
            onLoad={() => markAssociationFileReady(badge.file)}
            onError={() => markAssociationFileReady(badge.file)}
            style={{ '--association-scale': badge.scale ?? 1 } as CSSProperties}
          />
        </div>
      ))}
    </div>
  )

  return (
    <section className={`associations-marquee${isRunning ? ' is-marquee-running' : ''}`} ref={sectionRef} aria-label="Northline Roofing associations and certifications">
      <div className="associations-marquee-viewport">
        <div className="associations-marquee-rows">
        {associationRows.map((row, rowIndex) => (
          <div className={`associations-marquee-row associations-marquee-row-${rowIndex + 1}`} key={rowIndex}>
            <div className="associations-marquee-track">
              {renderGroup(row, false)}
              {renderGroup(row, true)}
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  )
}

export function PremiumFooter({ onBook }: BookHandler) {
  return (
    <footer className="premium-footer" id="contact">
      <div className="premium-footer-matte" aria-hidden="true"><img className="premium-footer-back" src="/assets/footer/footer-roofscape-backdrop.png" alt="" /><img className="premium-footer-front" src="/assets/footer/footer-eaves-foreground.png" alt="" /></div>
      <div className="premium-footer-content premium-shell">
        <div className="premium-footer-primary">
          <div className="premium-footer-brand" data-premium-reveal>
            <div className="premium-footer-brand-plaque">
              <img className="premium-footer-brand-frame" src="/assets/footer/brand-plaque.png" alt="" aria-hidden="true" />
              <div className="premium-footer-brand-surface"><img src="/assets/brand/combination-mark.svg" alt="Northline Roofing" /></div>
            </div>
            <div className="premium-footer-contact">
              <a href="tel:+15555555555"><span>Call</span><strong>(555) 555-5555</strong><i aria-hidden="true">↗</i></a>
              <a href="mailto:hello@northlineroofing.com"><span>Email</span><strong>hello@northlineroofing.com</strong><i aria-hidden="true">↗</i></a>
            </div>
            <button className="premium-footer-book" type="button" onClick={onBook}><CalendarDays aria-hidden="true" /><span>Book an Appointment</span><ArrowRight aria-hidden="true" /></button>
          </div>

          <section className="premium-footer-map" id="location" aria-labelledby="premium-footer-map-title" data-premium-reveal>
            <div className="premium-footer-map-heading">
              <span id="premium-footer-map-title">Main Office</span>
              <a href={siteConfig.location.mapsUrl} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
            </div>
            <div className="premium-footer-map-frame">
              <img src="/assets/footer/map-frame.png" alt="" aria-hidden="true" />
              <iframe src={siteConfig.location.embedUrl} title={`Google Map showing ${siteConfig.location.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          </section>
        </div>

        <div className="premium-footer-utility">
          <nav aria-label="Footer navigation"><a href="#services">Services</a><a href="#work">Gallery</a><a href="#protection">Protection</a><a href="#reviews">Reviews</a></nav>
          <div><span>Mon–Fri / 8am–6pm</span><a href="#top">Back to top ↑</a></div>
        </div>
      </div>
    </footer>
  )
}

export function CustomerServiceHologram({ onBook, hidden }: BookHandler & { hidden: boolean }) {
  const hologramRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [hovered, setHovered] = useState(false)
  const documentVisible = useDocumentVisibility()
  const rawId = useId()
  const id = rawId.replace(/:/g, '')
  const rippleAId = `${id}-ripple-a`
  const rippleBId = `${id}-ripple-b`
  const skewAId = `${id}-skew-a`
  const skewBId = `${id}-skew-b`
  const skewMaskId = `${id}-skew-mask`
  const rippleMaskId = `${id}-ripple-mask`
  const skewGradientId = `${id}-skew-gradient`
  const rippleGradientId = `${id}-ripple-gradient`
  const rippleOffsetARef = useRef<SVGFEOffsetElement>(null)
  const rippleOffsetBRef = useRef<SVGFEOffsetElement>(null)
  const rippleAlphaARef = useRef<SVGFEFuncAElement>(null)
  const rippleAlphaBRef = useRef<SVGFEFuncAElement>(null)
  const hologramAlphaRef = useRef<Uint8ClampedArray | null>(null)

  useEffect(() => {
    const image = new Image()
    image.src = '/assets/customer%20service/customer_service_hologram_full.png'
    const canvas = document.createElement('canvas')
    canvas.width = 720
    canvas.height = 1626
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return

    const loadAlpha = () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      hologramAlphaRef.current = context.getImageData(0, 0, canvas.width, canvas.height).data
    }
    image.addEventListener('load', loadAlpha)
    if (image.complete) loadAlpha()
    return () => image.removeEventListener('load', loadAlpha)
  }, [])

  useEffect(() => {
    const reviews = document.getElementById('reviews')
    const gallery = document.getElementById('work')
    if (!reviews && !gallery) return
    if (!('IntersectionObserver' in window)) {
      setActive(true)
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        setActive(entry.target === gallery ? false : true)
      })
    }, { threshold: .35 })
    if (reviews) observer.observe(reviews)
    if (gallery) observer.observe(gallery)
    return () => observer.disconnect()
  }, [])

  const showEffect = active && !hidden

  useEffect(() => {
    if (!showEffect || !documentVisible) return

    const period = 4200
    const startTime = performance.now()
    let frame = 0

    const rippleAlpha = (phase: number) => {
      if (phase < .42) return 0
      if (phase < .5) return (phase - .42) / .08
      if (phase < .92) return 1
      return 1 - (phase - .92) / .08
    }

    const tick = (timestamp: number) => {
      const phaseA = ((timestamp - startTime) % period) / period
      const phaseB = (phaseA + .5) % 1
      rippleOffsetARef.current?.setAttribute('dy', String(-180 + 360 * phaseA))
      rippleOffsetBRef.current?.setAttribute('dy', String(-180 + 360 * phaseB))
      rippleAlphaARef.current?.setAttribute('slope', String(rippleAlpha(phaseA)))
      rippleAlphaBRef.current?.setAttribute('slope', String(rippleAlpha(phaseB)))
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [documentVisible, showEffect])

  const updateHoverFromCoordinates = (clientX: number, clientY: number) => {
    const alpha = hologramAlphaRef.current
    const bounds = hologramRef.current?.getBoundingClientRect()
    if (!alpha || !bounds) return
    const x = Math.min(719, Math.max(0, Math.floor(((clientX - bounds.left) / bounds.width) * 720)))
    const y = Math.min(1625, Math.max(0, Math.floor(((clientY - bounds.top) / bounds.height) * 1626)))
    setHovered(alpha[(y * 720 + x) * 4 + 3] > 12)
  }

  const updateHoverFromPointer = (event: ReactPointerEvent<SVGSVGElement | HTMLButtonElement>) => {
    updateHoverFromCoordinates(event.clientX, event.clientY)
  }

  return (
    <div
      ref={hologramRef}
      className={`customer-service-hologram${showEffect ? ' is-active' : ''}${hidden ? ' is-obscured' : ''}${hovered ? ' is-hovered' : ''}`}
      aria-hidden={!showEffect}
    >
      <img className="customer-service-hologram-puck" src="/assets/customer service/customer_service_hologram_puck.png" alt="" aria-hidden="true" />
      <span className="customer-service-hologram-reveal" aria-hidden="true">
        <img src="/assets/customer service/customer_service_hologram_full.png" alt="" />
        <svg className="customer-service-hologram-effects" viewBox="0 0 720 1626" preserveAspectRatio="xMidYMid meet" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true">
        <defs>
          <linearGradient id={skewGradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1626">
            <stop offset="0%" stopColor="#fff" stopOpacity=".12" /><stop offset="15%" stopColor="#fff" stopOpacity=".12" /><stop offset="27%" stopColor="#fff" stopOpacity=".24" /><stop offset="35%" stopColor="#fff" stopOpacity=".52" /><stop offset="43%" stopColor="#fff" /><stop offset="72%" stopColor="#fff" /><stop offset="82%" stopColor="#fff" stopOpacity=".62" /><stop offset="90%" stopColor="#fff" stopOpacity="0" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={rippleGradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1626">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" /><stop offset="22%" stopColor="#fff" stopOpacity="0" /><stop offset="27%" stopColor="#fff" stopOpacity=".3" /><stop offset="34%" stopColor="#fff" /><stop offset="70%" stopColor="#fff" /><stop offset="79%" stopColor="#fff" stopOpacity=".68" /><stop offset="89%" stopColor="#fff" stopOpacity="0" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={skewMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="1626" mask-type="luminance"><rect width="720" height="1626" fill={`url(#${skewGradientId})`} /></mask>
          <mask id={rippleMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="720" height="1626" mask-type="luminance"><rect width="720" height="1626" fill={`url(#${rippleGradientId})`} /></mask>
          <filter id={rippleAId} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="-58" y="-66" width="836" height="1758" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .055" numOctaves="1" seed="7" result="ripple-noise" />
            <feTile in="ripple-noise" result="tiled-ripple" />
            <feOffset ref={rippleOffsetARef} in="tiled-ripple" dy="-180" result="moving-ripple"><animate attributeName="dy" from="-180" to="180" dur="4.2s" calcMode="linear" repeatCount="indefinite" /></feOffset>
            <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="outer-edge" />
            <feMorphology in="SourceAlpha" operator="erode" radius="9" result="inner-edge" />
            <feComposite in="outer-edge" in2="inner-edge" operator="out" result="edge-band" />
            <feFlood x="122" y="797" width="79" height="114" floodColor="#fff" result="armpit-exclusion" />
            <feComposite in="edge-band" in2="armpit-exclusion" operator="out" result="clean-edge-band" />
            <feDisplacementMap in="SourceGraphic" in2="moving-ripple" scale="12" xChannelSelector="R" yChannelSelector="B" result="distorted-hologram" />
            <feComposite in="distorted-hologram" in2="clean-edge-band" operator="in" result="ripple-output" />
            <feComponentTransfer in="ripple-output">
              <feFuncA ref={rippleAlphaARef} type="linear" slope="0"><animate attributeName="slope" values="0;0;1;1;0" keyTimes="0;.42;.5;.92;1" dur="4.2s" calcMode="linear" repeatCount="indefinite" /></feFuncA>
            </feComponentTransfer>
          </filter>
          <filter id={rippleBId} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="-58" y="-66" width="836" height="1758" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .055" numOctaves="1" seed="7" result="ripple-noise" />
            <feTile in="ripple-noise" result="tiled-ripple" />
            <feOffset ref={rippleOffsetBRef} in="tiled-ripple" dy="-180" result="moving-ripple"><animate attributeName="dy" from="-180" to="180" dur="4.2s" begin="-2.1s" calcMode="linear" repeatCount="indefinite" /></feOffset>
            <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="outer-edge" />
            <feMorphology in="SourceAlpha" operator="erode" radius="9" result="inner-edge" />
            <feComposite in="outer-edge" in2="inner-edge" operator="out" result="edge-band" />
            <feFlood x="122" y="797" width="79" height="114" floodColor="#fff" result="armpit-exclusion" />
            <feComposite in="edge-band" in2="armpit-exclusion" operator="out" result="clean-edge-band" />
            <feDisplacementMap in="SourceGraphic" in2="moving-ripple" scale="12" xChannelSelector="R" yChannelSelector="B" result="distorted-hologram" />
            <feComposite in="distorted-hologram" in2="clean-edge-band" operator="in" result="ripple-output" />
            <feComponentTransfer in="ripple-output">
              <feFuncA ref={rippleAlphaBRef} type="linear" slope="0"><animate attributeName="slope" values="0;0;1;1;0" keyTimes="0;.42;.5;.92;1" dur="4.2s" begin="-2.1s" calcMode="linear" repeatCount="indefinite" /></feFuncA>
            </feComponentTransfer>
          </filter>
          <filter id={skewAId} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="-58" y="-66" width="836" height="1758" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".045 .012" numOctaves="1" seed="11" result="skew-noise" />
            <feTile in="skew-noise" result="tiled-skew" />
            <feOffset in="tiled-skew" dy="0" result="moving-skew" />
            <feDisplacementMap in="SourceGraphic" in2="moving-skew" scale="13" xChannelSelector="R" yChannelSelector="G" result="skewed-hologram" />
            <feFlood x="122" y="797" width="79" height="114" floodColor="#fff" result="armpit-exclusion" />
            <feComposite in="skewed-hologram" in2="armpit-exclusion" operator="out" result="clean-skew" />
            <feFlood x="209" y="114" width="310" height="407" floodColor="#fff" result="face-exclusion" />
            <feComposite in="clean-skew" in2="face-exclusion" operator="out" />
          </filter>
          <filter id={skewBId} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="-58" y="-66" width="836" height="1758" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".045 .012" numOctaves="1" seed="11" result="skew-noise" />
            <feTile in="skew-noise" result="tiled-skew" />
            <feOffset in="tiled-skew" dy="0" result="moving-skew" />
            <feDisplacementMap in="SourceGraphic" in2="moving-skew" scale="13" xChannelSelector="R" yChannelSelector="G" result="skewed-hologram" />
            <feFlood x="122" y="797" width="79" height="114" floodColor="#fff" result="armpit-exclusion" />
            <feComposite in="skewed-hologram" in2="armpit-exclusion" operator="out" result="clean-skew" />
            <feFlood x="209" y="114" width="310" height="407" floodColor="#fff" result="face-exclusion" />
            <feComposite in="clean-skew" in2="face-exclusion" operator="out" />
          </filter>
        </defs>
          <g className="customer-service-hologram-skew customer-service-hologram-skew-a" filter={`url(#${skewAId})`} mask={`url(#${skewMaskId})`}><image x="0" y="0" width="720" height="1626" href="/assets/customer%20service/customer_service_hologram_full.png" xlinkHref="/assets/customer%20service/customer_service_hologram_full.png" preserveAspectRatio="xMidYMid meet" /></g>
          <g className="customer-service-hologram-skew customer-service-hologram-skew-b" filter={`url(#${skewBId})`} mask={`url(#${skewMaskId})`}><image x="0" y="0" width="720" height="1626" href="/assets/customer%20service/customer_service_hologram_full.png" xlinkHref="/assets/customer%20service/customer_service_hologram_full.png" preserveAspectRatio="xMidYMid meet" /></g>
          <g className="customer-service-hologram-distortion customer-service-hologram-distortion-a" filter={`url(#${rippleAId})`} mask={`url(#${rippleMaskId})`}><image x="0" y="0" width="720" height="1626" href="/assets/customer%20service/customer_service_hologram_full.png" xlinkHref="/assets/customer%20service/customer_service_hologram_full.png" preserveAspectRatio="xMidYMid meet" /></g>
          <g className="customer-service-hologram-distortion customer-service-hologram-distortion-b" filter={`url(#${rippleBId})`} mask={`url(#${rippleMaskId})`}><image x="0" y="0" width="720" height="1626" href="/assets/customer%20service/customer_service_hologram_full.png" xlinkHref="/assets/customer%20service/customer_service_hologram_full.png" preserveAspectRatio="xMidYMid meet" /></g>
        </svg>
      </span>
      <svg
        className="customer-service-hologram-hover-target"
        viewBox="0 0 720 1626"
        preserveAspectRatio="xMidYMid meet"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        pointerEvents="auto"
        aria-hidden="true"
        onPointerEnter={updateHoverFromPointer}
        onPointerMove={updateHoverFromPointer}
        onPointerLeave={() => setHovered(false)}
        onPointerCancel={() => setHovered(false)}
      >
        <rect width="720" height="1626" fill="transparent" />
      </svg>
      <button
        className="customer-service-hologram-hit"
        type="button"
        onClick={onBook}
        aria-label="Talk to customer service"
        tabIndex={showEffect ? 0 : -1}
        onPointerEnter={updateHoverFromPointer}
        onPointerMove={updateHoverFromPointer}
        onPointerLeave={() => setHovered(false)}
        onPointerCancel={() => setHovered(false)}
      />
    </div>
  )
}
