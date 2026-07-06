/** The 5 admin-selectable product card templates (Settings > Theme & Design, or
 * per-section override in Homepage CMS). Each is a set of tweaks layered onto
 * ProductCard's two existing dense/spacious skeletons, rather than a ground-up
 * rewrite — keeps every call site that only knows about `compact` working unchanged. */
export const CARD_TEMPLATES = {
  minimal: { label: "Minimal", dense: false, bordered: false, align: "left", cta: "link", showRating: false, showBadge: false, tall: false },
  marketplace: { label: "Marketplace", dense: true, bordered: false, align: "left", cta: "icon", showRating: true, showBadge: true, tall: false },
  luxury: { label: "Luxury", dense: false, bordered: false, align: "left", cta: "pill", showRating: true, showBadge: true, tall: false },
  grid: { label: "Grid", dense: true, bordered: true, align: "center", cta: "icon", showRating: true, showBadge: true, tall: false },
  large: { label: "Large", dense: false, bordered: false, align: "left", cta: "pill-full", showRating: true, showBadge: true, tall: true },
};
