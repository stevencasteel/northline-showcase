import { useEffect, useRef, useState, type CSSProperties, type FormEvent as ReactFormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { useDocumentVisibility } from './hooks/useDocumentVisibility'
import { siteConfig } from './config/site'

type BookHandler = { onBook: () => void }

const underlaymentImage = '/assets/source/protection-underlayment.png'
const protectionSphereImage = '/assets/ui/copper-sphere-etched-large-generated.png'
const protectionSphereLeftImage = '/assets/ui/copper-sphere-etched-large-hover-left.png'
const protectionSphereRightImage = '/assets/ui/copper-sphere-etched-large-hover-right.png'
const protectionHoverTransitionMs = 240

type ProtectionDragDirection = 'left' | 'right' | null

const clampProtectionSplit = (value: number) => Math.min(100, Math.max(0, Number(value.toFixed(1))))

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

    isDragging.current = true
    previousSplit.current = split
    setDragIndicatorVisible(false)
    setPointerFocusActive(true)

    event.currentTarget.focus({ preventScroll: true })

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a robustness enhancement, not a reason to abort.
    }

    updateSplitFromClientX(event.currentTarget, event.clientX)
  }

  const handleSplitInput = (event: ReactFormEvent<HTMLInputElement>) => {
    if (isDragging.current) return

    const nextSplit = clampProtectionSplit(Number(event.currentTarget.value))
    previousSplit.current = nextSplit
    setSplit(nextSplit)
  }

  const moveSplitDrag = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (!isDragging.current) return
    updateSplitFromClientX(event.currentTarget, event.clientX)
  }

  const finishSplitDrag = () => {
    if (!isDragging.current) return

    isDragging.current = false
    setDragIndicatorVisible(false)

    if (releaseTimeout.current !== null) window.clearTimeout(releaseTimeout.current)
    releaseTimeout.current = window.setTimeout(() => {
      setDragDirection(null)
      releaseTimeout.current = null
    }, protectionHoverTransitionMs)
  }

  const endSplitDrag = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (!isDragging.current) return

    updateSplitFromClientX(event.currentTarget, event.clientX)
    finishSplitDrag()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <section className="premium-protection premium-shell" id="protection">
      <div className="premium-protection-console" data-premium-reveal>
        <div
          className="premium-protection-stage"
          data-drag-direction={dragDirection ?? undefined}
          data-drag-indicator={dragIndicatorVisible && dragDirection ? 'visible' : undefined}
          data-pointer-focus={pointerFocusActive ? 'true' : undefined}
          style={{ '--premium-split': `${split}%` } as CSSProperties}
        >
          <img className="premium-protection-image" src="/assets/source/protection-finished-roof.jpg" alt="A completed premium slate and copper roof" />
          <img className="premium-protection-image premium-protection-layer" src={underlaymentImage} alt="The same roof with its underlayment construction exposed" />
          <div className="premium-protection-divider" aria-hidden="true">
            <span className="premium-protection-thumb">
              <span className="premium-protection-thumb-surface">
                <img className="premium-protection-sphere premium-protection-sphere-default" src={protectionSphereImage} alt="" aria-hidden="true" />
                <img className="premium-protection-sphere premium-protection-sphere-left" src={protectionSphereLeftImage} alt="" aria-hidden="true" />
                <img className="premium-protection-sphere premium-protection-sphere-right" src={protectionSphereRightImage} alt="" aria-hidden="true" />
              </span>
            </span>
          </div>
          <input
            className="premium-protection-range"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={split}
            onInput={handleSplitInput}
            onPointerDown={startSplitDrag}
            onPointerMove={moveSplitDrag}
            onPointerUp={endSplitDrag}
            onPointerCancel={endSplitDrag}
            onLostPointerCapture={finishSplitDrag}
            onBlur={() => {
              if (document.hasFocus()) setPointerFocusActive(false)
            }}
            aria-label="Reveal underlayment"
            aria-valuetext={`${split}% finished roof, ${100 - split}% underlayment`}
          />
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
              <span id="premium-footer-map-title">Service area</span>
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
  const [active, setActive] = useState(false)
  const documentVisible = useDocumentVisibility()

  useEffect(() => {
    const reviews = document.getElementById('reviews')
    const gallery = document.getElementById('work')
    if (!reviews && !gallery) return
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

  return (
    <div
      className={`customer-service-hologram${showEffect ? ' is-active' : ''}${hidden ? ' is-obscured' : ''}`}
      aria-hidden={!showEffect}
    >
      <img className="customer-service-hologram-puck" src="/assets/customer service/customer_service_hologram_puck.png" alt="" aria-hidden="true" />
      <span className="customer-service-hologram-reveal" aria-hidden="true">
        <img src="/assets/customer service/customer_service_hologram_full.png" alt="" />
        <img className="customer-service-hologram-skew customer-service-hologram-skew-a" src="/assets/customer service/customer_service_hologram_full.png" alt="" />
        <img className="customer-service-hologram-skew customer-service-hologram-skew-b" src="/assets/customer service/customer_service_hologram_full.png" alt="" />
        <img className="customer-service-hologram-distortion customer-service-hologram-distortion-a" src="/assets/customer service/customer_service_hologram_full.png" alt="" />
        <img className="customer-service-hologram-distortion customer-service-hologram-distortion-b" src="/assets/customer service/customer_service_hologram_full.png" alt="" />
      </span>
      {showEffect && documentVisible && <svg className="customer-service-hologram-filter" aria-hidden="true">
        <defs>
          <filter id="customer-service-hologram-ripple-a" x="-8%" y="-4%" width="116%" height="108%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .055" numOctaves="1" seed="7" result="ripple-noise" />
            <feTile in="ripple-noise" result="tiled-ripple" />
            <feOffset in="tiled-ripple" dy="-180" result="moving-ripple">
              <animate attributeName="dy" from="-180" to="180" dur="4.2s" calcMode="linear" repeatCount="indefinite" />
            </feOffset>
            <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="outer-edge" />
            <feMorphology in="SourceAlpha" operator="erode" radius="9" result="inner-edge" />
            <feComposite in="outer-edge" in2="inner-edge" operator="out" result="edge-band" />
            <feFlood x="17%" y="49%" width="11%" height="7%" floodColor="#fff" result="armpit-exclusion" />
            <feComposite in="edge-band" in2="armpit-exclusion" operator="out" result="clean-edge-band" />
            <feDisplacementMap in="SourceGraphic" in2="moving-ripple" scale="12" xChannelSelector="R" yChannelSelector="B" result="distorted-hologram" />
            <feComposite in="distorted-hologram" in2="clean-edge-band" operator="in" result="ripple-output" />
            <feComponentTransfer in="ripple-output">
              <feFuncA type="linear" slope="0">
                <animate attributeName="slope" values="0;0;1;1;0" keyTimes="0;.42;.5;.92;1" dur="4.2s" calcMode="linear" repeatCount="indefinite" />
              </feFuncA>
            </feComponentTransfer>
          </filter>
          <filter id="customer-service-hologram-ripple-b" x="-8%" y="-4%" width="116%" height="108%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .055" numOctaves="1" seed="7" result="ripple-noise" />
            <feTile in="ripple-noise" result="tiled-ripple" />
            <feOffset in="tiled-ripple" dy="-180" result="moving-ripple">
              <animate attributeName="dy" from="-180" to="180" dur="4.2s" begin="-2.1s" calcMode="linear" repeatCount="indefinite" />
            </feOffset>
            <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="outer-edge" />
            <feMorphology in="SourceAlpha" operator="erode" radius="9" result="inner-edge" />
            <feComposite in="outer-edge" in2="inner-edge" operator="out" result="edge-band" />
            <feFlood x="17%" y="49%" width="11%" height="7%" floodColor="#fff" result="armpit-exclusion" />
            <feComposite in="edge-band" in2="armpit-exclusion" operator="out" result="clean-edge-band" />
            <feDisplacementMap in="SourceGraphic" in2="moving-ripple" scale="12" xChannelSelector="R" yChannelSelector="B" result="distorted-hologram" />
            <feComposite in="distorted-hologram" in2="clean-edge-band" operator="in" result="ripple-output" />
            <feComponentTransfer in="ripple-output">
              <feFuncA type="linear" slope="0">
                <animate attributeName="slope" values="0;0;1;1;0" keyTimes="0;.42;.5;.92;1" dur="4.2s" begin="-2.1s" calcMode="linear" repeatCount="indefinite" />
              </feFuncA>
            </feComponentTransfer>
          </filter>
          <filter id="customer-service-hologram-skew-a" x="-8%" y="-4%" width="116%" height="108%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".045 .012" numOctaves="1" seed="11" result="skew-noise" />
            <feTile in="skew-noise" result="tiled-skew" />
            <feOffset in="tiled-skew" dy="0" result="moving-skew" />
            <feDisplacementMap in="SourceGraphic" in2="moving-skew" scale="13" xChannelSelector="R" yChannelSelector="G" result="skewed-hologram" />
            <feFlood x="17%" y="49%" width="11%" height="7%" floodColor="#fff" result="armpit-exclusion" />
            <feComposite in="skewed-hologram" in2="armpit-exclusion" operator="out" result="clean-skew" />
            <feFlood x="29%" y="7%" width="43%" height="25%" floodColor="#fff" result="face-exclusion" />
            <feComposite in="clean-skew" in2="face-exclusion" operator="out" />
          </filter>
          <filter id="customer-service-hologram-skew-b" x="-8%" y="-4%" width="116%" height="108%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".045 .012" numOctaves="1" seed="11" result="skew-noise" />
            <feTile in="skew-noise" result="tiled-skew" />
            <feOffset in="tiled-skew" dy="0" result="moving-skew" />
            <feDisplacementMap in="SourceGraphic" in2="moving-skew" scale="13" xChannelSelector="R" yChannelSelector="G" result="skewed-hologram" />
            <feFlood x="17%" y="49%" width="11%" height="7%" floodColor="#fff" result="armpit-exclusion" />
            <feComposite in="skewed-hologram" in2="armpit-exclusion" operator="out" result="clean-skew" />
            <feFlood x="29%" y="7%" width="43%" height="25%" floodColor="#fff" result="face-exclusion" />
            <feComposite in="clean-skew" in2="face-exclusion" operator="out" />
          </filter>
        </defs>
      </svg>}
      <button
        className="customer-service-hologram-hit"
        type="button"
        onClick={onBook}
        aria-label="Talk to customer service"
        tabIndex={showEffect ? 0 : -1}
      />
    </div>
  )
}
