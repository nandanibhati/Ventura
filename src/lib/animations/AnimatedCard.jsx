import { motion } from "framer-motion";
import { useTilt } from "./useTilt";
import { SPEED_MULTIPLIER, INTENSITY_SCALE, SHADOW_CLASS, RADIUS_CLASS, CARD_STYLE_CLASS } from "./presets";
import { cn } from "../utils";
import "./animations.css";

const IDLE_ANIMATE = {
  float: (amp) => ({ y: [0, -amp, 0] }),
  breathe: (amp) => ({ scale: [1, 1 + amp / 100, 1] }),
  pulse: (amp) => ({ opacity: [1, 0.85, 1], scale: [1, 1 + amp / 200, 1] }),
  none: () => ({}),
};

/**
 * The one reusable "premium card" wrapper every product/category card renders through.
 * Resolves a fully-merged animation config (global preset + optional per-product override,
 * see useResolvedAnimation) into: an entrance reveal, an idle loop, a hover response, and
 * (for hover:"tilt") real-time mouse-driven 3D perspective — all GPU-accelerated transforms,
 * no layout-affecting properties, so this never causes reflow/jank.
 *
 * `glow: true` in the config bundles the shine-sweep, gradient border, and soft reflection
 * decorations together as one "premium" toggle rather than four separate settings fields.
 */
export default function AnimatedCard({
  settings,
  index = 0,
  as: Component = "div",
  className,
  contentClassName,
  disableEntrance = false,
  children,
  ...props
}) {
  const speedMul = SPEED_MULTIPLIER[settings.speed] ?? 1;
  const intensityScale = INTENSITY_SCALE[settings.intensity] ?? 1;
  const duration = (settings.duration ?? 0.5) * speedMul;
  const floatAmp = 8 * intensityScale;
  const liftAmp = 8 * intensityScale;

  const tilt = useTilt({ max: 8 * intensityScale, scale: 1 + 0.02 * intensityScale });
  const useTiltEffect = settings.hover === "tilt";

  const idleAnimate = settings.idle && settings.idle !== "none" && settings.loop
    ? IDLE_ANIMATE[settings.idle]?.(settings.idle === "float" ? floatAmp : intensityScale)
    : undefined;

  const hoverAnimate =
    settings.hover === "lift"
      ? { y: -liftAmp }
      : settings.hover === "zoom"
      ? { scale: 1 + 0.03 * intensityScale }
      : settings.hover === "glow"
      ? { scale: 1 + 0.015 * intensityScale }
      : undefined;

  const MotionComponent = motion[Component] || motion.div;

  const tiltProps = useTiltEffect
    ? { style: { rotateX: tilt.rotateX, rotateY: tilt.rotateY, scale: tilt.scale }, ref: tilt.ref, ...tilt.handlers }
    : {};

  return (
    // Outer element owns the one-time scroll-entrance animation only, so its transition
    // never fights with the inner element's looping idle/hover transitions.
    <MotionComponent
      className={cn(
        "anim-card",
        SHADOW_CLASS[settings.shadow] ?? SHADOW_CLASS.medium,
        RADIUS_CLASS[settings.borderRadius] ?? RADIUS_CLASS.rounded,
        CARD_STYLE_CLASS[settings.cardStyle] ?? CARD_STYLE_CLASS.elevated,
        settings.glow && "anim-card--glow",
        className
      )}
      initial={disableEntrance ? false : { opacity: 0, y: 28 }}
      whileInView={disableEntrance ? undefined : { opacity: 1, y: 0 }}
      viewport={disableEntrance ? undefined : { once: true, amount: 0.2 }}
      transition={{ duration, delay: (settings.delay ?? 0.05) * index, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      <motion.div
        className={cn("relative", contentClassName)}
        animate={idleAnimate}
        transition={idleAnimate ? { duration: duration * 3, repeat: Infinity, ease: "easeInOut" } : undefined}
        whileHover={hoverAnimate}
        {...tiltProps}
      >
        {children}
      </motion.div>
      {settings.glow && (
        <>
          <div className="anim-card__shine" aria-hidden="true" />
          <div className="anim-card__reflection" aria-hidden="true" />
        </>
      )}
    </MotionComponent>
  );
}
