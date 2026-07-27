import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

/**
 * BrandCard — minimal, quiet card for a brand/maison directory —
 * wordmark-first, no imagery required.
 *
 * Props:
 *  - name, tagline, logo (optional image url), href
 */
export default function BrandCard({ name, tagline, logo, href = "#", className }) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)]",
        "bg-[var(--surface)] p-8 text-center shadow-soft-sm transition-all duration-300",
        "hover:border-gold-400/50 hover:shadow-soft-md",
        className
      )}
    >
      {logo ? (
        <img src={logo} alt={name} loading="lazy" decoding="async" className="h-9 object-contain opacity-80 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0" />
      ) : (
        <span
          className="text-2xl font-medium tracking-wide text-[var(--text-primary)] transition-colors group-hover:text-gold-500"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {name}
        </span>
      )}
      {tagline && <p className="text-xs text-[var(--text-muted)]">{tagline}</p>}
    </motion.a>
  );
}
