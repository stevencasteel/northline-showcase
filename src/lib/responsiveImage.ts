import { RESPONSIVE_ASSETS } from "../config/generatedResponsiveAssets";

export type ResponsiveAssetBase = keyof typeof RESPONSIVE_ASSETS;

export type ResponsiveAssetMetadata = {
  sourceWidth: number;
  sourceHeight: number;
  format: "webp" | "avif";
  widths: readonly number[];
};

const assetMetadata = RESPONSIVE_ASSETS as Record<
  ResponsiveAssetBase,
  ResponsiveAssetMetadata
>;

const responsiveImageCache = new Map<
  string,
  ReturnType<typeof createResponsiveImage>
>();
const responsivePreloadCache = new Map<string, Promise<void>>();

export function responsiveAssetMetadata(
  base: ResponsiveAssetBase,
): ResponsiveAssetMetadata {
  const metadata = assetMetadata[base];
  if (!metadata)
    throw new Error(`Missing responsive asset metadata for ${base}`);
  return metadata;
}

function assetPath(
  base: string,
  format: ResponsiveAssetMetadata["format"],
  width?: number,
) {
  return `${base}${width ? `-${width}` : ""}.${format}`;
}

export function asResponsiveAsset(base: string): ResponsiveAssetBase {
  if (!(base in RESPONSIVE_ASSETS))
    throw new Error(`Missing responsive asset metadata for ${base}`);
  return base as ResponsiveAssetBase;
}

function createResponsiveImage(
  base: ResponsiveAssetBase,
  sizes: string,
  defaultWidth?: number,
) {
  const metadata = responsiveAssetMetadata(base);
  const fallbackWidth = metadata.widths.length
    ? defaultWidth && metadata.widths.includes(defaultWidth)
      ? defaultWidth
      : metadata.widths[metadata.widths.length - 1]
    : undefined;
  const props = {
    src: assetPath(base, metadata.format, fallbackWidth),
    width: metadata.sourceWidth,
    height: metadata.sourceHeight,
    sizes,
  };
  return metadata.widths.length > 1
    ? {
        ...props,
        srcSet: metadata.widths
          .map(
            (width) => `${assetPath(base, metadata.format, width)} ${width}w`,
          )
          .join(", "),
      }
    : props;
}

export function responsiveImage(
  base: ResponsiveAssetBase,
  sizes: string,
  defaultWidth?: number,
) {
  const key = `${base}|${sizes}|${defaultWidth ?? ""}`;
  const cached = responsiveImageCache.get(key);
  if (cached) return cached;
  const props = createResponsiveImage(base, sizes, defaultWidth);
  responsiveImageCache.set(key, props);
  return props;
}

export function preloadResponsiveImage({
  base,
  sizes,
  defaultWidth,
}: {
  base: ResponsiveAssetBase;
  sizes: string;
  defaultWidth?: number;
}) {
  const props = responsiveImage(base, sizes, defaultWidth);
  const srcSet = "srcSet" in props ? props.srcSet : undefined;
  const cacheKey = `${props.src}|${srcSet ?? ""}|${props.sizes}`;
  const cached = responsivePreloadCache.get(cacheKey);
  if (cached) return cached;

  const promise = new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.sizes = props.sizes;
    if (srcSet) image.srcset = srcSet;
    image.onload = () => {
      if (typeof image.decode === "function") {
        void image
          .decode()
          .catch(() => undefined)
          .finally(resolve);
      } else resolve();
    };
    image.onerror = () => resolve();
    image.src = props.src;
  });
  responsivePreloadCache.set(cacheKey, promise);
  return promise;
}

export function responsiveSource(
  base: ResponsiveAssetBase,
  defaultWidth?: number,
) {
  const metadata = responsiveAssetMetadata(base);
  const fallbackWidth = metadata.widths.length
    ? defaultWidth && metadata.widths.includes(defaultWidth)
      ? defaultWidth
      : metadata.widths[metadata.widths.length - 1]
    : undefined;
  return assetPath(base, metadata.format, fallbackWidth);
}
