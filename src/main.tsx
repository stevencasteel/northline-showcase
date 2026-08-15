import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  UserRound,
  X,
} from "lucide-react";
import "./styles.css";
import "./site-sections.css";
import {
  AssociationsMarquee,
  CustomerServiceHologram,
  PremiumFooter,
  SiteSections,
} from "./SiteSections";
import { useDocumentVisibility } from "./hooks/useDocumentVisibility";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useRevealOnce } from "./hooks/useRevealOnce";
import { useInView } from "./hooks/useInView";
import { useGalleryKeyboardNavigation } from "./hooks/useGalleryKeyboardNavigation";
import { useActiveThumbnailScroll } from "./hooks/useActiveThumbnailScroll";
import { useGalleryPreviewCycle } from "./hooks/useGalleryPreviewCycle";
import { ScaledArtboard } from "./components/ScaledArtboard";
import { RasterStateArt } from "./components/RasterStateArt";
import { siteConfig } from "./config/site";
import { appointmentConfig, appointmentHoursLabel } from "./config/appointment";
import { services } from "./config/services";
import {
  GALLERY_PREVIEW_SLOTS,
  GALLERY_PREVIEW_CYCLE_CONFIG,
} from "./config/gallery";
import {
  asResponsiveAsset,
  preloadResponsiveImage,
  responsiveImage,
  responsiveAssetMetadata,
} from "./lib/responsiveImage";
import {
  percentFromPixels,
  sourceRectToPercentVariables,
} from "./lib/geometry";
import {
  SectionAssetProvider,
  SectionImage,
  useSectionAssets,
} from "./lib/assetStages";
import { DialogModal } from "./components/DialogModal";
import { CopperEdgeSeam } from "./components/CopperEdgeSeam";

const asset = "/assets/";
const heroSkyMetadata = responsiveAssetMetadata(
  asResponsiveAsset("/assets/hero/sky"),
);

function AnimatedHeroLine({
  text,
  accent = false,
}: {
  text: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`hero-line${accent ? " hero-accent" : ""}`}
      style={{ "--line-delay": ".14s" } as React.CSSProperties}
      aria-hidden="true"
    >
      {Array.from(text).map((character, index) => (
        <span
          className="hero-char"
          style={{ "--char-index": index } as React.CSSProperties}
          key={`${character}-${index}`}
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}

function Header({ onBookAppointment }: { onBookAppointment: () => void }) {
  return (
    <header
      className="site-header"
      aria-describedby="site-header-background-description"
    >
      <span id="site-header-background-description" className="visually-hidden">
        Background image: A wide, light beige background featuring a subtle,
        fine-grained texture resembling paper or smooth stone.
      </span>
      <a className="brand" href="#top" aria-label="Northline Roofing home">
        <img
          className="brand-logo"
          src={`${asset}brand/combination-mark.svg`}
          alt="Northline Roofing combination logo: a geometric navy, cream, and burnt-orange N emblem beside NORTHLINE ROOFING and the subtitle RESIDENTIAL & COMMERCIAL SYSTEMS."
        />
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        <a className="raster-control" href="#services" aria-label="Services">
          <RasterStateArt
            defaultAsset={{
              kind: "static",
              src: `${asset}navbar/nav_services_default.png`,
              width: 447,
              height: 164,
            }}
            hoverAsset={{
              kind: "static",
              src: `${asset}navbar/nav_services_hover.png`,
              width: 447,
              height: 164,
            }}
            alt="Services"
          />
        </a>
        <a className="raster-control" href="#gallery" aria-label="Gallery">
          <RasterStateArt
            defaultAsset={{
              kind: "static",
              src: `${asset}navbar/nav_gallery_default.png`,
              width: 440,
              height: 154,
            }}
            hoverAsset={{
              kind: "static",
              src: `${asset}navbar/nav_gallery_hover.png`,
              width: 440,
              height: 154,
            }}
            alt="Gallery"
          />
        </a>
        <a
          className="raster-control"
          href="#associations"
          aria-label="Associations"
        >
          <RasterStateArt
            defaultAsset={{
              kind: "static",
              src: `${asset}navbar/nav_associations_default.png`,
              width: 492,
              height: 150,
            }}
            hoverAsset={{
              kind: "static",
              src: `${asset}navbar/nav_associations_hover.png`,
              width: 492,
              height: 150,
            }}
            alt="Associations"
          />
        </a>
        <a
          className="raster-control"
          href="#protection"
          aria-label="Protection"
        >
          <RasterStateArt
            defaultAsset={{
              kind: "static",
              src: `${asset}navbar/nav_protection_default.png`,
              width: 464,
              height: 142,
            }}
            hoverAsset={{
              kind: "static",
              src: `${asset}navbar/nav_protection_hover.png`,
              width: 464,
              height: 142,
            }}
            alt="Protection"
          />
        </a>
        <a className="raster-control" href="#reviews" aria-label="Reviews">
          <RasterStateArt
            defaultAsset={{
              kind: "static",
              src: `${asset}navbar/nav_reviews_default.png`,
              width: 415,
              height: 163,
            }}
            hoverAsset={{
              kind: "static",
              src: `${asset}navbar/nav_reviews_hover.png`,
              width: 415,
              height: 163,
            }}
            alt="Reviews"
          />
        </a>
        <a className="raster-control" href="#founder" aria-label="Founder">
          <RasterStateArt
            defaultAsset={{
              kind: "static",
              src: `${asset}navbar/nav_founder_default.png`,
              width: 414,
              height: 154,
            }}
            hoverAsset={{
              kind: "static",
              src: `${asset}navbar/nav_founder_hover.png`,
              width: 414,
              height: 154,
            }}
            alt="Founder"
          />
        </a>
        <a className="raster-control" href="#contact" aria-label="Contact">
          <RasterStateArt
            defaultAsset={{
              kind: "static",
              src: `${asset}navbar/nav_contact_default.png`,
              width: 426,
              height: 150,
            }}
            hoverAsset={{
              kind: "static",
              src: `${asset}navbar/nav_contact_hover.png`,
              width: 426,
              height: 150,
            }}
            alt="Contact"
          />
        </a>
      </nav>
      <a
        className="header-phone navbar-art-link raster-control"
        href={siteConfig.phoneHref}
        aria-label={`Call ${siteConfig.phoneDisplay}`}
      >
        <RasterStateArt
          defaultAsset={{
            kind: "responsive",
            base: "/assets/navbar/nav_phone_default",
          }}
          hoverAsset={{
            kind: "responsive",
            base: "/assets/navbar/nav_phone_hover",
          }}
          sizes="18vw"
          alt={`Call ${siteConfig.phoneDisplay}`}
        />
      </a>
      <button
        className="header-appointment navbar-art-button raster-control"
        type="button"
        onClick={onBookAppointment}
        aria-label="Book an appointment"
      >
        <RasterStateArt
          defaultAsset={{
            kind: "responsive",
            base: "/assets/navbar/nav_book-appt_default",
          }}
          hoverAsset={{
            kind: "responsive",
            base: "/assets/navbar/nav_book-appt_hover",
          }}
          sizes="16vw"
          alt="Book an appointment"
        />
      </button>
    </header>
  );
}

function useNavbarScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useEffect(() => {
    const update = () => {
      const next = window.scrollY > 4;
      if (next === scrolledRef.current) return;
      scrolledRef.current = next;
      setScrolled(next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return scrolled;
}

function useNavbarScrollOffset(
  shellRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const root = document.documentElement;
    const update = () =>
      root.style.setProperty(
        "--sticky-header-height",
        `${shell.getBoundingClientRect().height}px`,
      );
    update();
    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(update) : null;
    resizeObserver?.observe(shell);
    window.addEventListener("resize", update);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("--sticky-header-height");
    };
  }, [shellRef]);
}

function Hero({ onBookAppointment }: { onBookAppointment: () => void }) {
  const heroRef = useRef<HTMLElement>(null);
  const skyTrackRef = useRef<HTMLDivElement>(null);
  const skyImageRef = useRef<HTMLImageElement>(null);
  const foregroundImageRef = useRef<HTMLImageElement>(null);
  const [heroAssetsReady, setHeroAssetsReady] = useState(false);
  const inView = useInView(heroRef, { threshold: 0.01 });
  const documentVisible = useDocumentVisibility();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const images = [skyImageRef.current, foregroundImageRef.current].filter(
      (image): image is HTMLImageElement => Boolean(image),
    );
    let readinessCheckStarted = false;
    let cancelled = false;
    const checkLoaded = () => {
      if (
        readinessCheckStarted ||
        !images.every((image) => image.complete && image.naturalWidth > 0)
      )
        return;
      readinessCheckStarted = true;
      Promise.all(
        images.map((image) => image.decode().catch(() => undefined)),
      ).then(() => {
        if (!cancelled) setHeroAssetsReady(true);
      });
    };

    images.forEach((image) => image.addEventListener("load", checkLoaded));
    checkLoaded();
    return () => {
      cancelled = true;
      images.forEach((image) => image.removeEventListener("load", checkLoaded));
    };
  }, []);

  useEffect(() => {
    const track = skyTrackRef.current;
    const image = skyImageRef.current;
    if (
      !track ||
      !image ||
      !heroAssetsReady ||
      !inView ||
      !documentVisible ||
      reducedMotion
    )
      return;

    let frame = 0;
    let transformOffsetLocalPx = 0;
    let travelDistanceVisualPx = 0;
    const speed = 13;

    const measure = () => {
      const imageWidthVisualPx = image.getBoundingClientRect().width;
      const viewportWidthVisualPx =
        track.parentElement?.getBoundingClientRect().width ?? 0;
      // Compatibility: these visual-pixel measurements intentionally feed a
      // pre-artboard CSS-pixel transform until a motion change is approved.
      travelDistanceVisualPx = Math.max(
        0,
        imageWidthVisualPx - viewportWidthVisualPx,
      );
      transformOffsetLocalPx =
        travelDistanceVisualPx > 0
          ? transformOffsetLocalPx % travelDistanceVisualPx
          : 0;
    };
    const animate = (time: number) => {
      const elapsed = time - previousTime;
      previousTime = time;
      if (travelDistanceVisualPx > 0) {
        transformOffsetLocalPx =
          (transformOffsetLocalPx + (speed * elapsed) / 1000) %
          travelDistanceVisualPx;
        track.style.transform = `translate3d(${-transformOffsetLocalPx}px, 0, 0)`;
      }
      frame = window.requestAnimationFrame(animate);
    };
    let previousTime = performance.now();
    measure();
    image.addEventListener("load", measure);
    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(track.parentElement ?? track);
    }
    window.addEventListener("resize", measure);
    frame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
      image.removeEventListener("load", measure);
    };
  }, [documentVisible, heroAssetsReady, inView, reducedMotion]);

  return (
    <section
      className={`hero${inView && documentVisible && !reducedMotion ? " is-sky-active" : ""}${heroAssetsReady ? " is-hero-assets-ready" : ""}`}
      id="top"
      ref={heroRef}
    >
      <div className="hero-sky-reveal" aria-hidden="true">
        <div className="hero-sky-track" ref={skyTrackRef}>
          <img
            className="hero-sky"
            ref={skyImageRef}
            {...responsiveImage("/assets/hero/sky", "100vw", 1440)}
            style={
              {
                "--hero-sky-aspect-ratio": `${heroSkyMetadata.sourceWidth} / ${heroSkyMetadata.sourceHeight}`,
              } as React.CSSProperties
            }
            alt="Bright blue sky with fluffy white cumulus clouds over distant mountain ranges, designed as a seamless background layer for the Northline Roofing hero image."
          />
        </div>
      </div>
      <img
        className="hero-image"
        ref={foregroundImageRef}
        {...responsiveImage("/assets/hero/foreground", "100vw", 1920)}
        fetchPriority="high"
        loading="eager"
        decoding="async"
        alt="A wide panoramic scene showing a human construction worker and a green-skinned orc installing tiles on the vast, intricate roof of a grand estate overlooking a pristine lake landscape. A middle-aged human with grey stubble leans forward on the right slope beside a muscular orc operating a bright orange power tool. The sweeping roof is clad in glossy bluish-green solar shingles with polished copper trim, arched dormers, and elegant finials; below, evergreen trees line a deep-blue bay toward distant mountains. The sky area is transparent so this foreground layer can be paired with a separate sky layer."
      />
      <div className="hero-reveal-curtain" aria-hidden="true" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">Northline Roofing</p>
        <h1 aria-label="Custom roofing since year 4-211.">
          <AnimatedHeroLine text="Custom roofing" />
          <br />
          <AnimatedHeroLine text="since year 4-211." accent />
        </h1>
        <p className="hero-description">
          Complete roofing systems, exterior protection, and water
          <span className="desktop-break">
            <br />
          </span>
          management—installed by a local crew that sweats every detail.
          <span className="desktop-break">
            <br />
          </span>{" "}
          Clear pricing, exacting standards, and zero shortcuts.
        </p>
        <div className="hero-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={onBookAppointment}
          >
            <CalendarDays aria-hidden="true" /> <span>Book an Appointment</span>{" "}
            <ArrowRight aria-hidden="true" />
          </button>
          <a className="button button-call" href={siteConfig.phoneHref}>
            <Phone size={20} /> <span>{siteConfig.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function AppointmentModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState("");

  return (
    <DialogModal
      backdropClassName="appointment-backdrop"
      dialogClassName="appointment-modal"
      ariaLabelledBy="appointment-title"
      onClose={onClose}
    >
      <header className="appointment-modal-header">
        <div>
          <p className="appointment-kicker">Northline Roofing</p>
          <h2 id="appointment-title">Book an Appointment</h2>
          <p>{siteConfig.appointmentSummary}</p>
        </div>
        <button
          className="modal-close"
          type="button"
          aria-label="Close appointment form"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
      </header>
      <div className="appointment-modal-scroll">
        <form
          className="appointment-form"
          onSubmit={(event) => {
            event.preventDefault();
            setError(
              `This appointment form is not connected yet. Please call ${siteConfig.phoneDisplay} to schedule your appointment.`,
            );
          }}
        >
          <div className="form-grid form-grid-two form-grid-contact">
            <label>
              <span>
                Full Name <b>*</b>
              </span>
              <div className="input-wrap">
                <UserRound aria-hidden="true" />
                <input
                  required
                  name="name"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
            </label>
            <label>
              <span>
                Phone Number <b>*</b>
              </span>
              <div className="input-wrap">
                <Phone aria-hidden="true" />
                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  autoComplete="tel"
                />
              </div>
            </label>
          </div>
          <label>
            <span>
              Email Address <b>*</b>
            </span>
            <div className="input-wrap">
              <Mail aria-hidden="true" />
              <input
                required
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </label>
          <label>
            <span>Property Address</span>
            <div className="input-wrap">
              <MapPin aria-hidden="true" />
              <input
                name="address"
                placeholder="Street address"
                autoComplete="street-address"
              />
            </div>
          </label>
          <div className="form-grid form-grid-two form-grid-address">
            <label>
              <span>City</span>
              <input
                name="city"
                placeholder="Your city"
                autoComplete="address-level2"
              />
            </label>
            <label>
              <span>Postal Code</span>
              <input
                name="postal-code"
                placeholder="ZIP / postal code"
                autoComplete="postal-code"
              />
            </label>
          </div>
          <div className="form-grid form-grid-two form-grid-appointment">
            <label>
              <span>
                Preferred Date <b>*</b>
              </span>
              <div className="input-wrap">
                <CalendarDays aria-hidden="true" />
                <input required name="date" type="date" />
              </div>
              <small>
                {appointmentHoursLabel} · {appointmentConfig.advanceNoticeHours}
                hr advance notice
              </small>
            </label>
            <label>
              <span>
                Time Preference <b>*</b>
              </span>
              <select required name="time">
                <option value="">Select a time</option>
                {appointmentConfig.windows.map((window) => (
                  <option value={window.id} key={window.id}>
                    {window.label} · {window.start.slice(0, 2)}–
                    {window.end.slice(0, 2)}
                  </option>
                ))}
              </select>
              <small>We’ll call when we’re on the way</small>
            </label>
          </div>
          <label>
            <span>
              Service Type <b>*</b>
            </span>
            <select required name="service">
              <option value="">Select a service</option>
              {appointmentConfig.serviceOptions.map((service) => (
                <option
                  value={service.toLowerCase().replaceAll(" ", "-")}
                  key={service}
                >
                  {service}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Additional Notes</span>
            <div className="input-wrap textarea-wrap">
              <MessageSquare aria-hidden="true" />
              <textarea
                name="notes"
                placeholder="Tell us about your roof or project..."
              />
            </div>
          </label>
          {error && (
            <p className="appointment-form-error" role="alert">
              <AlertCircle aria-hidden="true" />
              {error}
            </p>
          )}
          <button className="appointment-submit" type="submit">
            <Send aria-hidden="true" /> <span>Book My Free Appointment</span>
          </button>
          <p className="appointment-footnote">
            {appointmentHoursLabel} · We’ll call to confirm · No obligation
          </p>
        </form>
      </div>
    </DialogModal>
  );
}

const BADGE_BANNER_BASE = "/assets/badges/banner" as const;
const badgeBannerMetadata = responsiveAssetMetadata(
  asResponsiveAsset(BADGE_BANNER_BASE),
);
const badgeSliceConfigs = [
  {
    destinationLeftPercent: 3.06,
    destinationWidthPercent: 17.4,
    sourceXpx: 65,
    sourceWidthPx: 380,
    animationDelaySeconds: 0.08,
  },
  {
    destinationLeftPercent: 22.8,
    destinationWidthPercent: 1.65,
    sourceXpx: 485,
    sourceWidthPx: 35,
    animationDelaySeconds: 0.2,
  },
  {
    destinationLeftPercent: 25.86,
    destinationWidthPercent: 17.4,
    sourceXpx: 550,
    sourceWidthPx: 370,
    animationDelaySeconds: 0.31,
  },
  {
    destinationLeftPercent: 45.13,
    destinationWidthPercent: 1.65,
    sourceXpx: 960,
    sourceWidthPx: 35,
    animationDelaySeconds: 0.42,
  },
  {
    destinationLeftPercent: 48.19,
    destinationWidthPercent: 23.51,
    sourceXpx: 1025,
    sourceWidthPx: 500,
    animationDelaySeconds: 0.53,
  },
  {
    destinationLeftPercent: 73.11,
    destinationWidthPercent: 1.65,
    sourceXpx: 1555,
    sourceWidthPx: 35,
    animationDelaySeconds: 0.64,
  },
  {
    destinationLeftPercent: 76.16,
    destinationWidthPercent: 21.63,
    sourceXpx: 1620,
    sourceWidthPx: 460,
    animationDelaySeconds: 0.75,
  },
] as const;

function badgeSliceStyle(
  config: (typeof badgeSliceConfigs)[number],
): React.CSSProperties {
  return {
    "--badge-destination-left": `${config.destinationLeftPercent}%`,
    "--badge-destination-width": `${config.destinationWidthPercent}%`,
    "--badge-image-left": percentFromPixels(
      -config.sourceXpx,
      config.sourceWidthPx,
      2,
    ),
    "--badge-image-width": percentFromPixels(
      badgeBannerMetadata.sourceWidth,
      config.sourceWidthPx,
      2,
    ),
    "--badge-animation-delay": `${config.animationDelaySeconds}s`,
  } as React.CSSProperties;
}

function BadgeStrip() {
  return (
    <section
      className="badge-strip"
      id="qualifications"
      aria-label="Northline Roofing qualifications"
    >
      <div
        className="badge-sprite-canvas"
        aria-hidden="true"
        style={
          {
            "--badge-sprite-aspect-ratio": `${badgeBannerMetadata.sourceWidth} / ${badgeBannerMetadata.sourceHeight}`,
          } as React.CSSProperties
        }
      >
        {badgeSliceConfigs.map((config) => (
          <div
            className="badge-slice"
            key={`${config.sourceXpx}-${config.sourceWidthPx}`}
            style={badgeSliceStyle(config)}
          >
            <SectionImage
              base={BADGE_BANNER_BASE}
              sizes="91vw"
              defaultWidth={1440}
              section="badges"
              alt=""
            />
          </div>
        ))}
      </div>
      <SectionImage
        className="badge-banner visually-hidden"
        base={BADGE_BANNER_BASE}
        sizes="91vw"
        defaultWidth={1440}
        section="badges"
        alt="Northline Roofing promotional banner divided into four sections by copper divider bars: a copper award medal with 300 YEARS EXPERIENCE; a copper palm tree with TROPICS LICENSED; a copper cityscape with RESIDENTIAL & COMMERCIAL; and a copper anvil and hammer with CUSTOM METAL FABRICATION."
      />
      <p className="visually-hidden">
        Northline Roofing qualifications: 300 years experience. Tropics
        licensed. Residential and commercial roofing. Custom metal fabrication.
      </p>
    </section>
  );
}

function Services() {
  const reveal = useRevealOnce<HTMLElement>({ threshold: 0.16 });

  return (
    <section
      className={`services-section${reveal.revealed ? " is-visible" : ""}`}
      id="services"
      aria-label="Services"
      aria-describedby="services-background-description"
      ref={reveal.ref}
    >
      <span id="services-background-description" className="visually-hidden">
        Background image: A wide, light beige background featuring a subtle,
        fine-grained texture resembling paper or smooth stone.
      </span>
      <div className="services-layout">
        <div className="services-slice-grid">
          {services.map((service, index) => (
            <article
              className="service-slice"
              key={service.title}
              style={{ "--service-index": index } as React.CSSProperties}
            >
              <SectionImage
                base={service.image}
                sizes="44vw"
                defaultWidth={1440}
                section="services"
                alt={service.alt}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
              />
              <span className="service-slice-shade" />
              <span className="service-slice-number">0{index + 1}</span>
              <span className="service-slice-content">
                <strong>
                  {service.title === "Repairs & Inspections" ? (
                    <>
                      Repairs &<br />
                      Inspections
                    </>
                  ) : service.title === "Custom Fabrication" ? (
                    <>
                      Custom
                      <br />
                      Fabrication
                    </>
                  ) : (
                    service.title
                  )}
                </strong>
                <span>{service.text}</span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

type GalleryImage = { assetBase: string; alt: string };

const galleryImageCatalog: GalleryImage[] = [
  {
    assetBase: "01-gothic-mountain-house-copper-trim",
    alt: "Stone mountain house with steep slate roofs and copper trim.",
  },
  {
    assetBase: "02-curved-copper-coastal-roof",
    alt: "Modern coastal house with a wide curved copper roof.",
  },
  {
    assetBase: "03-white-metal-roof-gold-trim",
    alt: "White sculptural metal roof with polished gold trim.",
  },
  {
    assetBase: "04-butterfly-copper-roof-house",
    alt: "Modern house with a butterfly-shaped copper and white roof.",
  },
  {
    assetBase: "05-patina-copper-fantasy-villa",
    alt: "Ornate fantasy villa with sweeping green patina copper roofs.",
  },
  {
    assetBase: "06-tiered-dark-metal-roof-house",
    alt: "Modern house with layered dark metal roofs and copper edging.",
  },
  {
    assetBase: "07-coastal-tile-and-patina-roof",
    alt: "Coastal home with clay tiles and green patina roof accents.",
  },
  {
    assetBase: "08-iridescent-curved-slate-roof",
    alt: "Curved fantasy house roof covered in iridescent slate tiles.",
  },
  {
    assetBase: "09-desert-mixed-metal-tile-roof",
    alt: "Desert home with layered metal and tile roofing.",
  },
  {
    assetBase: "10-flared-copper-roof-house",
    alt: "Contemporary house with a dramatic flared copper roof.",
  },
  {
    assetBase: "11-mountain-lodge-slate-copper-roof",
    alt: "Mountain lodge with layered slate roofs and copper trim.",
  },
  {
    assetBase: "12-weathered-patina-copper-roof",
    alt: "Stone house with a weathered green patina copper roof.",
  },
  {
    assetBase: "13-turquoise-tile-copper-trim-roof",
    alt: "Curved turquoise tile roofs outlined with copper trim.",
  },
  {
    assetBase: "14-lakeside-multicolor-slate-roof",
    alt: "Lakeside house with multicolor slate roofs and copper edging.",
  },
  {
    assetBase: "15-ornate-green-tile-copper-roof",
    alt: "Ornate villa with green tile roofs and bright copper trim.",
  },
  {
    assetBase: "16-coastal-curved-shingle-roof",
    alt: "Coastal house with curved gray shingles and copper details.",
  },
  {
    assetBase: "17-desert-standing-seam-copper-roof",
    alt: "Desert house with sculpted standing-seam copper roofing.",
  },
  {
    assetBase: "18-curved-dark-shingle-lake-house",
    alt: "Lake house with dark curved shingle roofs and copper trim.",
  },
  {
    assetBase: "19-sunset-coastal-curved-roof-home",
    alt: "Coastal home at sunset with layered curved roofs.",
  },
  {
    assetBase: "20-ornate-copper-slate-arched-roof",
    alt: "Ornate house with arched slate roofs and copper framing.",
  },
  {
    assetBase: "21-purple-curved-metal-coastal-roof",
    alt: "Coastal home with a glossy purple curved metal roof.",
  },
  {
    assetBase: "22-desert-copper-tile-estate",
    alt: "Large desert estate with layered copper-colored tile roofs.",
  },
  {
    assetBase: "23-purple-slate-copper-mansion",
    alt: "Fantasy mansion with purple slate roofs and copper trim.",
  },
  {
    assetBase: "24-angular-white-metal-roof",
    alt: "Modern white house with sharp angular metal roofs.",
  },
  {
    assetBase: "25-red-copper-slate-gothic-house",
    alt: "Gothic house with steep slate roofs and red copper accents.",
  },
  {
    assetBase: "26-copper-turret-gothic-mansion",
    alt: "Gothic mansion with copper roofs and tall pointed turrets.",
  },
  {
    assetBase: "27-white-metal-gold-trim-coastal-roof",
    alt: "Coastal building with layered white metal roofs and gold trim.",
  },
  {
    assetBase: "28-cobalt-blue-tile-coastal-estate",
    alt: "Coastal estate with cobalt blue tile roofs and layered gables.",
  },
  {
    assetBase: "29-terracotta-tile-desert-estate",
    alt: "Desert estate with warm terracotta tile roofs and courtyards.",
  },
  {
    assetBase: "30-sunset-lakeside-standing-seam-lodge",
    alt: "Lakeside lodge at sunset with clean standing-seam metal roofs.",
  },
  {
    assetBase: "31-tiered-dark-standing-seam-roof",
    alt: "Large home with tiered dark standing-seam roofs.",
  },
  {
    assetBase: "32-sunset-lakeside-copper-shingle-estate",
    alt: "Lakeside estate at sunset with layered copper shingle roofs.",
  },
  {
    assetBase: "33-dark-slate-lakeside-estate",
    alt: "Lakeside estate with steep dark slate roofs.",
  },
  {
    assetBase: "34-iridescent-teal-tile-coastal-hotel",
    alt: "Coastal hotel with iridescent teal tile roofs.",
  },
  {
    assetBase: "35-green-tile-copper-trim-lakeside-mansion",
    alt: "Lakeside mansion with green tile roofs and copper trim.",
  },
  {
    assetBase: "36-tan-tile-vineyard-estate",
    alt: "Vineyard estate with broad tan tile roofs.",
  },
  {
    assetBase: "37-silver-metal-tile-coastal-home",
    alt: "Coastal home with sculpted silver metal tile roofs.",
  },
  {
    assetBase: "38-gold-hexagonal-tile-coastal-resort",
    alt: "Coastal resort with geometric gold hexagonal tile roofs.",
  },
  {
    assetBase: "39-cedar-shake-mountain-lodge",
    alt: "Mountain lodge with layered cedar shake roofs.",
  },
  {
    assetBase: "40-modern-solar-panel-roof-building",
    alt: "Modern building with an integrated solar panel roof.",
  },
  {
    assetBase: "41-dark-slate-turret-coastal-estate",
    alt: "Coastal estate with dark slate roofs and pointed turrets.",
  },
  {
    assetBase: "42-tropical-thatch-oceanfront-villa",
    alt: "Oceanfront villa with layered tropical thatch roofs.",
  },
  {
    assetBase: "43-modern-green-living-roof-building",
    alt: "Modern building with a lush green living roof.",
  },
  {
    assetBase: "44-curved-green-living-roof-building",
    alt: "Contemporary building with curved green living roofs.",
  },
  {
    assetBase: "45-cobalt-blue-tile-coastal-villa",
    alt: "Coastal villa with vivid cobalt blue tile roofs.",
  },
  {
    assetBase: "46-indigo-tile-coastal-estate",
    alt: "Coastal estate with layered indigo tile roofs.",
  },
  {
    assetBase: "47-red-terracotta-tile-coastal-estate",
    alt: "Coastal estate with red terracotta tile roofs.",
  },
  {
    assetBase: "48-terracotta-tile-mountain-estate",
    alt: "Mountain estate with sweeping terracotta tile roofs.",
  },
  {
    assetBase: "49-grey-metal-standing-seam-lakeside-estate",
    alt: "Lakeside estate with cool grey standing-seam metal roofs.",
  },
  {
    assetBase: "50-patina-metal-standing-seam-coastal-lodge",
    alt: "Coastal lodge with patina metal standing-seam roofs.",
  },
  {
    assetBase: "51-charcoal-standing-seam-lakeside-home",
    alt: "Lakeside home with charcoal standing-seam roofing.",
  },
  {
    assetBase: "52-dark-metal-standing-seam-mountain-home",
    alt: "Mountain home with dark metal standing-seam roofs.",
  },
  {
    assetBase: "53-copper-shingle-turret-coastal-estate",
    alt: "Coastal estate with copper shingle roofs and a turret.",
  },
  {
    assetBase: "54-copper-shingle-oceanfront-estate",
    alt: "Oceanfront estate with layered copper shingle roofs.",
  },
  {
    assetBase: "55-charcoal-slate-lakeside-mansion",
    alt: "Lakeside mansion with charcoal slate roofs.",
  },
  {
    assetBase: "56-dark-slate-coastal-stone-estate",
    alt: "Coastal stone estate with broad dark slate roofs.",
  },
  {
    assetBase: "57-patina-scalloped-tile-lakeside-mansion",
    alt: "Lakeside mansion with patina scalloped tile roofs.",
  },
  {
    assetBase: "58-iridescent-teal-diamond-tile-coastal-mansion",
    alt: "Coastal mansion with iridescent teal diamond tile roofs.",
  },
  {
    assetBase: "59-patina-scalloped-tile-coastal-chateau",
    alt: "Coastal chateau with layered patina scalloped tile roofs.",
  },
  {
    assetBase: "60-green-scalloped-tile-copper-trim-mansion",
    alt: "Mansion with green scalloped tile roofs and copper trim.",
  },
  {
    assetBase: "61-sand-tile-coastal-estate",
    alt: "Coastal estate with softly colored sand tile roofs.",
  },
  {
    assetBase: "62-cream-tile-waterfront-estate",
    alt: "Waterfront mansion with elegant cream tile roofs.",
  },
  {
    assetBase: "63-slate-grey-tile-coastal-home",
    alt: "Coastal home with slate grey tile roofs.",
  },
  {
    assetBase: "64-light-grey-tile-coastal-villa",
    alt: "Coastal villa with layered light grey tile roofs.",
  },
  {
    assetBase: "65-gold-hexagonal-tile-waterfront-mansion",
    alt: "Waterfront mansion with ornate gold hexagonal tile roofs.",
  },
  {
    assetBase: "66-gold-scalloped-tile-tropical-estate",
    alt: "Tropical estate with gleaming gold scalloped tile roofs.",
  },
  {
    assetBase: "67-cedar-shake-lakeside-lodge",
    alt: "Lakeside lodge with warm cedar shake roofs.",
  },
  {
    assetBase: "68-cedar-shake-lakeside-estate",
    alt: "Lakeside estate with expansive cedar shake roofs.",
  },
  {
    assetBase: "69-dark-solar-tile-lakeside-villa",
    alt: "Lakeside villa with integrated dark solar tile roofs.",
  },
  {
    assetBase: "70-solar-tile-lakeside-stone-home",
    alt: "Stone lakeside home with solar tile roofing.",
  },
  {
    assetBase: "71-slate-blue-scalloped-tile-coastal-mansion",
    alt: "Coastal mansion with slate blue scalloped tile roofs.",
  },
  {
    assetBase: "72-slate-blue-scalloped-tile-coastal-mansion",
    alt: "Coastal mansion with layered slate blue scalloped tile roofs.",
  },
  {
    assetBase: "73-tropical-thatch-cliffside-villa",
    alt: "Cliffside villa with sweeping tropical thatch roofs.",
  },
  {
    assetBase: "74-thatch-roof-tropical-pool-villa",
    alt: "Tropical pool villa with layered thatch roofs.",
  },
  {
    assetBase: "75-living-green-roof-coastal-retreat",
    alt: "Coastal retreat with a lush living green roof.",
  },
  {
    assetBase: "76-angular-green-living-roof-coastal-villa",
    alt: "Coastal villa with angular green living roofs.",
  },
];

function shuffleGalleryImages(images: GalleryImage[]) {
  const shuffled = [...images];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentImage = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = currentImage;
  }
  return shuffled;
}

// Shuffle once per app load so every refresh presents a new gallery sequence.
const galleryImages = shuffleGalleryImages(galleryImageCatalog);

const MATERIAL_LIBRARY_BASE = "/assets/gallery/material-library" as const;
const materialLibraryMetadata = responsiveAssetMetadata(
  asResponsiveAsset(MATERIAL_LIBRARY_BASE),
);
const materialRowsPx = [
  { yPx: 72, heightPx: 160 },
  { yPx: 244, heightPx: 155 },
  { yPx: 415, heightPx: 157 },
  { yPx: 585, heightPx: 156 },
  { yPx: 755, heightPx: 159 },
  { yPx: 928, heightPx: 160 },
  { yPx: 1103, heightPx: 162 },
  { yPx: 1280, heightPx: 167 },
] as const;
const materialColumnsPx = {
  left: { xPx: 56, widthPx: 450.5 },
  right: { xPx: 506.5, widthPx: 454.5 },
} as const;
const roofMaterials = [
  {
    number: "01",
    name: "Terracotta barrel tile",
    detail: "Burnt orange / rounded profile",
    rowIndex: 0,
    column: "left",
  },
  {
    number: "02",
    name: "Patinated copper seam",
    detail: "Blue-green / vertical panel",
    rowIndex: 1,
    column: "left",
  },
  {
    number: "03",
    name: "Riven slate tile",
    detail: "Blue-gray / rugged split face",
    rowIndex: 2,
    column: "left",
  },
  {
    number: "04",
    name: "Iridescent scale tile",
    detail: "Silver blue / fish-scale profile",
    rowIndex: 3,
    column: "left",
  },
  {
    number: "05",
    name: "Translucent polycarbonate",
    detail: "Clear / corrugated panel",
    rowIndex: 4,
    column: "left",
  },
  {
    number: "06",
    name: "Gilded hex tile",
    detail: "Amber gold / geometric relief",
    rowIndex: 5,
    column: "left",
  },
  {
    number: "07",
    name: "Blue scallop tile",
    detail: "Deep teal / glazed scale",
    rowIndex: 6,
    column: "left",
  },
  {
    number: "08",
    name: "Thatch roofing",
    detail: "Natural straw / layered fiber",
    rowIndex: 7,
    column: "left",
  },
  {
    number: "09",
    name: "Indigo barrel tile",
    detail: "Cobalt violet / fired gloss",
    rowIndex: 0,
    column: "right",
  },
  {
    number: "10",
    name: "Silver standing seam",
    detail: "Cool gray / vertical rib",
    rowIndex: 1,
    column: "right",
  },
  {
    number: "11",
    name: "Copper diamond shingle",
    detail: "Warm copper / geometric scale",
    rowIndex: 2,
    column: "right",
  },
  {
    number: "12",
    name: "Verdigris scallop tile",
    detail: "Emerald teal / aged copper",
    rowIndex: 3,
    column: "right",
  },
  {
    number: "13",
    name: "Ivory barrel tile",
    detail: "Cream / embossed pattern",
    rowIndex: 4,
    column: "right",
  },
  {
    number: "14",
    name: "Cedar shakes",
    detail: "Weathered wood / natural grain",
    rowIndex: 5,
    column: "right",
  },
  {
    number: "15",
    name: "Solar slate panel",
    detail: "Blue-gray / photovoltaic grid",
    rowIndex: 6,
    column: "right",
  },
  {
    number: "16",
    name: "Living roof membrane",
    detail: "Moss green / planted system",
    rowIndex: 7,
    column: "right",
  },
] as const;

// Keep the preview curated while the modal remains the complete gallery.
const galleryPreviewIndices = GALLERY_PREVIEW_SLOTS.map(
  ({ initialImageIndex }) => initialImageIndex,
);
const galleryObserverOptions: IntersectionObserverInit = {
  rootMargin: "20% 0px",
  threshold: 0.04,
};

function GalleryArrowButton({
  direction,
  keyboardActive,
  pressCount,
  suppressHover,
  onActivate,
}: {
  direction: "previous" | "next";
  keyboardActive: boolean;
  pressCount: number;
  suppressHover: boolean;
  onActivate: () => void;
}) {
  const arrowRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const chargeFrameRef = useRef<number | null>(null);
  const pressedRef = useRef(false);
  const pressStartedRef = useRef(0);
  const keyboardStartedRef = useRef(0);
  const startShiftRef = useRef(0);
  const currentShiftRef = useRef(0);
  const [pointerPressed, setPointerPressed] = useState(false);
  const [shockwave, setShockwave] = useState(0);
  const travelOffset = direction === "previous" ? -10 : 10;
  const pullbackOffset = -travelOffset;

  const readArrowShift = useCallback(() => {
    const arrow = arrowRef.current;
    if (!arrow) return currentShiftRef.current;
    try {
      const transform = getComputedStyle(arrow).transform;
      if (transform && transform !== "none")
        currentShiftRef.current = new DOMMatrixReadOnly(transform).m41;
    } catch {
      // Keep the last known shift when a browser cannot expose the in-flight matrix.
    }
    return currentShiftRef.current;
  }, []);

  const setArrowShift = useCallback((shift: number) => {
    currentShiftRef.current = shift;
    if (arrowRef.current)
      arrowRef.current.style.transform = `translate3d(${shift}px, 0, 0)`;
  }, []);

  const stopArrowMotion = useCallback(() => {
    const arrow = arrowRef.current;
    if (animationRef.current && arrow) {
      const currentShift = readArrowShift();
      animationRef.current.cancel();
      setArrowShift(currentShift);
    } else {
      animationRef.current?.cancel();
    }
    animationRef.current = null;
    if (chargeFrameRef.current) cancelAnimationFrame(chargeFrameRef.current);
    chargeFrameRef.current = null;
  }, [readArrowShift, setArrowShift]);

  const runArrowAnimation = useCallback(
    (
      arrow: HTMLElement,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
      finalShift: number,
    ) => {
      if (typeof arrow.animate !== "function") {
        setArrowShift(finalShift);
        return null;
      }
      const animation = arrow.animate(keyframes, options);
      animation.onfinish = () => {
        setArrowShift(finalShift);
        animationRef.current = null;
      };
      return animation;
    },
    [setArrowShift],
  );

  const springArrowTo = useCallback(
    (target: number) => {
      const arrow = arrowRef.current;
      if (!arrow) return;
      const start = readArrowShift();
      stopArrowMotion();
      animationRef.current = runArrowAnimation(
        arrow,
        [
          { transform: `translate3d(${start}px, 0, 0)`, offset: 0 },
          { transform: `translate3d(${target * 1.42}px, 0, 0)`, offset: 0.58 },
          { transform: `translate3d(${target * 0.88}px, 0, 0)`, offset: 0.82 },
          { transform: `translate3d(${target}px, 0, 0)`, offset: 1 },
        ],
        { duration: 360, easing: "cubic-bezier(.2,.82,.25,1)" },
        target,
      );
    },
    [readArrowShift, runArrowAnimation, stopArrowMotion],
  );

  const releaseArrow = useCallback(
    (held: boolean, keyboardHold = false) => {
      const arrow = arrowRef.current;
      if (!arrow) return;
      const start = readArrowShift();
      stopArrowMotion();
      const keyframes =
        keyboardHold && held
          ? [
              { transform: `translate3d(${start}px, 0, 0)`, offset: 0 },
              {
                transform: `translate3d(${travelOffset * 0.72}px, 0, 0)`,
                offset: 0.38,
              },
              {
                transform: `translate3d(${travelOffset * 0.22}px, 0, 0)`,
                offset: 0.76,
              },
              { transform: "translate3d(0, 0, 0)", offset: 1 },
            ]
          : held
            ? [
                { transform: `translate3d(${start}px, 0, 0)`, offset: 0 },
                {
                  transform: `translate3d(${pullbackOffset}px, 0, 0)`,
                  offset: 0.12,
                },
                {
                  transform: `translate3d(${travelOffset * 1.62}px, 0, 0)`,
                  offset: 0.48,
                },
                {
                  transform: `translate3d(${travelOffset * 0.74}px, 0, 0)`,
                  offset: 0.68,
                },
                {
                  transform: `translate3d(${travelOffset * 1.08}px, 0, 0)`,
                  offset: 0.82,
                },
                { transform: "translate3d(0, 0, 0)", offset: 1 },
              ]
            : [
                { transform: `translate3d(${start}px, 0, 0)`, offset: 0 },
                {
                  transform: `translate3d(${pullbackOffset * 0.46}px, 0, 0)`,
                  offset: 0.34,
                },
                {
                  transform: `translate3d(${pullbackOffset * 0.08}px, 0, 0)`,
                  offset: 0.76,
                },
                { transform: "translate3d(0, 0, 0)", offset: 1 },
              ];
      animationRef.current = runArrowAnimation(
        arrow,
        keyframes,
        {
          duration: keyboardHold && held ? 360 : held ? 510 : 270,
          easing:
            keyboardHold && held
              ? "cubic-bezier(.22,.8,.3,1)"
              : "cubic-bezier(.2,.76,.22,1)",
        },
        0,
      );
    },
    [
      pullbackOffset,
      readArrowShift,
      runArrowAnimation,
      stopArrowMotion,
      travelOffset,
    ],
  );

  const releasePointer = useCallback(
    (event?: React.PointerEvent<HTMLButtonElement>) => {
      if (!pressedRef.current) return;
      const held = performance.now() - pressStartedRef.current >= 150;
      pressedRef.current = false;
      setPointerPressed(false);
      releaseArrow(held);
      if (event && event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    },
    [releaseArrow],
  );

  useEffect(() => {
    if (keyboardActive) {
      keyboardStartedRef.current = performance.now();
      stopArrowMotion();
      setArrowShift(0);
      const started = performance.now();
      const detectKeyboardHold = (now: number) => {
        const elapsed = now - started;
        if (elapsed < 100)
          chargeFrameRef.current = requestAnimationFrame(detectKeyboardHold);
        else springArrowTo(travelOffset);
      };
      chargeFrameRef.current = requestAnimationFrame(detectKeyboardHold);
      return;
    }
    if (!pressedRef.current && keyboardStartedRef.current) {
      const held = performance.now() - keyboardStartedRef.current >= 100;
      keyboardStartedRef.current = 0;
      releaseArrow(held, true);
    } else if (!pressedRef.current) {
      springArrowTo(0);
    }
  }, [
    keyboardActive,
    pullbackOffset,
    readArrowShift,
    releaseArrow,
    setArrowShift,
    springArrowTo,
    stopArrowMotion,
    travelOffset,
  ]);

  useEffect(() => {
    if (pressCount > 0 && keyboardActive)
      setShockwave((current) => current + 1);
  }, [keyboardActive, pressCount]);

  useEffect(
    () => () => {
      pressedRef.current = false;
      setPointerPressed(false);
      stopArrowMotion();
    },
    [stopArrowMotion],
  );

  return (
    <button
      className={`gallery-modal-arrow gallery-modal-${direction}${keyboardActive ? " is-key-active" : ""}${pointerPressed ? " is-pointer-pressed" : ""}${suppressHover ? " suppress-hover" : ""}`}
      type="button"
      aria-label={direction === "previous" ? "Previous image" : "Next image"}
      onPointerEnter={() => {
        if (!pressedRef.current && !keyboardActive) springArrowTo(0);
      }}
      onPointerLeave={() => {
        if (!pressedRef.current && !keyboardActive) springArrowTo(0);
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (pressedRef.current) return;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is a robustness enhancement, not a reason to abort.
        }
        pressedRef.current = true;
        setPointerPressed(true);
        const currentShift = readArrowShift();
        stopArrowMotion();
        pressStartedRef.current = performance.now();
        startShiftRef.current = currentShift;
        const chargePointer = (now: number) => {
          const progress = Math.min((now - pressStartedRef.current) / 300, 1);
          const eased =
            progress < 0.5
              ? 2 * progress * progress
              : -1 + (4 - 2 * progress) * progress;
          setArrowShift(
            startShiftRef.current +
              (pullbackOffset - startShiftRef.current) * eased,
          );
          if (progress < 1 && pressedRef.current)
            chargeFrameRef.current = requestAnimationFrame(chargePointer);
        };
        chargeFrameRef.current = requestAnimationFrame(chargePointer);
      }}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onLostPointerCapture={releasePointer}
      onClick={(event) => {
        if (event.detail !== 0) event.currentTarget.blur();
        setShockwave((current) => current + 1);
        onActivate();
      }}
    >
      {shockwave > 0 && (
        <span
          className="gallery-arrow-shockwave"
          key={shockwave}
          aria-hidden="true"
        />
      )}
      <span className="gallery-arrow-icon" ref={arrowRef}>
        {direction === "previous" ? (
          <ChevronLeft aria-hidden="true" />
        ) : (
          <ChevronRight aria-hidden="true" />
        )}
      </span>
    </button>
  );
}

function preloadGalleryImage(image: GalleryImage) {
  return preloadResponsiveImage({
    base: asResponsiveAsset(`${asset}gallery/${image.assetBase}`),
    sizes: "94vw",
    defaultWidth: 960,
  });
}

const GallerySequenceThumbnail = memo(function GallerySequenceThumbnail({
  image,
  imageIndex,
  active,
  onSelect,
}: {
  image: GalleryImage;
  imageIndex: number;
  active: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <button
      className={active ? "is-active" : ""}
      type="button"
      onClick={() => onSelect(imageIndex)}
      aria-label={`View image ${imageIndex + 1}: ${image.alt}`}
      aria-current={active ? "true" : undefined}
    >
      <img
        {...responsiveImage(
          asResponsiveAsset(`${asset}gallery/${image.assetBase}`),
          "112px",
          640,
        )}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span>{String(imageIndex + 1).padStart(2, "0")}</span>
    </button>
  );
});

function GalleryModal({
  images,
  activeIndex,
  onSelect,
  onClose,
}: {
  images: GalleryImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const sequenceListRef = useRef<HTMLDivElement>(null);
  const [activeControl, setActiveControl] = useState<
    "previous" | "next" | null
  >(null);
  const [controlPressCount, setControlPressCount] = useState({
    previous: 0,
    next: 0,
  });
  const [suppressArrowHover, setSuppressArrowHover] = useState(false);
  const suppressArrowHoverRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);
  const [closeShockwave, setCloseShockwave] = useState(0);
  const [closePressed, setClosePressed] = useState(false);
  const reducedMotion = useReducedMotion();
  const [displayedIndex, setDisplayedIndex] = useState(activeIndex);

  const activeImage = images[displayedIndex];

  useEffect(() => {
    const preloadIndexes = [-1, 0, 1].map(
      (offset) => (activeIndex + offset + images.length) % images.length,
    );
    preloadIndexes.forEach((index) => void preloadGalleryImage(images[index]));
  }, [activeIndex, images]);

  useEffect(() => {
    if (activeIndex === displayedIndex) return;
    let cancelled = false;
    void preloadGalleryImage(images[activeIndex]).then(() => {
      if (!cancelled) setDisplayedIndex(activeIndex);
    });
    return () => {
      cancelled = true;
    };
  }, [activeIndex, displayedIndex, images]);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    if (reducedMotion) {
      onClose();
      return;
    }
    setCloseShockwave((current) => current + 1);
    setIsClosing(true);
  }, [onClose, reducedMotion]);

  const navigate = useCallback(
    (direction: -1 | 1) => {
      onSelect((activeIndex + direction + images.length) % images.length);
    },
    [activeIndex, images.length, onSelect],
  );

  const keyboardRepeatingRef = useGalleryKeyboardNavigation(
    (direction, repeating) => {
      if (!repeating) {
        setActiveControl(direction === 1 ? "next" : "previous");
        setControlPressCount((current) => ({
          ...current,
          [direction === 1 ? "next" : "previous"]:
            current[direction === 1 ? "next" : "previous"] + 1,
        }));
      }
      suppressArrowHoverRef.current = true;
      setSuppressArrowHover(true);
      navigate(direction);
    },
    () => {
      setSuppressArrowHover(false);
      setActiveControl(null);
    },
  );
  useActiveThumbnailScroll(
    sequenceListRef,
    activeIndex,
    keyboardRepeatingRef.current,
  );

  return (
    <DialogModal
      backdropClassName="gallery-modal-backdrop"
      dialogClassName="gallery-modal-frame"
      ariaLabel="Roofscape gallery viewer"
      closing={isClosing}
      onClose={handleClose}
      onDialogAnimationEnd={(event) => {
        if (
          isClosing &&
          event.target === event.currentTarget &&
          event.animationName === "gallery-frame-out"
        )
          onClose();
      }}
    >
      <button
        className={`gallery-modal-close${closePressed ? " is-pointer-pressed" : ""}`}
        type="button"
        aria-label="Close gallery"
        onClick={handleClose}
        onPointerDown={() => setClosePressed(true)}
        onPointerUp={() => setClosePressed(false)}
        onPointerLeave={() => setClosePressed(false)}
        onPointerCancel={() => setClosePressed(false)}
      >
        {closeShockwave > 0 && (
          <span
            className="gallery-arrow-shockwave"
            key={closeShockwave}
            aria-hidden="true"
          />
        )}
        <span
          className={`gallery-arrow-icon${closePressed ? " is-pointer-pressed" : ""}`}
        >
          <X aria-hidden="true" />
        </span>
      </button>
      <div className="gallery-modal-content">
        <div
          className="gallery-modal-stage"
          onPointerMove={() => {
            if (!suppressArrowHoverRef.current) return;
            suppressArrowHoverRef.current = false;
            setSuppressArrowHover(false);
          }}
        >
          <div className="gallery-modal-meta">
            <span>Roofscape</span>
            <strong>
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </strong>
          </div>
          <img
            {...responsiveImage(
              asResponsiveAsset(`${asset}gallery/${activeImage.assetBase}`),
              "94vw",
              960,
            )}
            alt={activeImage.alt}
            loading="eager"
            decoding="async"
          />
        </div>
        <aside className="gallery-sequence" aria-label="All gallery images">
          <div className="gallery-sequence-list" ref={sequenceListRef}>
            {images.map((image, imageIndex) => (
              <GallerySequenceThumbnail
                image={image}
                imageIndex={imageIndex}
                active={activeIndex === imageIndex}
                onSelect={onSelect}
                key={image.assetBase}
              />
            ))}
          </div>
        </aside>
      </div>
      <div className="gallery-modal-navigation">
        <GalleryArrowButton
          direction="previous"
          keyboardActive={activeControl === "previous"}
          pressCount={controlPressCount.previous}
          suppressHover={suppressArrowHover}
          onActivate={() => navigate(-1)}
        />
        <GalleryArrowButton
          direction="next"
          keyboardActive={activeControl === "next"}
          pressCount={controlPressCount.next}
          suppressHover={suppressArrowHover}
          onActivate={() => navigate(1)}
        />
      </div>
    </DialogModal>
  );
}

type GalleryCardProps = {
  image: GalleryImage;
  imageIndex: number;
  slot: number;
  slideDirections: GallerySlideDirection[];
  onOpen: () => void;
  onHoverChange: (slot: number | null) => void;
};

type GallerySlideDirection = "top" | "left" | "bottom" | "right";

const gallerySlideDirections: Record<number, GallerySlideDirection[]> = {
  0: ["top", "left"],
  1: ["top", "right"],
  2: ["right"],
  3: ["left", "bottom"],
  4: ["bottom"],
  5: ["right", "bottom"],
};

function GalleryCard({
  image,
  imageIndex,
  slot,
  slideDirections,
  onOpen,
  onHoverChange,
}: GalleryCardProps) {
  const [displayed, setDisplayed] = useState({ image, imageIndex });
  const [incoming, setIncoming] = useState<{
    image: GalleryImage;
    imageIndex: number;
  } | null>(null);
  const [incomingDirection, setIncomingDirection] =
    useState<GallerySlideDirection>(slideDirections[0]);
  const directionCursorRef = useRef(0);
  const getDigitSequence = (from: number, to: number) => {
    const digits = [from];
    const incrementDistance = (to - from + 10) % 10;
    const decrementDistance = (from - to + 10) % 10;
    const step = incrementDistance <= decrementDistance ? 1 : -1;
    const distance = Math.min(incrementDistance, decrementDistance);
    let current = from;
    for (let stepIndex = 0; stepIndex < distance; stepIndex += 1) {
      current = (current + step + 10) % 10;
      digits.push(current);
    }
    return digits;
  };

  useEffect(() => {
    if (imageIndex !== displayed.imageIndex) {
      const direction =
        slideDirections[directionCursorRef.current % slideDirections.length];
      directionCursorRef.current += 1;
      setIncomingDirection(direction);
      setIncoming({ image, imageIndex });
    }
  }, [displayed.imageIndex, image, imageIndex, slideDirections]);

  const cardSizes = slot === 0 ? "66.7vw" : "33.3vw";

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
      style={{ "--gallery-index": slot } as React.CSSProperties}
    >
      <SectionImage
        base={asResponsiveAsset(`${asset}gallery/${displayed.image.assetBase}`)}
        sizes={cardSizes}
        defaultWidth={960}
        section="gallery"
        className={`gallery-card-image gallery-card-image-current${incoming ? ` gallery-card-image-outgoing gallery-card-image-out-${incomingDirection}` : ""}`}
        alt={displayed.image.alt}
        loading={slot === 0 ? "eager" : "lazy"}
        decoding="async"
      />
      {incoming && (
        <SectionImage
          base={asResponsiveAsset(
            `${asset}gallery/${incoming.image.assetBase}`,
          )}
          sizes={cardSizes}
          defaultWidth={960}
          section="gallery"
          className={`gallery-card-image gallery-card-image-incoming gallery-card-image-from-${incomingDirection}`}
          alt=""
          onAnimationEnd={() => {
            setDisplayed(incoming);
            setIncoming(null);
          }}
        />
      )}
      <span className="gallery-card-index" aria-hidden="true">
        {String((incoming?.imageIndex ?? displayed.imageIndex) + 1)
          .padStart(2, "0")
          .split("")
          .map((digit, digitIndex) => {
            const currentDigits = String(displayed.imageIndex + 1).padStart(
              2,
              "0",
            );
            const sequence = incoming
              ? getDigitSequence(
                  Number(currentDigits[digitIndex]),
                  Number(digit),
                )
              : [Number(digit)];
            return (
              <span
                className="gallery-card-index-digit-window"
                key={`${slot}-${digitIndex}-${digit}`}
              >
                <span
                  className="gallery-card-index-digit-track"
                  style={
                    {
                      "--digit-steps": sequence.length - 1,
                    } as React.CSSProperties
                  }
                >
                  {sequence.map((sequenceDigit, sequenceIndex) => (
                    <span
                      className="gallery-card-index-digit"
                      key={`${sequenceDigit}-${sequenceIndex}`}
                    >
                      {sequenceDigit}
                    </span>
                  ))}
                </span>
              </span>
            );
          })}
      </span>
      <span className="gallery-card-view">
        View <ArrowUpRight aria-hidden="true" />
      </span>
    </button>
  );
}

function Gallery() {
  const galleryReveal = useRevealOnce<HTMLElement>(galleryObserverOptions, {
    live: true,
  });
  const sectionRef = galleryReveal.ref;
  const inView = galleryReveal.inView;
  const revealed = galleryReveal.revealed;
  const images = galleryImages;
  const documentVisible = useDocumentVisibility();
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeMaterialIndex, setActiveMaterialIndex] = useState<number | null>(
    null,
  );
  const hoveredSlotRef = useRef<number | null>(null);
  const closeGallery = useCallback(() => setActiveIndex(null), []);
  const previewIndices = useGalleryPreviewCycle(
    images.length,
    galleryPreviewIndices.filter((imageIndex) => galleryImages[imageIndex]),
    GALLERY_PREVIEW_SLOTS,
    GALLERY_PREVIEW_CYCLE_CONFIG,
    !inView || !documentVisible || reducedMotion || activeIndex !== null,
    hoveredSlotRef,
  );

  const visibleImages = images.length
    ? previewIndices.map((imageIndex, slot) => ({
        image: images[imageIndex],
        imageIndex,
        slot,
      }))
    : [];

  const openGallery = useCallback(
    (imageIndex: number) => {
      void preloadGalleryImage(images[imageIndex]).then(() =>
        setActiveIndex(imageIndex),
      );
    },
    [images],
  );

  const renderGalleryCard = ({
    image,
    imageIndex,
    slot,
  }: {
    image: GalleryImage;
    imageIndex: number;
    slot: number;
  }) => (
    <GalleryCard
      image={image}
      imageIndex={imageIndex}
      slot={slot}
      slideDirections={gallerySlideDirections[slot]}
      onOpen={() => openGallery(imageIndex)}
      onHoverChange={(hoveredSlot) => {
        hoveredSlotRef.current = hoveredSlot;
      }}
      key={`gallery-preview-${slot}`}
    />
  );

  return (
    <section
      className={`gallery-section${revealed ? " is-visible" : ""}`}
      id="gallery"
      aria-label="Gallery"
      ref={sectionRef}
    >
      <div className="gallery-layout">
        <div className="gallery-content">
          <div className="gallery-showcase-shell">
            <div className="gallery-showcase">
              {visibleImages.map(renderGalleryCard)}
            </div>
          </div>
          <aside
            className="gallery-material-library"
            aria-labelledby="materials-title"
          >
            <div className="gallery-material-heading">
              <span className="gallery-material-kicker">
                Northline / Roof systems
              </span>
              <h2 id="materials-title">Material library</h2>
              <span className="gallery-material-rule" />
            </div>
            <div
              className="gallery-material-art"
              style={
                {
                  "--gallery-material-aspect-ratio": `${materialLibraryMetadata.sourceWidth} / ${materialLibraryMetadata.sourceHeight}`,
                } as React.CSSProperties
              }
            >
              <div className="gallery-material-clip">
                <SectionImage
                  base={MATERIAL_LIBRARY_BASE}
                  sizes="32vw"
                  defaultWidth={960}
                  section="gallery"
                  alt="A front-facing display of sixteen fantasy roofing material samples arranged in two columns like a premium architectural showroom library."
                />
                <div className="gallery-material-labels">
                  {roofMaterials.map(
                    ({ number, name, detail, rowIndex, column }, index) => {
                      const row = materialRowsPx[rowIndex];
                      const columnGeometry = materialColumnsPx[column];
                      const geometry = sourceRectToPercentVariables(
                        {
                          xPx: columnGeometry.xPx,
                          yPx: row.yPx,
                          widthPx: columnGeometry.widthPx,
                          heightPx: row.heightPx,
                        },
                        materialLibraryMetadata,
                      );
                      return (
                        <button
                          className={`gallery-material-label gallery-material-label-${column}${activeMaterialIndex === index ? " is-active" : ""}`}
                          type="button"
                          style={
                            {
                              "--material-label-top": geometry.top,
                              "--material-label-left": geometry.left,
                              "--material-label-width": geometry.width,
                              "--material-label-height": geometry.height,
                            } as React.CSSProperties
                          }
                          onClick={() =>
                            setActiveMaterialIndex((current) =>
                              current === index ? null : index,
                            )
                          }
                          key={number}
                          aria-label={`${number}: ${name}. ${detail}`}
                          aria-pressed={activeMaterialIndex === index}
                        >
                          <span>{number}</span>
                          <strong>{name}</strong>
                          <small>{detail}</small>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      {activeIndex !== null && images[activeIndex] && (
        <GalleryModal
          images={images}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          onClose={closeGallery}
        />
      )}
    </section>
  );
}

function App() {
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const openAppointment = useCallback(() => setAppointmentOpen(true), []);
  const closeAppointment = useCallback(() => setAppointmentOpen(false), []);
  const stickyHeaderShellRef = useRef<HTMLDivElement>(null);
  const navbarScrolled = useNavbarScrollState();
  useNavbarScrollOffset(stickyHeaderShellRef);
  const { isNarrowViewport, style, sectionClassName } = useSectionAssets();
  return (
    <div
      className={`app${isNarrowViewport ? " asset-narrow-viewport" : ""} ${sectionClassName}`}
      style={style}
    >
      <div
        className={`sticky-header-shell${navbarScrolled ? " is-scrolled" : ""}`}
        ref={stickyHeaderShellRef}
      >
        <Header onBookAppointment={openAppointment} />
      </div>
      <ScaledArtboard>
        <main>
          <Hero onBookAppointment={openAppointment} />
          <BadgeStrip />
          <Services />
          <Gallery />
          <CopperEdgeSeam />
          <AssociationsMarquee />
          <CopperEdgeSeam />
          <SiteSections />
        </main>
        <PremiumFooter onBook={openAppointment} />
      </ScaledArtboard>
      <CustomerServiceHologram onBook={openAppointment} />
      {appointmentOpen && <AppointmentModal onClose={closeAppointment} />}
    </div>
  );
}

function Root() {
  const galleryAssets = galleryPreviewIndices.map(
    (index) => `/assets/gallery/${galleryImages[index].assetBase}`,
  );
  return (
    <SectionAssetProvider galleryAssets={galleryAssets}>
      <App />
    </SectionAssetProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
