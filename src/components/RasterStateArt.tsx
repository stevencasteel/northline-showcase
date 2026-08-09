import { responsiveImage } from "../lib/responsiveImage";

export type RasterAsset = {
  file?: string;
  responsiveBase?: Parameters<typeof responsiveImage>[0];
};

type RasterStateArtProps = {
  defaultAsset: RasterAsset;
  hoverAsset?: RasterAsset;
  stateAsset?: RasterAsset;
  width: number;
  height: number;
  alt: string;
  sizes?: string;
};

function imageProps(
  asset: RasterAsset,
  width: number,
  height: number,
  sizes: string,
) {
  return asset.responsiveBase
    ? responsiveImage(asset.responsiveBase, sizes, 640)
    : { src: asset.file ?? "", width, height };
}

export function RasterStateArt({
  defaultAsset,
  hoverAsset,
  stateAsset,
  width,
  height,
  alt,
  sizes = "15vw",
}: RasterStateArtProps) {
  return (
    <span className="raster-art" aria-hidden={alt ? undefined : true}>
      <img
        className="raster-art-default"
        {...imageProps(defaultAsset, width, height, sizes)}
        alt={alt}
      />
      {hoverAsset && (
        <img
          className="raster-art-hover"
          {...imageProps(hoverAsset, width, height, sizes)}
          alt=""
          aria-hidden="true"
        />
      )}
      {stateAsset && (
        <img
          className="raster-art-state"
          {...imageProps(stateAsset, width, height, sizes)}
          alt=""
          aria-hidden="true"
        />
      )}
    </span>
  );
}
