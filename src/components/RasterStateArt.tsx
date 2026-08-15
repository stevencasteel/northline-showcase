import {
  responsiveImage,
  type ResponsiveAssetBase,
} from "../lib/responsiveImage";

export type RasterAsset =
  | { kind: "responsive"; base: ResponsiveAssetBase }
  | { kind: "static"; src: string; width: number; height: number };

type RasterStateArtProps = {
  defaultAsset: RasterAsset;
  hoverAsset?: RasterAsset;
  stateAsset?: RasterAsset;
  alt: string;
  sizes?: string;
};

function imageProps(asset: RasterAsset, sizes: string) {
  return asset.kind === "responsive"
    ? responsiveImage(asset.base, sizes, 640)
    : { src: asset.src, width: asset.width, height: asset.height };
}

export function RasterStateArt({
  defaultAsset,
  hoverAsset,
  stateAsset,
  alt,
  sizes = "15vw",
}: RasterStateArtProps) {
  return (
    <span className="raster-art" aria-hidden={alt ? undefined : true}>
      <img
        className="raster-art-default"
        {...imageProps(defaultAsset, sizes)}
        alt={alt}
      />
      {hoverAsset && (
        <img
          className="raster-art-hover"
          {...imageProps(hoverAsset, sizes)}
          alt=""
          aria-hidden="true"
        />
      )}
      {stateAsset && (
        <img
          className="raster-art-state"
          {...imageProps(stateAsset, sizes)}
          alt=""
          aria-hidden="true"
        />
      )}
    </span>
  );
}
