import { useCallback, useLayoutEffect, useRef } from "react";

function centerActiveThumbnail(list: HTMLElement, behavior: ScrollBehavior) {
  const item = list.querySelector<HTMLElement>('[aria-current="true"]');
  if (!item) return;
  const listRect = list.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const maxLeft = Math.max(0, list.scrollWidth - list.clientWidth);
  const maxTop = Math.max(0, list.scrollHeight - list.clientHeight);
  if (maxLeft > maxTop) {
    list.scrollTo({
      left: Math.min(
        maxLeft,
        Math.max(
          0,
          list.scrollLeft +
            itemRect.left -
            listRect.left +
            itemRect.width / 2 -
            list.clientWidth / 2,
        ),
      ),
      behavior,
    });
  } else {
    list.scrollTo({
      top: Math.min(
        maxTop,
        Math.max(
          0,
          list.scrollTop +
            itemRect.top -
            listRect.top +
            itemRect.height / 2 -
            list.clientHeight / 2,
        ),
      ),
      behavior,
    });
  }
}

export function useActiveThumbnailScroll(
  listRef: React.RefObject<HTMLElement | null>,
  activeIndex: number,
  instant: boolean,
) {
  const frameRef = useRef<number | null>(null);
  const schedule = useCallback(
    (behavior: ScrollBehavior) => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const list = listRef.current;
        if (list) centerActiveThumbnail(list, behavior);
      });
    },
    [listRef],
  );

  useLayoutEffect(() => {
    schedule(instant ? "auto" : "smooth");
  }, [activeIndex, instant, schedule]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(() => schedule("auto"));
    observer.observe(list);
    return () => observer.disconnect();
  }, [listRef, schedule]);

  useLayoutEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );
}
