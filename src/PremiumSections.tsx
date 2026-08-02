import { useEffect, useId, useState, type CSSProperties } from 'react'

type BookHandler = { onBook: () => void }

const underlaymentImage = '/assets/protection/protection-underlayment.png'

const reviews = [
  {
    name: 'Kaia Nimbus',
    role: 'Lakeside homeowner',
    quote: 'The storm rolled across the lake before dawn. Northline had us dry, safe, and fully documented before lunch—and the new slate looks extraordinary.',
    portrait: '/assets/reviews/reviewer-kaia-nimbus.webp',
    googlePlace: 'Nimbus Reach',
    googleUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Garden%2C%2026%20Gandalf%27s%20Cutting%2C%20Waikato%203472%2C%20New%20Zealand',
  },
  {
    name: 'Vesper Loom',
    role: 'Architect & property owner',
    quote: 'They found the ventilation problem everyone else missed, showed me every layer, and left the copper transitions cleaner than the original drawings.',
    portrait: '/assets/reviews/reviewer-vesper-loom.webp',
    googlePlace: 'Coppervale District',
    googleUrl: 'https://www.google.com/maps/search/?api=1&query=Green%20Dragon%20Inn%2C%20Hobbiton%20Movie%20Set%2C%20Waikato%2C%20New%20Zealand',
  },
  {
    name: 'Bram Hearthstone',
    role: 'Mountain innkeeper',
    quote: 'Our roof has twelve valleys and not one simple line. The crew treated every seam like finish carpentry and left the grounds immaculate.',
    portrait: '/assets/reviews/reviewer-bram-hearthstone.webp',
    googlePlace: 'Hearthstone Basin',
    googleUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Shire%27s%20Rest%2C%20501%20Buckland%20Road%2C%20Hinuera%2C%20Matamata%203472%2C%20New%20Zealand',
  },
] as const

const serviceLocation = {
  name: 'The Garden',
  label: 'Northline field coordinate 04–211',
  address: "26 Gandalf's Cutting, Waikato 3472, New Zealand",
  note: 'A tucked-away field coordinate inside the rolling landscape of Hobbiton country.',
  embedUrl: 'https://www.google.com/maps?q=The%20Garden%2C%2026%20Gandalf%27s%20Cutting%2C%20Waikato%203472%2C%20New%20Zealand&t=k&z=18&output=embed',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Garden%2C%2026%20Gandalf%27s%20Cutting%2C%20Waikato%203472%2C%20New%20Zealand',
}

const ctaContexts = [
  { section: 'top', eyebrow: 'Free roof inspection', label: 'Schedule an inspection' },
  { section: 'services', eyebrow: 'Need a recommendation?', label: 'Choose my roof system' },
  { section: 'work', eyebrow: 'Found the roof you want?', label: 'Price this roof' },
  { section: 'protection', eyebrow: 'Concerned about hidden layers?', label: 'Inspect my roof' },
  { section: 'reviews', eyebrow: 'Ready for the same care?', label: 'Schedule an inspection' },
  { section: 'support', eyebrow: 'Meet face to face', label: 'Book a hologram call' },
  { section: 'location', eyebrow: 'Inside the service area?', label: 'Check availability' },
  { section: 'contact', eyebrow: 'Start with certainty', label: 'Schedule an inspection' },
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

function PremiumSectionHeading({ kicker, title, copy, id }: { kicker: string; title: string; copy: string; id: string }) {
  return (
    <div className="premium-section-heading" data-premium-reveal>
      <p className="premium-kicker">{kicker}</p>
      <h2 id={id}>{title}</h2>
      <p>{copy}</p>
    </div>
  )
}

function HowWeProtectSection({ onBook }: BookHandler) {
  const [split, setSplit] = useState(54)
  const titleId = useId()

  return (
    <section className="premium-protection premium-shell" id="protection" aria-labelledby={titleId}>
      <PremiumSectionHeading
        kicker="System anatomy / underlayment"
        title="The roof beneath your roof."
        copy="Drag across the finished surface to expose the continuous underlayment assembly in the exact same position—the protection that starts working before the first visible piece is installed."
        id={titleId}
      />
      <div className="premium-protection-console" data-premium-reveal>
        <div className="premium-console-rail" aria-hidden="true"><span>Underlayment reveal</span><span>Northline deck-to-finish spec / 04–211</span></div>
        <div className="premium-protection-stage" style={{ '--premium-split': `${split}%` } as CSSProperties}>
          <img className="premium-protection-image" src="/assets/protection/protection-finished-roof.jpg" alt="A completed premium slate and copper roof" />
          <img className="premium-protection-image premium-protection-layer" src={underlaymentImage} alt="The same roof with its underlayment construction exposed" />
          <span className="premium-stage-label premium-stage-label-finished">Finished roof</span>
          <span className="premium-stage-label premium-stage-label-layer">Underlayment</span>
          <div className="premium-protection-divider" aria-hidden="true"><span><i /><i /><i /></span></div>
          <input
            className="premium-protection-range"
            type="range"
            min="8"
            max="92"
            value={split}
            onInput={(event) => setSplit(Number(event.currentTarget.value))}
            aria-label="Reveal underlayment"
            aria-valuetext={`${split}% finished roof, ${100 - split}% underlayment`}
          />
        </div>
        <div className="premium-underlayment-story">
          <div className="premium-underlayment-specs" aria-label="Underlayment specification">
            <div><span>01</span><strong>Continuous coverage</strong><small>One uninterrupted water-shedding plane across the deck.</small></div>
            <div><span>02</span><strong>Sealed transitions</strong><small>Careful laps and penetrations keep vulnerable seams controlled.</small></div>
            <div><span>03</span><strong>Dry-in confidence</strong><small>The structure is protected before the finish roof is complete.</small></div>
          </div>
          <div className="premium-protection-copy">
            <span>Northline / protected assembly</span>
            <h3>The quiet second roof beneath the roof.</h3>
            <p>Underlayment is the continuous safeguard between the deck and the finished system. It manages incidental water, protects during installation, and gives every visible material a disciplined foundation.</p>
            <button className="premium-text-link" type="button" onClick={onBook}>Inspect my roof <span>↗</span></button>
          </div>
        </div>
      </div>
    </section>
  )
}

function GoogleReviewsSection({ onBook }: BookHandler) {
  return (
    <section className="premium-reviews premium-shell" id="reviews" aria-labelledby="premium-reviews-title">
      <div className="premium-reviews-heading" data-premium-reveal>
        <div><p className="premium-kicker">Customer dispatches / Google places</p><h2 id="premium-reviews-title">Word travels fast above the roofline.</h2></div>
        <div className="premium-google-mark" aria-label="Reviews on Google"><img src="/assets/brand/google-g-logo.svg" alt="Google G" /><span>Reviews on Google</span></div>
      </div>
      <div className="premium-review-grid">
        {reviews.map((review, index) => (
          <article className="premium-review-card" data-premium-reveal key={review.name} style={{ '--premium-review-index': index } as CSSProperties}>
            <div className="premium-review-fasteners" aria-hidden="true"><i /><i /><i /><i /></div>
            <header><img src={review.portrait} alt={`${review.name}, ${review.role}`} /><div><h3>{review.name}</h3><p>{review.role}</p></div><span className="premium-review-rating" aria-label="Rated five out of five">5 / 5</span></header>
            <blockquote>“{review.quote}”</blockquote>
            <footer><a className="premium-review-google-link" href={review.googleUrl} target="_blank" rel="noreferrer" aria-label={`Open ${review.googlePlace} on Google Maps`}><span>{review.googlePlace}</span><img src="/assets/brand/google-g-logo.svg" alt="" aria-hidden="true" /></a></footer>
          </article>
        ))}
      </div>
      <div className="premium-reviews-action" data-premium-reveal>
        <button className="premium-button premium-button-primary" type="button" onClick={onBook}>Schedule an inspection <span>↗</span></button>
      </div>
    </section>
  )
}

function SupportConciergeSection({ onBook }: BookHandler) {
  return (
    <section className="premium-support premium-shell" id="support" aria-labelledby="premium-support-title">
      <div className="premium-support-console" data-premium-reveal>
        <div className="premium-support-art">
          <img src="/assets/support/support-hologram-concierge.webp" alt="A prismatic holographic Northline customer concierge inside a copper and steel diagnostic console" />
          <div className="premium-support-scanline" aria-hidden="true" />
          <div className="premium-support-status"><i /> Concierge channel open</div>
        </div>
        <div className="premium-support-copy">
          <p className="premium-kicker">Northline concierge / hologram desk</p>
          <h2 id="premium-support-title">Bring the roof into the room.</h2>
          <p>Set up a hologram call with a Northline specialist and walk us through what you are seeing—leaks, storm damage, aging materials, or the ambitious roof you have in mind. We will review it face to face and map the next sensible step.</p>
          <dl><div><dt>Connection window</dt><dd>One business day</dd></div><div><dt>First hologram</dt><dd>No charge</dd></div><div><dt>Fallback channel</dt><dd>Phone or email</dd></div></dl>
          <div className="premium-support-actions"><button className="premium-button premium-button-primary" type="button" onClick={onBook}>Set up a hologram call <span>↗</span></button><a className="premium-button premium-button-ghost" href="tel:+15555555555">Call instead</a></div>
        </div>
      </div>
    </section>
  )
}

function ServiceAreaMapSection({ onBook }: BookHandler) {
  return (
    <section className="premium-location premium-shell" id="location" aria-labelledby="premium-location-title">
      <div className="premium-location-plate" data-premium-reveal>
        <div className="premium-location-copy">
          <p className="premium-kicker">Service coordinates / real-world demo pin</p>
          <h2 id="premium-location-title">Somewhere worth finding.</h2>
          <p>{serviceLocation.note}</p>
          <div className="premium-location-address"><span>{serviceLocation.label}</span><strong>{serviceLocation.name}</strong><address>{serviceLocation.address}</address></div>
          <div className="premium-location-actions"><a className="premium-button premium-button-primary" href={serviceLocation.mapsUrl} target="_blank" rel="noreferrer">View in Google Maps <span>↗</span></a><button className="premium-text-link" type="button" onClick={onBook}>Check availability <span>↗</span></button></div>
        </div>
        <div className="premium-map-frame">
          <div className="premium-map-label"><span>Map field unit</span><span>04–211 / active</span></div>
          <iframe src={serviceLocation.embedUrl} title={`Google Map showing ${serviceLocation.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          <div className="premium-map-corner premium-map-corner-a" aria-hidden="true" /><div className="premium-map-corner premium-map-corner-b" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export function PremiumSections({ onBook }: BookHandler) {
  usePremiumReveal()
  return <div className="premium-sections"><HowWeProtectSection onBook={onBook} /><GoogleReviewsSection onBook={onBook} /><SupportConciergeSection onBook={onBook} /><ServiceAreaMapSection onBook={onBook} /></div>
}

export function PremiumFooter({ onBook }: BookHandler) {
  return (
    <footer className="premium-footer" id="contact">
      <div className="premium-footer-matte" aria-hidden="true"><img className="premium-footer-back" src="/assets/footer/footer-roofscape-backdrop.webp" alt="" /><img className="premium-footer-front" src="/assets/footer/footer-eaves-foreground.png" alt="" /></div>
      <div className="premium-footer-content premium-shell">
        <div className="premium-footer-lead" data-premium-reveal><img src="/assets/northline_roofing_combination_mark.svg" alt="Northline Roofing" /><h2>Build the roof people remember.</h2><button className="premium-button premium-button-primary" type="button" onClick={onBook}>Schedule an inspection <span>↗</span></button></div>
        <div className="premium-footer-grid">
          <div><span>Navigate</span><a href="#services">Services</a><a href="#work">Gallery</a><a href="#protection">Protection</a><a href="#reviews">Reviews</a></div>
          <div><span>Talk to us</span><a href="tel:+15555555555">(555) 555-5555</a><a href="mailto:hello@northlineroofing.com">hello@northlineroofing.com</a><a href="#location">Service coordinates</a></div>
          <div><span>Field office</span><p>Mon–Fri / 8am–6pm</p><p>Residential & commercial systems</p><a href="#top">Back to top ↑</a></div>
        </div>
        <div className="premium-footer-bottom"><span>Residential & commercial roofing systems</span><span>© {new Date().getFullYear()} Northline Roofing</span></div>
      </div>
    </footer>
  )
}

export function PersistentPremiumCta({ onBook, hidden }: BookHandler & { hidden: boolean }) {
  const [activeSection, setActiveSection] = useState('top')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    const sections = ctaContexts.map((item) => document.getElementById(item.section)).filter((node): node is HTMLElement => Boolean(node))
    const heroObserver = hero ? new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: .18 }) : null
    if (hero && heroObserver) heroObserver.observe(hero)
    const sectionObserver = new IntersectionObserver((entries) => {
      const candidate = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (candidate?.target.id) setActiveSection(candidate.target.id)
    }, { rootMargin: '-25% 0px -55%', threshold: [0, .2, .5, .8] })
    sections.forEach((section) => sectionObserver.observe(section))
    return () => { heroObserver?.disconnect(); sectionObserver.disconnect() }
  }, [])

  const context = ctaContexts.find((item) => item.section === activeSection) ?? ctaContexts[0]
  return (
    <button type="button" className={`premium-persistent-cta${visible && !hidden ? ' is-visible' : ''}`} onClick={onBook} aria-label={`${context.label}. ${context.eyebrow}`}>
      <span className="premium-persistent-icon" aria-hidden="true">⌂</span><span className="premium-persistent-copy" key={context.section}><small>{context.eyebrow}</small><strong>{context.label}</strong></span><span className="premium-persistent-arrow" aria-hidden="true">↗</span>
    </button>
  )
}
