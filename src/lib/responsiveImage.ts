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

export function responsiveImage(
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
