import { useSyncExternalStore } from "react";

const subscribe = (onStoreChange: () => void) => {
  if (typeof document === "undefined") return () => undefined;
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
};
const getSnapshot = () => typeof document === "undefined" || !document.hidden;
const getServerSnapshot = () => true;

export function useDocumentVisibility() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
