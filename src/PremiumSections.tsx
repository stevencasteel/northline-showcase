import { useEffect, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { ArrowRight, CalendarDays } from 'lucide-react'

type BookHandler = { onBook: () => void }

const underlaymentImage = '/assets/source/protection-underlayment.png'

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

const serviceLocation = {
  name: 'The Garden',
  embedUrl: 'https://www.google.com/maps?q=The%20Garden%2C%2026%20Gandalf%27s%20Cutting%2C%20Waikato%203472%2C%20New%20Zealand&t=k&z=18&output=embed',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Garden%2C%2026%20Gandalf%27s%20Cutting%2C%20Waikato%203472%2C%20New%20Zealand',
}

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

function HowWeProtectSection(_: BookHandler) {
  const [split, setSplit] = useState(54)

  const setSplitFromPointer = (event: ReactPointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const nextSplit = ((event.clientX - bounds.left) / bounds.width) * 100
    setSplit(Math.min(100, Math.max(0, Number(nextSplit.toFixed(1)))))
  }

  const startSplitDrag = (event: ReactPointerEvent<HTMLInputElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setSplitFromPointer(event)
  }

  const continueSplitDrag = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) setSplitFromPointer(event)
  }

  return (
    <section className="premium-protection premium-shell" id="protection">
      <div className="premium-protection-console" data-premium-reveal>
        <div className="premium-protection-stage" style={{ '--premium-split': `${split}%` } as CSSProperties}>
          <img className="premium-protection-image" src="/assets/source/protection-finished-roof.jpg" alt="A completed premium slate and copper roof" />
          <img className="premium-protection-image premium-protection-layer" src={underlaymentImage} alt="The same roof with its underlayment construction exposed" />
          <div className="premium-protection-divider" aria-hidden="true">
            <span className="premium-protection-thumb">
              <i className="premium-protection-arrow premium-protection-arrow-left" />
              <i className="premium-protection-grip" />
              <i className="premium-protection-arrow premium-protection-arrow-right" />
            </span>
          </div>
          <input
            className="premium-protection-range"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={split}
            onInput={(event) => setSplit(Number(event.currentTarget.value))}
            onPointerDown={startSplitDrag}
            onPointerMove={continueSplitDrag}
            aria-label="Reveal underlayment"
            aria-valuetext={`${split}% finished roof, ${100 - split}% underlayment`}
          />
        </div>
      </div>
    </section>
  )
}

function GoogleReviewsSection(_: BookHandler) {
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

export function PremiumSections({ onBook }: BookHandler) {
  usePremiumReveal()
  return <div className="premium-sections"><HowWeProtectSection onBook={onBook} /><GoogleReviewsSection onBook={onBook} /></div>
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
              <a href={serviceLocation.mapsUrl} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
            </div>
            <div className="premium-footer-map-frame">
              <img src="/assets/footer/map-frame.png" alt="" aria-hidden="true" />
              <iframe src={serviceLocation.embedUrl} title={`Google Map showing ${serviceLocation.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
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

  useEffect(() => {
    let frame = 0
    let previousScrollY = window.scrollY
    const update = () => {
      frame = 0
      const scrollY = window.scrollY
      const scrollingUp = scrollY < previousScrollY
      previousScrollY = scrollY

      if (scrollY <= 1) {
        setActive(false)
        return
      }

      const gallery = document.getElementById('work')
      if (scrollingUp && gallery) {
        const bounds = gallery.getBoundingClientRect()
        const visibleHeight = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0))
        const fullyVisibleHeight = Math.min(bounds.height, window.innerHeight)
        if (fullyVisibleHeight > 0 && visibleHeight / fullyVisibleHeight >= .98) {
          setActive(false)
          return
        }
      }

      const reviews = document.getElementById('reviews')
      if (reviews && reviews.getBoundingClientRect().top <= window.innerHeight / 2) setActive(true)
    }
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <button
      type="button"
      className={`customer-service-hologram${active ? ' is-active' : ''}${hidden ? ' is-obscured' : ''}`}
      onClick={onBook}
      aria-label="Talk to customer service"
      aria-hidden={!active || hidden}
      tabIndex={active && !hidden ? 0 : -1}
    >
      <img className="customer-service-hologram-puck" src="/assets/customer service/customer_service_hologram_puck.png" alt="" aria-hidden="true" />
      <span className="customer-service-hologram-reveal" aria-hidden="true">
        <img src="/assets/customer service/customer_service_hologram_full.png" alt="" />
        <img className="customer-service-hologram-distortion customer-service-hologram-distortion-a" src="/assets/customer service/customer_service_hologram_full.png" alt="" />
        <img className="customer-service-hologram-distortion customer-service-hologram-distortion-b" src="/assets/customer service/customer_service_hologram_full.png" alt="" />
      </span>
      <svg className="customer-service-hologram-filter" aria-hidden="true">
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
            <feComposite in="distorted-hologram" in2="clean-edge-band" operator="in" />
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
            <feComposite in="distorted-hologram" in2="clean-edge-band" operator="in" />
          </filter>
        </defs>
      </svg>
    </button>
  )
}
