import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useDocumentVisibility } from "./hooks/useDocumentVisibility";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useInView } from "./hooks/useInView";
import { useRevealOnce } from "./hooks/useRevealOnce";
import { useComparisonSlider } from "./hooks/useComparisonSlider";
import { siteConfig } from "./config/site";
import { HOLOGRAM } from "./config/hologram";
import { responsiveAssetMetadata } from "./lib/responsiveImage";
import {
  asResponsiveAsset,
  responsiveImage,
  responsiveSource,
} from "./lib/responsiveImage";
import { StageImage } from "./lib/assetStages";
import { CopperEdgeSeam } from "./components/CopperEdgeSeam";
import { RasterStateArt } from "./components/RasterStateArt";

type BookHandler = { onBook: () => void };

const underlaymentImage = "/assets/protection/protection-underlayment";
const protectionSphereImage = "/assets/ui/copper-sphere-etched-large-generated";
const protectionSphereLeftImage =
  "/assets/ui/copper-sphere-etched-large-hover-left";
const protectionSphereRightImage =
  "/assets/ui/copper-sphere-etched-large-hover-right";
const protectionHoverTransitionMs = 240;

type AssociationBadgeKind = "standard" | "landscape" | "wide" | "ultrawide";

type AssociationBadge = {
  file: string;
  /** Deprecated presentation overrides are retained only for migration; asset facts come from the manifest. */
  width?: number;
  height?: number;
  kind: AssociationBadgeKind;
  scale?: number;
  hoverScale?: number;
};

const associationRows: AssociationBadge[][] = [
  [
    { file: "badge_row-1_01_high_vale_roof_tile", kind: "standard" },
    {
      file: "badge_row-1_02_century_seal_roof_assurance",
      width: 600,
      height: 598,
      kind: "standard",
    },
    {
      file: "badge_row-1_03_united_roofwrights",
      width: 563,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_04_aurelian_slate_council",
      width: 498,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_05_royal_sheet_and_slate",
      width: 434,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_06_crownwatch",
      width: 542,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_07_skyseer",
      width: 492,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_08_tempest",
      width: 544,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_09_emberward",
      width: 518,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_10_windmark",
      width: 507,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_11_hammerfall",
      width: 574,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_12_evergreen",
      width: 567,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_13_oldstone",
      width: 551,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_14_sunscale",
      width: 509,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_15_ironclad",
      width: 600,
      height: 573,
      kind: "standard",
    },
    {
      file: "badge_row-1_16_valeward",
      width: 546,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_17_verdant_peak",
      width: 586,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_18_everlight",
      width: 506,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_19_gildharbor",
      width: 600,
      height: 442,
      kind: "landscape",
    },
    {
      file: "badge_row-1_20_cinderpeak",
      width: 600,
      height: 597,
      kind: "standard",
    },
    {
      file: "badge_row-1_21_highspire",
      width: 580,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-1_22_highmere",
      width: 600,
      height: 597,
      kind: "standard",
    },
    {
      file: "badge_row-1_23_embercrest",
      width: 599,
      height: 600,
      kind: "standard",
    },
  ],
  [
    {
      file: "badge_row-2_01_ironmere",
      width: 600,
      height: 392,
      kind: "landscape",
    },
    {
      file: "badge_row-2_02_stormglass",
      width: 600,
      height: 333,
      kind: "landscape",
      hoverScale: 1.1,
    },
    {
      file: "badge_row-2_03_stonewake",
      width: 600,
      height: 195,
      kind: "wide",
      hoverScale: 1.1,
    },
    {
      file: "badge_row-2_04_ironpeak",
      width: 600,
      height: 590,
      kind: "standard",
    },
    {
      file: "badge_row-2_05_skyforge",
      width: 600,
      height: 465,
      kind: "standard",
    },
    {
      file: "badge_row-2_06_northreach",
      width: 600,
      height: 148,
      kind: "ultrawide",
      hoverScale: 1.1,
    },
    {
      file: "badge_row-2_07_celestial_canopy_co-op",
      width: 597,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-2_08_wyverns_nest",
      width: 543,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-2_09_aegis",
      width: 600,
      height: 257,
      kind: "wide",
      hoverScale: 1.1,
    },
    {
      file: "badge_row-2_10_stoneweather",
      width: 600,
      height: 571,
      kind: "standard",
    },
    {
      file: "badge_row-2_11_skyreach",
      width: 600,
      height: 428,
      kind: "landscape",
    },
    {
      file: "badge_row-2_12_thornwall",
      width: 600,
      height: 436,
      kind: "landscape",
    },
    {
      file: "badge_row-2_13_aurelian",
      width: 600,
      height: 192,
      kind: "wide",
      hoverScale: 1.1,
    },
    {
      file: "badge_row-2_14_eldercape",
      width: 526,
      height: 600,
      kind: "standard",
    },
    {
      file: "badge_row-2_15_gryphon",
      width: 600,
      height: 477,
      kind: "standard",
    },
    {
      file: "badge_row-2_16_moonkeep",
      width: 599,
      height: 600,
      kind: "standard",
    },
  ],
];

const associationLabel = (filename: string) =>
  filename
    .replace(/^badge_row-\d+_\d+_/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const associationRowsConfig = [
  { direction: -1, durationSeconds: 145, initialProgress: 0.27 },
  { direction: 1, durationSeconds: 155, initialProgress: 0.61 },
] as const;

const protectionIntentThreshold = 10;

const reviews = [
  {
    name: "Seris Rhuke",
    role: "Lakeside homeowner",
    quote:
      "The storm rolled across the lake before dawn. Northline had us dry, safe, and fully documented before lunch—and the new slate looks extraordinary.",
    portrait: "/assets/reviews/seris-rhuke",
    googlePlace: "Illyrion Spire",
    googleUrl:
      "https://www.google.com/maps/search/?api=1&query=The%20Garden%2C%2026%20Gandalf%27s%20Cutting%2C%20Waikato%203472%2C%20New%20Zealand",
  },
  {
    name: "Nyaren Klourm",
    role: "Architect & property owner",
    quote:
      "They found the ventilation problem everyone else missed, showed me every layer, and left the copper transitions cleaner than the original drawings.",
    portrait: "/assets/reviews/nyaren-klourm",
    googlePlace: "Aestir Hollow",
    googleUrl:
      "https://www.google.com/maps/search/?api=1&query=Green%20Dragon%20Inn%2C%20Hobbiton%20Movie%20Set%2C%20Waikato%2C%20New%20Zealand",
  },
  {
    name: "Baeloon Pluhng",
    role: "Mountain innkeeper",
    quote:
      "Our roof has twelve valleys and not one simple line. The crew treated every seam like finish carpentry and left the grounds immaculate.",
    portrait: "/assets/reviews/baeloon-pluhng",
    googlePlace: "The Goorough District",
    googleUrl:
      "https://www.google.com/maps/search/?api=1&query=The%20Shire%27s%20Rest%2C%20501%20Buckland%20Road%2C%20Hinuera%2C%20Matamata%203472%2C%20New%20Zealand",
  },
] as const;

function HowWeProtectSection() {
  const reveal = useRevealOnce<HTMLDivElement>({ threshold: 0.12 });
  const comparison = useComparisonSlider({
    initialValue: 54,
    intentThreshold: protectionIntentThreshold,
    releaseDelayMs: protectionHoverTransitionMs,
  });

  return (
    <section
      className="premium-protection"
      id="protection"
      aria-label="Roof layers: finished roof and exposed underlayment"
      style={
        {
          "--protection-hover-transition": `${protectionHoverTransitionMs}ms`,
        } as CSSProperties
      }
    >
      <div className="premium-shell">
        <div
          className={`premium-protection-console${reveal.revealed ? " is-visible" : ""}`}
          data-premium-reveal
          ref={reveal.ref}
        >
          <div
            className="premium-protection-stage"
            data-drag-direction={comparison.direction ?? undefined}
            data-drag-indicator={
              comparison.indicatorVisible && comparison.direction
                ? "visible"
                : undefined
            }
            style={
              { "--premium-split": `${comparison.value}%` } as CSSProperties
            }
          >
            <StageImage
              className="premium-protection-image"
              base="/assets/protection/protection-finished-roof"
              sizes="100vw"
              stage="protection"
              alt="A completed premium slate and copper roof"
            />
            <StageImage
              className="premium-protection-image premium-protection-layer"
              base={underlaymentImage}
              sizes="100vw"
              stage="protection"
              alt="The same roof with its underlayment construction exposed"
            />
            <input
              className="premium-protection-range"
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={comparison.value}
              data-pointer-focus={
                comparison.pointerFocusActive ? "true" : undefined
              }
              onInput={comparison.onInput}
              onPointerDown={comparison.onPointerDown}
              onPointerMove={comparison.onPointerMove}
              onPointerUp={comparison.onPointerUp}
              onPointerCancel={comparison.onPointerCancel}
              onLostPointerCapture={comparison.onLostPointerCapture}
              onBlur={comparison.onBlur}
              aria-label="Reveal underlayment"
              aria-valuetext={`${comparison.value}% finished roof, ${100 - comparison.value}% underlayment`}
            />
            <div className="premium-protection-divider" aria-hidden="true">
              <span className="premium-protection-thumb">
                <span className="premium-protection-thumb-surface">
                  <StageImage
                    className="premium-protection-sphere premium-protection-sphere-default"
                    base={protectionSphereImage}
                    sizes="8vw"
                    defaultWidth={640}
                    stage="protection"
                    alt=""
                    aria-hidden="true"
                  />
                  <StageImage
                    className="premium-protection-sphere premium-protection-sphere-left"
                    base={protectionSphereLeftImage}
                    sizes="8vw"
                    defaultWidth={640}
                    stage="protection"
                    alt=""
                    aria-hidden="true"
                  />
                  <StageImage
                    className="premium-protection-sphere premium-protection-sphere-right"
                    base={protectionSphereRightImage}
                    sizes="8vw"
                    defaultWidth={640}
                    stage="protection"
                    alt=""
                    aria-hidden="true"
                  />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GoogleReviewsSection() {
  const reveal = useRevealOnce<HTMLElement>({ threshold: 0.12 });
  return (
    <section
      className={`premium-reviews${reveal.revealed ? " is-visible" : ""}`}
      id="reviews"
      ref={reveal.ref}
    >
      <div className="premium-shell">
        <div className="premium-review-grid">
          {reviews.map((review, index) => (
            <article
              className="premium-review-card"
              data-premium-reveal
              key={review.name}
              style={{ "--premium-review-index": index } as CSSProperties}
            >
              <div className="premium-review-fasteners" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
              <header>
                <StageImage
                  base={review.portrait}
                  sizes="8vw"
                  defaultWidth={640}
                  stage="reviews"
                  alt={`${review.name}, ${review.role}`}
                />
                <div>
                  <h3>{review.name}</h3>
                  <p>{review.role}</p>
                </div>
                <span
                  className="premium-review-rating"
                  aria-label="Rated five out of five"
                >
                  <span>5</span>
                  <i>/</i>
                  <span>5</span>
                </span>
              </header>
              <blockquote>“{review.quote}”</blockquote>
              <footer>
                <a
                  className="premium-review-google-link"
                  href={review.googleUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${review.googlePlace} on Google Maps`}
                >
                  <span>{review.googlePlace}</span>
                  <img
                    src="/assets/brand/google-g-logo.svg"
                    alt=""
                    aria-hidden="true"
                  />
                </a>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderSection() {
  const reveal = useRevealOnce<HTMLElement>({ threshold: 0.16 });

  return (
    <section
      className={`premium-founder${reveal.revealed ? " is-visible" : ""}`}
      id="founder"
      ref={reveal.ref}
      aria-labelledby="premium-founder-title"
    >
      <div className="premium-founder-texture" aria-hidden="true" />

      <StageImage
        className="premium-founder-art premium-founder-art-left"
        base="/assets/founder/founder_left_frame"
        sizes="30vw"
        stage="founder"
        alt="Northline Roofing founder in his metalworking workshop"
        decoding="async"
        loading="lazy"
      />

      <div className="premium-founder-copy">
        <h2 id="premium-founder-title" data-premium-reveal>
          From the Bench
          <span>to the Roofline.</span>
        </h2>

        <div className="premium-founder-body" data-premium-reveal>
          <p>
            Roofing is a trade of details. Northline was built on a simple
            standard:
            <br />
            <em>
              <strong>
                know the material, respect the structure, and build work worthy
                of your name.
              </strong>
            </em>
          </p>
        </div>

        <blockquote className="premium-founder-quote" data-premium-reveal>
          <p>“Craft is what remains after the crew leaves.”</p>
        </blockquote>

        <div className="premium-founder-signoff" data-premium-reveal>
          <strong>Don Rafael Montoya</strong>
          <span>Founder &amp; Master Roofer</span>
          <img
            className="premium-founder-signature"
            src="/assets/founder/don-rafael-montoya-signature.png"
            alt="Don Rafael Montoya signature"
            width="1774"
            height="887"
            decoding="async"
          />
        </div>
      </div>

      <StageImage
        className="premium-founder-art premium-founder-art-right"
        base="/assets/founder/founder_right_frame"
        sizes="50vw"
        stage="founder"
        alt="Northline Roofing founder working on a tile roof"
        decoding="async"
        loading="lazy"
      />
    </section>
  );
}

export function PremiumSections() {
  return (
    <div className="premium-sections">
      <HowWeProtectSection />
      <CopperEdgeSeam />
      <GoogleReviewsSection />
      <FounderSection />
    </div>
  );
}

export function AssociationsMarquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);
  const marqueeProgress = useRef<number[]>(
    associationRowsConfig.map(({ initialProgress }) => initialProgress),
  );
  const marqueeVelocity = useRef<number[]>(associationRowsConfig.map(() => 0));
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const inView = useInView(sectionRef, { rootMargin: "200px 0px" });
  const documentVisible = useDocumentVisibility();
  const reducedMotion = useReducedMotion();
  const isRunning = inView && documentVisible && !reducedMotion;

  useEffect(() => {
    if (!isRunning) {
      marqueeVelocity.current = associationRowsConfig.map(() => 0);
      return;
    }

    let frame = 0;
    let previousTime = performance.now();
    const animate = (time: number) => {
      const delta = Math.min(time - previousTime, 48);
      previousTime = time;
      marqueeProgress.current.forEach((progress, rowIndex) => {
        const targetVelocity = hoveredRow === rowIndex ? 0 : 1;
        const easing = 1 - Math.exp(-delta / 260);
        marqueeVelocity.current[rowIndex] +=
          (targetVelocity - marqueeVelocity.current[rowIndex]) * easing;
        const rowConfig = associationRowsConfig[rowIndex];
        const nextProgress =
          (progress +
            (marqueeVelocity.current[rowIndex] * delta) /
              rowConfig.durationSeconds /
              1000) %
          1;
        marqueeProgress.current[rowIndex] = nextProgress;
        const translate =
          rowConfig.direction < 0
            ? -nextProgress * 50
            : -50 + nextProgress * 50;
        trackRefs.current[rowIndex]?.style.setProperty(
          "transform",
          `translate3d(${translate}%,0,0)`,
        );
      });
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [hoveredRow, isRunning]);

  const renderGroup = (row: AssociationBadge[], clone: boolean) => (
    <div
      className="associations-marquee-group"
      aria-hidden={clone || undefined}
    >
      {row.map((badge) => (
        <div
          className="association-badge-cell"
          data-kind={badge.kind}
          key={`${badge.file}-${clone ? "clone" : "original"}`}
        >
          <span className="association-badge-effects">
            <AssociationBadgeImage badge={badge} clone={clone} />
          </span>
        </div>
      ))}
    </div>
  );

  function AssociationBadgeImage({
    badge,
    clone,
  }: {
    badge: AssociationBadge;
    clone: boolean;
  }) {
    const base = asResponsiveAsset(`/assets/associations/${badge.file}`);
    const metadata = responsiveAssetMetadata(base);
    return (
      <StageImage
        base={base}
        sizes={`${Math.ceil((metadata.sourceWidth / metadata.sourceHeight) * 12)}vw`}
        defaultWidth={640}
        stage="associations"
        alt={clone ? "" : associationLabel(badge.file)}
        aria-hidden={clone || undefined}
        decoding="async"
        loading="lazy"
        style={
          {
            "--association-scale": badge.scale ?? 1,
            "--association-hover-scale":
              badge.hoverScale ?? (badge.scale ?? 1) * 1.14,
          } as CSSProperties
        }
      />
    );
  }

  return (
    <section
      className="associations-marquee"
      id="associations"
      ref={sectionRef}
      aria-label="Northline Roofing associations and certifications"
    >
      <div className="associations-marquee-viewport">
        <div className="associations-marquee-rows">
          {associationRows.map((row, rowIndex) => (
            <div
              className={`associations-marquee-row associations-marquee-row-${rowIndex + 1}`}
              key={rowIndex}
              onMouseEnter={() => setHoveredRow(rowIndex)}
              onMouseLeave={() =>
                setHoveredRow((current) =>
                  current === rowIndex ? null : current,
                )
              }
            >
              <div
                className="associations-marquee-track"
                ref={(element) => {
                  trackRefs.current[rowIndex] = element;
                }}
                style={{
                  transform: `translate3d(${-50 + associationRowsConfig[rowIndex].initialProgress * 50}%,0,0)`,
                }}
              >
                {renderGroup(row, false)}
                {renderGroup(row, true)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PremiumFooter({ onBook }: BookHandler) {
  const reveal = useRevealOnce<HTMLElement>({ threshold: 0.12 });
  return (
    <footer
      className={`premium-footer${reveal.revealed ? " is-visible" : ""}`}
      id="contact"
      ref={reveal.ref}
    >
      <div className="premium-footer-matte" aria-hidden="true">
        <StageImage
          className="premium-footer-back"
          base="/assets/footer/footer-roofscape-backdrop"
          sizes="100vw"
          stage="footer"
          alt=""
        />
        <StageImage
          className="premium-footer-front"
          base="/assets/footer/footer-eaves-foreground"
          sizes="100vw"
          stage="footer"
          alt=""
        />
      </div>
      <div className="premium-footer-content premium-shell">
        <div className="premium-footer-primary">
          <div className="premium-footer-brand" data-premium-reveal>
            <div className="premium-footer-brand-plaque">
              <StageImage
                className="premium-footer-brand-frame"
                base="/assets/footer/brand-plaque"
                sizes="36vw"
                defaultWidth={960}
                stage="footer"
                alt=""
                aria-hidden="true"
              />
              <div className="premium-footer-brand-surface">
                <img
                  src="/assets/brand/combination-mark.svg"
                  alt="Northline Roofing"
                />
              </div>
            </div>
            <div
              className="premium-footer-contact-rack"
              aria-label="Contact Northline Roofing"
            >
              <button
                className="premium-footer-raster-control raster-control"
                type="button"
                onClick={onBook}
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
                  sizes="12vw"
                  alt="Book an appointment"
                />
              </button>
              <a
                className="premium-footer-raster-control raster-control"
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
                  sizes="12vw"
                  alt={`Call ${siteConfig.phoneDisplay}`}
                />
              </a>
              <EmailCopyButton />
            </div>
          </div>

          <section
            className="premium-footer-map"
            id="location"
            aria-labelledby="premium-footer-map-title"
            data-premium-reveal
          >
            <div className="premium-footer-map-heading">
              <span id="premium-footer-map-title">Main Office</span>
              <a
                href={siteConfig.location.mapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps ↗
              </a>
            </div>
            <div className="premium-footer-map-frame">
              <StageImage
                base="/assets/footer/map-frame"
                sizes="60vw"
                defaultWidth={960}
                stage="footer"
                alt=""
                aria-hidden="true"
              />
              <iframe
                src={siteConfig.location.embedUrl}
                title={`Google Map showing ${siteConfig.location.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      </div>
    </footer>
  );
}

function EmailCopyButton() {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current !== null)
        window.clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const copyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(siteConfig.email);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = siteConfig.email;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copiedSuccessfully = document.execCommand("copy");
        textarea.remove();
        if (!copiedSuccessfully) return;
      }
      setCopied(true);
      if (resetTimerRef.current !== null)
        window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Do not expose the success artwork unless the clipboard operation completed.
    }
  };

  return (
    <button
      className="premium-footer-raster-control raster-control"
      type="button"
      onClick={() => void copyEmail()}
      data-raster-state={copied ? "copied" : undefined}
      aria-label={`Copy ${siteConfig.email}`}
    >
      <RasterStateArt
        defaultAsset={{
          kind: "responsive",
          base: "/assets/navbar/nav_email_default",
        }}
        hoverAsset={{
          kind: "responsive",
          base: "/assets/navbar/nav_email_hover",
        }}
        stateAsset={{
          kind: "responsive",
          base: "/assets/navbar/nav_email_copied",
        }}
        sizes="12vw"
        alt={`Copy ${siteConfig.email}`}
      />
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Email address copied to clipboard." : ""}
      </span>
    </button>
  );
}

export function CustomerServiceHologram({
  onBook,
  hidden = false,
}: BookHandler & { hidden?: boolean }) {
  const hologramRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const documentVisible = useDocumentVisibility();
  const reducedMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const rippleAId = `${id}-ripple-a`;
  const rippleBId = `${id}-ripple-b`;
  const skewAId = `${id}-skew-a`;
  const skewBId = `${id}-skew-b`;
  const skewMaskId = `${id}-skew-mask`;
  const rippleMaskId = `${id}-ripple-mask`;
  const skewGradientId = `${id}-skew-gradient`;
  const rippleGradientId = `${id}-ripple-gradient`;
  const rippleOffsetARef = useRef<SVGFEOffsetElement>(null);
  const rippleOffsetBRef = useRef<SVGFEOffsetElement>(null);
  const rippleAlphaARef = useRef<SVGFEFuncAElement>(null);
  const rippleAlphaBRef = useRef<SVGFEFuncAElement>(null);
  const hologramAlphaRef = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    const image = new Image();
    image.src = responsiveSource(HOLOGRAM.image, 640);
    const canvas = document.createElement("canvas");
    canvas.width = HOLOGRAM.width;
    canvas.height = HOLOGRAM.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    const loadAlpha = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      hologramAlphaRef.current = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;
    };
    image.addEventListener("load", loadAlpha);
    if (image.complete) loadAlpha();
    return () => image.removeEventListener("load", loadAlpha);
  }, []);

  useEffect(() => {
    const reviews = document.getElementById("reviews");
    const founder = document.getElementById("founder");
    const gallery = document.getElementById("work");
    if (!reviews && !founder && !gallery) return;
    if (!("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === gallery) {
            setActive(false);
            setDismissed(false);
            return;
          }
          setActive(true);
        });
      },
      { threshold: 0.35 },
    );
    if (reviews) observer.observe(reviews);
    if (founder) observer.observe(founder);
    if (gallery) observer.observe(gallery);
    return () => observer.disconnect();
  }, []);

  const showEffect = active && !hidden && !dismissed;
  const shouldAnimate = active && !dismissed && !reducedMotion;

  useEffect(() => {
    if (!shouldAnimate || !documentVisible) return;

    const period = HOLOGRAM.periodMs;
    const startTime = performance.now();
    let frame = 0;

    const rippleAlpha = (phase: number) => {
      if (phase < HOLOGRAM.alphaFadeInStart) return 0;
      if (phase < HOLOGRAM.alphaFadeInEnd)
        return (
          (phase - HOLOGRAM.alphaFadeInStart) /
          (HOLOGRAM.alphaFadeInEnd - HOLOGRAM.alphaFadeInStart)
        );
      if (phase < HOLOGRAM.alphaFadeOutStart) return 1;
      return (
        1 -
        (phase - HOLOGRAM.alphaFadeOutStart) / (1 - HOLOGRAM.alphaFadeOutStart)
      );
    };

    const tick = (timestamp: number) => {
      const phaseA = ((timestamp - startTime) % period) / period;
      const phaseB = (phaseA + HOLOGRAM.phaseOffset) % 1;
      rippleOffsetARef.current?.setAttribute(
        "dy",
        String(HOLOGRAM.rippleStartY + HOLOGRAM.rippleTravelY * phaseA),
      );
      rippleOffsetBRef.current?.setAttribute(
        "dy",
        String(HOLOGRAM.rippleStartY + HOLOGRAM.rippleTravelY * phaseB),
      );
      rippleAlphaARef.current?.setAttribute(
        "slope",
        String(rippleAlpha(phaseA)),
      );
      rippleAlphaBRef.current?.setAttribute(
        "slope",
        String(rippleAlpha(phaseB)),
      );
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [documentVisible, reducedMotion, shouldAnimate]);

  const updateHoverFromCoordinates = (clientX: number, clientY: number) => {
    const alpha = hologramAlphaRef.current;
    const bounds = hologramRef.current?.getBoundingClientRect();
    if (!alpha || !bounds) return;
    const x = Math.min(
      HOLOGRAM.width - 1,
      Math.max(
        0,
        Math.floor(((clientX - bounds.left) / bounds.width) * HOLOGRAM.width),
      ),
    );
    const y = Math.min(
      HOLOGRAM.height - 1,
      Math.max(
        0,
        Math.floor(((clientY - bounds.top) / bounds.height) * HOLOGRAM.height),
      ),
    );
    setHovered(
      alpha[(y * HOLOGRAM.width + x) * 4 + 3] > HOLOGRAM.alphaHitThreshold,
    );
  };

  const updateHoverFromPointer = (
    event: ReactPointerEvent<SVGSVGElement | HTMLButtonElement>,
  ) => {
    updateHoverFromCoordinates(event.clientX, event.clientY);
  };

  return (
    <div
      ref={hologramRef}
      className={`customer-service-hologram${showEffect ? " is-active" : ""}${hidden ? " is-obscured" : ""}${hovered ? " is-hovered" : ""}`}
      aria-hidden={!showEffect}
    >
      <img
        className="customer-service-hologram-puck"
        {...responsiveImage(
          "/assets/customer service/customer_service_hologram_puck",
          "160px",
          640,
        )}
        alt=""
        aria-hidden="true"
      />
      <button
        className="customer-service-hologram-minimize"
        type="button"
        aria-label="Minimize customer service assistant"
        tabIndex={showEffect ? 0 : -1}
        onClick={(event) => {
          event.currentTarget.blur();
          setHovered(false);
          setDismissed(true);
        }}
      >
        <span aria-hidden="true" />
      </button>
      <span className="customer-service-hologram-reveal" aria-hidden="true">
        <img {...responsiveImage(HOLOGRAM.image, "160px", 640)} alt="" />
        <svg
          className="customer-service-hologram-effects"
          viewBox={`0 0 ${HOLOGRAM.width} ${HOLOGRAM.height}`}
          preserveAspectRatio="xMidYMid meet"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={skewGradientId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2={HOLOGRAM.height}
            >
              <stop offset="0%" stopColor="#fff" stopOpacity=".12" />
              <stop offset="15%" stopColor="#fff" stopOpacity=".12" />
              <stop offset="27%" stopColor="#fff" stopOpacity=".24" />
              <stop offset="35%" stopColor="#fff" stopOpacity=".52" />
              <stop offset="43%" stopColor="#fff" />
              <stop offset="72%" stopColor="#fff" />
              <stop offset="82%" stopColor="#fff" stopOpacity=".62" />
              <stop offset="90%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id={rippleGradientId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2={HOLOGRAM.height}
            >
              <stop offset="0%" stopColor="#fff" stopOpacity="0" />
              <stop offset="22%" stopColor="#fff" stopOpacity="0" />
              <stop offset="27%" stopColor="#fff" stopOpacity=".3" />
              <stop offset="34%" stopColor="#fff" />
              <stop offset="70%" stopColor="#fff" />
              <stop offset="79%" stopColor="#fff" stopOpacity=".68" />
              <stop offset="89%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask
              id={skewMaskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={HOLOGRAM.width}
              height={HOLOGRAM.height}
              mask-type="luminance"
            >
              <rect
                width={HOLOGRAM.width}
                height={HOLOGRAM.height}
                fill={`url(#${skewGradientId})`}
              />
            </mask>
            <mask
              id={rippleMaskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={HOLOGRAM.width}
              height={HOLOGRAM.height}
              mask-type="luminance"
            >
              <rect
                width={HOLOGRAM.width}
                height={HOLOGRAM.height}
                fill={`url(#${rippleGradientId})`}
              />
            </mask>
            <filter
              id={rippleAId}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              x="-58"
              y="-66"
              width="836"
              height="1758"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".012 .055"
                numOctaves="1"
                seed="7"
                result="ripple-noise"
              />
              <feTile in="ripple-noise" result="tiled-ripple" />
              <feOffset
                ref={rippleOffsetARef}
                in="tiled-ripple"
                dy={HOLOGRAM.rippleStartY}
                result="moving-ripple"
              />
              <feMorphology
                in="SourceAlpha"
                operator="dilate"
                radius="5"
                result="outer-edge"
              />
              <feMorphology
                in="SourceAlpha"
                operator="erode"
                radius="9"
                result="inner-edge"
              />
              <feComposite
                in="outer-edge"
                in2="inner-edge"
                operator="out"
                result="edge-band"
              />
              <feFlood
                x="122"
                y="797"
                width="79"
                height="114"
                floodColor="#fff"
                result="armpit-exclusion"
              />
              <feComposite
                in="edge-band"
                in2="armpit-exclusion"
                operator="out"
                result="clean-edge-band"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="moving-ripple"
                scale="12"
                xChannelSelector="R"
                yChannelSelector="B"
                result="distorted-hologram"
              />
              <feComposite
                in="distorted-hologram"
                in2="clean-edge-band"
                operator="in"
                result="ripple-output"
              />
              <feComponentTransfer in="ripple-output">
                <feFuncA ref={rippleAlphaARef} type="linear" slope="0" />
              </feComponentTransfer>
            </filter>
            <filter
              id={rippleBId}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              x="-58"
              y="-66"
              width="836"
              height="1758"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".012 .055"
                numOctaves="1"
                seed="7"
                result="ripple-noise"
              />
              <feTile in="ripple-noise" result="tiled-ripple" />
              <feOffset
                ref={rippleOffsetBRef}
                in="tiled-ripple"
                dy={HOLOGRAM.rippleStartY}
                result="moving-ripple"
              />
              <feMorphology
                in="SourceAlpha"
                operator="dilate"
                radius="5"
                result="outer-edge"
              />
              <feMorphology
                in="SourceAlpha"
                operator="erode"
                radius="9"
                result="inner-edge"
              />
              <feComposite
                in="outer-edge"
                in2="inner-edge"
                operator="out"
                result="edge-band"
              />
              <feFlood
                x="122"
                y="797"
                width="79"
                height="114"
                floodColor="#fff"
                result="armpit-exclusion"
              />
              <feComposite
                in="edge-band"
                in2="armpit-exclusion"
                operator="out"
                result="clean-edge-band"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="moving-ripple"
                scale="12"
                xChannelSelector="R"
                yChannelSelector="B"
                result="distorted-hologram"
              />
              <feComposite
                in="distorted-hologram"
                in2="clean-edge-band"
                operator="in"
                result="ripple-output"
              />
              <feComponentTransfer in="ripple-output">
                <feFuncA ref={rippleAlphaBRef} type="linear" slope="0" />
              </feComponentTransfer>
            </filter>
            <filter
              id={skewAId}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              x="-58"
              y="-66"
              width="836"
              height="1758"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".045 .012"
                numOctaves="1"
                seed="11"
                result="skew-noise"
              />
              <feTile in="skew-noise" result="tiled-skew" />
              <feOffset in="tiled-skew" dy="0" result="moving-skew" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="moving-skew"
                scale="13"
                xChannelSelector="R"
                yChannelSelector="G"
                result="skewed-hologram"
              />
              <feFlood
                x="122"
                y="797"
                width="79"
                height="114"
                floodColor="#fff"
                result="armpit-exclusion"
              />
              <feComposite
                in="skewed-hologram"
                in2="armpit-exclusion"
                operator="out"
                result="clean-skew"
              />
              <feFlood
                x="209"
                y="114"
                width="310"
                height="407"
                floodColor="#fff"
                result="face-exclusion"
              />
              <feComposite
                in="clean-skew"
                in2="face-exclusion"
                operator="out"
              />
            </filter>
            <filter
              id={skewBId}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              x="-58"
              y="-66"
              width="836"
              height="1758"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".045 .012"
                numOctaves="1"
                seed="11"
                result="skew-noise"
              />
              <feTile in="skew-noise" result="tiled-skew" />
              <feOffset in="tiled-skew" dy="0" result="moving-skew" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="moving-skew"
                scale="13"
                xChannelSelector="R"
                yChannelSelector="G"
                result="skewed-hologram"
              />
              <feFlood
                x="122"
                y="797"
                width="79"
                height="114"
                floodColor="#fff"
                result="armpit-exclusion"
              />
              <feComposite
                in="skewed-hologram"
                in2="armpit-exclusion"
                operator="out"
                result="clean-skew"
              />
              <feFlood
                x="209"
                y="114"
                width="310"
                height="407"
                floodColor="#fff"
                result="face-exclusion"
              />
              <feComposite
                in="clean-skew"
                in2="face-exclusion"
                operator="out"
              />
            </filter>
          </defs>
          <g
            className="customer-service-hologram-skew customer-service-hologram-skew-a"
            filter={`url(#${skewAId})`}
            mask={`url(#${skewMaskId})`}
          >
            <image
              x="0"
              y="0"
              width={HOLOGRAM.width}
              height={HOLOGRAM.height}
              href={responsiveSource(HOLOGRAM.image, 640)}
              xlinkHref={responsiveSource(HOLOGRAM.image, 640)}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
          <g
            className="customer-service-hologram-skew customer-service-hologram-skew-b"
            filter={`url(#${skewBId})`}
            mask={`url(#${skewMaskId})`}
          >
            <image
              x="0"
              y="0"
              width={HOLOGRAM.width}
              height={HOLOGRAM.height}
              href={responsiveSource(HOLOGRAM.image, 640)}
              xlinkHref={responsiveSource(HOLOGRAM.image, 640)}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
          <g
            className="customer-service-hologram-distortion customer-service-hologram-distortion-a"
            filter={`url(#${rippleAId})`}
            mask={`url(#${rippleMaskId})`}
          >
            <image
              x="0"
              y="0"
              width={HOLOGRAM.width}
              height={HOLOGRAM.height}
              href={responsiveSource(HOLOGRAM.image, 640)}
              xlinkHref={responsiveSource(HOLOGRAM.image, 640)}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
          <g
            className="customer-service-hologram-distortion customer-service-hologram-distortion-b"
            filter={`url(#${rippleBId})`}
            mask={`url(#${rippleMaskId})`}
          >
            <image
              x="0"
              y="0"
              width={HOLOGRAM.width}
              height={HOLOGRAM.height}
              href={responsiveSource(HOLOGRAM.image, 640)}
              xlinkHref={responsiveSource(HOLOGRAM.image, 640)}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </svg>
      </span>
      <svg
        className="customer-service-hologram-hover-target"
        viewBox={`0 0 ${HOLOGRAM.width} ${HOLOGRAM.height}`}
        preserveAspectRatio="xMidYMid meet"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        pointerEvents="auto"
        aria-hidden="true"
        onClick={onBook}
        onPointerEnter={updateHoverFromPointer}
        onPointerMove={updateHoverFromPointer}
        onPointerLeave={() => setHovered(false)}
        onPointerCancel={() => setHovered(false)}
      >
        <rect
          width={HOLOGRAM.width}
          height={HOLOGRAM.height}
          fill="transparent"
        />
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
  );
}
