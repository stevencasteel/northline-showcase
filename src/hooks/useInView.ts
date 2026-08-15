import { useEffect, useState, type RefObject } from "react";

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  options?: IntersectionObserverInit,
) {
  const [inView, setInView] = useState(false);
  const root = options?.root;
  const rootMargin = options?.rootMargin;
  const threshold = options?.threshold;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const requiredRatio = Array.isArray(threshold)
      ? Math.min(...threshold)
      : (threshold ?? 0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(
          requiredRatio === 0
            ? entry.isIntersecting
            : entry.intersectionRatio >= requiredRatio,
        );
      },
      { root, rootMargin, threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, root, rootMargin, threshold]);

  return inView;
}
