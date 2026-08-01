import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Headphones,
  Flame,
  TrendingUp,
  Quote,
  Mail,
  Send,
  Plus,
  Check,
  Users,
  Package,
  Globe2,
  Watch,
  Sofa,
  Sparkles,
  Baby,
  Lamp,
  Smartphone,
  Laptop,
  Pencil,
} from "lucide-react";
import { categoriesApi, brandsApi, statsApi, promotionsApi, homepageApi, settingsApi } from "../../api/catalog";
import { productsApi, reviewsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner, EmptyState } from "../../components/ui/Feedback";
import { useToast } from "../../components/ui/Feedback/useToast";
import { gradientClassFor } from "../../lib/gradientFor";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import { resolveMediaUrl, resolveProductImageUrl } from "../../lib/api";
import { cn } from "../../lib/utils";
import ProductCard from "../../components/ui/Cards/ProductCard";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const CATEGORY_ICONS = {
  Audio: Headphones,
  Wearables: Watch,
  Computing: Laptop,
  "Mobile & Tablets": Smartphone,
  "Smart Home": Lamp,
  "Home & Kitchen": Sofa,
  "Personal Care": Sparkles,
  "Kids & Baby": Baby,
};
function iconFor(categoryName) {
  return CATEGORY_ICONS[categoryName] || Package;
}

const FAQS = [
  { question: "What is your return policy?", answer: "We offer a 30-day hassle-free return policy on all unopened or unused items with original packaging. Refunds are processed within 5-7 business days of receiving your return." },
  { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days within the country. Express shipping options are available at checkout for 1-2 day delivery." },
  { question: "Do you offer international shipping?", answer: "Yes, we ship to over 45 countries worldwide. International delivery times vary between 7-14 business days depending on destination." },
  { question: "Can I track my order?", answer: "Absolutely. Once your order ships, you will receive a tracking link via email so you can follow your package every step of the way." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit and debit cards, along with popular digital wallets. All transactions are secured with end-to-end encryption." },
  { question: "Do your products come with a warranty?", answer: "Yes, all electronics come with a minimum 1-year manufacturer warranty, with extended coverage available at checkout." },
  { question: "How do I know which product is right for me?", answer: "Each product page includes detailed specs and a compatibility guide. If you are ever unsure, our support team is happy to help you find the perfect fit." },
  { question: "Do you offer price matching?", answer: "If you find an identical item at a lower price within 14 days of purchase, we will happily match it and refund the difference." },
  { question: "How can I contact customer support?", answer: "Reach our support team any time via live chat, email or phone — we typically respond within minutes, not hours." },
];

function formatCompact(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${Math.floor(n / 1000)}K`;
  return `${Math.floor(n)}`;
}

/** Counts down to a real target Date (e.g. a promotion's endsAt). */
function useCountdownTo(targetDate) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = targetDate ? Math.max(0, Math.floor((new Date(targetDate).getTime() - now) / 1000)) : 0;
  return {
    hrs: Math.floor(remaining / 3600),
    mins: Math.floor((remaining % 3600) / 60),
    secs: remaining % 60,
  };
}

function FloatingBlob({ className }) {
  return (
    <motion.div
      animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
    />
  );
}

function StarRating({ rating, size = "h-3.5 w-3.5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
          }`}
        />
      ))}
    </div>
  );
}

/** Marketplace-style widget shell — every homepage section renders inside one of these:
 * a tight white card on the page's light-gray background, not a full-bleed editorial block. */
function SectionCard({ children, className, padded = true }) {
  return (
    <div className={cn("mx-auto max-w-7xl px-2 sm:px-3", className)}>
      <div className={cn("rounded-md bg-white shadow-sm dark:bg-neutral-900", padded && "p-3 sm:p-4")}>{children}</div>
    </div>
  );
}

function SectionHeaderRow({ icon: Icon, title, viewAllLink, viewAllLabel = "View all" }) {
  return (
    <div className="relative mb-5 flex items-center justify-center">
      <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white sm:text-xl" style={{ fontFamily: "var(--font-display)" }}>
        {Icon && <Icon className="h-4 w-4 text-amber-500" />}
        {title}
      </h2>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="absolute right-0 flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
        >
          {viewAllLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function SectionStatus({ isLoading, isError, isEmpty, onRetry, emptyLabel = "Nothing to show here yet." }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size="md" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">We couldn't load this section.</p>
        {onRetry && (
          <button onClick={onRetry} className="text-sm font-semibold text-amber-600 hover:underline dark:text-amber-400">
            Try again
          </button>
        )}
      </div>
    );
  }
  if (isEmpty) {
    return <EmptyState title={emptyLabel} className="py-10" />;
  }
  return null;
}

function toCardProduct(product) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand?.name,
    category: product.category?.name,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    rating: product.ratingAvg,
    reviews: product.ratingCount,
    isNew: product.isNew,
    isTrending: product.isTrending,
    isBestSeller: product.isBestSeller,
    badge: product.badge,
    image: resolveProductImageUrl(product.images?.[0]?.url) || null,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    animationOverride: product.animationOverride,
  };
}

/** The site-wide default product card template (Settings > Theme & Design). Individual
 * homepage sections can still override it via `config.cardTemplate`. Shares the same
 * react-query cache key as ThemeProvider's fetch, so this never triggers an extra request. */
function useGlobalCardTemplate() {
  const { data } = useQuery({ queryKey: ["settings", "public"], queryFn: settingsApi.getPublic, staleTime: 5 * 60 * 1000 });
  return data?.themeColors?.cardTemplate || "marketplace";
}

/** Thin adapter so every Home.jsx grid can keep calling `<HomeProductCard product={product} />`
 * while wiring the shared component's onAdd through this page's cart context. */
function HomeProductCard({ product, index, compact, template }) {
  const { addItem, isMutating } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleAdd = async () => {
    if (isMutating) return;
    try {
      await addItem({ productId: product.id, quantity: 1 });
      toast({
        title: "Added to bag",
        variant: "success",
        action: { label: "View Bag", onClick: () => navigate("/cart") },
      });
    } catch (err) {
      toast({ title: err.response?.data?.error?.message || "Couldn't add to bag", variant: "error" });
    }
  };
  return (
    <ProductCard
      product={product}
      image={product.image}
      index={index}
      compact={compact}
      template={template}
      // These grids already sit inside a whileInView-triggered stagger container — giving
      // each individual card its own independent entrance animation on top of that is
      // redundant, and nesting two separate scroll-triggered animations is a known source of
      // cards getting stuck at their pre-animation opacity:0 (looks exactly like a missing
      // image: the surface-inset placeholder color shows through forever).
      disableEntrance
      onAdd={handleAdd}
    />
  );
}

/** Single-row, horizontally scrollable product strip (Amazon/Argos-style "Popular products") —
 * used instead of a wrapping grid so a section reads as one scannable row with side arrows,
 * rather than boxes stacking into several rows. */
function HorizontalProductRow({ children }) {
  const scrollRef = useRef(null);
  // Scroll by exactly one card (not a full-container "page") so the arrow advances the row one
  // card at a time instead of swapping the whole visible set at once. Measured directly from two
  // consecutive cards' rendered positions (card width + gap) rather than hardcoding either, so
  // this keeps working across the row's responsive width/gap breakpoints above.
  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const [first, second] = el.children;
    const step = first && second ? second.offsetLeft - first.offsetLeft : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-2 [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="absolute left-0 top-[35%] hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-soft-md ring-1 ring-black/5 hover:bg-neutral-50 sm:flex dark:bg-neutral-800 dark:text-white dark:ring-white/10"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="absolute right-0 top-[35%] hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-soft-md ring-1 ring-black/5 hover:bg-neutral-50 sm:flex dark:bg-neutral-800 dark:text-white dark:ring-white/10"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

/** Dense marketplace product grid — the workhorse behind Featured/Trending/Best Sellers/Flash Sale. */
/** Literal Tailwind class map — dynamic template-string class names (`lg:grid-cols-${n}`)
 * would never get generated by Tailwind's build-time scanner, so every admin-selectable
 * column count needs a literal class string somewhere in source. */
const COLUMN_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  8: "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
};

/** Maps a section's chosen "product source" (Admin > Homepage CMS) to real API query
 * params — every source is either an existing sort/flag filter or a targeted lookup,
 * no source requires bespoke backend work. */
function resolveProductSourceParams(source, sourceValue, limit) {
  switch (source) {
    case "featured":
      return { featured: true, sort: "rating", limit };
    case "trending":
      return { trending: true, sort: "newest", limit };
    case "bestSeller":
      return { bestSeller: true, sort: "best-selling", limit };
    case "newest":
      return { sort: "newest", limit };
    case "rating":
      return { sort: "rating", limit };
    case "price-asc":
      return { sort: "price-asc", limit };
    case "price-desc":
      return { sort: "price-desc", limit };
    case "category":
      return sourceValue ? { category: sourceValue, limit } : { sort: "featured", limit };
    case "brand":
      return sourceValue ? { brand: sourceValue, limit } : { sort: "featured", limit };
    case "seller":
      return sourceValue ? { storeId: sourceValue, limit } : { sort: "featured", limit };
    case "manual":
      return sourceValue ? { ids: sourceValue, limit: 100 } : { sort: "featured", limit };
    default:
      return { sort: "featured", limit };
  }
}

// Boosts admin-flagged products to the front of the pool for these three sources, so
// toggling Featured/Trending/Best-Seller on a product has an immediate, visible effect
// even before the section is empty of un-flagged items to fall back on.
const BOOST_FLAG_BY_SOURCE = { featured: "isFeatured", trending: "isTrending", bestSeller: "isBestSeller" };

/** Tracks the current responsive breakpoint so section visibility (Desktop/Tablet/Mobile
 * only) can react to real window resizes, not just the initial render. */
function useViewportKind() {
  const getKind = () => (typeof window === "undefined" ? "desktop" : window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop");
  const [kind, setKind] = useState(getKind);
  useEffect(() => {
    const onResize = () => setKind(getKind());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return kind;
}

/** Evaluates a section's `config.visibility` (device + audience targeting) against the
 * current viewport/auth state. Absent visibility config = always visible (non-breaking). */
function useSectionVisible(config) {
  const { isAuthenticated } = useAuth();
  const viewport = useViewportKind();
  const vis = config?.visibility;
  if (!vis) return true;
  if (vis.audience === "guest" && isAuthenticated) return false;
  if (vis.audience === "loggedIn" && !isAuthenticated) return false;
  if (vis.devices && vis.devices.length > 0 && !vis.devices.includes(viewport)) return false;
  return true;
}

/** Every Featured/Trending/Best-Seller-type section (any number of instances, each with
 * its own config — "Section Library") renders through this one config-driven component. */
function ProductGridSection({ section, defaults }) {
  const config = section?.config || {};
  const visible = useSectionVisible(config);
  const globalTemplate = useGlobalCardTemplate();
  const template = config.cardTemplate || globalTemplate;
  const { isPreview, requestEdit } = useCmsEditClick();

  const source = config.productSource || defaults.source;
  const title = config.title || defaults.title;
  const subtitle = config.subtitle;
  const viewAllLink = config.buttonLink || defaults.viewAllLink;
  const buttonText = config.buttonText || "View all";
  const requestedCount = Number(config.productCount) || 12;
  const columns = Number(config.columns) || 6;
  const fetchLimit = BOOST_FLAG_BY_SOURCE[source] ? Math.max(requestedCount * 2, 16) : requestedCount;
  const params = resolveProductSourceParams(source, config.sourceValue, fetchLimit);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "cms-section", section?.id, params],
    queryFn: () => productsApi.list(params),
    enabled: visible,
  });

  let items = data?.items || [];
  const boostFlag = BOOST_FLAG_BY_SOURCE[source];
  if (boostFlag) items = items.slice().sort((a, b) => (b[boostFlag] ? 1 : 0) - (a[boostFlag] ? 1 : 0));
  if (source === "manual" && config.sourceValue) {
    const order = config.sourceValue.split(",");
    items = items.slice().sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }
  const products = items.slice(0, requestedCount).map(toCardProduct);

  if (!visible) return null;

  return (
    <SectionCard>
      <SectionHeaderRow icon={defaults.icon} title={title} viewAllLink={viewAllLink} viewAllLabel={buttonText} />
      {subtitle && <p className="-mt-2 mb-3 text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
      <SectionStatus isLoading={isLoading} isError={isError} isEmpty={products.length === 0} onRetry={refetch} emptyLabel={defaults.emptyLabel} />
      {!isLoading && !isError && products.length > 0 && (
        <HorizontalProductRow>
          {products.map((product, i) => (
            <div key={product.id} className="relative w-[72vw] shrink-0 snap-start sm:w-[270px] lg:w-[calc((100%-4*1.5rem)/5)]">
              <HomeProductCard product={product} index={i} template={template} />
              {isPreview && <CmsEditOverlay onEdit={() => requestEdit("product", product.id)} />}
            </div>
          ))}
        </HorizontalProductRow>
      )}
    </SectionCard>
  );
}

const VERTICAL_UPGRADE_BANNER_URL =
  "https://res.cloudinary.com/dmyuu0c8g/image/upload/f_auto,q_auto,w_1600,c_limit/v1785524031/veluntra/rgobblechcmaapcg2lui.jpg";

const PROMO_TILES = [
  {
    id: "pay-later",
    heading: "Tech now,\npay later",
    bullets: ["0% interest", "Flexible payments", "Quick & easy"],
    cta: "Learn more",
    link: "/shop",
    bg: "bg-[#EDE6FB] dark:bg-[#2e1065]/40",
    dot: "bg-[#8B5CF6]",
    text: "text-[#5B21B6] dark:text-white",
    sub: "text-[#6D28D9] dark:text-gold-200",
    categorySlug: "laptops",
  },
  {
    id: "sweet-deals",
    heading: "Sweeet\ndeals!",
    body: "Save up to £200 on selected fridge freezers. Plus, get free recycling.",
    cta: "Shop now",
    link: "/shop?category=home-kitchen",
    bg: "bg-[#FDF0D5] dark:bg-[#3a2a0a]/40",
    dot: "bg-[#F59E0B]",
    text: "text-[#B45309] dark:text-white",
    sub: "text-[#92400E] dark:text-gold-200",
    categorySlug: "home-kitchen",
  },
  {
    id: "upgrade-now",
    heading: "Upgrade Now,\nSave More.",
    bullets: ["Top brands", "Lower prices", "Premium quality"],
    cta: "Shop now",
    link: "/shop?category=phones",
    bg: "bg-[#DCF3EA] dark:bg-[#0a2e24]/40",
    dot: "bg-[#10B981]",
    text: "text-[#065F46] dark:text-white",
    sub: "text-[#047857] dark:text-gold-200",
    categorySlug: "phones",
    badge: "Big Savings!",
    image: VERTICAL_UPGRADE_BANNER_URL,
  },
];

/** Client-supplied marketing promo row (financing / seasonal deal / upsell) - not tied to live
 * category data like the rest of the homepage, since this is fixed campaign copy the store
 * asked for verbatim. The 3rd tile renders the client's own finished banner image directly
 * (tile.image) instead of the coded layout the other two use. */
function PromoTilesRow() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const imageFor = (slug) => categories.find((c) => c.slug === slug)?.imageUrl;

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-3">
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {PROMO_TILES.map((tile) => {
          if (tile.image) {
            return (
              <Link
                key={tile.id}
                to={tile.link}
                className="block h-40 w-[75vw] shrink-0 snap-start overflow-hidden rounded-lg sm:h-56 sm:w-auto"
              >
                <img src={tile.image} alt={tile.heading.replace(/\n/g, " ")} loading="lazy" decoding="async" className="size-full object-cover" />
              </Link>
            );
          }
          const img = imageFor(tile.categorySlug);
          return (
            <Link
              key={tile.id}
              to={tile.link}
              className={cn(
                "group relative flex h-40 w-[75vw] shrink-0 snap-start items-center overflow-hidden rounded-lg px-6 py-5 sm:h-56 sm:w-auto",
                tile.bg
              )}
            >
              {/* Decorative accent circles, standing in for the illustrated confetti/spheres in
                  the client's reference design. */}
              <span className={cn("pointer-events-none absolute -left-3 -top-3 size-14 rounded-full opacity-20", tile.dot)} />
              <span className={cn("pointer-events-none absolute -right-2 top-8 size-3 rounded-full opacity-40", tile.dot)} />

              {tile.badge && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  {tile.badge}
                </span>
              )}

              <div className="relative z-10 max-w-[58%]">
                <span className="inline-block rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:bg-white/10 dark:text-white">
                  Veluntra
                </span>
                <h3 className={cn("mt-2 whitespace-pre-line text-lg font-extrabold leading-tight sm:text-2xl", tile.text)}>
                  {tile.heading}
                </h3>
                {tile.body && <p className={cn("mt-1.5 text-xs sm:text-sm", tile.sub)}>{tile.body}</p>}
                {tile.bullets && (
                  <ul className={cn("mt-1.5 space-y-0.5 text-xs sm:text-sm", tile.sub)}>
                    {tile.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-1.5">
                        <Check className="size-3 shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                )}
                <span className={cn("mt-2 inline-flex items-center gap-1 text-sm font-semibold", tile.text)}>
                  {tile.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>

              {img && (
                <img
                  src={resolveMediaUrl(img)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-y-0 right-0 h-full w-[48%] object-contain p-3 transition-transform duration-500 group-hover:scale-105 sm:p-6"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const WIDE_BANNER_URL =
  "https://res.cloudinary.com/dmyuu0c8g/image/upload/f_auto,q_auto,w_1600,c_limit/v1785599804/veluntra/fnm3qxetkfybytdnnmcw.jpg";

/** Full-width single promo banner, sitting directly below the 3-tile row - client-supplied
 * final asset, used as-is rather than recreated in code. */
function WideBannerSection() {
  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-3">
      <Link to="/shop" className="block overflow-hidden rounded-lg">
        <img src={WIDE_BANNER_URL} alt="Upgrade Smarter with Veluntra" className="w-full object-cover" />
      </Link>
    </div>
  );
}

/** Photo-tile strip, horizontally scrollable — the primary category nav. Shows the
 * admin-uploaded category photo when set (Admin > Categories), falling back to a
 * generic icon on a gradient tile when a category has no photo yet. */
function CategoriesSection() {
  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });
  const scrollRef = useRef(null);
  const scrollBy = (dir) => scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  const { isPreview, requestEdit } = useCmsEditClick();

  return (
    <div className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-2 sm:px-3">
        <SectionStatus isLoading={isLoading} isError={isError} isEmpty={categories.length === 0} onRetry={refetch} />
        {!isLoading && !isError && categories.length > 0 && (
          <div className="relative">
            {/* Flat, uncropped product renders directly on the section's own background
                (Apple-style category nav). The source photos are used as-is (real, unedited
                images with their own plain white canvas + circle backdrop baked in) - so this
                section is pinned to a fixed light background regardless of site theme, since
                that's the only way those photos sit on it with no visible seam. object-contain
                so nothing of the source image is ever cropped, whatever its aspect ratio. */}
            <div ref={scrollRef} className="flex items-start gap-6 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:gap-12 sm:px-10 [&::-webkit-scrollbar]:hidden">
              {categories.slice(0, 12).map((cat) => {
                const Icon = iconFor(cat.name);
                return (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.slug}`}
                    className="group flex w-20 shrink-0 flex-col items-center gap-2 text-center sm:w-28"
                  >
                    <div className="relative flex h-20 w-20 items-center justify-center sm:h-28 sm:w-28">
                      {cat.imageUrl ? (
                        <img
                          src={resolveMediaUrl(cat.imageUrl)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className={cn("flex size-full items-center justify-center rounded-full bg-gradient-to-br", gradientClassFor(cat.id))}>
                          <Icon className="h-7 w-7 text-white sm:h-9 sm:w-9" strokeWidth={1.5} />
                        </div>
                      )}
                      {isPreview && <CmsEditOverlay onEdit={() => requestEdit("category", cat.id)} />}
                    </div>
                    <span className="text-[13px] font-semibold leading-tight text-neutral-900 sm:text-base">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
            {categories.length > 6 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  aria-label="Scroll categories left"
                  className="absolute left-0 top-6 hidden size-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md hover:bg-neutral-100 sm:flex sm:top-10"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  aria-label="Scroll categories right"
                  className="absolute right-0 top-6 hidden size-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md hover:bg-neutral-100 sm:flex sm:top-10"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const FEATURED_DEFAULTS = { source: "featured", title: "Handpicked For You", viewAllLink: "/shop", emptyLabel: "No featured products yet." };
const TRENDING_DEFAULTS = { source: "trending", title: "New Arrivals", viewAllLink: "/shop?sort=newest", emptyLabel: "No new arrivals yet.", icon: TrendingUp };
const BEST_SELLERS_DEFAULTS = { source: "bestSeller", title: "Best Sellers", viewAllLink: "/shop?sort=best-selling", emptyLabel: "No sales data yet — check back once orders start rolling in." };

function FeaturedProductsSection({ section }) {
  return <ProductGridSection section={section} defaults={FEATURED_DEFAULTS} />;
}

function TrendingSection({ section }) {
  return <ProductGridSection section={section} defaults={TRENDING_DEFAULTS} />;
}

function BestSellersSection({ section }) {
  return <ProductGridSection section={section} defaults={BEST_SELLERS_DEFAULTS} />;
}

/** Unlike the other product-grid sections, Flash Sale's products come from an *active
 * promotion* (Admin > Offers), not a chosen product source — title/count/columns/
 * visibility are still config-driven for consistency with every other section type. */
function FlashSaleSection({ section }) {
  const config = section?.config || {};
  const visible = useSectionVisible(config);
  const globalTemplate = useGlobalCardTemplate();
  const template = config.cardTemplate || globalTemplate;
  const { isPreview, requestEdit } = useCmsEditClick();
  const requestedCount = Number(config.productCount) || 12;
  const columns = Number(config.columns) || 6;

  const { data: promotions = [], isLoading: promosLoading } = useQuery({
    queryKey: ["promotions", "active"],
    queryFn: promotionsApi.listActive,
    enabled: visible,
  });

  const flashSale = promotions.find((p) => p.type === "flash_sale");

  const scopeParams = flashSale
    ? flashSale.scope === "category"
      ? { category: flashSale.category?.slug }
      : flashSale.scope === "brand"
      ? { brand: flashSale.brand?.slug }
      : {}
    : {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", "flash-sale", flashSale?.id, requestedCount],
    queryFn: () => productsApi.list({ ...scopeParams, limit: requestedCount }),
    enabled: visible && Boolean(flashSale),
  });

  const { hrs, mins, secs } = useCountdownTo(flashSale?.endsAt);
  const percentOff = Number(flashSale?.value || 0);
  const products = (data?.items || []).map((p) => {
    const card = toCardProduct(p);
    const discounted = Math.round(card.price * (1 - percentOff / 100) * 100) / 100;
    return { ...card, oldPrice: card.price, price: discounted };
  });

  if (!visible || (!promosLoading && !flashSale)) return null;

  return (
    <SectionCard>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-rose-600 dark:text-rose-400 sm:text-lg">
          <Flame className="h-4 w-4" /> {config.title || flashSale?.name || "Deals of the Day"}
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
          <span>Ends in</span>
          <span className="rounded-sm bg-neutral-900 px-1.5 py-0.5 tabular-nums text-white">{String(hrs).padStart(2, "0")}</span>:
          <span className="rounded-sm bg-neutral-900 px-1.5 py-0.5 tabular-nums text-white">{String(mins).padStart(2, "0")}</span>:
          <span className="rounded-sm bg-neutral-900 px-1.5 py-0.5 tabular-nums text-white">{String(secs).padStart(2, "0")}</span>
        </div>
      </div>
      {isLoading || isError ? (
        <SectionStatus isLoading={isLoading} isError={isError} isEmpty={false} />
      ) : (
        <HorizontalProductRow>
          {products.map((product, i) => (
            <div key={product.id} className="relative w-[72vw] shrink-0 snap-start sm:w-[270px] lg:w-[calc((100%-4*1.5rem)/5)]">
              <HomeProductCard product={product} index={i} template={template} />
              {isPreview && <CmsEditOverlay onEdit={() => requestEdit("product", product.id)} />}
            </div>
          ))}
        </HorizontalProductRow>
      )}
    </SectionCard>
  );
}

const COLLECTION_BADGES = ["Popular", "New in", "Save", "Top rated"];

/** Flat, image-forward tile grid (Argos "Seasonal inspiration" style) — deliberately NOT a
 * boxed white SectionCard with white text over a dark image overlay. Image on top with a small
 * colored badge, bold dark title + short description below it, on the bare page background. */
function CollectionsSection({ section }) {
  const config = section?.config || {};
  const visible = useSectionVisible(config);
  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
    enabled: visible,
  });
  // Prefer admin-flagged featured categories, but don't limit this section to just 4 tiles when
  // there are more categories to show — a couple of sparse tiles in an otherwise dense page reads
  // as broken/unfinished, not minimal.
  const featuredFirst = categories.filter((c) => c.featured);
  const rest = categories.filter((c) => !c.featured);
  const featured = [...featuredFirst, ...rest].slice(0, 8);

  if (!visible || (!isLoading && !isError && featured.length === 0)) return null;

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-3">
      <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white sm:text-xl">
        {config.title || "Seasonal Inspiration"}
      </h2>
      <SectionStatus isLoading={isLoading} isError={isError} isEmpty={false} onRetry={refetch} />
      {!isLoading && !isError && (
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {featured.map((cat, i) => {
            const Icon = iconFor(cat.name);
            return (
              <div key={cat.id} className="w-full">
                <Link to={`/shop?category=${cat.slug}`} className="group block w-full">
                  <div
                    className={cn(
                      "relative aspect-[4/3] w-full overflow-hidden rounded-md",
                      cat.imageUrl ? "bg-white" : "bg-gradient-to-br",
                      !cat.imageUrl && gradientClassFor(cat.id)
                    )}
                  >
                    {cat.imageUrl ? (
                      <img
                        src={resolveMediaUrl(cat.imageUrl)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Icon className="absolute right-3 top-3 h-10 w-10 text-white/20" strokeWidth={1} />
                    )}
                    <span className="absolute left-2.5 top-2.5 rounded-sm bg-rose-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {COLLECTION_BADGES[i % COLLECTION_BADGES.length]}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold text-neutral-900 dark:text-white sm:text-base">{cat.name}</h3>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{cat.productCount}+ items to explore</p>
                  <span className="mt-1 inline-block text-xs font-semibold text-amber-600 underline underline-offset-2 dark:text-amber-400">
                    Shop now
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BrandsSection({ section }) {
  const config = section?.config || {};
  const visible = useSectionVisible(config);
  const { isPreview, requestEdit } = useCmsEditClick();
  const { data: brands = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.list,
    enabled: visible,
  });

  if (!visible) return null;

  return (
    <SectionCard>
      <SectionHeaderRow title={config.title || "Trusted Brands"} />
      <SectionStatus isLoading={isLoading} isError={isError} isEmpty={brands.length === 0} onRetry={refetch} />
      {!isLoading && !isError && brands.length > 0 && (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-6">
          {brands.slice(0, 12).map((brand) => (
            <div
              key={brand.id}
              className="relative flex items-center justify-center rounded-sm border border-black/5 p-3 opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:border-white/10"
            >
              {brand.logoUrl ? (
                <img src={resolveMediaUrl(brand.logoUrl)} alt={brand.name} loading="lazy" decoding="async" className="h-8 max-w-full object-contain sm:h-10" />
              ) : (
                <span className="text-xs font-bold tracking-wide text-neutral-900 dark:text-white sm:text-sm">{brand.name.toUpperCase()}</span>
              )}
              {isPreview && <CmsEditOverlay onEdit={() => requestEdit("brand", brand.id)} />}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function StatItem({ icon: Icon, value, decimals = 0, suffix = "", label }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  const startCounting = () => {
    if (started.current) return;
    started.current = true;
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(progress * value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    <motion.div
      variants={fadeUp}
      onViewportEnter={startCounting}
      viewport={{ once: true, amount: 0.6 }}
      className="flex flex-col items-center gap-1.5 text-center"
    >
      <Icon className="h-5 w-5 text-amber-400" strokeWidth={1.75} />
      <span className="text-xl font-bold tabular-nums text-white sm:text-2xl">
        {decimals ? display.toFixed(decimals) : formatCompact(display)}
        {suffix}
      </span>
      <span className="text-xs text-white/60">{label}</span>
    </motion.div>
  );
}

function StatsSection() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["stats"],
    queryFn: statsApi.getPublicStats,
  });

  const items = stats
    ? [
        { icon: Users, value: stats.happyCustomers, suffix: "+", label: "Happy Customers", decimals: 0 },
        { icon: Package, value: stats.productsDelivered, suffix: "+", label: "Products Delivered", decimals: 0 },
        { icon: Globe2, value: stats.countriesServed, suffix: "+", label: "Countries Served", decimals: 0 },
        { icon: Star, value: stats.averageRating, suffix: "/5", label: "Average Rating", decimals: 1 },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-3">
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-5 sm:p-6">
        <FloatingBlob className="left-[10%] top-[-40%] h-40 w-40 bg-amber-500/10" />
        <FloatingBlob className="bottom-[-40%] right-[10%] h-52 w-52 bg-indigo-500/10" />
        {isLoading || isError ? (
          <SectionStatus isLoading={isLoading} isError={isError} isEmpty={false} onRetry={refetch} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {items.map((stat) => (
              <StatItem key={stat.label} {...stat} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TestimonialsSection({ section }) {
  const config = section?.config || {};
  const visible = useSectionVisible(config);
  const [index, setIndex] = useState(0);
  const { data: testimonials = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["reviews", "featured"],
    queryFn: () => reviewsApi.listFeatured(6),
    enabled: visible,
  });

  useEffect(() => {
    if (testimonials.length === 0) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  if (!visible || (!isLoading && !isError && testimonials.length === 0)) return null;

  const testimonial = testimonials[index];

  return (
    <SectionCard>
      <SectionHeaderRow title={config.title || "What Customers Say"} />
      <SectionStatus isLoading={isLoading} isError={isError} isEmpty={false} onRetry={refetch} />
      {!isLoading && !isError && testimonial && (
        <div className="relative">
          <Quote className="mb-3 h-6 w-6 text-amber-400" />
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-100 sm:text-base">
                &quot;{testimonial.body}&quot;
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-xs font-bold text-white">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white sm:text-sm">{testimonial.name}</p>
                    <p className="text-[11px] text-neutral-400">On {testimonial.productName}</p>
                  </div>
                </div>
                <StarRating rating={testimonial.rating} size="h-3.5 w-3.5" />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              aria-label="Previous testimonial"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-neutral-500 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-5 bg-neutral-900 dark:bg-white" : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
                )}
              />
            ))}
            <button
              onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
              aria-label="Next testimonial"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-neutral-500 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-black/5 last:border-b-0 dark:border-white/10">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 py-3.5 text-left">
        <span className="text-sm font-medium text-neutral-900 dark:text-white">{faq.question}</span>
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 transition-transform duration-300 dark:border-white/15",
            isOpen ? "rotate-45 border-transparent bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-500"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-3.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <SectionCard>
      <SectionHeaderRow title="Frequently Asked Questions" />
      <div>
        {FAQS.map((faq, i) => (
          <FAQItem key={faq.question} faq={faq} isOpen={openIndex === i} onToggle={() => setOpenIndex((cur) => (cur === i ? -1 : i))} />
        ))}
      </div>
    </SectionCard>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-3">
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-6 text-center sm:p-8">
        <div className="relative mx-auto max-w-md">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
            <Mail className="h-5 w-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Get Deals in Your Inbox</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-white/60">Early access to new drops and member-only pricing.</p>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex items-center justify-center gap-2 rounded-sm bg-white/10 px-5 py-3 text-sm font-medium text-white"
              >
                <Check className="h-4 w-4 text-emerald-400" /> You&apos;re on the list.
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-sm border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900"
                >
                  Subscribe <Send className="h-3.5 w-3.5" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Simple text/image banner rendered from a CMS section's `config` — no fixed component of its own. */
function AnnouncementBanner({ section }) {
  const { text, link, linkLabel } = section.config || {};
  if (!text) return null;
  return (
    <div className="bg-neutral-900 py-2 text-center text-xs text-white dark:bg-neutral-100 dark:text-neutral-900 sm:text-sm">
      {section.title && <span className="font-medium">{section.title}: </span>}
      {text}
      {link && (
        <Link to={link} className="ml-2 font-medium underline underline-offset-2">
          {linkLabel || "Learn more"}
        </Link>
      )}
    </div>
  );
}

function AdBanner({ section }) {
  const { imageUrl, link } = section.config || {};
  if (!imageUrl) return null;
  const content = <img src={imageUrl} alt={section.title || "Promotion"} className="w-full rounded-md object-cover" />;
  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-3">
      {link ? <Link to={link}>{content}</Link> : content}
    </div>
  );
}

// Sections whose visibility/order the admin controls from Settings > Homepage CMS. Sections not
// in this map (banner, trust strip, stats, FAQ, newsletter, etc.) are permanent site chrome, not
// merchandising blocks, so they always render in their fixed slot regardless of CMS configuration.
const CMS_SECTION_COMPONENTS = {
  categories: CategoriesSection,
  featured_products: FeaturedProductsSection,
  trending_products: TrendingSection,
  flash_sale: FlashSaleSection,
  best_sellers: BestSellersSection,
  collections: CollectionsSection,
  brands: BrandsSection,
  testimonials: TestimonialsSection,
  announcement: AnnouncementBanner,
  ad_banner: AdBanner,
};

const DEFAULT_CMS_SECTION_ORDER = [
  "categories",
  "flash_sale",
  "featured_products",
  "ad_banner",
  "trending_products",
  "best_sellers",
  "collections",
  "brands",
  "testimonials",
];

/** When embedded as `/?cms_preview=1` inside the admin's Homepage CMS editor (see
 * AdminDashboard.jsx's HomepageCmsSection), this listens for the parent window's
 * postMessage carrying the in-progress draft section list and renders that instead of
 * the saved DB data — so an admin sees edits reflected on the real page instantly,
 * without saving and reopening the live site. No-ops entirely outside preview mode. */
function useCmsPreviewSections() {
  const [draftSections, setDraftSections] = useState(null);
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cms_preview") === "1";

  useEffect(() => {
    if (!isPreview) return;
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "veluntra-cms-preview") return;
      setDraftSections(event.data.sections);
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "veluntra-cms-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [isPreview]);

  return draftSections;
}

/** In CMS preview mode only: returns { isPreview, requestEdit } so a component can both
 * conditionally render an edit affordance and, on click, ask the parent admin window to jump
 * straight to that specific item's edit screen (e.g. clicking a category tile in the live
 * preview opens that exact category's editor in Admin > Categories). requestEdit no-ops
 * outside preview mode, so it's always safe to call on the real, customer-facing site. */
function useCmsEditClick() {
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cms_preview") === "1";
  const requestEdit = (entityType, entityId) => {
    if (!isPreview) return;
    window.parent?.postMessage({ type: "veluntra-cms-edit-request", entityType, entityId }, window.location.origin);
  };
  return { isPreview, requestEdit };
}

/** Hover-to-reveal "Edit" pencil overlay — only ever rendered by a caller that already
 * checked `isPreview`, so this has no visibility logic of its own beyond opacity-on-hover. */
function CmsEditOverlay({ onEdit }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit();
      }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
      aria-label="Edit this item"
    >
      <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900">
        <Pencil className="size-3.5" /> Edit
      </span>
    </button>
  );
}

function Home() {
  useDocumentTitle();
  const isCmsPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("cms_preview") === "1";
  const previewSections = useCmsPreviewSections();
  const { data: fetchedSections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: homepageApi.listPublic,
    staleTime: 5 * 60 * 1000,
    enabled: !isCmsPreview,
  });
  const cmsSections = isCmsPreview ? previewSections : fetchedSections;

  // Fall back to the default section order once we know the CMS genuinely has nothing
  // configured (or is unreachable) — NOT while the request is simply still in flight. Falling
  // back during loading used to render the default section list (with synthetic ids like
  // "featured_products") immediately, each firing its own product query, and then swap to the
  // real CMS sections (with real uuids) the moment they arrived — a different `key` per section
  // meant React remounted every one of them, doubling every product fetch and briefly
  // flashing whatever order the default list happens to use before settling on the real one.
  const merchandisingSections =
    cmsSections && cmsSections.length > 0
      ? cmsSections.filter((s) => CMS_SECTION_COMPONENTS[s.type])
      : !isCmsPreview && sectionsLoading
      ? []
      : DEFAULT_CMS_SECTION_ORDER.map((type) => ({ id: type, type, config: null, title: null }));
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="pt-2 sm:pt-3">
        <CategoriesSection />
      </div>
      <div className="space-y-2 py-2 sm:space-y-3 sm:py-3">
        <PromoTilesRow />
        <WideBannerSection />
        {merchandisingSections
          .filter((s) => s.type !== "categories")
          .map((section) => {
            const SectionComponent = CMS_SECTION_COMPONENTS[section.type];
            return <SectionComponent key={section.id} section={section} />;
          })}
        <StatsSection />
        <FAQSection />
        <NewsletterSection />
      </div>
    </div>
  );
}

export default Home;
