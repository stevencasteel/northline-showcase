import { useEffect, useRef } from "react";

export function useGalleryKeyboardNavigation(
  onNavigate: (direction: -1 | 1, repeating: boolean) => void,
  onNavigationEnd: () => void,
) {
  const repeatingRef = useRef(false);
  const onNavigateRef = useRef(onNavigate);
  const onNavigationEndRef = useRef(onNavigationEnd);
  onNavigateRef.current = onNavigate;
  onNavigationEndRef.current = onNavigationEnd;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? 1
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? -1
            : 0;
      if (!direction) return;
      event.preventDefault();
      repeatingRef.current = event.repeat;
      onNavigateRef.current(direction, event.repeat);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (!event.key.startsWith("Arrow")) return;
      repeatingRef.current = false;
      onNavigationEndRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);
  return repeatingRef;
}
