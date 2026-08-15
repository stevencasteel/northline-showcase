import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
let media: MediaQueryList | null = null;
const getMedia = () => {
  if (typeof window === "undefined") return null;
  return (media ??= window.matchMedia(query));
};
const subscribe = (onStoreChange: () => void) => {
  const current = getMedia();
  if (!current) return () => undefined;
  current.addEventListener?.("change", onStoreChange);
  return () => current.removeEventListener?.("change", onStoreChange);
};
const getSnapshot = () => getMedia()?.matches ?? false;
const getServerSnapshot = () => false;

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
