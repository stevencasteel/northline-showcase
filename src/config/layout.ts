/** Shared layout contracts used by both browser behavior and CSS. */
export const NARROW_VIEWPORT_MAX_WIDTH_PX = 700;

export const NARROW_VIEWPORT_MEDIA_QUERY = `(max-width: ${NARROW_VIEWPORT_MAX_WIDTH_PX}px)`;

export const ARTBOARD_REFERENCE_WIDTH_PX = {
  wide: 1440,
  narrow: 720,
} as const;
