import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Mail, MapPin, MessageSquare, Phone, Send, UserRound, X } from 'lucide-react'
import './styles.css'

const asset = '/assets/'

function AnimatedHeroLine({ text, accent = false }: { text: string; accent?: boolean }) {
  return <span className={`hero-line${accent ? ' hero-accent' : ''}`} style={{ '--line-delay': '.14s' } as React.CSSProperties} aria-hidden="true">{Array.from(text).map((character, index) => <span className="hero-char" style={{ '--char-index': index } as React.CSSProperties} key={`${character}-${index}`}>{character === ' ' ? '\u00a0' : character}</span>)}</span>
}

function isMobileDevice() {
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(navigator.userAgent)
  const touchDevice = navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches
  return mobileUserAgent || touchDevice
}

function Header({ onBookAppointment }: { onBookAppointment: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Northline Roofing home">
        <img className="brand-logo" src={`${asset}northline_roofing_combination_mark.svg`} alt="Northline Roofing combination logo: a geometric navy, cream, and burnt-orange N emblem beside NORTHLINE ROOFING and the subtitle RESIDENTIAL & COMMERCIAL SYSTEMS." />
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        <a href="#services">Services</a>
        <a href="#work">Gallery</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="header-phone" href="tel:+15555555555"><Phone size={17} strokeWidth={2.4} /> (555) 555-5555</a>
      <button className="header-quote" type="button" onClick={onBookAppointment}><CalendarDays aria-hidden="true" /> <span>Book an Appointment</span> <ArrowRight aria-hidden="true" /></button>
      <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">
        <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
        <a href="#work" onClick={() => setMenuOpen(false)}>Gallery</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
      </nav>}
    </header>
  )
}

function Hero({ onBookAppointment }: { onBookAppointment: () => void }) {
  const skyTrackRef = useRef<HTMLDivElement>(null)
  const skyImageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    let frame = 0
    let offset = 0
    let previousTime = performance.now()
    const speed = 13

    const animateSky = (time: number) => {
      const elapsed = time - previousTime
      previousTime = time
      const imageWidth = skyImageRef.current?.getBoundingClientRect().width ?? 0
      const viewportWidth = skyTrackRef.current?.parentElement?.getBoundingClientRect().width ?? 0
      const scrollDistance = imageWidth - viewportWidth
      if (scrollDistance > 0 && skyTrackRef.current) {
        offset = (offset + speed * elapsed / 1000) % scrollDistance
        skyTrackRef.current.style.transform = `translate3d(${-offset}px, 0, 0)`
      }
      frame = requestAnimationFrame(animateSky)
    }

    frame = requestAnimationFrame(animateSky)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="hero" id="top">
      <div className="hero-sky-track" ref={skyTrackRef} aria-hidden="true">
        <img className="hero-sky" ref={skyImageRef} src={`${asset}sec2_1_hero_sky.png`} alt="Bright blue sky with fluffy white cumulus clouds over distant mountain ranges, designed as a seamless background layer for the Northline Roofing hero image." />
      </div>
      <img className="hero-image" src={`${asset}sec2_1_hero.png`} alt="A wide panoramic image showing a human construction worker and a green-skinned orc installing tiles on the vast, intricate roof of a grand estate overlooking a pristine lake landscape. A middle-aged human with grey stubble leans forward on the right slope beside a muscular orc operating a bright orange power tool. The sweeping roof is clad in glossy bluish-green solar shingles with polished copper trim, arched dormers, and elegant finials; below, evergreen trees line a deep-blue bay toward distant mountains. The sky area is transparent so this foreground image can be paired with a separate sky layer." />
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">Northline Roofing</p>
        <h1 aria-label="Custom roofing since year 4-211."><AnimatedHeroLine text="Custom roofing" /><br /><AnimatedHeroLine text="since year 4-211." accent /></h1>
        <p className="hero-description">Complete roofing systems, exterior protection, and water<span className="desktop-break"><br /></span>management—installed by a local crew that sweats every detail.<span className="desktop-break"><br /></span> Clear pricing, exacting standards, and zero shortcuts.</p>
        <div className="hero-actions">
          <button className="button button-primary" type="button" onClick={onBookAppointment}><CalendarDays aria-hidden="true" /> <span>Book an Appointment</span> <ArrowRight aria-hidden="true" /></button>
          <a className="button button-call" href="tel:+15555555555"><Phone size={20} /> <span>(555) 555-5555</span></a>
        </div>
      </div>
    </section>
  )
}

type AppointmentSelectOption = { value: string; label: string }

function AppointmentSelect({ name, placeholder, value, options, invalid, onChange }: {
  name: string
  placeholder: string
  value: string
  options: AppointmentSelectOption[]
  invalid: boolean
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const fieldRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find((option) => option.value === value)?.label

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="appointment-custom-select" ref={fieldRef}>
      <input type="hidden" name={name} value={value} />
      <button
        className="appointment-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={() => setOpen(!open)}
      >
        <span>{selectedLabel ?? placeholder}</span>
        <span className="appointment-select-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="appointment-select-menu" role="listbox" aria-label={placeholder}>
          {options.map((option) => (
            <button
              className={value === option.value ? 'is-selected' : ''}
              type="button"
              role="option"
              aria-selected={value === option.value}
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const appointmentTimes: AppointmentSelectOption[] = [
  { value: 'morning', label: 'Morning · 8am–12pm' },
  { value: 'afternoon', label: 'Afternoon · 12pm–4pm' },
  { value: 'late-afternoon', label: 'Late afternoon · 4pm–6pm' },
]

const appointmentServices: AppointmentSelectOption[] = [
  { value: 'residential', label: 'Residential roofing system' },
  { value: 'commercial', label: 'Commercial roofing system' },
  { value: 'custom-metal', label: 'Custom metal fabrication' },
  { value: 'storm-inspection', label: 'Storm or weather damage inspection' },
  { value: 'repair', label: 'Roof repair and maintenance' },
]

function AppointmentModal({ onClose, mobileDevice }: { onClose: () => void; mobileDevice: boolean }) {
  const [submitted, setSubmitted] = useState(false)
  const [timePreference, setTimePreference] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [validationAttempted, setValidationAttempted] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleKeyDown) }
  }, [onClose])

  return (
    <div className="appointment-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="appointment-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-title">
        <header className="appointment-modal-header">
          <div>
            <p className="appointment-kicker">Northline Roofing</p>
            <h2 id="appointment-title">Book an Appointment</h2>
            <p>Free roof inspection — Mon–Fri, 8am–6pm</p>
          </div>
          <button className="modal-close" type="button" aria-label="Close appointment form" onClick={onClose}><X aria-hidden="true" /></button>
        </header>
        {submitted ? (
          <div className="appointment-success">
            <CheckCircle2 aria-hidden="true" />
            <h3>Request received.</h3>
            <p>A Northline specialist will call to confirm your appointment and learn more about your roof.</p>
            <button className="button button-primary" type="button" onClick={onClose}>Back to the site</button>
          </div>
        ) : (
          <form className="appointment-form" onSubmit={(event) => {
            event.preventDefault()
            if (mobileDevice && (!timePreference || !serviceType)) {
              setValidationAttempted(true)
              requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.appointment-select-trigger[aria-invalid="true"]')?.focus())
              return
            }
            setSubmitted(true)
          }}>
            <div className="form-grid form-grid-two form-grid-contact">
              <label><span>Full Name <b>*</b></span><div className="input-wrap"><UserRound aria-hidden="true" /><input required name="name" placeholder="Your full name" autoComplete="name" /></div></label>
              <label><span>Phone Number <b>*</b></span><div className="input-wrap"><Phone aria-hidden="true" /><input required name="phone" type="tel" placeholder="(555) 555-5555" autoComplete="tel" /></div></label>
            </div>
            <label><span>Email Address <b>*</b></span><div className="input-wrap"><Mail aria-hidden="true" /><input required name="email" type="email" placeholder="you@example.com" autoComplete="email" /></div></label>
            <label><span>Property Address</span><div className="input-wrap"><MapPin aria-hidden="true" /><input name="address" placeholder="Street address" autoComplete="street-address" /></div></label>
            <div className="form-grid form-grid-two form-grid-address">
              <label><span>City</span><input name="city" placeholder="Your city" autoComplete="address-level2" /></label>
              <label><span>Postal Code</span><input name="postal-code" placeholder="ZIP / postal code" autoComplete="postal-code" /></label>
            </div>
            <div className="form-grid form-grid-two form-grid-appointment">
              <label><span>Preferred Date <b>*</b></span><div className="input-wrap"><CalendarDays aria-hidden="true" /><input required name="date" type="date" /></div><small>Mon–Fri · 24hr advance notice</small></label>
              <label><span>Time Preference <b>*</b></span>{mobileDevice ? <AppointmentSelect name="time" placeholder="Select a time" value={timePreference} options={appointmentTimes} invalid={validationAttempted && !timePreference} onChange={setTimePreference} /> : <select required name="time"><option value="">Select a time</option><option>Morning · 8am–12pm</option><option>Afternoon · 12pm–4pm</option><option>Late afternoon · 4pm–6pm</option></select>}<small>We’ll call when we’re on the way</small></label>
            </div>
            <label><span>Service Type <b>*</b></span>{mobileDevice ? <AppointmentSelect name="service" placeholder="Select a service" value={serviceType} options={appointmentServices} invalid={validationAttempted && !serviceType} onChange={setServiceType} /> : <select required name="service"><option value="">Select a service</option><option>Residential roofing system</option><option>Commercial roofing system</option><option>Custom metal fabrication</option><option>Storm or weather damage inspection</option><option>Roof repair and maintenance</option></select>}</label>
            <label><span>Additional Notes</span><div className="input-wrap textarea-wrap"><MessageSquare aria-hidden="true" /><textarea name="notes" placeholder="Tell us about your roof or project..." onFocus={(event) => {
              const notesField = event.currentTarget
              window.setTimeout(() => notesField.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
            }} /></div></label>
            <button className="appointment-submit" type="submit"><Send aria-hidden="true" /> <span>Book My Free Appointment</span></button>
            <p className="appointment-footnote">Mon–Fri, 8am–6pm · We’ll call to confirm · No obligation</p>
          </form>
        )}
      </section>
    </div>
  )
}

function BadgeStrip() {
  return (
    <section className="badge-strip" id="about" aria-label="Northline Roofing qualifications">
      <div className="badge-sprite-canvas" aria-hidden="true">
        <div className="badge-slice badge-slice-one"><img src={`${asset}sec3_1_banner.png`} alt="" /></div>
        <div className="badge-slice badge-divider-one"><img src={`${asset}sec3_1_banner.png`} alt="" /></div>
        <div className="badge-slice badge-slice-two"><img src={`${asset}sec3_1_banner.png`} alt="" /></div>
        <div className="badge-slice badge-divider-two"><img src={`${asset}sec3_1_banner.png`} alt="" /></div>
        <div className="badge-slice badge-slice-three"><img src={`${asset}sec3_1_banner.png`} alt="" /></div>
        <div className="badge-slice badge-divider-three"><img src={`${asset}sec3_1_banner.png`} alt="" /></div>
        <div className="badge-slice badge-slice-four"><img src={`${asset}sec3_1_banner.png`} alt="" /></div>
      </div>
      <img className="badge-banner visually-hidden" src={`${asset}sec3_1_banner.png`} alt="Northline Roofing promotional banner divided into four sections by copper divider bars: a copper award medal with 300 YEARS EXPERIENCE; a copper palm tree with TROPICS LICENSED; a copper cityscape with RESIDENTIAL & COMMERCIAL; and a copper anvil and hammer with CUSTOM METAL FABRICATION." />
      <p className="visually-hidden">Northline Roofing qualifications: 300 years experience. Tropics licensed. Residential and commercial roofing. Custom metal fabrication.</p>
    </section>
  )
}

const services = [
  { title: 'Residential', image: 'service-residential-roofing.png', alt: 'In a bright, sunny coastal setting high above a deep blue ocean lined with palm trees and distant islands, a purple-skinned female elf construction worker stands on scaffolding to fit a dark-framed rectangular window into the curved beige stucco wall of a turret. Above her is an elaborate roof of teal-blue patinated standing-seam copper panels with a polished reddish-gold copper edge, alongside light-cream Spanish-style clay roof tiles.' , text: 'Complete roof systems designed for lasting protection and a clean, finished line.' },
  { title: 'Commercial', image: 'service-commercial-roofing.png', alt: 'Set atop a grand building framed with polished gold beams and a vast roof of deep red tiles, a diverse crew of fantastical creatures constructs and maintains the structure above a sprawling fantasy metropolis. The crew includes a golden-brown insectoid polishing gold trim, a pink axolotl-headed worker smoothing mortar, purple goblin-like workers arranging shingles, a brass robot welding, a small green lizard inspecting wiring, and a stone giant lifting roofing panels. A golden cupola crowns the building above extensive scaffolding, with colorful domes, ornate spires, and a harbor in the distance.' , text: 'Durable, carefully coordinated systems for commercial properties of every scale.' },
  { title: 'Custom Fabrication', image: 'service-custom-metal.png', alt: 'Inside a dimly lit open-air workshop blending traditional blacksmithing with futuristic technology, a sleek humanoid robot craftsman in a dark leather apron forges ornate copper architecture. The gold-visored robot swings a heavy hammer onto polished reddish copper embossed with raised scrollwork, while a completed copper tower finial rests nearby and an intense orange-gold forge burns beneath a metal hood. Through an open window, a sunny landscape shows a grand copper-roofed building, ornate spire, blue sky, and distant green hills.' , text: 'Hand-finished copperwork, flashing, trim, and architectural details built to order.' },
  { title: 'Repairs & Inspections', image: 'service-repairs-inspections.png', alt: 'In bright daylight under a cloud-dappled sky, a humanoid dragon and an alien construction worker inspect the steep roof of an old-fashioned building overlooking lush green mountains. The dragon has vivid cobalt-blue scales, pale-gold scales beneath his jaw, ram-like horns fitted through a yellow hard hat, and a dark-clawed hand resting on polished reddish-gold copper flashing. Beside him, a grey-purple alien with four glowing amber eyes reviews a clipboard. Weathered greenish-grey slate shingles, a tall roof spire, copper, and strong sunlight fill the scene.' , text: 'Clear assessments and dependable repairs before a small issue becomes a larger one.' },
]

function Services({ mobileDevice }: { mobileDevice: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [activeService, setActiveService] = useState<number | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.16 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section className={`services-section${visible ? ' is-visible' : ''}`} id="services" aria-labelledby="services-title" ref={sectionRef}>
      <div className="services-brutalist-heading">
        <p className="section-kicker" id="services-title">04 / Services</p>
      </div>
      <div className="services-slice-grid">
        {services.map((service, index) => (
          <a
            className={`service-slice${activeService === index ? ' is-active' : ''}`}
            href="#contact"
            key={service.title}
            aria-label={`${activeService === index ? 'Close' : 'Open'} ${service.title} service details`}
            aria-expanded={mobileDevice ? activeService === index : undefined}
            onClick={(event) => {
              if (!mobileDevice) return
              event.preventDefault()
              setActiveService(activeService === index ? null : index)
            }}
            style={{ '--service-index': index } as React.CSSProperties}
          >
            <img src={`${asset}${service.image}`} alt={service.alt} />
            <span className="service-slice-shade" />
            <span className="service-slice-number">0{index + 1}</span>
            <span className="service-slice-content">
              <strong>{service.title}</strong>
              <span>{service.text}</span>
              <ArrowUpRight aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

type GalleryImage = { file: string; alt: string }

// Keep the preview curated while the modal remains the complete gallery.
const galleryPreviewIndices = [0, 2, 7, 9, 13, 16]

function GalleryArrowButton({ direction, keyboardActive, pressCount, suppressHover, onActivate }: {
  direction: 'previous' | 'next'
  keyboardActive: boolean
  pressCount: number
  suppressHover: boolean
  onActivate: () => void
}) {
  const arrowRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<Animation | null>(null)
  const chargeFrameRef = useRef<number | null>(null)
  const hoveringRef = useRef(false)
  const pressedRef = useRef(false)
  const pressStartedRef = useRef(0)
  const keyboardStartedRef = useRef(0)
  const startShiftRef = useRef(0)
  const currentShiftRef = useRef(0)
  const [pointerPressed, setPointerPressed] = useState(false)
  const [shockwave, setShockwave] = useState(0)
  const travelOffset = direction === 'previous' ? -10 : 10
  const pullbackOffset = -travelOffset

  const readArrowShift = useCallback(() => {
    const arrow = arrowRef.current
    if (!arrow) return currentShiftRef.current
    try {
      const transform = getComputedStyle(arrow).transform
      if (transform && transform !== 'none') currentShiftRef.current = new DOMMatrixReadOnly(transform).m41
    } catch {
      // Keep the last known shift when a browser cannot expose the in-flight matrix.
    }
    return currentShiftRef.current
  }, [])

  const stopArrowMotion = useCallback(() => {
    animationRef.current?.cancel()
    animationRef.current = null
    if (chargeFrameRef.current) cancelAnimationFrame(chargeFrameRef.current)
    chargeFrameRef.current = null
  }, [])

  const setArrowShift = useCallback((shift: number) => {
    currentShiftRef.current = shift
    if (arrowRef.current) arrowRef.current.style.transform = `translate3d(${shift}px, 0, 0)`
  }, [])

  const springArrowTo = useCallback((target: number) => {
    const arrow = arrowRef.current
    if (!arrow) return
    const start = readArrowShift()
    stopArrowMotion()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setArrowShift(target)
      return
    }
    animationRef.current = arrow.animate([
      { transform: `translate3d(${start}px, 0, 0)`, offset: 0 },
      { transform: `translate3d(${target * 1.42}px, 0, 0)`, offset: .58 },
      { transform: `translate3d(${target * .88}px, 0, 0)`, offset: .82 },
      { transform: `translate3d(${target}px, 0, 0)`, offset: 1 },
    ], { duration: 360, easing: 'cubic-bezier(.2,.82,.25,1)' })
    animationRef.current.onfinish = () => {
      setArrowShift(target)
      animationRef.current = null
    }
  }, [readArrowShift, setArrowShift, stopArrowMotion])

  const releaseArrow = useCallback((held: boolean, keyboardHold = false) => {
    const arrow = arrowRef.current
    if (!arrow) return
    const start = readArrowShift()
    stopArrowMotion()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setArrowShift(0)
      return
    }
    const keyframes = keyboardHold && held
      ? [
          { transform: `translate3d(${start}px, 0, 0)`, offset: 0 },
          { transform: `translate3d(${travelOffset * .72}px, 0, 0)`, offset: .38 },
          { transform: `translate3d(${travelOffset * .22}px, 0, 0)`, offset: .76 },
          { transform: 'translate3d(0, 0, 0)', offset: 1 },
        ]
      : held
      ? [
          { transform: `translate3d(${start}px, 0, 0)`, offset: 0 },
          { transform: `translate3d(${pullbackOffset}px, 0, 0)`, offset: .12 },
          { transform: `translate3d(${travelOffset * 1.62}px, 0, 0)`, offset: .48 },
          { transform: `translate3d(${travelOffset * .74}px, 0, 0)`, offset: .68 },
          { transform: `translate3d(${travelOffset * 1.08}px, 0, 0)`, offset: .82 },
          { transform: 'translate3d(0, 0, 0)', offset: 1 },
        ]
      : [
          { transform: `translate3d(${start}px, 0, 0)`, offset: 0 },
          { transform: `translate3d(${pullbackOffset * .46}px, 0, 0)`, offset: .34 },
          { transform: `translate3d(${pullbackOffset * .08}px, 0, 0)`, offset: .76 },
          { transform: 'translate3d(0, 0, 0)', offset: 1 },
        ]
    animationRef.current = arrow.animate(keyframes, { duration: keyboardHold && held ? 360 : held ? 510 : 270, easing: keyboardHold && held ? 'cubic-bezier(.22,.8,.3,1)' : 'cubic-bezier(.2,.76,.22,1)' })
    animationRef.current.onfinish = () => {
      setArrowShift(0)
      animationRef.current = null
    }
  }, [pullbackOffset, readArrowShift, setArrowShift, stopArrowMotion, travelOffset])

  const releasePointer = useCallback(() => {
    if (!pressedRef.current) return
    const held = performance.now() - pressStartedRef.current >= 150
    pressedRef.current = false
    setPointerPressed(false)
    releaseArrow(held)
  }, [releaseArrow])

  useEffect(() => {
    if (keyboardActive) {
      keyboardStartedRef.current = performance.now()
      stopArrowMotion()
      setArrowShift(0)
      const started = performance.now()
      const detectKeyboardHold = (now: number) => {
        const elapsed = now - started
        if (elapsed < 100) chargeFrameRef.current = requestAnimationFrame(detectKeyboardHold)
        else springArrowTo(travelOffset)
      }
      chargeFrameRef.current = requestAnimationFrame(detectKeyboardHold)
      return
    }
    if (!pressedRef.current && keyboardStartedRef.current) {
      const held = performance.now() - keyboardStartedRef.current >= 100
      keyboardStartedRef.current = 0
      releaseArrow(held, true)
    } else if (!pressedRef.current) {
      springArrowTo(0)
    }
  }, [keyboardActive, pullbackOffset, readArrowShift, releaseArrow, setArrowShift, springArrowTo, stopArrowMotion, travelOffset])

  useEffect(() => {
    if (pressCount > 0 && keyboardActive) setShockwave((current) => current + 1)
  }, [keyboardActive, pressCount])

  useEffect(() => () => stopArrowMotion(), [stopArrowMotion])

  return (
    <button
      className={`gallery-modal-arrow gallery-modal-${direction}${keyboardActive ? ' is-key-active' : ''}${pointerPressed ? ' is-pointer-pressed' : ''}${suppressHover ? ' suppress-hover' : ''}`}
      type="button"
      aria-label={direction === 'previous' ? 'Previous image' : 'Next image'}
      onPointerEnter={() => {
        hoveringRef.current = true
        if (!pressedRef.current && !keyboardActive) springArrowTo(0)
      }}
      onPointerLeave={() => {
        hoveringRef.current = false
        if (!pressedRef.current && !keyboardActive) springArrowTo(0)
      }}
      onPointerDown={(event) => {
        if (pressedRef.current) return
        event.currentTarget.setPointerCapture(event.pointerId)
        pressedRef.current = true
        setPointerPressed(true)
        const currentShift = readArrowShift()
        stopArrowMotion()
        pressStartedRef.current = performance.now()
        startShiftRef.current = currentShift
        const chargePointer = (now: number) => {
          const progress = Math.min((now - pressStartedRef.current) / 300, 1)
          const eased = progress < .5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress
          setArrowShift(startShiftRef.current + (pullbackOffset - startShiftRef.current) * eased)
          if (progress < 1 && pressedRef.current) chargeFrameRef.current = requestAnimationFrame(chargePointer)
        }
        chargeFrameRef.current = requestAnimationFrame(chargePointer)
      }}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onClick={(event) => {
        if (event.detail !== 0) event.currentTarget.blur()
        setShockwave((current) => current + 1)
        onActivate()
      }}
    >
      {shockwave > 0 && <span className="gallery-arrow-shockwave" key={shockwave} aria-hidden="true" />}
      <span className="gallery-arrow-icon" ref={arrowRef}>
        {direction === 'previous' ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
      </span>
    </button>
  )
}

function GalleryModal({ images, activeIndex, onSelect, onClose }: {
  images: GalleryImage[]
  activeIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}) {
  const modalFrameRef = useRef<HTMLElement>(null)
  const sequenceListRef = useRef<HTMLDivElement>(null)
  const [activeControl, setActiveControl] = useState<'previous' | 'next' | null>(null)
  const [controlPressCount, setControlPressCount] = useState({ previous: 0, next: 0 })
  const [suppressArrowHover, setSuppressArrowHover] = useState(false)
  const activeImage = images[activeIndex]

  const navigate = useCallback((direction: -1 | 1) => {
    onSelect((activeIndex + direction + images.length) % images.length)
  }, [activeIndex, images.length, onSelect])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    modalFrameRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        setSuppressArrowHover(true)
        if (!event.repeat) {
          setActiveControl('next')
          setControlPressCount((current) => ({ ...current, next: current.next + 1 }))
        }
        navigate(1)
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        setSuppressArrowHover(true)
        if (!event.repeat) {
          setActiveControl('previous')
          setControlPressCount((current) => ({ ...current, previous: current.previous + 1 }))
        }
        navigate(-1)
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if ((event.key === 'ArrowRight' || event.key === 'ArrowDown') && activeControl === 'next') setActiveControl(null)
      if ((event.key === 'ArrowLeft' || event.key === 'ArrowUp') && activeControl === 'previous') setActiveControl(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [activeControl, navigate, onClose])

  useEffect(() => {
    sequenceListRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <div className="gallery-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="gallery-modal-frame" role="dialog" aria-modal="true" aria-label="Roofscape gallery viewer" tabIndex={-1} ref={modalFrameRef}>
        <div className="gallery-modal-stage" onPointerMove={() => setSuppressArrowHover(false)}>
          <div className="gallery-modal-meta">
            <span>Roofscape</span>
            <strong>{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</strong>
          </div>
          <img src={`${asset}gallery/${activeImage.file}`} alt={activeImage.alt} />
          <GalleryArrowButton direction="previous" keyboardActive={activeControl === 'previous'} pressCount={controlPressCount.previous} suppressHover={suppressArrowHover} onActivate={() => navigate(-1)} />
          <GalleryArrowButton direction="next" keyboardActive={activeControl === 'next'} pressCount={controlPressCount.next} suppressHover={suppressArrowHover} onActivate={() => navigate(1)} />
        </div>
        <aside className="gallery-sequence" aria-label="All gallery images">
          <div className="gallery-sequence-list" ref={sequenceListRef}>
            {images.map((image, imageIndex) => (
              <button className={activeIndex === imageIndex ? 'is-active' : ''} type="button" onClick={() => onSelect(imageIndex)} key={image.file} aria-label={`View image ${imageIndex + 1}: ${image.alt}`} aria-current={activeIndex === imageIndex ? 'true' : undefined}>
                <img src={`${asset}gallery/${image.file}`} alt="" loading="eager" />
                <span>{String(imageIndex + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </aside>
        <button className="gallery-modal-close" type="button" aria-label="Close gallery" onClick={onClose}><X aria-hidden="true" /></button>
      </section>
    </div>
  )
}

type GalleryCardProps = {
  image: GalleryImage
  imageIndex: number
  slot: number
  slideDirections: GallerySlideDirection[]
  onOpen: () => void
  onHoverChange: (slot: number | null) => void
}

type GallerySlideDirection = 'top' | 'left' | 'bottom' | 'right'

const gallerySlideDirections: Record<number, GallerySlideDirection[]> = {
  0: ['top', 'left'],
  1: ['top', 'right'],
  2: ['right'],
  3: ['left', 'bottom'],
  4: ['bottom'],
  5: ['right', 'bottom'],
}

function GalleryCard({ image, imageIndex, slot, slideDirections, onOpen, onHoverChange }: GalleryCardProps) {
  const [displayed, setDisplayed] = useState({ image, imageIndex })
  const [incoming, setIncoming] = useState<{ image: GalleryImage; imageIndex: number } | null>(null)
  const [incomingDirection, setIncomingDirection] = useState<GallerySlideDirection>(slideDirections[0])
  const directionCursorRef = useRef(0)

  useEffect(() => {
    if (imageIndex !== displayed.imageIndex) {
      const direction = slideDirections[directionCursorRef.current % slideDirections.length]
      directionCursorRef.current += 1
      setIncomingDirection(direction)
      setIncoming({ image, imageIndex })
    }
  }, [displayed.imageIndex, image, imageIndex, slideDirections])

  return (
    <button
      className={`gallery-card gallery-card-${slot}`}
      type="button"
      onClick={onOpen}
      onMouseEnter={() => onHoverChange(slot)}
      onMouseLeave={() => onHoverChange(null)}
      onFocus={() => onHoverChange(slot)}
      onBlur={() => onHoverChange(null)}
      aria-label={`Open image ${displayed.imageIndex + 1}: ${displayed.image.alt}`}
      style={{ '--gallery-index': slot } as React.CSSProperties}
    >
      <img className={`gallery-card-image gallery-card-image-current${incoming ? ` gallery-card-image-outgoing gallery-card-image-out-${incomingDirection}` : ''}`} src={`${asset}gallery/${displayed.image.file}`} alt={displayed.image.alt} loading={slot < 3 ? 'eager' : 'lazy'} />
      {incoming && (
        <img
          className={`gallery-card-image gallery-card-image-incoming gallery-card-image-from-${incomingDirection}`}
          src={`${asset}gallery/${incoming.image.file}`}
          alt=""
          onAnimationEnd={() => {
            setDisplayed(incoming)
            setIncoming(null)
          }}
        />
      )}
      <span className="gallery-card-index">{String(displayed.imageIndex + 1).padStart(2, '0')}</span>
      <span className="gallery-card-view">View <ArrowUpRight aria-hidden="true" /></span>
    </button>
  )
}

function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const swapCursorRef = useRef(galleryPreviewIndices.length)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [visible, setVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [previewIndices, setPreviewIndices] = useState<number[]>([])
  const hoveredSlotRef = useRef<number | null>(null)

  useEffect(() => {
    fetch(`${asset}gallery/gallery-images.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load gallery manifest')
        return response.json() as Promise<GalleryImage[]>
      })
      .then((galleryImages) => {
        setImages(galleryImages)
        setPreviewIndices(galleryPreviewIndices.filter((imageIndex) => galleryImages[imageIndex]))
      })
      .catch(() => setImages([]))
  }, [])

  useEffect(() => {
    if (!visible || activeIndex !== null || images.length <= previewIndices.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const globalBuffer = 850
    const adjacencyBuffer = 1700
    const neighbors: number[][] = [
      [1, 2, 3, 4],
      [0, 2],
      [0, 1, 4, 5],
      [0, 4],
      [0, 2, 3, 5],
      [2, 4],
    ]
    const lastFired = Array(galleryPreviewIndices.length).fill(-Infinity)
    const dueTimes = galleryPreviewIndices.map(() => performance.now() + 2000 + Math.random() * 4000)
    let lastGlobalFire = -Infinity
    let cancelled = false

    const scheduler = window.setInterval(() => {
      if (cancelled) return
      const now = performance.now()
      if (now - lastGlobalFire < globalBuffer) return

      const eligibleSlots = dueTimes
        .map((dueTime, slot) => ({ dueTime, slot }))
        .filter(({ dueTime, slot }) => {
          if (slot === hoveredSlotRef.current) return false
          if (dueTime > now || now - lastFired[slot] < adjacencyBuffer) return false
          return neighbors[slot].every((neighbor) => now - lastFired[neighbor] >= adjacencyBuffer)
        })
        .sort((a, b) => a.dueTime - b.dueTime)

      const nextSlot = eligibleSlots[0]?.slot
      if (nextSlot === undefined) return

      lastFired[nextSlot] = now
      lastGlobalFire = now
      dueTimes[nextSlot] = now + 2000 + Math.random() * 4000
      setPreviewIndices((current) => {
        if (current.length < galleryPreviewIndices.length) return current
        const next = [...current]
        let candidate = swapCursorRef.current % images.length
        let attempts = 0
        while (next.includes(candidate) && attempts < images.length) {
          swapCursorRef.current += 1
          candidate = swapCursorRef.current % images.length
          attempts += 1
        }
        next[nextSlot] = candidate
        swapCursorRef.current += 1
        return next
      })
    }, 120)

    return () => {
      cancelled = true
      window.clearInterval(scheduler)
    }
  }, [activeIndex, images.length, previewIndices.length, visible])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.04 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const visibleImages = images.length
    ? previewIndices
      .map((imageIndex, slot) => ({ image: images[imageIndex], imageIndex, slot }))
    : []

  const renderGalleryCard = ({ image, imageIndex, slot }: { image: GalleryImage; imageIndex: number; slot: number }) => (
    <GalleryCard image={image} imageIndex={imageIndex} slot={slot} slideDirections={gallerySlideDirections[slot]} onOpen={() => setActiveIndex(imageIndex)} onHoverChange={(hoveredSlot) => { hoveredSlotRef.current = hoveredSlot }} key={`gallery-preview-${slot}`} />
  )

  return (
    <section className={`gallery-section${visible ? ' is-visible' : ''}`} id="work" aria-labelledby="gallery-title" ref={sectionRef}>
      <div className="gallery-brutalist-heading">
        <p className="section-kicker" id="gallery-title">05 / Gallery</p>
      </div>
      <div className="gallery-showcase">
        {visibleImages.map(renderGalleryCard)}
      </div>
      {activeIndex !== null && images[activeIndex] && <GalleryModal images={images} activeIndex={activeIndex} onSelect={setActiveIndex} onClose={() => setActiveIndex(null)} />}
    </section>
  )
}

function App() {
  const mobileDevice = isMobileDevice()
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  return <div className={mobileDevice ? 'app is-mobile-device' : 'app'}><Header onBookAppointment={() => setAppointmentOpen(true)} /><main><Hero onBookAppointment={() => setAppointmentOpen(true)} /><BadgeStrip /><Services mobileDevice={mobileDevice} /><Gallery /></main>{appointmentOpen && <AppointmentModal mobileDevice={mobileDevice} onClose={() => setAppointmentOpen(false)} />}</div>
}

createRoot(document.getElementById('root')!).render(<App />)
