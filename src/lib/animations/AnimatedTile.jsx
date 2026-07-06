import AnimatedCard from "./AnimatedCard";

/**
 * Lighter category/collection tile variant of AnimatedCard — same engine (float/glow/
 * 3D-tilt/hover-lift), just defaults tuned for a smaller, denser grid (less shadow,
 * no reflection-heavy "glass" treatment by default).
 */
export default function AnimatedTile({ settings, index = 0, className, children, ...props }) {
  const tileSettings = { ...settings, shadow: settings.shadow === "none" ? "none" : "soft" };
  return (
    <AnimatedCard settings={tileSettings} index={index} className={className} {...props}>
      {children}
    </AnimatedCard>
  );
}
