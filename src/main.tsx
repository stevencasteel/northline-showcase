import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Phone } from 'lucide-react'
import './styles.css'

const asset = '/assets/'

function isMobileDevice() {
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(navigator.userAgent)
  const touchDevice = navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches
  return mobileUserAgent || touchDevice
}

function Header() {
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
      <a className="header-quote" href="#contact">Request a quote</a>
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

function Hero() {
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
        <h1>Custom roofing<br /><span>since year 4-211.</span></h1>
        <p className="hero-description">Complete roofing systems, exterior protection, and water<span className="desktop-break"><br /></span>management—installed by a local crew that sweats every detail.<span className="desktop-break"><br /></span> Clear pricing, exacting standards, and zero shortcuts.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#contact">Request a quote</a>
          <a className="button button-call" href="tel:+15555555555"><Phone size={20} /> <span>(555) 555-5555</span></a>
        </div>
      </div>
    </section>
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

function App() {
  const mobileDevice = isMobileDevice()
  return <div className={mobileDevice ? 'app is-mobile-device' : 'app'}><Header /><main><Hero /><BadgeStrip /></main></div>
}

createRoot(document.getElementById('root')!).render(<App />)
