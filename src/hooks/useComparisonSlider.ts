import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";

type DragDirection = "left" | "right" | null;
type PointerMode = "idle" | "pending" | "dragging";

type ComparisonSliderOptions = {
  initialValue?: number;
  intentThreshold?: number;
  releaseDelayMs?: number;
};

const clamp = (value: number) =>
  Math.min(100, Math.max(0, Number(value.toFixed(1))));

export function useComparisonSlider({
  initialValue = 54,
  intentThreshold = 10,
  releaseDelayMs = 240,
}: ComparisonSliderOptions = {}) {
  const [value, setValue] = useState(initialValue);
  const [direction, setDirection] = useState<DragDirection>(null);
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const [pointerFocusActive, setPointerFocusActive] = useState(false);
  const isDragging = useRef(false);
  const previousValue = useRef(value);
  const directionRef = useRef<DragDirection>(null);
  const releaseTimeout = useRef<number | null>(null);
  const pointerMode = useRef<PointerMode>("idle");
  const activePointerId = useRef<number | null>(null);
  const pointerStart = useRef({ x: 0, y: 0, value });
  const dragBounds = useRef<{ left: number; width: number } | null>(null);

  useEffect(
    () => () => {
      if (releaseTimeout.current !== null)
        window.clearTimeout(releaseTimeout.current);
    },
    [],
  );

  const updateFromClientX = (input: HTMLInputElement, clientX: number) => {
    const bounds = dragBounds.current ?? input.getBoundingClientRect();
    if (bounds.width <= 0) return;
    const next = clamp(((clientX - bounds.left) / bounds.width) * 100);
    if (next !== previousValue.current) {
      const nextDirection = next > previousValue.current ? "right" : "left";
      directionRef.current = nextDirection;
      setDirection(nextDirection);
      setIndicatorVisible(true);
    }
    previousValue.current = next;
    setValue(next);
  };

  const scheduleRelease = () => {
    if (releaseTimeout.current !== null)
      window.clearTimeout(releaseTimeout.current);
    if (!directionRef.current) {
      setIndicatorVisible(false);
      releaseTimeout.current = null;
      return;
    }
    setIndicatorVisible(true);
    releaseTimeout.current = window.setTimeout(() => {
      setDirection(null);
      setIndicatorVisible(false);
      releaseTimeout.current = null;
    }, releaseDelayMs);
  };

  const finish = (pointerId?: number, preserveFeedback = true) => {
    if (pointerId !== undefined && activePointerId.current !== pointerId)
      return;
    isDragging.current = false;
    dragBounds.current = null;
    pointerMode.current = "idle";
    activePointerId.current = null;
    if (preserveFeedback) {
      scheduleRelease();
      return;
    }
    directionRef.current = null;
    setDirection(null);
    setIndicatorVisible(false);
  };

  const onInput = (event: FormEvent<HTMLInputElement>) => {
    if (isDragging.current || pointerMode.current === "pending") return;
    const next = clamp(Number(event.currentTarget.value));
    previousValue.current = next;
    directionRef.current = null;
    setDirection(null);
    setIndicatorVisible(false);
    setValue(next);
  };

  const onPointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (releaseTimeout.current !== null)
      window.clearTimeout(releaseTimeout.current);
    directionRef.current = null;
    setDirection(null);
    setIndicatorVisible(false);
    pointerStart.current = { x: event.clientX, y: event.clientY, value };
    const bounds = event.currentTarget.getBoundingClientRect();
    dragBounds.current = { left: bounds.left, width: bounds.width };
    activePointerId.current = event.pointerId;
    setIndicatorVisible(false);
    setPointerFocusActive(true);
    event.currentTarget.focus({ preventScroll: true });
    if (event.pointerType === "mouse") {
      pointerMode.current = "dragging";
      isDragging.current = true;
      previousValue.current = value;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* optional */
      }
      updateFromClientX(event.currentTarget, event.clientX);
    } else {
      pointerMode.current = "pending";
      isDragging.current = false;
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLInputElement>) => {
    if (activePointerId.current !== event.pointerId) return;
    if (pointerMode.current === "pending") {
      const dx = event.clientX - pointerStart.current.x;
      const dy = event.clientY - pointerStart.current.y;
      if (Math.abs(dx) < intentThreshold && Math.abs(dy) < intentThreshold)
        return;
      if (Math.abs(dy) > Math.abs(dx)) {
        finish(event.pointerId);
        return;
      }
      pointerMode.current = "dragging";
      isDragging.current = true;
      previousValue.current = pointerStart.current.value;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* optional */
      }
    }
    if (isDragging.current)
      updateFromClientX(event.currentTarget, event.clientX);
  };

  const onPointerUp = (event: PointerEvent<HTMLInputElement>) => {
    if (activePointerId.current !== event.pointerId) return;
    if (pointerMode.current === "pending" || isDragging.current)
      updateFromClientX(event.currentTarget, event.clientX);
    const captured = event.currentTarget.hasPointerCapture(event.pointerId);
    finish(event.pointerId);
    if (captured) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onPointerCancel = (event: PointerEvent<HTMLInputElement>) => {
    if (activePointerId.current !== event.pointerId) return;
    const captured = event.currentTarget.hasPointerCapture(event.pointerId);
    finish(event.pointerId, false);
    if (captured) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onLostPointerCapture = (event: PointerEvent<HTMLInputElement>) =>
    finish(event.pointerId);

  return {
    value,
    direction,
    indicatorVisible,
    pointerFocusActive,
    onInput,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
    onBlur: () => {
      if (document.hasFocus()) setPointerFocusActive(false);
    },
  };
}
