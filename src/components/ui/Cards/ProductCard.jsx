import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { cn } from "../../../lib/utils";
import Badge from "../Feedback/Badge";

/**
 * ProductCard — the primary catalogue card.
 *
 * Props:
 *  - product: { name, brand, category, price, oldPrice, rating, reviews, isNew }
 *  - image: string url, or omit to show the monogram placeholder
 *  - wished: boolean, onWishlistToggle: () => void
 *  - onAdd: () => void — "Add to bag"
 *  - currency: symbol string, defaults to "£"
 */
export default function ProductCard({
  product,
  image,
  wished = false,
  onWishlistToggle,
  onAdd,
  currency = "£",
  className,
}) {
  const { name, brand, category, price, oldPrice, rating, reviews, isNew } = product;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]",
        "bg-[var(--surface)] shadow-soft-sm transition-shadow duration-300 hover:shadow-soft-lg",
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-inset)]">
        {isNew && (
          <Badge variant="gold" className="absolute left-3 top-3 z-10">New</Badge>
        )}
        <button
          onClick={onWishlistToggle}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border backdrop-blur-sm transition-all",
            wished
              ? "border-gold-400 bg-gold-400/15 text-gold-500"
              : "border-white/20 bg-ink-950/40 text-white hover:scale-110"
          )}
        >
          <Heart className="size-4" fill={wished ? "currentColor" : "none"} />
        </button>

        {image ? (
          <img
            src={image}
            alt={name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span
              className="text-7xl font-semibold text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {name?.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[10.5px] font-medium uppercase tracking-wider text-gold-500">{category}</span>
        <h3 className="text-[17px] font-medium leading-snug" style={{ fontFamily: "var(--font-display)" }}>
          {name}
        </h3>
        {brand && <p className="text-xs text-[var(--text-muted)]">{brand}</p>}

        {rating != null && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="size-3"
                  fill={n <= Math.round(rating) ? "var(--color-gold-400)" : "none"}
                  stroke="var(--color-gold-400)"
                />
              ))}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {rating.toFixed(1)} {reviews != null && `(£{reviews})`}
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base text-[var(--text-primary)]">
            {oldPrice && (
              <s className="mr-1.5 text-[13px] font-normal text-[var(--text-muted)]">
                {currency}{oldPrice.toLocaleString()}
              </s>
            )}
            {currency}{price.toLocaleString()}
          </span>
          <button
            onClick={onAdd}
            className={cn(
              "rounded-full border border-[var(--border)] px-4 py-2 text-[11px] font-medium uppercase tracking-wider",
              "transition-colors hover:border-gold-400 hover:bg-gradient-to-r hover:from-gold-400 hover:to-gold-100 hover:text-ink-950"
            )}
          >
            Add to bag
          </button>
        </div>
      </div>
    </motion.article>
  );
}
