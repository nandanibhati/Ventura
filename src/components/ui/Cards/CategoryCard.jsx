import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * CategoryCard — large tappable tile for a top-level category
 * (Handbags, Watches, etc). Designed for a category grid on the
 * homepage or nav mega-menu.
 *
 * Props:
 *  - name, count (e.g. "128 pieces"), image (optional), href
 */
export default function CategoryCard({ name, count, image, href = "#", className }) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)]",
        "border border-[var(--border)] p-5",
        className
      )}
      style={{
        backgroundImage: image
          ? `linear-gradient(180deg, rgba(8,8,13,0.05), rgba(8,8,13,0.75)), url(${image})`
          : "linear-gradient(160deg, var(--surface-inset), var(--surface))",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <span
        className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 text-[86px] font-semibold text-white/8 select-none transition-transform duration-500 group-hover:scale-110"
        style={{ fontFamily: "var(--font-display)" }}
        aria-hidden="true"
      >
        {name?.charAt(0)}
      </span>
      <div className="relative z-10 flex items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-medium text-white" style={{ fontFamily: "var(--font-display)" }}>
            {name}
          </h3>
          {count && <p className="text-xs text-white/70 mt-0.5">{count}</p>}
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </motion.a>
  );
}
