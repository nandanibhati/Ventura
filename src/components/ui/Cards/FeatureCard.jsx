import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

/**
 * FeatureCard — value-proposition tile (free shipping, secure payment,
 * concierge support, etc). Icon-led, quiet, and compact.
 *
 * Props:
 *  - icon: Lucide icon component
 *  - title, description
 */
export default function FeatureCard({ icon: Icon, title, description, className }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6",
        "shadow-soft-sm transition-shadow hover:shadow-soft-md",
        className
      )}
    >
      {Icon && (
        <span className="grid size-11 place-items-center rounded-full bg-gold-400/12 text-gold-500">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
      <div>
        <h3 className="text-[15px] font-medium text-[var(--text-primary)]">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>}
      </div>
    </motion.div>
  );
}
