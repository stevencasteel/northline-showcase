import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { CONSTRAINED_MEDIA_QUERY } from "../config/layout";

const DESKTOP_ARTBOARD_REFERENCE_WIDTH_PX = 1440;
const MOBILE_ARTBOARD_REFERENCE_WIDTH_PX = 720;
const SCALE_CHANGE_EPSILON = 0.0001;
const HEIGHT_CHANGE_EPSILON_PX = 0.5;
const MIN_MEASURABLE_WIDTH_PX = 1;

type ScaledArtboardProps = {
  children: ReactNode;
};

export function ScaledArtboard({ children }: ScaledArtboardProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({
    artboardWidth: DESKTOP_ARTBOARD_REFERENCE_WIDTH_PX,
    scale: 1,
    height: 0,
  });

  useLayoutEffect(() => {
    const host = hostRef.current;
    const inner = innerRef.current;
    if (!host || !inner) return;

    let resizeFrame = 0;

    const update = () => {
      const hostWidth = Math.max(
        host.getBoundingClientRect().width,
        MIN_MEASURABLE_WIDTH_PX,
      );
      const referenceWidth = window.matchMedia(CONSTRAINED_MEDIA_QUERY).matches
        ? MOBILE_ARTBOARD_REFERENCE_WIDTH_PX
        : DESKTOP_ARTBOARD_REFERENCE_WIDTH_PX;
      const artboardWidth = Math.max(referenceWidth, hostWidth);
      const scale = hostWidth / artboardWidth;
      const height = inner.scrollHeight * scale;
      setLayout((current) =>
        current.artboardWidth === artboardWidth &&
        Math.abs(current.scale - scale) < SCALE_CHANGE_EPSILON &&
        Math.abs(current.height - height) < HEIGHT_CHANGE_EPSILON_PX
          ? current
          : { artboardWidth, scale, height },
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
    const referenceMedia = window.matchMedia(CONSTRAINED_MEDIA_QUERY);
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
    width: `${layout.artboardWidth}px`,
    maxWidth: "none",
    transform: `scale(${layout.scale})`,
    transformOrigin: "top left",
  } as CSSProperties;

  return (
    <div
      className="scaled-artboard"
      ref={hostRef}
      style={{ height: layout.height || undefined }}
    >
      <div
        className="scaled-artboard-inner"
        ref={innerRef}
        style={innerStyle}
        data-artboard-width={layout.artboardWidth}
      >
        {children}
      </div>
    </div>
  );
}
