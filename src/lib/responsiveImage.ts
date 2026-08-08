import { RESPONSIVE_ASSETS } from '../config/generatedResponsiveAssets'

type ResponsiveAssetMetadata = {
  sourceWidth: number
  sourceHeight: number
  format: 'webp' | 'avif'
  widths: readonly number[]
}

const assetMetadata = RESPONSIVE_ASSETS as Record<string, ResponsiveAssetMetadata>

function assetPath(base: string, format: ResponsiveAssetMetadata['format'], width?: number) {
  return `${base}${width ? `-${width}` : ''}.${format}`
}

export function responsiveImage(base: string, sizes: string, defaultWidth?: number) {
  const metadata = assetMetadata[base]
  if (!metadata) throw new Error(`Missing responsive asset metadata for ${base}`)
  const fallbackWidth = metadata.widths.length
    ? defaultWidth && metadata.widths.includes(defaultWidth)
      ? defaultWidth
      : metadata.widths[metadata.widths.length - 1]
    : undefined
  const props = {
    src: assetPath(base, metadata.format, fallbackWidth),
    width: metadata.sourceWidth,
    height: metadata.sourceHeight,
    sizes,
  }
  return metadata.widths.length > 1
    ? { ...props, srcSet: metadata.widths.map((width) => `${assetPath(base, metadata.format, width)} ${width}w`).join(', ') }
    : props
}

export function responsiveSource(base: string, defaultWidth?: number) {
  const metadata = assetMetadata[base]
  if (!metadata) throw new Error(`Missing responsive asset metadata for ${base}`)
  const fallbackWidth = metadata.widths.length
    ? defaultWidth && metadata.widths.includes(defaultWidth)
      ? defaultWidth
      : metadata.widths[metadata.widths.length - 1]
    : undefined
  return assetPath(base, metadata.format, fallbackWidth)
}
