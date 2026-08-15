export const GALLERY_PREVIEW_SLOTS = [
  { initialImageIndex: 0, neighbors: [1, 2, 3, 4] },
  { initialImageIndex: 2, neighbors: [0, 2] },
  { initialImageIndex: 7, neighbors: [0, 1, 4, 5] },
  { initialImageIndex: 9, neighbors: [0, 4] },
  { initialImageIndex: 13, neighbors: [0, 2, 3, 5] },
  { initialImageIndex: 16, neighbors: [2, 4] },
] as const;

export const GALLERY_PREVIEW_CYCLE_CONFIG = {
  minimumGlobalIntervalMs: 850,
  neighborSlotCooldownMs: 1700,
  minimumDelayMs: 2000,
  randomDelayRangeMs: 4000,
  idleRetryMs: 500,
  schedulerFloorMs: 250,
} as const;
