import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, Mail, MapPin, MessageSquare, Phone, Send, UserRound, X } from 'lucide-react'
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
        <img className="brand-logo" src={`${asset}northline_roofing_combination_mark.svg`} alt="Northline Roofing — Residential & Commercial Systems" />
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        <a href="#services">Services</a>
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="header-phone" href="tel:+15555555555"><Phone size={17} strokeWidth={2.4} /> (555) 555-5555</a>
      <button className="header-quote" type="button" onClick={onBookAppointment}><CalendarDays aria-hidden="true" /> <span>Book an Appointment</span> <ArrowRight aria-hidden="true" /></button>
      <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
      {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">
        <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
        <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
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
        <img className="hero-sky" ref={skyImageRef} src={`${asset}sec2_1_hero_sky.png`} alt="" />
      </div>
      <img className="hero-image" src={`${asset}sec2_1_hero.png`} alt="A panoramic image featuring a steep roof inclined upward toward the top right, where a muscular nordic human roofer with a graying beard and a green-skinned orc in yellow hard hats work closely side-by-side. They install tiles on a teal prismatic roof with ornate copper trim, which slopes down on the left to reveal a bright blue lake and distant mountains with sparse white clouds." />
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
  const [submitted, setSubmitted] = useState(false)

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
          <form className="appointment-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
            <div className="form-grid form-grid-two">
              <label><span>Full Name <b>*</b></span><div className="input-wrap"><UserRound aria-hidden="true" /><input required name="name" placeholder="Your full name" autoComplete="name" /></div></label>
              <label><span>Phone Number <b>*</b></span><div className="input-wrap"><Phone aria-hidden="true" /><input required name="phone" type="tel" placeholder="(555) 555-5555" autoComplete="tel" /></div></label>
            </div>
            <label><span>Email Address <b>*</b></span><div className="input-wrap"><Mail aria-hidden="true" /><input required name="email" type="email" placeholder="you@example.com" autoComplete="email" /></div></label>
            <label><span>Property Address</span><div className="input-wrap"><MapPin aria-hidden="true" /><input name="address" placeholder="Street address" autoComplete="street-address" /></div></label>
            <div className="form-grid form-grid-two">
              <label><span>City</span><input name="city" placeholder="Your city" autoComplete="address-level2" /></label>
              <label><span>Postal Code</span><input name="postal-code" placeholder="ZIP / postal code" autoComplete="postal-code" /></label>
            </div>
            <div className="form-grid form-grid-two">
              <label><span>Preferred Date <b>*</b></span><div className="input-wrap"><CalendarDays aria-hidden="true" /><input required name="date" type="date" /></div><small>Mon–Fri · 24hr advance notice</small></label>
              <label><span>Time Preference <b>*</b></span><select required name="time"><option value="">Select a time</option><option>Morning · 8am–12pm</option><option>Afternoon · 12pm–4pm</option><option>Late afternoon · 4pm–6pm</option></select><small>We’ll call when we’re on the way</small></label>
            </div>
            <label><span>Service Type <b>*</b></span><select required name="service"><option value="">Select a service</option><option>Residential roofing system</option><option>Commercial roofing system</option><option>Custom metal fabrication</option><option>Storm or weather damage inspection</option><option>Roof repair and maintenance</option></select></label>
            <label><span>Additional Notes</span><div className="input-wrap textarea-wrap"><MessageSquare aria-hidden="true" /><textarea name="notes" placeholder="Tell us about your roof or project..." /></div></label>
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
      <img className="badge-banner visually-hidden" src={`${asset}sec3_1_banner.png`} alt="Northline Roofing qualifications: 300 years experience, Tropics licensed, residential and commercial roofing, and custom metal fabrication." />
      <p className="visually-hidden">Northline Roofing qualifications: 300 years experience. Tropics licensed. Residential and commercial roofing. Custom metal fabrication.</p>
    </section>
  )
}

const services = [
  { title: 'Residential', image: 'service-residential-roofing.png', alt: 'Human and orc roofers installing teal slate tiles on an ornate residential roof above a mountain lake.', text: 'Complete roof systems designed for lasting protection and a clean, finished line.' },
  { title: 'Commercial', image: 'service-commercial-roofing.png', alt: 'A large roofing crew working across the broad copper-trimmed roof of a civic building above a coastal city.', text: 'Durable, carefully coordinated systems for commercial properties of every scale.' },
  { title: 'Custom Fabrication', image: 'service-custom-metal.png', alt: 'A human metalworker and orc craftsperson shaping ornate copper roofing details in a forge.', text: 'Hand-finished copperwork, flashing, trim, and architectural details built to order.' },
  { title: 'Repairs & Inspections', image: 'service-repairs-inspections.png', alt: 'A human inspector and orc roofer examining a copper seam on a steep slate roof after a storm.', text: 'Clear assessments and dependable repairs before a small issue becomes a larger one.' },
]

function Services() {
  return (
    <section className="services-section" id="services" aria-labelledby="services-title">
      <div className="services-brutalist-heading">
        <p className="section-kicker" id="services-title">04 / Services</p>
      </div>
      <div className="services-slice-grid">
        {services.map((service, index) => (
          <a className="service-slice" href="#contact" key={service.title} aria-label={`Learn more about ${service.title}`}>
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

function App() {
  const mobileDevice = isMobileDevice()
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  return <div className={mobileDevice ? 'app is-mobile-device' : 'app'}><Header onBookAppointment={() => setAppointmentOpen(true)} /><main><Hero onBookAppointment={() => setAppointmentOpen(true)} /><BadgeStrip /><Services /></main>{appointmentOpen && <AppointmentModal onClose={() => setAppointmentOpen(false)} />}</div>
}

createRoot(document.getElementById('root')!).render(<App />)
