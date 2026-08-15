import { useEffect, useRef, useState, type RefObject } from "react";
import { useInView } from "./useInView";

export function useRevealOnce<T extends Element>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null);
  const inView = useInView(ref as RefObject<T | null>, options);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (inView) setRevealed(true);
  }, [inView]);

  return { ref, inView, revealed };
}
