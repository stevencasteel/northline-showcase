import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  asResponsiveAsset,
  responsiveImage,
  responsiveSource,
  type ResponsiveAssetBase,
} from "./responsiveImage";
import { CONSTRAINED_MEDIA_QUERY } from "../config/layout";

export type AssetStage =
  | "hero"
  | "badges"
  | "services"
  | "gallery"
  | "associations"
  | "protection"
  | "reviews"
  | "founder"
  | "footer";

const stageOrder: AssetStage[] = [
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
  badges: { id: "about" },
  services: { id: "services", navLabel: "Services" },
  gallery: { id: "work", navLabel: "Gallery" },
  associations: { id: "associations", navLabel: "Associations" },
  protection: { id: "protection", navLabel: "Protection" },
  reviews: { id: "reviews", navLabel: "Reviews" },
  founder: { id: "founder", navLabel: "Founder" },
  footer: { id: "contact", navLabel: "Contact" },
} as const;

export type SectionKey = keyof typeof sections;
const sectionSelector = (stage: AssetStage) => `#${sections[stage].id}`;

// Only assets needed to establish the first complete view of each section belong here.
// Rotating gallery images, association clones, hover art, and map tiles remain on demand.
const requiredAssets: Record<AssetStage, string[]> = {
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
    "/assets/ui/copper-sphere-etched-large-generated",
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

const stageBackgroundAssets = {
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
} as const satisfies Partial<Record<AssetStage, Record<string, string>>>;

type AssetStageContextValue = {
  constrained: boolean;
  enabled: (stage: AssetStage) => boolean;
  style: CSSProperties;
  stageClassName: string;
};

const AssetStageContext = createContext<AssetStageContextValue | null>(null);

function loadAndDecodeImage(baseOrUrl: string, width: number) {
  const image = new Image();
  const source =
    baseOrUrl.endsWith(".jpg") ||
    baseOrUrl.endsWith(".jpeg") ||
    baseOrUrl.endsWith(".png")
      ? baseOrUrl
      : responsiveSource(asResponsiveAsset(baseOrUrl), width);
  return new Promise<void>((resolve) => {
    image.onload = () => {
      if (typeof image.decode === "function")
        void image
          .decode()
          .catch(() => undefined)
          .finally(resolve);
      else resolve();
    };
    image.onerror = () => resolve();
    image.src = source;
  });
}

export function AssetStageProvider({
  children,
  galleryAssets = [],
}: {
  children: ReactNode;
  galleryAssets?: string[];
}) {
  const initialConstrained =
    typeof window !== "undefined" &&
    window.matchMedia(CONSTRAINED_MEDIA_QUERY).matches;
  const [constrained, setConstrained] = useState(initialConstrained);
  const [enabledStages, setEnabledStages] = useState<AssetStage[]>(["hero"]);
  const enabledStagesRef = useRef<AssetStage[]>(["hero"]);

  useEffect(() => {
    const media = window.matchMedia(CONSTRAINED_MEDIA_QUERY);
    const update = () => {
      setConstrained(media.matches);
    };
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const enableStage = async (stage: AssetStage) => {
      const assets =
        stage === "gallery"
          ? [...requiredAssets.gallery, ...galleryAssets]
          : requiredAssets[stage];
      await Promise.allSettled(
        assets.map((base) =>
          loadAndDecodeImage(base, constrained ? 640 : 1440),
        ),
      );
      if (cancelled) return;
      setEnabledStages((current) => {
        if (current.includes(stage)) return current;
        const next = [...current, stage];
        enabledStagesRef.current = next;
        return next;
      });
    };

    if (!("IntersectionObserver" in window)) {
      stageOrder.slice(1).forEach((stage) => {
        void enableStage(stage);
      });
      return () => {
        cancelled = true;
      };
    }

    const pending = new Set<AssetStage>();
    const observedStages = stageOrder.slice(1).flatMap((stage) => {
      const element = document.querySelector(sectionSelector(stage));
      if (element) {
        return [{ stage, element }];
      }
      void enableStage(stage);
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
            const stage = observedStages.find(
              ({ element }) => element === entry.target,
            )?.stage;
            if (
              !stage ||
              pending.has(stage) ||
              enabledStagesRef.current.includes(stage)
            )
              return;
            pending.add(stage);
            observer?.unobserve(entry.target);
            void enableStage(stage);
          });
        },
        { rootMargin: `${margin}px 0px` },
      );
      observedStages.forEach(({ element }) => observer?.observe(element));
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
  }, [constrained, galleryAssets]);

  const value = useMemo<AssetStageContextValue>(() => {
    const width = constrained ? 640 : 1440;
    const style = Object.fromEntries(
      enabledStages.flatMap((stage) =>
        Object.entries(
          (
            stageBackgroundAssets as Partial<
              Record<AssetStage, Record<string, string>>
            >
          )[stage] ?? {},
        ).map(([property, base]) => [
          property,
          `url("${responsiveSource(asResponsiveAsset(base), width)}")`,
        ]),
      ),
    ) as CSSProperties;
    return {
      constrained,
      enabled: (stage) => enabledStages.includes(stage),
      style,
      stageClassName: enabledStages
        .map((stage) => `asset-stage-${stage}`)
        .join(" "),
    };
  }, [constrained, enabledStages]);

  return (
    <AssetStageContext.Provider value={value}>
      {children}
    </AssetStageContext.Provider>
  );
}

export function useAssetStage() {
  return (
    useContext(AssetStageContext) ?? {
      constrained: false,
      enabled: () => true,
      style: {},
      stageClassName: "",
    }
  );
}

type StageImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  base: ResponsiveAssetBase;
  sizes: string;
  defaultWidth?: number;
  stage: AssetStage;
};

export function StageImage({
  base,
  sizes,
  defaultWidth = 1440,
  stage,
  style,
  ...props
}: StageImageProps) {
  const { enabled } = useAssetStage();
  const metadata = responsiveImage(base, sizes, defaultWidth);
  if (!enabled(stage)) {
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
