import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ARTBOARD_REFERENCE_WIDTH_PX,
  NARROW_VIEWPORT_MEDIA_QUERY,
} from "../config/layout";

const SCALE_CHANGE_EPSILON = 0.0001;
const HEIGHT_CHANGE_EPSILON_PX = 0.5;
const MIN_MEASURABLE_WIDTH_PX = 1;

type ScaledArtboardProps = {
  children: ReactNode;
};

export function ScaledArtboard({ children }: ScaledArtboardProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{
    artboardWidthPx: number;
    scale: number;
    scaledHeightPx: number;
  }>({
    artboardWidthPx: ARTBOARD_REFERENCE_WIDTH_PX.wide,
    scale: 1,
    scaledHeightPx: 0,
  });

  useLayoutEffect(() => {
    const host = hostRef.current;
    const inner = innerRef.current;
    if (!host || !inner) return;

    let resizeFrame = 0;

    const update = () => {
      const hostWidthPx = Math.max(
        host.getBoundingClientRect().width,
        MIN_MEASURABLE_WIDTH_PX,
      );
      const referenceWidthPx = window.matchMedia(NARROW_VIEWPORT_MEDIA_QUERY)
        .matches
        ? ARTBOARD_REFERENCE_WIDTH_PX.narrow
        : ARTBOARD_REFERENCE_WIDTH_PX.wide;
      const artboardWidthPx = Math.max(referenceWidthPx, hostWidthPx);
      const scale = hostWidthPx / artboardWidthPx;
      const scaledHeightPx = inner.scrollHeight * scale;
      setLayout((current) =>
        current.artboardWidthPx === artboardWidthPx &&
        Math.abs(current.scale - scale) < SCALE_CHANGE_EPSILON &&
        Math.abs(current.scaledHeightPx - scaledHeightPx) <
          HEIGHT_CHANGE_EPSILON_PX
          ? current
          : { artboardWidthPx, scale, scaledHeightPx },
      );
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(host);
      resizeObserver.observe(inner);
    }
    window.addEventListener("resize", scheduleUpdate);
    const referenceMedia = window.matchMedia(NARROW_VIEWPORT_MEDIA_QUERY);
    referenceMedia.addEventListener?.("change", scheduleUpdate);
    const imageListeners: HTMLImageElement[] = [];
    inner.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      if (image.complete) return;
      image.addEventListener("load", scheduleUpdate);
      imageListeners.push(image);
    });
    const fontReady = document.fonts?.ready.then(scheduleUpdate);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      referenceMedia.removeEventListener?.("change", scheduleUpdate);
      imageListeners.forEach((image) =>
        image.removeEventListener("load", scheduleUpdate),
      );
      window.cancelAnimationFrame(resizeFrame);
      void fontReady;
    };
  }, []);

  const innerStyle = {
    maxWidth: "none",
    transform: `scale(${layout.scale})`,
    transformOrigin: "top left",
  } as CSSProperties;

  return (
    <div
      className="scaled-artboard"
      ref={hostRef}
      style={{ height: layout.scaledHeightPx || undefined }}
    >
      <div
        className="scaled-artboard-inner"
        ref={innerRef}
        style={{
          ...innerStyle,
          width: `${layout.artboardWidthPx}px`,
        }}
        data-artboard-width={layout.artboardWidthPx}
      >
        {children}
      </div>
    </div>
  );
}
