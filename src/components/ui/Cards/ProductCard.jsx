import { Link } from "react-router-dom";
import { Heart, Star, Eye, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import Badge from "../Feedback/Badge";
import { AnimatedCard, useResolvedAnimation } from "../../../lib/animations";
import { CARD_TEMPLATES } from "../../../lib/cardTemplates";

function stockStatusFor(stock, lowStockThreshold = 10) {
  if (stock == null) return null;
  if (stock === 0) return { label: "Out of stock", tone: "text-error-500" };
  if (stock <= lowStockThreshold) return { label: `Only ${stock} left`, tone: "text-amber-500" };
  return null;
}

function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function autoBadge(product) {
  if (product.badge) return product.badge;
  if (product.isNew) return "New";
  if (product.oldPrice) return "Sale";
  if (product.isBestSeller) return "Bestseller";
  if (product.isTrending) return "Trending";
  return null;
}


/**
 * ProductCard — the single card every page renders a product through (Home, Products,
 * Cart recommendations, ProductDetails related, Wishlist). Wrapped in AnimatedCard so
 * every product automatically gets the admin-configured premium animation preset
 * (Settings > Animation & Design), optionally overridden per-product from the product
 * form's Animation panel — no page-specific animation code required.
 *
 * Props:
 *  - product: { id, name, brand, category, price, oldPrice, rating, reviews, isNew,
 *               isFeatured, isTrending, isBestSeller, badge, stock, lowStockThreshold,
 *               animationOverride }
 *  - image: string url, or omit to show the monogram placeholder
 *  - video: string url — shown instead of the image when the seller uploaded one
 *  - wished: boolean, onWishlistToggle: () => void
 *  - onAdd: () => void — "Add to bag"
 *  - onQuickView: () => void — optional, shows a Quick View button when provided
 *  - compact: marketplace-dense layout (square image, discount %, tight text) for
 *             high-density grids like the homepage — otherwise the spacious default.
 *             Ignored when `template` is given explicitly.
 *  - template: "minimal" | "marketplace" | "luxury" | "grid" | "large" — overrides
 *              `compact` with one of the 5 named card templates (see CARD_TEMPLATES).
 *  - index: stagger position for the entrance animation
 */
export default function ProductCard({
  product,
  image,
  video,
  wished = false,
  onWishlistToggle,
  onAdd,
  onQuickView,
  currency = "£",
  index = 0,
  compact = false,
  template,
  className,
  disableEntrance = false,
}) {
  const { id, name, brand, category, price, oldPrice, rating, reviews, stock, lowStockThreshold } = product;
  const badge = autoBadge(product);
  const discount = discountPercent(price, oldPrice);
  const stockStatus = stockStatusFor(stock, lowStockThreshold);
  const anim = useResolvedAnimation(product.animationOverride);
  const href = id ? `/product/${id}` : undefined;
  const cfg = CARD_TEMPLATES[template] || CARD_TEMPLATES[compact ? "marketplace" : "luxury"];

  return (
    <AnimatedCard
      settings={anim}
      index={index}
      as="article"
      disableEntrance={disableEntrance}
      className={cn("group flex flex-col", cfg.bordered && "overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]", className)}
    >
      <Link
        to={href}
        className={cn(
          "relative block overflow-hidden bg-[var(--surface-inset)]",
          cfg.dense ? "aspect-square" : cfg.tall ? "aspect-[3/4]" : "aspect-[4/5]"
        )}
      >
        {cfg.showBadge &&
          (cfg.dense ? (
            discount != null && (
              <span className="absolute left-2 top-2 z-10 rounded-sm bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                -{discount}%
              </span>
            )
          ) : (
            badge && (
              <Badge variant="gold" className="absolute left-3 top-3 z-10">
                {badge}
              </Badge>
            )
          ))}
        {onWishlistToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle();
            }}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute z-10 grid place-items-center rounded-full border backdrop-blur-sm transition-all",
              cfg.dense ? "right-1.5 top-1.5 size-6" : "right-3 top-3 size-9",
              wished
                ? "border-gold-400 bg-gold-400/15 text-gold-500"
                : "border-white/20 bg-ink-950/40 text-white hover:scale-110"
            )}
          >
            <Heart className={cfg.dense ? "size-3" : "size-4"} fill={wished ? "currentColor" : "none"} />
          </button>
        )}

        {video ? (
          <video
            src={video}
            // Absolute + inset-0 instead of size-full (width/height: 100%): a percentage-height
            // child depends on its parent reporting a "definite" height, and a parent whose
            // height comes from CSS aspect-ratio (not a fixed px value, unlike category tiles'
            // h-16/w-16) is a known-fragile combination for that — confirmed on the live site via
            // a right-click on a "blank" card landing on the wrapping <Link>, not an <img>,
            // meaning the image had rendered at zero size. Absolute positioning fills the
            // containing block directly and doesn't have this dependency.
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            // object-contain regardless of template: object-cover crops any photo that isn't
            // itself square to fill the box, which for a tall/portrait product shot reads as a
            // random zoomed-in slice rather than the actual product (same issue fixed on the
            // product detail gallery — see ProductDetails.jsx).
            className="absolute inset-0 size-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                "font-semibold text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2",
                cfg.dense ? "text-4xl" : "text-7xl"
              )}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {name?.charAt(0)}
            </span>
          </div>
        )}

        {!cfg.dense && onQuickView && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full justify-center bg-black/40 py-2.5 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-950 hover:bg-neutral-100"
            >
              <Eye className="size-3.5" /> Quick view
            </button>
          </div>
        )}
      </Link>

      {cfg.dense ? (
        <div className={cn("flex flex-1 flex-col gap-1 p-2", cfg.align === "center" && "items-center text-center")}>
          <Link to={href}>
            <h3 className="line-clamp-2 min-h-[2.4em] text-[12.5px] leading-snug text-[var(--text-primary)]">{name}</h3>
          </Link>
          {cfg.showRating && rating != null && (
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-0.5 rounded-sm bg-emerald-600 px-1 py-px text-[10px] font-medium text-white">
                {Number(rating).toFixed(1)} <Star className="size-2.5" fill="currentColor" stroke="none" />
              </span>
              {reviews != null && <span className="text-[10px] text-[var(--text-muted)]">({reviews})</span>}
            </div>
          )}
          <div className={cn("mt-auto flex items-center gap-1 pt-1", cfg.align === "center" ? "flex-col" : "justify-between")}>
            <span className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {currency}
                {Number(price).toFixed(2)}
              </span>
              {oldPrice && (
                <s className="text-[10.5px] font-normal text-[var(--text-muted)]">
                  {currency}
                  {Number(oldPrice).toFixed(2)}
                </s>
              )}
            </span>
            {onAdd &&
              (cfg.cta === "link" ? (
                <button onClick={onAdd} disabled={stock === 0} className="text-[11px] font-medium uppercase tracking-wide text-gold-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40">
                  {stock === 0 ? "Sold out" : "Add"}
                </button>
              ) : (
                <button
                  onClick={onAdd}
                  disabled={stock === 0}
                  aria-label="Add to bag"
                  className="grid size-6 shrink-0 place-items-center rounded-[var(--radius-btn,999px)] bg-gold-400 text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="size-3.5" />
                </button>
              ))}
          </div>
          {/* Always rendered (just invisible when there's nothing to say) so cards without a
              low-stock warning don't end up shorter than ones that have it — same fixed-height
              slot on every card keeps a row of cards visually aligned. */}
          <span className={cn("text-[10px] font-medium", stockStatus ? stockStatus.tone : "invisible")}>{stockStatus?.label || "placeholder"}</span>
        </div>
      ) : (
        <div className={cn("flex flex-1 flex-col gap-1.5 p-4", cfg.align === "center" && "items-center text-center")}>
          {category && <span className="text-[10.5px] font-medium uppercase tracking-wider text-gold-500">{category}</span>}
          <Link to={href}>
            <h3
              className={cn("line-clamp-2 min-h-[2.75em] font-medium leading-snug", cfg.tall ? "text-xl" : "text-[17px]")}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {name}
            </h3>
          </Link>
          {brand && <p className="text-xs text-[var(--text-muted)]">{brand}</p>}

          {cfg.showRating && rating != null && (
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "size-3",
                      n <= Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
                    )}
                  />
                ))}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {Number(rating).toFixed(1)} {reviews != null && `(${reviews})`}
              </span>
            </div>
          )}

          <span className={cn("text-[11px] font-medium", stockStatus ? stockStatus.tone : "invisible")}>{stockStatus?.label || "placeholder"}</span>

          <div className={cn("mt-auto flex pt-3", cfg.cta === "pill-full" ? "flex-col gap-3" : "items-center justify-between")}>
            <span className="text-base text-[var(--text-primary)]">
              {oldPrice && (
                <s className="mr-1.5 text-[13px] font-normal text-[var(--text-muted)]">
                  {currency}
                  {Number(oldPrice).toFixed(2)}
                </s>
              )}
              {currency}
              {Number(price).toFixed(2)}
            </span>
            {onAdd &&
              (cfg.cta === "link" ? (
                <button onClick={onAdd} disabled={stock === 0} className="text-[11px] font-medium uppercase tracking-wide text-gold-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40">
                  {stock === 0 ? "Sold out" : "Add to bag"}
                </button>
              ) : (
                <button
                  onClick={onAdd}
                  disabled={stock === 0}
                  className={cn(
                    "rounded-[var(--radius-btn,999px)] border border-[var(--border)] px-4 py-2 text-[11px] font-medium uppercase tracking-wider",
                    cfg.cta === "pill-full" && "w-full py-2.5",
                    "transition-colors hover:border-gold-400 hover:bg-gold-400 hover:text-white",
                    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border)] disabled:hover:bg-none disabled:hover:text-[var(--text-primary)]"
                  )}
                >
                  {stock === 0 ? "Sold out" : "Add to bag"}
                </button>
              ))}
          </div>
        </div>
      )}
    </AnimatedCard>
  );
}
