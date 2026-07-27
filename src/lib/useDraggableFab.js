import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const MARGIN = 12;
// Only used for the very first paint, before the button has ever been measured or dragged —
// once elRef is attached we clamp against the button's real (possibly text-label-widened)
// bounding box instead, so dragging a wide pill button to an edge never clips its label.
// These buttons hide their text label below Tailwind's `sm` breakpoint (640px) and render as a
// small icon-only circle instead — estimating the full labeled width on a narrow/phone screen
// would place that much narrower button well short of the true edge, visibly close to the
// horizontal center of the screen until the post-mount remeasure corrects it.
const SM_BREAKPOINT = 640;
const ESTIMATED_WIDTH_LABELED = 190;
const ESTIMATED_WIDTH_ICON_ONLY = 56;
const ESTIMATED_HEIGHT = 48;

function estimatedWidth() {
  return window.innerWidth < SM_BREAKPOINT ? ESTIMATED_WIDTH_ICON_ONLY : ESTIMATED_WIDTH_LABELED;
}

function clamp(x, y, width, height) {
  const maxX = window.innerWidth - width - MARGIN;
  const maxY = window.innerHeight - height - MARGIN;
  return { x: Math.min(Math.max(x, MARGIN), Math.max(MARGIN, maxX)), y: Math.min(Math.max(y, MARGIN), Math.max(MARGIN, maxY)) };
}

/** Makes a fixed-position floating button (chat widget, feedback button, etc.) draggable to
 * anywhere on screen, remembering where the user left it. `side` picks the default starting
 * corner ("left" or "right") the first time it renders, before any drag has happened.
 * Consumers must attach the returned `ref` to the actual button element — its real measured
 * size (not a guess) is what dragging gets clamped against, since these are wide pill buttons
 * with text labels, not fixed-size icons. */
export function useDraggableFab(storageKey, side = "right") {
  const elRef = useRef(null);

  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore malformed storage
    }
    const width = estimatedWidth();
    const x = side === "left" ? MARGIN + 4 : window.innerWidth - width - MARGIN - 4;
    const y = window.innerHeight - ESTIMATED_HEIGHT - 96; // matches the old bottom-24 offset
    return clamp(x, y, width, ESTIMATED_HEIGHT);
  });

  const measure = useCallback(() => {
    const rect = elRef.current?.getBoundingClientRect();
    return rect ? { width: rect.width, height: rect.height } : { width: estimatedWidth(), height: ESTIMATED_HEIGHT };
  }, []);

  // Once the real element is on screen, snap any estimate-based position onto real bounds
  // (covers the case where the estimate was too small/large for this particular label). Runs as
  // a layout effect — synchronously before the browser paints — rather than a passive effect, so
  // any remaining estimate error is corrected before the user ever sees it, instead of as a
  // visible jump one frame after the initial (possibly wrong) position was already painted.
  useLayoutEffect(() => {
    const { width, height } = measure();
    setPos((current) => clamp(current.x, current.y, width, height));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const onPointerDown = useCallback(
    (e) => {
      draggingRef.current = true;
      movedRef.current = false;
      startRef.current = { mouseX: e.clientX, mouseY: e.clientY, posX: pos.x, posY: pos.y };
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [pos]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - startRef.current.mouseX;
      const dy = e.clientY - startRef.current.mouseY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
      if (!movedRef.current) return;
      const { width, height } = measure();
      setPos(clamp(startRef.current.posX + dx, startRef.current.posY + dy, width, height));
    },
    [measure]
  );

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (movedRef.current) {
      setPos((current) => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(current));
        } catch {
          // storage full/unavailable — position just won't persist across reloads
        }
        return current;
      });
    }
  }, [storageKey]);

  // Keep it on-screen if the window is resized (e.g. rotating a tablet).
  useEffect(() => {
    const onResize = () => {
      const { width, height } = measure();
      setPos((current) => clamp(current.x, current.y, width, height));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  /** Wrap the button's real onClick — suppresses the click that would otherwise fire right
   * after a drag ends (pointerup + click both fire on release). */
  const handleClick = useCallback((originalOnClick) => (e) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    originalOnClick(e);
  }, []);

  return {
    ref: elRef,
    style: { position: "fixed", left: pos.x, top: pos.y, touchAction: "none" },
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp },
    handleClick,
  };
}
