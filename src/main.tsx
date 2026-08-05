import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { AlertCircle, ArrowRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Mail, MapPin, MessageSquare, Phone, Send, UserRound, X } from 'lucide-react'
import './styles.css'
import './premium-sections.css'
import { CustomerServiceHologram, PremiumFooter, PremiumSections } from './PremiumSections'
import { useBodyScrollLock } from './hooks/useBodyScrollLock'
import { useDocumentVisibility } from './hooks/useDocumentVisibility'
import { useInView } from './hooks/useInView'
import { useDialogFocus } from './hooks/useDialogFocus'
import { ScaledArtboard } from './components/ScaledArtboard'
import { siteConfig } from './config/site'

const asset = '/assets/'

function AnimatedHeroLine({ text, accent = false }: { text: string; accent?: boolean }) {
  return <span className={`hero-line${accent ? ' hero-accent' : ''}`} style={{ '--line-delay': '.14s' } as React.CSSProperties} aria-hidden="true">{Array.from(text).map((character, index) => <span className="hero-char" style={{ '--char-index': index } as React.CSSProperties} key={`${character}-${index}`}>{character === ' ' ? '\u00a0' : character}</span>)}</span>
}

function Header({ onBookAppointment }: { onBookAppointment: () => void }) {
  return (
    <header className="site-header" aria-describedby="site-header-background-description">
      <span id="site-header-background-description" className="visually-hidden">Background image: A wide, light beige background featuring a subtle, fine-grained texture resembling paper or smooth stone.</span>
      <a className="brand" href="#top" aria-label="Northline Roofing home">
        <img className="brand-logo" src={`${asset}brand/combination-mark.svg`} alt="Northline Roofing combination logo: a geometric navy, cream, and burnt-orange N emblem beside NORTHLINE ROOFING and the subtitle RESIDENTIAL & COMMERCIAL SYSTEMS." />
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        <a href="#services">Services</a>
        <a href="#work">Gallery</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="header-phone" href={siteConfig.phoneHref}><Phone size={17} strokeWidth={2.4} /> {siteConfig.phoneDisplay}</a>
      <button className="header-quote" type="button" onClick={onBookAppointment}><CalendarDays aria-hidden="true" /> <span>Book an Appointment</span> <ArrowRight aria-hidden="true" /></button>
    </header>
  )
}

function Hero({ onBookAppointment }: { onBookAppointment: () => void }) {
  const heroRef = useRef<HTMLElement>(null)
  const skyTrackRef = useRef<HTMLDivElement>(null)
  const skyImageRef = useRef<HTMLImageElement>(null)
  const inView = useInView(heroRef, { threshold: 0.01 })
  const documentVisible = useDocumentVisibility()

  useEffect(() => {
    const track = skyTrackRef.current
    const image = skyImageRef.current
    if (!track || !image || !inView || !documentVisible) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let frame = 0
    let offset = 0
    let travelDistance = 0
    const speed = 13

    const measure = () => {
      const imageWidth = image.getBoundingClientRect().width
      const viewportWidth = track.parentElement?.getBoundingClientRect().width ?? 0
      travelDistance = Math.max(0, imageWidth - viewportWidth)
      offset = travelDistance > 0 ? offset % travelDistance : 0
    }
    const animate = (time: number) => {
      const elapsed = time - previousTime
      previousTime = time
      if (travelDistance > 0) {
        offset = (offset + speed * elapsed / 1000) % travelDistance
        track.style.transform = `translate3d(${-offset}px, 0, 0)`
      }
      frame = window.requestAnimationFrame(animate)
    }
    let previousTime = performance.now()
    measure()
    image.addEventListener('load', measure)
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(track.parentElement ?? track)
    frame = window.requestAnimationFrame(animate)
    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      image.removeEventListener('load', measure)
    }
  }, [documentVisible, inView])

  return (
    <section className={`hero${inView && documentVisible ? ' is-sky-active' : ''}`} id="top" ref={heroRef}>
      <div className="hero-sky-track" ref={skyTrackRef} aria-hidden="true">
        <img className="hero-sky" ref={skyImageRef} src={`${asset}hero/sky.png`} alt="Bright blue sky with fluffy white cumulus clouds over distant mountain ranges, designed as a seamless background layer for the Northline Roofing hero image." />
      </div>
        <img className="hero-image" src={`${asset}hero/foreground.png`} alt="A wide panoramic scene showing a human construction worker and a green-skinned orc installing tiles on the vast, intricate roof of a grand estate overlooking a pristine lake landscape. A middle-aged human with grey stubble leans forward on the right slope beside a muscular orc operating a bright orange power tool. The sweeping roof is clad in glossy bluish-green solar shingles with polished copper trim, arched dormers, and elegant finials; below, evergreen trees line a deep-blue bay toward distant mountains. The sky area is transparent so this foreground layer can be paired with a separate sky layer." />
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

function AppointmentModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState('')
  const modalRef = useRef<HTMLElement>(null)
  useBodyScrollLock(true)
  useDialogFocus(modalRef, onClose)

  return (
    <div className="appointment-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="appointment-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-title" ref={modalRef}>
        <header className="appointment-modal-header">
          <div>
            <p className="appointment-kicker">Northline Roofing</p>
            <h2 id="appointment-title">Book an Appointment</h2>
        <p>{siteConfig.appointmentSummary}</p>
          </div>
          <button className="modal-close" type="button" aria-label="Close appointment form" onClick={onClose}><X aria-hidden="true" /></button>
        </header>
        <div className="appointment-modal-scroll">
        <form className="appointment-form" onSubmit={(event) => {
            event.preventDefault()
            setError(`This appointment form is not connected yet. Please call ${siteConfig.phoneDisplay} to schedule your inspection.`)
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
              <label><span>Time Preference <b>*</b></span><select required name="time"><option value="">Select a time</option><option value="morning">Morning · 8am–12pm</option><option value="afternoon">Afternoon · 12pm–4pm</option><option value="late-afternoon">Late afternoon · 4pm–6pm</option></select><small>We’ll call when we’re on the way</small></label>
            </div>
            <label><span>Service Type <b>*</b></span><select required name="service"><option value="">Select a service</option><option value="residential">Residential roofing system</option><option value="commercial">Commercial roofing system</option><option value="custom-metal">Custom metal fabrication</option><option value="storm-inspection">Storm or weather damage inspection</option><option value="repair">Roof repair and maintenance</option></select></label>
            <label><span>Additional Notes</span><div className="input-wrap textarea-wrap"><MessageSquare aria-hidden="true" /><textarea name="notes" placeholder="Tell us about your roof or project..." /></div></label>
            {error && <p className="appointment-form-error" role="alert"><AlertCircle aria-hidden="true" />{error}</p>}
            <button className="appointment-submit" type="submit"><Send aria-hidden="true" /> <span>Book My Free Appointment</span></button>
            <p className="appointment-footnote">Mon–Fri, 8am–6pm · We’ll call to confirm · No obligation</p>
          </form>
        </div>
      </section>
    </div>
  )
}

function BadgeStrip() {
  return (
    <section className="badge-strip" id="about" aria-label="Northline Roofing qualifications">
      <div className="badge-sprite-canvas" aria-hidden="true">
        <div className="badge-slice badge-slice-one"><img src={`${asset}badges/banner.png`} alt="" /></div>
        <div className="badge-slice badge-divider-one"><img src={`${asset}badges/banner.png`} alt="" /></div>
        <div className="badge-slice badge-slice-two"><img src={`${asset}badges/banner.png`} alt="" /></div>
        <div className="badge-slice badge-divider-two"><img src={`${asset}badges/banner.png`} alt="" /></div>
        <div className="badge-slice badge-slice-three"><img src={`${asset}badges/banner.png`} alt="" /></div>
        <div className="badge-slice badge-divider-three"><img src={`${asset}badges/banner.png`} alt="" /></div>
        <div className="badge-slice badge-slice-four"><img src={`${asset}badges/banner.png`} alt="" /></div>
      </div>
      <img className="badge-banner visually-hidden" src={`${asset}badges/banner.png`} alt="Northline Roofing promotional banner divided into four sections by copper divider bars: a copper award medal with 300 YEARS EXPERIENCE; a copper palm tree with TROPICS LICENSED; a copper cityscape with RESIDENTIAL & COMMERCIAL; and a copper anvil and hammer with CUSTOM METAL FABRICATION." />
      <p className="visually-hidden">Northline Roofing qualifications: 300 years experience. Tropics licensed. Residential and commercial roofing. Custom metal fabrication.</p>
    </section>
  )
}

const services = [
  { title: 'Residential', image: 'services/residential-roofing.jpg', alt: 'In a bright, sunny coastal setting high above a deep blue ocean lined with palm trees and distant islands, a purple-skinned female elf construction worker stands on scaffolding to fit a dark-framed rectangular window into the curved beige stucco wall of a turret. Above her is an elaborate roof of teal-blue patinated standing-seam copper panels with a polished reddish-gold copper edge, alongside light-cream Spanish-style clay roof tiles.' , text: 'Complete roof systems designed for lasting protection and a clean, finished line.' },
  { title: 'Commercial', image: 'services/commercial-roofing.jpg', alt: 'Set atop a grand building framed with polished gold beams and a vast roof of deep red tiles, a diverse crew of fantastical creatures constructs and maintains the structure above a sprawling fantasy metropolis. The crew includes a golden-brown insectoid polishing gold trim, a pink axolotl-headed worker smoothing mortar, purple goblin-like workers arranging shingles, a brass robot welding, a small green lizard inspecting wiring, and a stone giant lifting roofing panels. A golden cupola crowns the building above extensive scaffolding, with colorful domes, ornate spires, and a harbor in the distance.' , text: 'Durable, carefully coordinated systems for commercial properties of every scale.' },
  { title: 'Custom Fabrication', image: 'services/custom-metal.jpg', alt: 'Inside a dimly lit open-air workshop blending traditional blacksmithing with futuristic technology, a sleek humanoid robot craftsman in a dark leather apron forges ornate copper architecture. The gold-visored robot swings a heavy hammer onto polished reddish copper embossed with raised scrollwork, while a completed copper tower finial rests nearby and an intense orange-gold forge burns beneath a metal hood. Through an open window, a sunny landscape shows a grand copper-roofed building, ornate spire, blue sky, and distant green hills.' , text: 'Hand-finished copperwork, flashing, trim, and architectural details built to order.' },
  { title: 'Repairs & Inspections', image: 'services/repairs-inspections.jpg', alt: 'In bright daylight under a cloud-dappled sky, a humanoid dragon and an alien construction worker inspect the steep roof of an old-fashioned building overlooking lush green mountains. The dragon has vivid cobalt-blue scales, pale-gold scales beneath his jaw, ram-like horns fitted through a yellow hard hat, and a dark-clawed hand resting on polished reddish-gold copper flashing. Beside him, a grey-purple alien with four glowing amber eyes reviews a clipboard. Weathered greenish-grey slate shingles, a tall roof spire, copper, and strong sunlight fill the scene.' , text: 'Clear assessments and dependable repairs before a small issue becomes a larger one.' },
]

function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

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
    <section className={`services-section${visible ? ' is-visible' : ''}`} id="services" aria-labelledby="services-title" aria-describedby="services-background-description" ref={sectionRef}>
      <span id="services-background-description" className="visually-hidden">Background image: A wide, light beige background featuring a subtle, fine-grained texture resembling paper or smooth stone.</span>
      <div className="services-layout">
        <div className="services-brutalist-heading">
          <p className="section-kicker" id="services-title">Services</p>
        </div>
        <div className="services-slice-grid">
          {services.map((service, index) => (
            <a
              className="service-slice"
              href="#contact"
              key={service.title}
              aria-label={`${service.title} service — contact Northline Roofing`}
              style={{ '--service-index': index } as React.CSSProperties}
            >
              <img src={`${asset}${service.image}`} alt={service.alt} />
              <span className="service-slice-shade" />
              <span className="service-slice-number">0{index + 1}</span>
              <span className="service-slice-content">
                <strong>{service.title === 'Repairs & Inspections' ? <>Repairs &<br />Inspections</> : service.title === 'Custom Fabrication' ? <>Custom<br />Fabrication</> : service.title}</strong>
                <span>{service.text}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

type GalleryImage = { file: string; alt: string }

const galleryImages: GalleryImage[] = [
  { file: '01-gothic-mountain-house-copper-trim.jpg', alt: 'Stone mountain house with steep slate roofs and copper trim.' },
  { file: '02-curved-copper-coastal-roof.jpg', alt: 'Modern coastal house with a wide curved copper roof.' },
  { file: '03-white-metal-roof-gold-trim.jpg', alt: 'White sculptural metal roof with polished gold trim.' },
  { file: '04-butterfly-copper-roof-house.jpg', alt: 'Modern house with a butterfly-shaped copper and white roof.' },
  { file: '05-patina-copper-fantasy-villa.jpg', alt: 'Ornate fantasy villa with sweeping green patina copper roofs.' },
  { file: '06-tiered-dark-metal-roof-house.jpg', alt: 'Modern house with layered dark metal roofs and copper edging.' },
  { file: '07-coastal-tile-and-patina-roof.jpg', alt: 'Coastal home with clay tiles and green patina roof accents.' },
  { file: '08-iridescent-curved-slate-roof.jpg', alt: 'Curved fantasy house roof covered in iridescent slate tiles.' },
  { file: '09-desert-mixed-metal-tile-roof.jpg', alt: 'Desert home with layered metal and tile roofing.' },
  { file: '10-flared-copper-roof-house.jpg', alt: 'Contemporary house with a dramatic flared copper roof.' },
  { file: '11-mountain-lodge-slate-copper-roof.jpg', alt: 'Mountain lodge with layered slate roofs and copper trim.' },
  { file: '12-weathered-patina-copper-roof.jpg', alt: 'Stone house with a weathered green patina copper roof.' },
  { file: '13-turquoise-tile-copper-trim-roof.jpg', alt: 'Curved turquoise tile roofs outlined with copper trim.' },
  { file: '14-lakeside-multicolor-slate-roof.jpg', alt: 'Lakeside house with multicolor slate roofs and copper edging.' },
  { file: '15-ornate-green-tile-copper-roof.jpg', alt: 'Ornate villa with green tile roofs and bright copper trim.' },
  { file: '16-coastal-curved-shingle-roof.jpg', alt: 'Coastal house with curved gray shingles and copper details.' },
  { file: '17-desert-standing-seam-copper-roof.jpg', alt: 'Desert house with sculpted standing-seam copper roofing.' },
  { file: '18-curved-dark-shingle-lake-house.jpg', alt: 'Lake house with dark curved shingle roofs and copper trim.' },
  { file: '19-sunset-coastal-curved-roof-home.jpg', alt: 'Coastal home at sunset with layered curved roofs.' },
  { file: '20-ornate-copper-slate-arched-roof.jpg', alt: 'Ornate house with arched slate roofs and copper framing.' },
  { file: '21-purple-curved-metal-coastal-roof.jpg', alt: 'Coastal home with a glossy purple curved metal roof.' },
  { file: '22-desert-copper-tile-estate.jpg', alt: 'Large desert estate with layered copper-colored tile roofs.' },
  { file: '23-purple-slate-copper-mansion.jpg', alt: 'Fantasy mansion with purple slate roofs and copper trim.' },
  { file: '24-angular-white-metal-roof.jpg', alt: 'Modern white house with sharp angular metal roofs.' },
  { file: '25-red-copper-slate-gothic-house.jpg', alt: 'Gothic house with steep slate roofs and red copper accents.' },
  { file: '26-copper-turret-gothic-mansion.jpg', alt: 'Gothic mansion with copper roofs and tall pointed turrets.' },
  { file: '27-white-metal-gold-trim-coastal-roof.jpg', alt: 'Coastal building with layered white metal roofs and gold trim.' },
]

const roofMaterials = [
  ['01', 'Terracotta barrel tile', 'Burnt orange / rounded profile'],
  ['02', 'Patinated copper seam', 'Blue-green / vertical panel'],
  ['03', 'Riven slate tile', 'Blue-gray / rugged split face'],
  ['04', 'Iridescent scale tile', 'Silver blue / fish-scale profile'],
  ['05', 'Translucent polycarbonate', 'Clear / corrugated panel'],
  ['06', 'Gilded hex tile', 'Amber gold / geometric relief'],
  ['07', 'Blue scallop tile', 'Deep teal / glazed scale'],
  ['08', 'Thatch roofing', 'Natural straw / layered fiber'],
  ['09', 'Indigo barrel tile', 'Cobalt violet / fired gloss'],
  ['10', 'Silver standing seam', 'Cool gray / vertical rib'],
  ['11', 'Copper diamond shingle', 'Warm copper / geometric scale'],
  ['12', 'Verdigris scallop tile', 'Emerald teal / aged copper'],
  ['13', 'Ivory barrel tile', 'Cream / embossed pattern'],
  ['14', 'Cedar shakes', 'Weathered wood / natural grain'],
  ['15', 'Solar slate panel', 'Blue-gray / photovoltaic grid'],
  ['16', 'Living roof membrane', 'Moss green / planted system'],
] as const

// Keep the preview curated while the modal remains the complete gallery.
const galleryPreviewIndices = [0, 2, 7, 9, 13, 16]
const galleryObserverOptions: IntersectionObserverInit = { rootMargin: '20% 0px', threshold: 0.04 }

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
        if (!pressedRef.current && !keyboardActive) springArrowTo(0)
      }}
      onPointerLeave={() => {
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
  const [isClosing, setIsClosing] = useState(false)
  const isClosingRef = useRef(false)
  const [closeShockwave, setCloseShockwave] = useState(0)
  const [closePressed, setClosePressed] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const activeImage = images[activeIndex]

  useEffect(() => {
    const neighborIndexes = [activeIndex, (activeIndex - 1 + images.length) % images.length, (activeIndex + 1) % images.length]
    const preloads = neighborIndexes.map((index) => {
      const image = new Image()
      image.src = `${asset}gallery/${images[index].file}`
      return image
    })
    return () => preloads.forEach((image) => { image.src = '' })
  }, [activeIndex, images])

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setCloseShockwave((current) => current + 1)
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(onClose, 360)
  }, [onClose])

  const navigate = useCallback((direction: -1 | 1) => {
    onSelect((activeIndex + direction + images.length) % images.length)
  }, [activeIndex, images.length, onSelect])

  useBodyScrollLock(true)
  useDialogFocus(modalFrameRef, handleClose)

  useEffect(() => {
    document.body.classList.add('gallery-modal-open')
    return () => {
      document.body.classList.remove('gallery-modal-open')
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [activeControl, navigate])

  useEffect(() => {
    sequenceListRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeIndex])

  const modal = (
    <div className={`gallery-modal-backdrop${isClosing ? ' is-closing' : ''}`} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) handleClose() }}>
      <section className={`gallery-modal-frame${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label="Roofscape gallery viewer" tabIndex={-1} ref={modalFrameRef}>
        <div className="gallery-modal-stage" onPointerMove={() => setSuppressArrowHover(false)}>
          <div className="gallery-modal-meta">
            <span>Roofscape</span>
            <strong>{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</strong>
          </div>
          <img src={`${asset}gallery/${activeImage.file}`} alt={activeImage.alt} decoding="async" />
          <GalleryArrowButton direction="previous" keyboardActive={activeControl === 'previous'} pressCount={controlPressCount.previous} suppressHover={suppressArrowHover} onActivate={() => navigate(-1)} />
          <GalleryArrowButton direction="next" keyboardActive={activeControl === 'next'} pressCount={controlPressCount.next} suppressHover={suppressArrowHover} onActivate={() => navigate(1)} />
        </div>
        <aside className="gallery-sequence" aria-label="All gallery images">
          <div className="gallery-sequence-list" ref={sequenceListRef}>
            {images.map((image, imageIndex) => (
              <button className={activeIndex === imageIndex ? 'is-active' : ''} type="button" onClick={() => onSelect(imageIndex)} key={image.file} aria-label={`View image ${imageIndex + 1}: ${image.alt}`} aria-current={activeIndex === imageIndex ? 'true' : undefined}>
                <img src={`${asset}gallery/${image.file}`} alt="" loading="lazy" decoding="async" />
                <span>{String(imageIndex + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </aside>
        <button className={`gallery-modal-close${closePressed ? ' is-pointer-pressed' : ''}`} type="button" aria-label="Close gallery" onClick={handleClose} onPointerDown={() => setClosePressed(true)} onPointerUp={() => setClosePressed(false)} onPointerLeave={() => setClosePressed(false)} onPointerCancel={() => setClosePressed(false)}>
          {closeShockwave > 0 && <span className="gallery-arrow-shockwave" key={closeShockwave} aria-hidden="true" />}
          <span className={`gallery-arrow-icon${closePressed ? ' is-pointer-pressed' : ''}`}><X aria-hidden="true" /></span>
        </button>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
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
  const getDigitSequence = (from: number, to: number) => {
    const digits = [from]
    const incrementDistance = (to - from + 10) % 10
    const decrementDistance = (from - to + 10) % 10
    const step = incrementDistance <= decrementDistance ? 1 : -1
    const distance = Math.min(incrementDistance, decrementDistance)
    let current = from
    for (let stepIndex = 0; stepIndex < distance; stepIndex += 1) {
      current = (current + step + 10) % 10
      digits.push(current)
    }
    return digits
  }

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
      <span className="gallery-card-index" aria-hidden="true">
        {String((incoming?.imageIndex ?? displayed.imageIndex) + 1).padStart(2, '0').split('').map((digit, digitIndex) => {
          const currentDigits = String(displayed.imageIndex + 1).padStart(2, '0')
          const sequence = incoming
            ? getDigitSequence(Number(currentDigits[digitIndex]), Number(digit))
            : [Number(digit)]
          return (
          <span className="gallery-card-index-digit-window" key={`${slot}-${digitIndex}-${digit}`}>
            <span className="gallery-card-index-digit-track" style={{ '--digit-steps': sequence.length - 1 } as React.CSSProperties}>
              {sequence.map((sequenceDigit, sequenceIndex) => <span className="gallery-card-index-digit" key={`${sequenceDigit}-${sequenceIndex}`}>{sequenceDigit}</span>)}
            </span>
          </span>
          )
        })}
      </span>
      <span className="gallery-card-view">View <ArrowUpRight aria-hidden="true" /></span>
    </button>
  )
}

function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const swapCursorRef = useRef(galleryPreviewIndices.length)
  const images = galleryImages
  const inView = useInView(sectionRef, galleryObserverOptions)
  const documentVisible = useDocumentVisibility()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [previewIndices, setPreviewIndices] = useState<number[]>(() => galleryPreviewIndices.filter((imageIndex) => galleryImages[imageIndex]))
  const hoveredSlotRef = useRef<number | null>(null)
  const closeGallery = useCallback(() => setActiveIndex(null), [])

  useEffect(() => {
    if (!inView || !documentVisible || activeIndex !== null || images.length <= previewIndices.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
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
    let scheduler = 0

    const scheduleNext = () => {
      const now = performance.now()
      if (now - lastGlobalFire < globalBuffer) {
        scheduler = window.setTimeout(scheduleNext, globalBuffer)
        return
      }

      const eligibleSlots = dueTimes
        .map((dueTime, slot) => ({ dueTime, slot }))
        .filter(({ dueTime, slot }) => {
          if (slot === hoveredSlotRef.current) return false
          if (dueTime > now || now - lastFired[slot] < adjacencyBuffer) return false
          return neighbors[slot].every((neighbor) => now - lastFired[neighbor] >= adjacencyBuffer)
        })
        .sort((a, b) => a.dueTime - b.dueTime)

      const nextSlot = eligibleSlots[0]?.slot
      if (nextSlot === undefined) {
        scheduler = window.setTimeout(scheduleNext, 500)
        return
      }

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
      const nextDue = Math.min(...dueTimes)
      scheduler = window.setTimeout(scheduleNext, Math.max(250, nextDue - performance.now()))
    }
    scheduler = window.setTimeout(scheduleNext, Math.max(250, Math.min(...dueTimes) - performance.now()))

    return () => {
      window.clearTimeout(scheduler)
    }
  }, [activeIndex, documentVisible, images.length, inView, previewIndices.length])

  const visibleImages = images.length
    ? previewIndices
      .map((imageIndex, slot) => ({ image: images[imageIndex], imageIndex, slot }))
    : []

  const renderGalleryCard = ({ image, imageIndex, slot }: { image: GalleryImage; imageIndex: number; slot: number }) => (
    <GalleryCard image={image} imageIndex={imageIndex} slot={slot} slideDirections={gallerySlideDirections[slot]} onOpen={() => setActiveIndex(imageIndex)} onHoverChange={(hoveredSlot) => { hoveredSlotRef.current = hoveredSlot }} key={`gallery-preview-${slot}`} />
  )

  return (
    <section className={`gallery-section${inView ? ' is-visible' : ''}`} id="work" aria-labelledby="gallery-title" ref={sectionRef}>
      <div className="gallery-layout">
        <div className="gallery-brutalist-heading">
          <p className="section-kicker" id="gallery-title">Gallery</p>
        </div>
        <div className="gallery-content">
          <div className="gallery-showcase">
            {visibleImages.map(renderGalleryCard)}
          </div>
          <aside className="gallery-material-library" aria-labelledby="materials-title">
            <div className="gallery-material-heading">
              <span className="gallery-material-kicker">Northline / Roof systems</span>
              <h2 id="materials-title">Material library</h2>
              <span className="gallery-material-rule" />
            </div>
            <div className="gallery-material-art">
              <img src={`${asset}gallery/material-library.jpg`} alt="A front-facing display of sixteen fantasy roofing material samples arranged in two columns like a premium architectural showroom library." />
              <div className="gallery-material-labels">
                {roofMaterials.map(([number, name, detail]) => (
                  <div className="gallery-material-label" key={number}>
                    <span>{number}</span>
                    <strong>{name}</strong>
                    <small>{detail}</small>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      {activeIndex !== null && images[activeIndex] && <GalleryModal images={images} activeIndex={activeIndex} onSelect={setActiveIndex} onClose={closeGallery} />}
    </section>
  )
}

function App() {
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  const openAppointment = useCallback(() => setAppointmentOpen(true), [])
  const closeAppointment = useCallback(() => setAppointmentOpen(false), [])
  return (
    <div className="app">
      <ScaledArtboard>
        <Header onBookAppointment={openAppointment} />
        <main><Hero onBookAppointment={openAppointment} /><BadgeStrip /><Services /><Gallery /><span className="copper-edge-seam" aria-hidden="true" /><PremiumSections /></main>
        <PremiumFooter onBook={openAppointment} />
      </ScaledArtboard>
      <CustomerServiceHologram onBook={openAppointment} hidden={appointmentOpen} />
      {appointmentOpen && <AppointmentModal onClose={closeAppointment} />}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
