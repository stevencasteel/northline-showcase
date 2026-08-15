import type { ResponsiveAssetMetadata } from "./responsiveImage";

type SourceRectPx = {
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
};

export function percentFromPixels(
  valuePx: number,
  sourceSizePx: number,
  precision = 6,
) {
  return `${Number(((valuePx / sourceSizePx) * 100).toFixed(precision))}%`;
}

export function sourceRectToPercentVariables(
  rect: SourceRectPx,
  metadata: Pick<ResponsiveAssetMetadata, "sourceWidth" | "sourceHeight">,
  precision = 6,
) {
  return {
    left: percentFromPixels(rect.xPx, metadata.sourceWidth, precision),
    top: percentFromPixels(rect.yPx, metadata.sourceHeight, precision),
    width: percentFromPixels(rect.widthPx, metadata.sourceWidth, precision),
    height: percentFromPixels(rect.heightPx, metadata.sourceHeight, precision),
  };
}
