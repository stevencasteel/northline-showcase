export const GALLERY_PREVIEW_SLOTS = [
  { initialImage: 0, neighbors: [1, 2, 3, 4] },
  { initialImage: 2, neighbors: [0, 2] },
  { initialImage: 7, neighbors: [0, 1, 4, 5] },
  { initialImage: 9, neighbors: [0, 4] },
  { initialImage: 13, neighbors: [0, 2, 3, 5] },
  { initialImage: 16, neighbors: [2, 4] },
] as const;

export const GALLERY_SWAP_CONFIG = {
  minimumGlobalIntervalMs: 850,
  neighboringCellCooldownMs: 1700,
  minimumDelayMs: 2000,
  randomDelayRangeMs: 4000,
  idleRetryMs: 500,
  schedulerFloorMs: 250,
} as const;
