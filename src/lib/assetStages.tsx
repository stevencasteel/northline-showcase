import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  asResponsiveAsset,
  preloadResponsiveImage,
  responsiveImage,
  responsiveSource,
  type ResponsiveAssetBase,
} from "./responsiveImage";
import { NARROW_VIEWPORT_MEDIA_QUERY } from "../config/layout";

export type SectionKey =
  | "hero"
  | "badges"
  | "services"
  | "gallery"
  | "associations"
  | "protection"
  | "reviews"
  | "founder"
  | "footer";

const sectionLoadOrder: SectionKey[] = [
  "hero",
  "badges",
  "services",
  "gallery",
  "associations",
  "protection",
  "reviews",
  "founder",
  "footer",
];
export const sections = {
  hero: { id: "top" },
  badges: { id: "qualifications" },
  services: { id: "services", navLabel: "Services" },
  gallery: { id: "gallery", navLabel: "Gallery" },
  associations: { id: "associations", navLabel: "Associations" },
  protection: { id: "protection", navLabel: "Protection" },
  reviews: { id: "reviews", navLabel: "Reviews" },
  founder: { id: "founder", navLabel: "Founder" },
  footer: { id: "contact", navLabel: "Contact" },
} as const;

const sectionSelector = (section: SectionKey) => `#${sections[section].id}`;

const sectionActivationListeners = new Map<SectionKey, Set<() => void>>();
let activatedSectionSet = new Set<SectionKey>(["hero"]);

function subscribeToSectionActivation(
  section: SectionKey,
  listener: () => void,
) {
  const listeners = sectionActivationListeners.get(section) ?? new Set();
  listeners.add(listener);
  sectionActivationListeners.set(section, listeners);
  return () => listeners.delete(listener);
}

function sectionActivationSnapshot(section: SectionKey) {
  return activatedSectionSet.has(section);
}

// Only assets needed to establish the first complete view of each section belong here.
// Rotating gallery images, association clones, hover art, and map tiles remain on demand.
const sectionPreloadAssets: Record<SectionKey, string[]> = {
  hero: ["/assets/hero/sky", "/assets/hero/foreground"],
  badges: [
    "/assets/badges/banner",
    "/assets/badges/badge-banner-workshirt",
    "/assets/badges/badge-banner-workshirt-full-hem",
  ],
  services: [
    "/assets/services/services-cover-board",
    "/assets/services/residential-roofing",
    "/assets/services/commercial-roofing",
    "/assets/services/custom-metal",
    "/assets/services/repairs-inspections",
  ],
  gallery: [
    "/assets/gallery/paper_texture",
    "/assets/gallery/material-library",
  ],
  associations: [
    "/assets/associations/associations_bg_texture",
    "/assets/associations/badge_row-1_01_high_vale_roof_tile",
    "/assets/associations/badge_row-1_02_century_seal_roof_assurance",
    "/assets/associations/badge_row-2_01_ironmere",
    "/assets/associations/badge_row-2_02_stormglass",
  ],
  protection: [
    "/assets/protection/copper_background_texture.jpg",
    "/assets/protection/protection-finished-roof",
    "/assets/protection/protection-underlayment",
    "/assets/ui/copper-sphere-etched-large-default",
  ],
  reviews: [
    "/assets/reviews/leaf_background_texture.jpg",
    "/assets/reviews/seris-rhuke",
    "/assets/reviews/nyaren-klourm",
    "/assets/reviews/baeloon-pluhng",
  ],
  founder: [
    "/assets/founder/founder-jean-texture",
    "/assets/founder/founder_left_frame",
    "/assets/founder/founder_right_frame",
  ],
  footer: [
    "/assets/footer/footer-roofscape-backdrop",
    "/assets/footer/footer-eaves-foreground",
    "/assets/footer/brand-plaque",
    "/assets/footer/map-frame",
  ],
};

const sectionBackgroundAssets = {
  hero: {
    "--asset-navbar-underlayment": "/assets/navbar/navbar-underlayment",
    "--asset-copper-edge": "/assets/ui/copper-edge",
  },
  badges: {
    "--asset-badge-workshirt": "/assets/badges/badge-banner-workshirt",
    "--asset-badge-workshirt-hem":
      "/assets/badges/badge-banner-workshirt-full-hem",
  },
  services: {
    "--asset-services-cover-board": "/assets/services/services-cover-board",
  },
  gallery: { "--asset-gallery-paper": "/assets/gallery/paper_texture" },
  associations: {
    "--asset-associations-texture":
      "/assets/associations/associations_bg_texture",
  },
  protection: {
    "--asset-protection-texture":
      "/assets/protection/copper_background_texture",
  },
  reviews: {
    "--asset-reviews-texture": "/assets/reviews/leaf_background_texture",
  },
  founder: {
    "--asset-founder-texture": "/assets/founder/founder-jean-texture",
  },
} as const satisfies Partial<Record<SectionKey, Record<string, string>>>;

const fixedPreloadCache = new Map<string, Promise<void>>();

type SectionAssetContextValue = {
  isNarrowViewport: boolean;
  isSectionActivated: (section: SectionKey) => boolean;
  style: CSSProperties;
  sectionClassName: string;
};

const SectionAssetContext = createContext<SectionAssetContextValue | null>(
  null,
);

function preloadFixedImage(baseOrUrl: string) {
  const cached = fixedPreloadCache.get(baseOrUrl);
  if (cached) return cached;
  const image = new Image();
  const promise = new Promise<void>((resolve) => {
    image.onload = () => {
      if (typeof image.decode === "function")
        void image
          .decode()
          .catch(() => undefined)
          .finally(resolve);
      else resolve();
    };
    image.onerror = () => resolve();
    image.src = baseOrUrl;
  });
  fixedPreloadCache.set(baseOrUrl, promise);
  return promise;
}

function preloadSectionImage(
  baseOrUrl: string,
  section: SectionKey,
  defaultWidth: number,
) {
  if (/[.]([a-z]+)$/i.test(baseOrUrl)) return preloadFixedImage(baseOrUrl);
  const base = asResponsiveAsset(baseOrUrl);
  const isBackgroundAsset = Object.values(
    (
      sectionBackgroundAssets as Partial<
        Record<SectionKey, Record<string, string>>
      >
    )[section] ?? {},
  ).includes(baseOrUrl);
  if (isBackgroundAsset)
    return preloadFixedImage(responsiveSource(base, defaultWidth));
  const sizes =
    section === "services"
      ? "44vw"
      : section === "badges"
        ? "91vw"
        : section === "reviews"
          ? "8vw"
          : section === "founder"
            ? "30vw"
            : section === "gallery"
              ? baseOrUrl.endsWith("material-library")
                ? "32vw"
                : "66.7vw"
              : "100vw";
  return preloadResponsiveImage({
    base,
    sizes,
    defaultWidth:
      section === "reviews" || section === "associations" ? 640 : 1440,
  });
}

export function SectionAssetProvider({
  children,
  galleryAssets = [],
}: {
  children: ReactNode;
  galleryAssets?: string[];
}) {
  const initialIsNarrowViewport =
    typeof window !== "undefined" &&
    window.matchMedia(NARROW_VIEWPORT_MEDIA_QUERY).matches;
  const [isNarrowViewport, setIsNarrowViewport] = useState(
    initialIsNarrowViewport,
  );
  const [activatedSections, setActivatedSections] = useState<SectionKey[]>([
    "hero",
  ]);
  const activatedSectionsRef = useRef<SectionKey[]>(["hero"]);

  useEffect(() => {
    const media = window.matchMedia(NARROW_VIEWPORT_MEDIA_QUERY);
    const update = () => {
      setIsNarrowViewport(media.matches);
    };
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const activateSectionAssets = async (section: SectionKey) => {
      const assets =
        section === "gallery"
          ? [...sectionPreloadAssets.gallery, ...galleryAssets]
          : sectionPreloadAssets[section];
      await Promise.allSettled(
        assets.map((base) =>
          preloadSectionImage(base, section, isNarrowViewport ? 640 : 1440),
        ),
      );
      if (cancelled) return;
      setActivatedSections((current) => {
        if (current.includes(section)) return current;
        const next = [...current, section];
        activatedSectionsRef.current = next;
        activatedSectionSet = new Set(next);
        sectionActivationListeners
          .get(section)
          ?.forEach((listener) => listener());
        return next;
      });
    };

    if (!("IntersectionObserver" in window)) {
      sectionLoadOrder.slice(1).forEach((section) => {
        void activateSectionAssets(section);
      });
      return () => {
        cancelled = true;
      };
    }

    const pending = new Set<SectionKey>();
    const observedSections = sectionLoadOrder.slice(1).flatMap((section) => {
      const element = document.querySelector(sectionSelector(section));
      if (element) {
        return [{ section, element }];
      }
      void activateSectionAssets(section);
      return [];
    });

    let observer: IntersectionObserver | null = null;
    let lastViewportHeight = 0;
    const rebuildObserver = () => {
      observer?.disconnect();
      // Keep one viewport of lead time without decoding several below-fold
      // sections before the visitor is likely to reach them.
      const margin = Math.round(window.innerHeight * 0.9);
      lastViewportHeight = window.innerHeight;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const section = observedSections.find(
              ({ element }) => element === entry.target,
            )?.section;
            if (
              !section ||
              pending.has(section) ||
              activatedSectionsRef.current.includes(section)
            )
              return;
            pending.add(section);
            observer?.unobserve(entry.target);
            void activateSectionAssets(section);
          });
        },
        { rootMargin: `${margin}px 0px` },
      );
      observedSections.forEach(({ element }) => observer?.observe(element));
    };
    rebuildObserver();

    let resizeFrame = 0;
    const handleResize = () => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        if (Math.abs(window.innerHeight - lastViewportHeight) > 32)
          rebuildObserver();
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(resizeFrame);
    };
  }, [isNarrowViewport, galleryAssets]);

  const value = useMemo<SectionAssetContextValue>(() => {
    const width = isNarrowViewport ? 640 : 1440;
    const style = Object.fromEntries(
      activatedSections.flatMap((section) =>
        Object.entries(
          (
            sectionBackgroundAssets as Partial<
              Record<SectionKey, Record<string, string>>
            >
          )[section] ?? {},
        ).map(([property, base]) => [
          property,
          `url("${responsiveSource(asResponsiveAsset(base), width)}")`,
        ]),
      ),
    ) as CSSProperties;
    return {
      isNarrowViewport,
      isSectionActivated: (section) => activatedSections.includes(section),
      style,
      sectionClassName: activatedSections
        .map((section) => `asset-section-${section}`)
        .join(" "),
    };
  }, [isNarrowViewport, activatedSections]);

  return (
    <SectionAssetContext.Provider value={value}>
      {children}
    </SectionAssetContext.Provider>
  );
}

export function useSectionAssets() {
  return (
    useContext(SectionAssetContext) ?? {
      isNarrowViewport: false,
      isSectionActivated: () => true,
      style: {},
      sectionClassName: "",
    }
  );
}

function useSectionActivation(section: SectionKey) {
  return useSyncExternalStore(
    (listener) => subscribeToSectionActivation(section, listener),
    () => sectionActivationSnapshot(section),
    () => section === "hero",
  );
}

type SectionImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  base: ResponsiveAssetBase;
  sizes: string;
  defaultWidth?: number;
  section: SectionKey;
};

export function SectionImage({
  base,
  sizes,
  defaultWidth = 1440,
  section,
  style,
  ...props
}: SectionImageProps) {
  const isSectionActivated = useSectionActivation(section);
  const metadata = responsiveImage(base, sizes, defaultWidth);
  if (!isSectionActivated) {
    return (
      <img
        className={`asset-placeholder${props.className ? ` ${props.className}` : ""}`}
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
        width={metadata.width}
        height={metadata.height}
        alt=""
        aria-hidden="true"
        data-asset-placeholder="true"
        style={style}
      />
    );
  }
  return <img {...metadata} {...props} alt={props.alt ?? ""} style={style} />;
}
