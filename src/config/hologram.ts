export const HOLOGRAM = {
  imageBase: "/assets/customer service/customer_service_hologram_full",
  periodMs: 4200,
  phaseOffset: 0.5,
  rippleStartYPx: -180,
  rippleTravelYPx: 360,
  alphaHitThreshold: 12,
  alphaFadeInStart: 0.42,
  alphaFadeInEnd: 0.5,
  alphaFadeOutStart: 0.92,
} as const;

/** Geometry in the hologram asset's 720 × 1626 source-pixel coordinate system. */
export const HOLOGRAM_SOURCE_GEOMETRY = {
  filterBoundsPx: { x: -58, y: -66, width: 836, height: 1758 },
  armpitExclusionPx: { x: 122, y: 797, width: 79, height: 114 },
  faceExclusionPx: { x: 209, y: 114, width: 310, height: 407 },
  rippleOuterDilateRadiusPx: 5,
  rippleInnerErodeRadiusPx: 9,
  rippleDisplacementScalePx: 12,
  skewDisplacementScalePx: 13,
} as const;
