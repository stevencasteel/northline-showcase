import { useEffect, useRef, useState } from "react";

type PreviewSlot = { readonly neighbors: readonly number[] };
type Config = {
  minimumGlobalIntervalMs: number;
  neighborSlotCooldownMs: number;
  minimumDelayMs: number;
  randomDelayRangeMs: number;
  idleRetryMs: number;
  schedulerFloorMs: number;
};

export function selectEligibleSlot(
  slots: readonly PreviewSlot[],
  nextSwapAt: number[],
  lastSwapAt: number[],
  now: number,
  hoveredSlot: number | null,
  cooldown: number,
) {
  return slots
    .map((slot, index) => ({ dueTime: nextSwapAt[index], slot: index }))
    .filter(
      ({ dueTime, slot }) =>
        slot !== hoveredSlot &&
        dueTime <= now &&
        now - lastSwapAt[slot] >= cooldown &&
        slots[slot].neighbors.every(
          (neighbor) => now - lastSwapAt[neighbor] >= cooldown,
        ),
    )
    .sort((a, b) => a.dueTime - b.dueTime)[0]?.slot;
}

export function useGalleryPreviewCycle(
  imagesLength: number,
  initialIndices: readonly number[],
  slots: readonly PreviewSlot[],
  config: Config,
  paused: boolean,
  hoveredSlotRef: { current: number | null },
) {
  const [indices, setIndices] = useState(initialIndices);
  const cursorRef = useRef(initialIndices.length);
  useEffect(() => {
    if (paused || imagesLength <= indices.length) return;
    const lastSwapAt = Array(slots.length).fill(-Infinity) as number[];
    const nextSwapAt = slots.map(
      () =>
        performance.now() +
        config.minimumDelayMs +
        Math.random() * config.randomDelayRangeMs,
    );
    let lastGlobalFire = -Infinity;
    let timer = 0;
    const schedule = () => {
      const now = performance.now();
      if (now - lastGlobalFire < config.minimumGlobalIntervalMs) {
        timer = window.setTimeout(schedule, config.minimumGlobalIntervalMs);
        return;
      }
      const slot = selectEligibleSlot(
        slots,
        nextSwapAt,
        lastSwapAt,
        now,
        hoveredSlotRef.current,
        config.neighborSlotCooldownMs,
      );
      if (slot === undefined) {
        timer = window.setTimeout(schedule, config.idleRetryMs);
        return;
      }
      lastSwapAt[slot] = now;
      lastGlobalFire = now;
      nextSwapAt[slot] =
        now + config.minimumDelayMs + Math.random() * config.randomDelayRangeMs;
      setIndices((current) => {
        const next = [...current];
        let candidate = cursorRef.current % imagesLength;
        let attempts = 0;
        while (next.includes(candidate) && attempts < imagesLength) {
          cursorRef.current += 1;
          candidate = cursorRef.current % imagesLength;
          attempts += 1;
        }
        next[slot] = candidate;
        cursorRef.current += 1;
        return next;
      });
      timer = window.setTimeout(
        schedule,
        Math.max(
          config.schedulerFloorMs,
          Math.min(...nextSwapAt) - performance.now(),
        ),
      );
    };
    timer = window.setTimeout(
      schedule,
      Math.max(
        config.schedulerFloorMs,
        Math.min(...nextSwapAt) - performance.now(),
      ),
    );
    return () => window.clearTimeout(timer);
  }, [config, hoveredSlotRef, imagesLength, indices.length, paused, slots]);
  return indices;
}
