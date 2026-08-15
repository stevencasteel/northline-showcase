import { useEffect, useRef, useState } from "react";

export function useRevealOnce<T extends Element>(
  options?: IntersectionObserverInit,
  { live = false }: { live?: boolean } = {},
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const root = options?.root;
  const rootMargin = options?.rootMargin;
  const threshold = options?.threshold;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      setRevealed(true);
      return;
    }
    const requiredRatio = Array.isArray(threshold)
      ? Math.min(...threshold)
      : (threshold ?? 0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible =
          requiredRatio === 0
            ? entry.isIntersecting
            : entry.intersectionRatio >= requiredRatio;
        setInView(visible);
        if (!visible) return;
        setRevealed(true);
        if (!live) observer.disconnect();
      },
      { root, rootMargin, threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [live, root, rootMargin, threshold]);

  return { ref, inView, revealed };
}
