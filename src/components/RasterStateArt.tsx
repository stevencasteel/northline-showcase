import { responsiveImage } from '../lib/responsiveImage'

export type RasterAsset = {
  file?: string
  responsiveBase?: string
}

type RasterStateArtProps = {
  defaultAsset: RasterAsset
  hoverAsset?: RasterAsset
  stateAsset?: RasterAsset
  width: number
  height: number
  alt: string
}

function imageProps(asset: RasterAsset, width: number, height: number) {
  return asset.responsiveBase
    ? responsiveImage(asset.responsiveBase, '15vw', 640)
    : { src: asset.file ?? '', width, height }
}

export function RasterStateArt({ defaultAsset, hoverAsset, stateAsset, width, height, alt }: RasterStateArtProps) {
  return (
    <span className="raster-art" aria-hidden={alt ? undefined : true}>
      <img className="raster-art-default" {...imageProps(defaultAsset, width, height)} alt={alt} />
      {hoverAsset && <img className="raster-art-hover" {...imageProps(hoverAsset, width, height)} alt="" aria-hidden="true" />}
      {stateAsset && <img className="raster-art-state" {...imageProps(stateAsset, width, height)} alt="" aria-hidden="true" />}
    </span>
  )
}
