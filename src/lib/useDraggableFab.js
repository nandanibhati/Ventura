import { useCallback, useEffect, useRef, useState } from "react";

const MARGIN = 12;
const FAB_SIZE = 56; // approx button footprint, used for clamping so it can't be dragged off-screen

function clamp(x, y) {
  const maxX = window.innerWidth - FAB_SIZE - MARGIN;
  const maxY = window.innerHeight - FAB_SIZE - MARGIN;
  return { x: Math.min(Math.max(x, MARGIN), Math.max(MARGIN, maxX)), y: Math.min(Math.max(y, MARGIN), Math.max(MARGIN, maxY)) };
}

/** Makes a fixed-position floating button (chat widget, feedback button, etc.) draggable to
 * anywhere on screen, remembering where the user left it. `side` picks the default starting
 * corner ("left" or "right") the first time it renders, before any drag has happened. */
export function useDraggableFab(storageKey, side = "right") {
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore malformed storage
    }
    const x = side === "left" ? MARGIN + 4 : window.innerWidth - FAB_SIZE - MARGIN - 4;
    const y = window.innerHeight - FAB_SIZE - 96; // matches the old bottom-24 offset
    return clamp(x, y);
  });

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

  const onPointerMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startRef.current.mouseX;
    const dy = e.clientY - startRef.current.mouseY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;
    if (!movedRef.current) return;
    setPos(clamp(startRef.current.posX + dx, startRef.current.posY + dy));
  }, []);

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
    const onResize = () => setPos((current) => clamp(current.x, current.y));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
    style: { position: "fixed", left: pos.x, top: pos.y, touchAction: "none" },
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp },
    handleClick,
  };
}
