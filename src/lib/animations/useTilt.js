import { useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * Classic premium-storefront "3D tilt" — a perspective rotateX/rotateY transform driven
 * by mouse position, not a literal 3D model. Returns a ref to attach to the tilted
 * element plus motion-value handlers to spread onto it.
 */
export function useTilt({ max = 10, scale = 1.02 } = {}) {
  const ref = useRef(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 25 });
  const s = useSpring(useMotionValue(1), { stiffness: 300, damping: 25 });

  function onMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * max * 2);
    rotateX.set(-py * max * 2);
    s.set(scale);
  }

  function onMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    s.set(1);
  }

  return { ref, rotateX, rotateY, scale: s, handlers: { onMouseMove, onMouseLeave } };
}

/** Lightweight parallax offset for hero visuals — same mouse-tracking idea, no rotation. */
export function useParallax(strength = 20) {
  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });

  function onMouseMove(e) {
    const px = e.clientX / window.innerWidth - 0.5;
    const py = e.clientY / window.innerHeight - 0.5;
    x.set(px * strength);
    y.set(py * strength);
  }

  return { x, y, onMouseMove };
}
