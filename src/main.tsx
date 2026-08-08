import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { AlertCircle, ArrowRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Mail, MapPin, MessageSquare, Phone, Send, UserRound, X } from 'lucide-react'
import './styles.css'
import './premium-sections.css'
import { AssociationsMarquee, CustomerServiceHologram, PremiumFooter, PremiumSections } from './PremiumSections'
import { useBodyScrollLock } from './hooks/useBodyScrollLock'
import { useDocumentVisibility } from './hooks/useDocumentVisibility'
import { useInView } from './hooks/useInView'
import { useRevealOnce } from './hooks/useRevealOnce'
import { useDialogFocus } from './hooks/useDialogFocus'
import { useGalleryKeyboardNavigation } from './hooks/useGalleryKeyboardNavigation'
import { useActiveThumbnailScroll } from './hooks/useActiveThumbnailScroll'
import { useGalleryPreviewRotation } from './hooks/useGalleryPreviewRotation'
import { ScaledArtboard } from './components/ScaledArtboard'
import { siteConfig } from './config/site'
import { GALLERY_PREVIEW_SLOTS, GALLERY_SWAP_CONFIG } from './config/gallery'
import { responsiveImage } from './lib/responsiveImage'
import { AssetStageProvider, StageImage, useAssetStage } from './lib/assetStages'

const asset = '/assets/'

function CopperEdgeSeam() {
  return <span className="copper-edge-seam" aria-hidden="true" />
}

type NavbarArtProps = {
  file: string
  hoverFile?: string
  width: number
  height: number
  alt: string
}

function NavbarArt({ file, hoverFile, width, height, alt }: NavbarArtProps) {
  return (
    <span className="navbar-art" aria-hidden={alt ? undefined : true}>
      <img className="navbar-art-default" src={`${asset}navbar/${file}`} alt={alt} width={width} height={height} />
      {hoverFile && <img className="navbar-art-hover" src={`${asset}navbar/${hoverFile}`} alt="" width={width} height={height} aria-hidden="true" />}
    </span>
  )
}

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
        <a href="#services" aria-label="Services"><NavbarArt file="nav_services_default.png" hoverFile="nav_services_hover.png" width={447} height={164} alt="Services" /></a>
        <a href="#work" aria-label="Gallery"><NavbarArt file="nav_gallery_default.png" hoverFile="nav_gallery_hover.png" width={440} height={154} alt="Gallery" /></a>
        <a href="#associations" aria-label="Associations"><NavbarArt file="nav_associations_default.png" hoverFile="nav_associations_hover.png" width={492} height={150} alt="Associations" /></a>
        <a href="#protection" aria-label="Protection"><NavbarArt file="nav_protection_default.png" hoverFile="nav_protection_hover.png" width={464} height={142} alt="Protection" /></a>
        <a href="#reviews" aria-label="Reviews"><NavbarArt file="nav_reviews_default.png" hoverFile="nav_reviews_hover.png" width={415} height={163} alt="Reviews" /></a>
        <a href="#founder" aria-label="Founder"><NavbarArt file="nav_founder_default.png" hoverFile="nav_founder_hover.png" width={414} height={154} alt="Founder" /></a>
        <a href="#contact" aria-label="Contact"><NavbarArt file="nav_contact_default.png" hoverFile="nav_contact_hover.png" width={426} height={150} alt="Contact" /></a>
      </nav>
      <a className="header-phone navbar-art-link" href={siteConfig.phoneHref} aria-label={`Call ${siteConfig.phoneDisplay}`}>
        <NavbarArt file="nav_phone_default.png" width={955} height={202} alt={`Call ${siteConfig.phoneDisplay}`} />
      </a>
      <button className="header-quote navbar-art-button" type="button" onClick={onBookAppointment} aria-label="Book an appointment">
        <NavbarArt file="nav_book-appt_default.png" width={966} height={180} alt="Book an appointment" />
      </button>
    </header>
  )
}

function Hero({ onBookAppointment }: { onBookAppointment: () => void }) {
  const heroRef = useRef<HTMLElement>(null)
  const skyTrackRef = useRef<HTMLDivElement>(null)
  const skyImageRef = useRef<HTMLImageElement>(null)
  const foregroundImageRef = useRef<HTMLImageElement>(null)
  const [heroAssetsReady, setHeroAssetsReady] = useState(false)
  const inView = useInView(heroRef, { threshold: 0.01 })
  const documentVisible = useDocumentVisibility()

  useEffect(() => {
    const images = [skyImageRef.current, foregroundImageRef.current].filter((image): image is HTMLImageElement => Boolean(image))
    let readinessCheckStarted = false
    let cancelled = false
    const checkLoaded = () => {
      if (readinessCheckStarted || !images.every((image) => image.complete && image.naturalWidth > 0)) return
      readinessCheckStarted = true
      Promise.all(images.map((image) => image.decode().catch(() => undefined))).then(() => {
        if (!cancelled) setHeroAssetsReady(true)
      })
    }

    images.forEach((image) => image.addEventListener('load', checkLoaded))
    checkLoaded()
    return () => {
      cancelled = true
      images.forEach((image) => image.removeEventListener('load', checkLoaded))
    }
  }, [])

  useEffect(() => {
    const track = skyTrackRef.current
    const image = skyImageRef.current
    if (!track || !image || !heroAssetsReady || !inView || !documentVisible) return

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
    let resizeObserver: ResizeObserver | null = null
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(track.parentElement ?? track)
    }
    window.addEventListener('resize', measure)
    frame = window.requestAnimationFrame(animate)
    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measure)
      image.removeEventListener('load', measure)
    }
  }, [documentVisible, heroAssetsReady, inView])

  return (
    <section className={`hero${inView && documentVisible ? ' is-sky-active' : ''}${heroAssetsReady ? ' is-hero-assets-ready' : ''}`} id="top" ref={heroRef}>
      <div className="hero-sky-reveal" aria-hidden="true">
        <div className="hero-sky-track" ref={skyTrackRef}>
          <img className="hero-sky" ref={skyImageRef} {...responsiveImage('/assets/hero/sky', '100vw', 1440)} alt="Bright blue sky with fluffy white cumulus clouds over distant mountain ranges, designed as a seamless background layer for the Northline Roofing hero image." />
        </div>
      </div>
      <img className="hero-image" ref={foregroundImageRef} {...responsiveImage('/assets/hero/foreground', '100vw', 1440)} alt="A wide panoramic scene showing a human construction worker and a green-skinned orc installing tiles on the vast, intricate roof of a grand estate overlooking a pristine lake landscape. A middle-aged human with grey stubble leans forward on the right slope beside a muscular orc operating a bright orange power tool. The sweeping roof is clad in glossy bluish-green solar shingles with polished copper trim, arched dormers, and elegant finials; below, evergreen trees line a deep-blue bay toward distant mountains. The sky area is transparent so this foreground layer can be paired with a separate sky layer." />
      <div className="hero-reveal-curtain" aria-hidden="true" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">Northline Roofing</p>
        <h1 aria-label="Custom roofing since year 4-211."><AnimatedHeroLine text="Custom roofing" /><br /><AnimatedHeroLine text="since year 4-211." accent /></h1>
        <p className="hero-description">Complete roofing systems, exterior protection, and water<span className="desktop-break"><br /></span>management—installed by a local crew that sweats every detail.<span className="desktop-break"><br /></span> Clear pricing, exacting standards, and zero shortcuts.</p>
        <div className="hero-actions">
          <button className="button button-primary" type="button" onClick={onBookAppointment}><CalendarDays aria-hidden="true" /> <span>Book an Appointment</span> <ArrowRight aria-hidden="true" /></button>
          <a className="button button-call" href={siteConfig.phoneHref}><Phone size={20} /> <span>{siteConfig.phoneDisplay}</span></a>
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
    <div className="appointment-backdrop" role="presentation" onPointerDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
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
        {['badge-slice-one', 'badge-divider-one', 'badge-slice-two', 'badge-divider-two', 'badge-slice-three', 'badge-divider-three', 'badge-slice-four'].map((className) => <div className={`badge-slice ${className}`} key={className}><StageImage base="/assets/badges/banner" sizes="91vw" defaultWidth={1440} stage="badges" alt="" /></div>)}
      </div>
      <StageImage className="badge-banner visually-hidden" base="/assets/badges/banner" sizes="91vw" defaultWidth={1440} stage="badges" alt="Northline Roofing promotional banner divided into four sections by copper divider bars: a copper award medal with 300 YEARS EXPERIENCE; a copper palm tree with TROPICS LICENSED; a copper cityscape with RESIDENTIAL & COMMERCIAL; and a copper anvil and hammer with CUSTOM METAL FABRICATION." />
      <p className="visually-hidden">Northline Roofing qualifications: 300 years experience. Tropics licensed. Residential and commercial roofing. Custom metal fabrication.</p>
    </section>
  )
}

const services = [
  { title: 'Residential', image: 'services/residential-roofing', alt: 'In a bright, sunny coastal setting high above a deep blue ocean lined with palm trees and distant islands, a purple-skinned female elf construction worker stands on scaffolding to fit a dark-framed rectangular window into the curved beige stucco wall of a turret. Above her is an elaborate roof of teal-blue patinated standing-seam copper panels with a polished reddish-gold copper edge, alongside light-cream Spanish-style clay roof tiles.' , text: 'Complete roof systems designed for lasting protection and a clean, finished line.' },
  { title: 'Commercial', image: 'services/commercial-roofing', alt: 'Set atop a grand building framed with polished gold beams and a vast roof of deep red tiles, a diverse crew of fantastical creatures constructs and maintains the structure above a sprawling fantasy metropolis. The crew includes a golden-brown insectoid polishing gold trim, a pink axolotl-headed worker smoothing mortar, purple goblin-like workers arranging shingles, a brass robot welding, a small green lizard inspecting wiring, and a stone giant lifting roofing panels. A golden cupola crowns the building above extensive scaffolding, with colorful domes, ornate spires, and a harbor in the distance.' , text: 'Durable, carefully coordinated systems for commercial properties of every scale.' },
  { title: 'Custom Fabrication', image: 'services/custom-metal', alt: 'Inside a dimly lit open-air workshop blending traditional blacksmithing with futuristic technology, a sleek humanoid robot craftsman in a dark leather apron forges ornate copper architecture. The gold-visored robot swings a heavy hammer onto polished reddish copper embossed with raised scrollwork, while a completed copper tower finial rests nearby and an intense orange-gold forge burns beneath a metal hood. Through an open window, a sunny landscape shows a grand copper-roofed building, ornate spire, blue sky, and distant green hills.' , text: 'Hand-finished copperwork, flashing, trim, and architectural details built to order.' },
  { title: 'Repairs & Inspections', image: 'services/repairs-inspections', alt: 'In bright daylight under a cloud-dappled sky, a humanoid dragon and an alien construction worker inspect the steep roof of an old-fashioned building overlooking lush green mountains. The dragon has vivid cobalt-blue scales, pale-gold scales beneath his jaw, ram-like horns fitted through a yellow hard hat, and a dark-clawed hand resting on polished reddish-gold copper flashing. Beside him, a grey-purple alien with four glowing amber eyes reviews a clipboard. Weathered greenish-grey slate shingles, a tall roof spire, copper, and strong sunlight fill the scene.' , text: 'Clear assessments and dependable repairs before a small issue becomes a larger one.' },
]

function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
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
    <section className={`services-section${visible ? ' is-visible' : ''}`} id="services" aria-label="Services" aria-describedby="services-background-description" ref={sectionRef}>
      <span id="services-background-description" className="visually-hidden">Background image: A wide, light beige background featuring a subtle, fine-grained texture resembling paper or smooth stone.</span>
      <div className="services-layout">
        <div className="services-slice-grid">
          {services.map((service, index) => (
            <article
              className="service-slice"
              key={service.title}
              style={{ '--service-index': index } as React.CSSProperties}
            >
              <StageImage base={`${asset}${service.image}`} sizes="26vw" defaultWidth={960} stage="services" alt={service.alt} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" />
              <span className="service-slice-shade" />
              <span className="service-slice-number">0{index + 1}</span>
              <span className="service-slice-content">
                <strong>{service.title === 'Repairs & Inspections' ? <>Repairs &<br />Inspections</> : service.title === 'Custom Fabrication' ? <>Custom<br />Fabrication</> : service.title}</strong>
                <span>{service.text}</span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

type GalleryImage = { file: string; alt: string }

const galleryImageCatalog: GalleryImage[] = [
  { file: '01-gothic-mountain-house-copper-trim', alt: 'Stone mountain house with steep slate roofs and copper trim.' },
  { file: '02-curved-copper-coastal-roof', alt: 'Modern coastal house with a wide curved copper roof.' },
  { file: '03-white-metal-roof-gold-trim', alt: 'White sculptural metal roof with polished gold trim.' },
  { file: '04-butterfly-copper-roof-house', alt: 'Modern house with a butterfly-shaped copper and white roof.' },
  { file: '05-patina-copper-fantasy-villa', alt: 'Ornate fantasy villa with sweeping green patina copper roofs.' },
  { file: '06-tiered-dark-metal-roof-house', alt: 'Modern house with layered dark metal roofs and copper edging.' },
  { file: '07-coastal-tile-and-patina-roof', alt: 'Coastal home with clay tiles and green patina roof accents.' },
  { file: '08-iridescent-curved-slate-roof', alt: 'Curved fantasy house roof covered in iridescent slate tiles.' },
  { file: '09-desert-mixed-metal-tile-roof', alt: 'Desert home with layered metal and tile roofing.' },
  { file: '10-flared-copper-roof-house', alt: 'Contemporary house with a dramatic flared copper roof.' },
  { file: '11-mountain-lodge-slate-copper-roof', alt: 'Mountain lodge with layered slate roofs and copper trim.' },
  { file: '12-weathered-patina-copper-roof', alt: 'Stone house with a weathered green patina copper roof.' },
  { file: '13-turquoise-tile-copper-trim-roof', alt: 'Curved turquoise tile roofs outlined with copper trim.' },
  { file: '14-lakeside-multicolor-slate-roof', alt: 'Lakeside house with multicolor slate roofs and copper edging.' },
  { file: '15-ornate-green-tile-copper-roof', alt: 'Ornate villa with green tile roofs and bright copper trim.' },
  { file: '16-coastal-curved-shingle-roof', alt: 'Coastal house with curved gray shingles and copper details.' },
  { file: '17-desert-standing-seam-copper-roof', alt: 'Desert house with sculpted standing-seam copper roofing.' },
  { file: '18-curved-dark-shingle-lake-house', alt: 'Lake house with dark curved shingle roofs and copper trim.' },
  { file: '19-sunset-coastal-curved-roof-home', alt: 'Coastal home at sunset with layered curved roofs.' },
  { file: '20-ornate-copper-slate-arched-roof', alt: 'Ornate house with arched slate roofs and copper framing.' },
  { file: '21-purple-curved-metal-coastal-roof', alt: 'Coastal home with a glossy purple curved metal roof.' },
  { file: '22-desert-copper-tile-estate', alt: 'Large desert estate with layered copper-colored tile roofs.' },
  { file: '23-purple-slate-copper-mansion', alt: 'Fantasy mansion with purple slate roofs and copper trim.' },
  { file: '24-angular-white-metal-roof', alt: 'Modern white house with sharp angular metal roofs.' },
  { file: '25-red-copper-slate-gothic-house', alt: 'Gothic house with steep slate roofs and red copper accents.' },
  { file: '26-copper-turret-gothic-mansion', alt: 'Gothic mansion with copper roofs and tall pointed turrets.' },
  { file: '27-white-metal-gold-trim-coastal-roof', alt: 'Coastal building with layered white metal roofs and gold trim.' },
  { file: '28-cobalt-blue-tile-coastal-estate', alt: 'Coastal estate with cobalt blue tile roofs and layered gables.' },
  { file: '29-terracotta-tile-desert-estate', alt: 'Desert estate with warm terracotta tile roofs and courtyards.' },
  { file: '30-sunset-lakeside-standing-seam-lodge', alt: 'Lakeside lodge at sunset with clean standing-seam metal roofs.' },
  { file: '31-tiered-dark-standing-seam-roof', alt: 'Large home with tiered dark standing-seam roofs.' },
  { file: '32-sunset-lakeside-copper-shingle-estate', alt: 'Lakeside estate at sunset with layered copper shingle roofs.' },
  { file: '33-dark-slate-lakeside-estate', alt: 'Lakeside estate with steep dark slate roofs.' },
  { file: '34-iridescent-teal-tile-coastal-hotel', alt: 'Coastal hotel with iridescent teal tile roofs.' },
  { file: '35-green-tile-copper-trim-lakeside-mansion', alt: 'Lakeside mansion with green tile roofs and copper trim.' },
  { file: '36-tan-tile-vineyard-estate', alt: 'Vineyard estate with broad tan tile roofs.' },
  { file: '37-silver-metal-tile-coastal-home', alt: 'Coastal home with sculpted silver metal tile roofs.' },
  { file: '38-gold-hexagonal-tile-coastal-resort', alt: 'Coastal resort with geometric gold hexagonal tile roofs.' },
  { file: '39-cedar-shake-mountain-lodge', alt: 'Mountain lodge with layered cedar shake roofs.' },
  { file: '40-modern-solar-panel-roof-building', alt: 'Modern building with an integrated solar panel roof.' },
  { file: '41-dark-slate-turret-coastal-estate', alt: 'Coastal estate with dark slate roofs and pointed turrets.' },
  { file: '42-tropical-thatch-oceanfront-villa', alt: 'Oceanfront villa with layered tropical thatch roofs.' },
  { file: '43-modern-green-living-roof-building', alt: 'Modern building with a lush green living roof.' },
  { file: '44-curved-green-living-roof-building', alt: 'Contemporary building with curved green living roofs.' },
  { file: '45-cobalt-blue-tile-coastal-villa', alt: 'Coastal villa with vivid cobalt blue tile roofs.' },
  { file: '46-indigo-tile-coastal-estate', alt: 'Coastal estate with layered indigo tile roofs.' },
  { file: '47-red-terracotta-tile-coastal-estate', alt: 'Coastal estate with red terracotta tile roofs.' },
  { file: '48-terracotta-tile-mountain-estate', alt: 'Mountain estate with sweeping terracotta tile roofs.' },
  { file: '49-grey-metal-standing-seam-lakeside-estate', alt: 'Lakeside estate with cool grey standing-seam metal roofs.' },
  { file: '50-patina-metal-standing-seam-coastal-lodge', alt: 'Coastal lodge with patina metal standing-seam roofs.' },
  { file: '51-charcoal-standing-seam-lakeside-home', alt: 'Lakeside home with charcoal standing-seam roofing.' },
  { file: '52-dark-metal-standing-seam-mountain-home', alt: 'Mountain home with dark metal standing-seam roofs.' },
  { file: '53-copper-shingle-turret-coastal-estate', alt: 'Coastal estate with copper shingle roofs and a turret.' },
  { file: '54-copper-shingle-oceanfront-estate', alt: 'Oceanfront estate with layered copper shingle roofs.' },
  { file: '55-charcoal-slate-lakeside-mansion', alt: 'Lakeside mansion with charcoal slate roofs.' },
  { file: '56-dark-slate-coastal-stone-estate', alt: 'Coastal stone estate with broad dark slate roofs.' },
  { file: '57-patina-scalloped-tile-lakeside-mansion', alt: 'Lakeside mansion with patina scalloped tile roofs.' },
  { file: '58-iridescent-teal-diamond-tile-coastal-mansion', alt: 'Coastal mansion with iridescent teal diamond tile roofs.' },
  { file: '59-patina-scalloped-tile-coastal-chateau', alt: 'Coastal chateau with layered patina scalloped tile roofs.' },
  { file: '60-green-scalloped-tile-copper-trim-mansion', alt: 'Mansion with green scalloped tile roofs and copper trim.' },
  { file: '61-sand-tile-coastal-estate', alt: 'Coastal estate with softly colored sand tile roofs.' },
  { file: '62-cream-tile-waterfront-estate', alt: 'Waterfront mansion with elegant cream tile roofs.' },
  { file: '63-slate-grey-tile-coastal-home', alt: 'Coastal home with slate grey tile roofs.' },
  { file: '64-light-grey-tile-coastal-villa', alt: 'Coastal villa with layered light grey tile roofs.' },
  { file: '65-gold-hexagonal-tile-waterfront-mansion', alt: 'Waterfront mansion with ornate gold hexagonal tile roofs.' },
  { file: '66-gold-scalloped-tile-tropical-estate', alt: 'Tropical estate with gleaming gold scalloped tile roofs.' },
  { file: '67-cedar-shake-lakeside-lodge', alt: 'Lakeside lodge with warm cedar shake roofs.' },
  { file: '68-cedar-shake-lakeside-estate', alt: 'Lakeside estate with expansive cedar shake roofs.' },
  { file: '69-dark-solar-tile-lakeside-villa', alt: 'Lakeside villa with integrated dark solar tile roofs.' },
  { file: '70-solar-tile-lakeside-stone-home', alt: 'Stone lakeside home with solar tile roofing.' },
  { file: '71-slate-blue-scalloped-tile-coastal-mansion', alt: 'Coastal mansion with slate blue scalloped tile roofs.' },
  { file: '72-slate-blue-scalloped-tile-coastal-mansion', alt: 'Coastal mansion with layered slate blue scalloped tile roofs.' },
  { file: '73-tropical-thatch-cliffside-villa', alt: 'Cliffside villa with sweeping tropical thatch roofs.' },
  { file: '74-thatch-roof-tropical-pool-villa', alt: 'Tropical pool villa with layered thatch roofs.' },
  { file: '75-living-green-roof-coastal-retreat', alt: 'Coastal retreat with a lush living green roof.' },
  { file: '76-angular-green-living-roof-coastal-villa', alt: 'Coastal villa with angular green living roofs.' },
]

function shuffleGalleryImages(images: GalleryImage[]) {
  const shuffled = [...images]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentImage = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = currentImage
  }
  return shuffled
}

// Shuffle once per app load so every refresh presents a new gallery sequence.
const galleryImages = shuffleGalleryImages(galleryImageCatalog)

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
const galleryPreviewIndices = GALLERY_PREVIEW_SLOTS.map(({ initialImage }) => initialImage)
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

  const setArrowShift = useCallback((shift: number) => {
    currentShiftRef.current = shift
    if (arrowRef.current) arrowRef.current.style.transform = `translate3d(${shift}px, 0, 0)`
  }, [])

  const stopArrowMotion = useCallback(() => {
    const arrow = arrowRef.current
    if (animationRef.current && arrow) {
      const currentShift = readArrowShift()
      animationRef.current.cancel()
      setArrowShift(currentShift)
    } else {
      animationRef.current?.cancel()
    }
    animationRef.current = null
    if (chargeFrameRef.current) cancelAnimationFrame(chargeFrameRef.current)
    chargeFrameRef.current = null
  }, [readArrowShift, setArrowShift])

  const runArrowAnimation = useCallback((arrow: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions, finalShift: number) => {
    if (typeof arrow.animate !== 'function') {
      setArrowShift(finalShift)
      return null
    }
    const animation = arrow.animate(keyframes, options)
    animation.onfinish = () => {
      setArrowShift(finalShift)
      animationRef.current = null
    }
    return animation
  }, [setArrowShift])

  const springArrowTo = useCallback((target: number) => {
    const arrow = arrowRef.current
    if (!arrow) return
    const start = readArrowShift()
    stopArrowMotion()
    animationRef.current = runArrowAnimation(arrow, [
      { transform: `translate3d(${start}px, 0, 0)`, offset: 0 },
      { transform: `translate3d(${target * 1.42}px, 0, 0)`, offset: .58 },
      { transform: `translate3d(${target * .88}px, 0, 0)`, offset: .82 },
      { transform: `translate3d(${target}px, 0, 0)`, offset: 1 },
    ], { duration: 360, easing: 'cubic-bezier(.2,.82,.25,1)' }, target)
  }, [readArrowShift, runArrowAnimation, stopArrowMotion])

  const releaseArrow = useCallback((held: boolean, keyboardHold = false) => {
    const arrow = arrowRef.current
    if (!arrow) return
    const start = readArrowShift()
    stopArrowMotion()
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
    animationRef.current = runArrowAnimation(arrow, keyframes, { duration: keyboardHold && held ? 360 : held ? 510 : 270, easing: keyboardHold && held ? 'cubic-bezier(.22,.8,.3,1)' : 'cubic-bezier(.2,.76,.22,1)' }, 0)
  }, [pullbackOffset, readArrowShift, runArrowAnimation, stopArrowMotion, travelOffset])

  const releasePointer = useCallback((event?: React.PointerEvent<HTMLButtonElement>) => {
    if (!pressedRef.current) return
    const held = performance.now() - pressStartedRef.current >= 150
    pressedRef.current = false
    setPointerPressed(false)
    releaseArrow(held)
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
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

  useEffect(() => () => {
    pressedRef.current = false
    setPointerPressed(false)
    stopArrowMotion()
  }, [stopArrowMotion])

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
        if (event.pointerType === 'mouse' && event.button !== 0) return
        if (pressedRef.current) return
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          // Pointer capture is a robustness enhancement, not a reason to abort.
        }
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
      onLostPointerCapture={releasePointer}
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
  const activeImage = images[activeIndex]
  const preloadedImagesRef = useRef(new Map<string, HTMLImageElement>())

  useEffect(() => {
    const preloadIndexes = [-1, 0, 1].map((offset) => (activeIndex + offset + images.length) % images.length)
    preloadedImagesRef.current.forEach((image, src) => {
      const stillWanted = preloadIndexes.some((index) => responsiveImage(`${asset}gallery/${images[index].file}`, '94vw', 960).src === src)
      if (!stillWanted) {
        image.src = ''
        preloadedImagesRef.current.delete(src)
      }
    })
    preloadIndexes.forEach((index) => {
      const src = responsiveImage(`${asset}gallery/${images[index].file}`, '94vw', 960).src
      if (preloadedImagesRef.current.has(src)) return
      const image = new Image()
      image.decoding = 'async'
      image.src = src
      preloadedImagesRef.current.set(src, image)
    })
  }, [activeIndex, images])

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setCloseShockwave((current) => current + 1)
    setIsClosing(true)
  }, [])

  const navigate = useCallback((direction: -1 | 1) => {
    onSelect((activeIndex + direction + images.length) % images.length)
  }, [activeIndex, images.length, onSelect])

  const keyboardRepeatingRef = useGalleryKeyboardNavigation((direction, repeating) => {
    if (!repeating) {
      setActiveControl(direction === 1 ? 'next' : 'previous')
      setControlPressCount((current) => ({ ...current, [direction === 1 ? 'next' : 'previous']: current[direction === 1 ? 'next' : 'previous'] + 1 }))
    }
    setSuppressArrowHover(true)
    navigate(direction)
  }, () => {
    setSuppressArrowHover(false)
    setActiveControl(null)
  })
  useActiveThumbnailScroll(sequenceListRef, activeIndex, keyboardRepeatingRef.current)

  useBodyScrollLock(true)
  useDialogFocus(modalFrameRef, handleClose)

  useEffect(() => {
    document.body.classList.add('gallery-modal-open')
    return () => {
      document.body.classList.remove('gallery-modal-open')
    }
  }, [])

  const modal = (
    <div className={`gallery-modal-backdrop${isClosing ? ' is-closing' : ''}`} role="presentation" onPointerDown={(event) => { if (event.currentTarget === event.target) handleClose() }}>
      <section className={`gallery-modal-frame${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label="Roofscape gallery viewer" tabIndex={-1} ref={modalFrameRef} onAnimationEnd={(event) => {
        if (isClosing && event.target === event.currentTarget && event.animationName === 'gallery-frame-out') onClose()
      }}>
        <div className="gallery-modal-stage" onPointerMove={() => setSuppressArrowHover(false)}>
          <div className="gallery-modal-meta">
            <span>Roofscape</span>
            <strong>{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</strong>
          </div>
          <img {...responsiveImage(`${asset}gallery/${activeImage.file}`, '94vw', 960)} alt={activeImage.alt} loading="eager" decoding="async" />
          <GalleryArrowButton direction="previous" keyboardActive={activeControl === 'previous'} pressCount={controlPressCount.previous} suppressHover={suppressArrowHover} onActivate={() => navigate(-1)} />
          <GalleryArrowButton direction="next" keyboardActive={activeControl === 'next'} pressCount={controlPressCount.next} suppressHover={suppressArrowHover} onActivate={() => navigate(1)} />
        </div>
        <aside className="gallery-sequence" aria-label="All gallery images">
          <div className="gallery-sequence-list" ref={sequenceListRef}>
            {images.map((image, imageIndex) => (
              <button className={activeIndex === imageIndex ? 'is-active' : ''} type="button" onClick={() => onSelect(imageIndex)} key={image.file} aria-label={`View image ${imageIndex + 1}: ${image.alt}`} aria-current={activeIndex === imageIndex ? 'true' : undefined}>
                <img {...responsiveImage(`${asset}gallery/${image.file}`, '112px', 640)} alt="" loading="lazy" decoding="async" />
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

  const cardSizes = slot === 0 ? '66.7vw' : '33.3vw'

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
      <StageImage base={`${asset}gallery/${displayed.image.file}`} sizes={cardSizes} defaultWidth={960} stage="gallery" className={`gallery-card-image gallery-card-image-current${incoming ? ` gallery-card-image-outgoing gallery-card-image-out-${incomingDirection}` : ''}`} alt={displayed.image.alt} loading={slot < 3 ? 'eager' : 'lazy'} />
      {incoming && (
        <StageImage
          base={`${asset}gallery/${incoming.image.file}`}
          sizes={cardSizes}
          defaultWidth={960}
          stage="gallery"
          className={`gallery-card-image gallery-card-image-incoming gallery-card-image-from-${incomingDirection}`}
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
  const galleryReveal = useRevealOnce<HTMLElement>(galleryObserverOptions)
  const sectionRef = galleryReveal.ref
  const inView = galleryReveal.inView
  const revealed = galleryReveal.revealed
  const images = galleryImages
  const documentVisible = useDocumentVisibility()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [activeMaterialIndex, setActiveMaterialIndex] = useState<number | null>(null)
  const hoveredSlotRef = useRef<number | null>(null)
  const closeGallery = useCallback(() => setActiveIndex(null), [])
  const previewIndices = useGalleryPreviewRotation(
    images.length,
    galleryPreviewIndices.filter((imageIndex) => galleryImages[imageIndex]),
    GALLERY_PREVIEW_SLOTS,
    GALLERY_SWAP_CONFIG,
    !inView || !documentVisible || activeIndex !== null,
    hoveredSlotRef,
  )

  const visibleImages = images.length
    ? previewIndices
      .map((imageIndex, slot) => ({ image: images[imageIndex], imageIndex, slot }))
    : []

  const renderGalleryCard = ({ image, imageIndex, slot }: { image: GalleryImage; imageIndex: number; slot: number }) => (
    <GalleryCard image={image} imageIndex={imageIndex} slot={slot} slideDirections={gallerySlideDirections[slot]} onOpen={() => setActiveIndex(imageIndex)} onHoverChange={(hoveredSlot) => { hoveredSlotRef.current = hoveredSlot }} key={`gallery-preview-${slot}`} />
  )

  return (
    <section className={`gallery-section${revealed ? ' is-visible' : ''}`} id="work" aria-label="Gallery" ref={sectionRef}>
      <div className="gallery-layout">
        <div className="gallery-content">
          <div className="gallery-showcase-shell">
            <div className="gallery-showcase">
              {visibleImages.map(renderGalleryCard)}
            </div>
          </div>
          <aside className="gallery-material-library" aria-labelledby="materials-title">
            <div className="gallery-material-heading">
              <span className="gallery-material-kicker">Northline / Roof systems</span>
              <h2 id="materials-title">Material library</h2>
              <span className="gallery-material-rule" />
            </div>
            <div className="gallery-material-art">
              <div className="gallery-material-clip">
                <StageImage base="/assets/gallery/material-library" sizes="32vw" defaultWidth={960} stage="gallery" alt="A front-facing display of sixteen fantasy roofing material samples arranged in two columns like a premium architectural showroom library." />
                <div className="gallery-material-labels">
                  {roofMaterials.map(([number, name, detail], index) => (
                    <button
                      className={`gallery-material-label${activeMaterialIndex === index ? ' is-active' : ''}`}
                      type="button"
                      onClick={() => setActiveMaterialIndex((current) => current === index ? null : index)}
                      key={number}
                      aria-label={`${number}: ${name}. ${detail}`}
                      aria-pressed={activeMaterialIndex === index}
                    >
                      <span>{number}</span>
                      <strong>{name}</strong>
                      <small>{detail}</small>
                    </button>
                  ))}
                </div>
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
  const { style, stageClassName } = useAssetStage()
  return (
    <div className={`app ${stageClassName}`} style={style}>
      <ScaledArtboard>
        <Header onBookAppointment={openAppointment} />
        <main>
          <Hero onBookAppointment={openAppointment} />
          <BadgeStrip />
          <Services />
          <Gallery />
          <CopperEdgeSeam />
          <AssociationsMarquee />
          <CopperEdgeSeam />
          <PremiumSections />
        </main>
        <PremiumFooter onBook={openAppointment} />
      </ScaledArtboard>
      <CustomerServiceHologram onBook={openAppointment} />
      {appointmentOpen && <AppointmentModal onClose={closeAppointment} />}
    </div>
  )
}

function Root() {
  const galleryAssets = galleryPreviewIndices.map((index) => `/assets/gallery/${galleryImages[index].file}`)
  return <AssetStageProvider galleryAssets={galleryAssets}><App /></AssetStageProvider>
}

createRoot(document.getElementById('root')!).render(<Root />)
