import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
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
  Diamond,
  Camera,
  AtSign,
  Watch,
  Sofa,
  Sparkles,
  Baby,
  Lamp,
  Smartphone,
  Laptop,
} from "lucide-react";
import { categoriesApi, brandsApi, statsApi, promotionsApi, homepageApi } from "../../api/catalog";
import { productsApi, reviewsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { LoadingSpinner, EmptyState } from "../../components/ui/Feedback";
import { gradientClassFor } from "../../lib/gradientFor";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import { resolveMediaUrl } from "../../lib/api";
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

const FEATURES = [
  { icon: Truck, title: "Free shipping over £150" },
  { icon: ShieldCheck, title: "Secure payments" },
  { icon: RotateCcw, title: "Easy 30-day returns" },
  { icon: Headphones, title: "24/7 support" },
];

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
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-neutral-900 dark:text-white sm:text-lg">
        {Icon && <Icon className="h-4 w-4 text-amber-500" />}
        {title}
      </h2>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
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
    image: resolveMediaUrl(product.images?.[0]?.url) || null,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    animationOverride: product.animationOverride,
  };
}

/** Thin adapter so every Home.jsx grid can keep calling `<HomeProductCard product={product} />`
 * while wiring the shared component's onAdd through this page's cart context. */
function HomeProductCard({ product, index, compact }) {
  const { addItem, isMutating } = useCart();
  return (
    <ProductCard
      product={product}
      index={index}
      compact={compact}
      onAdd={() => !isMutating && addItem({ productId: product.id, quantity: 1 })}
    />
  );
}

/** Dense marketplace product grid — the workhorse behind Featured/Trending/Best Sellers/Flash Sale. */
function ProductGridSection({ icon, title, viewAllLink, isLoading, isError, isEmpty, emptyLabel, onRetry, products }) {
  return (
    <SectionCard>
      <SectionHeaderRow icon={icon} title={title} viewAllLink={viewAllLink} />
      <SectionStatus isLoading={isLoading} isError={isError} isEmpty={isEmpty} onRetry={onRetry} emptyLabel={emptyLabel} />
      {!isLoading && !isError && products.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {products.map((product, i) => (
            <HomeProductCard key={product.id} product={product} index={i} compact />
          ))}
        </motion.div>
      )}
    </SectionCard>
  );
}

/**
 * Rotating full-width banner strip (Amazon/Flipkart-style "lightning deals" banner), not a
 * heavy editorial hero. The first slide is CMS-editable (Homepage CMS > hero_banner); the
 * rest are always-on fallback promo slides so the strip never looks empty.
 */
const FALLBACK_SLIDES = [
  { id: "s1", gradient: "from-amber-500 to-orange-600", title: "Big Electronics Sale", subtitle: "Up to 60% off Audio, Wearables & more", cta: "Shop deals", link: "/shop" },
  { id: "s2", gradient: "from-indigo-600 to-blue-700", title: "New Arrivals Just Landed", subtitle: "The latest tech, fresh in stock", cta: "Explore new", link: "/shop?sort=newest" },
  { id: "s3", gradient: "from-emerald-600 to-teal-700", title: "Top Rated Best Sellers", subtitle: "Loved by thousands of happy customers", cta: "View best sellers", link: "/shop?sort=best-selling" },
];

function BannerCarousel({ heroConfig }) {
  const slides = heroConfig?.headline || heroConfig?.backgroundImage || heroConfig?.backgroundVideo
    ? [
        {
          id: "cms-hero",
          image: heroConfig.backgroundImage,
          video: heroConfig.backgroundVideo,
          gradient: "from-neutral-800 to-neutral-950",
          title: heroConfig.headline || "Upgrade Your Everyday Tech",
          subtitle: heroConfig.subheadline,
          cta: heroConfig.ctaText || "Shop now",
          link: heroConfig.ctaLink || "/shop",
        },
        ...FALLBACK_SLIDES,
      ]
    : FALLBACK_SLIDES;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-3">
      <div className="relative h-[170px] overflow-hidden rounded-md sm:h-[240px] md:h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={cn("absolute inset-0 flex items-center bg-gradient-to-br", slide.gradient)}
          >
            {slide.video ? (
              <video src={slide.video} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
            ) : slide.image ? (
              <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            {(slide.image || slide.video) && <div className="absolute inset-0 bg-black/30" />}
            <div className="relative z-10 px-5 sm:px-10 md:px-14">
              <h2 className="max-w-md text-xl font-bold leading-tight text-white sm:text-2xl md:text-4xl">{slide.title}</h2>
              {slide.subtitle && <p className="mt-2 max-w-sm text-xs text-white/80 sm:text-sm md:text-base">{slide.subtitle}</p>}
              <Link
                to={slide.link}
                className="mt-4 inline-flex items-center gap-2 rounded-sm bg-white px-4 py-2 text-xs font-semibold text-neutral-900 sm:mt-5 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                {slide.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          aria-label="Previous banner"
          className="absolute left-2 top-1/2 z-20 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-neutral-900 hover:bg-white sm:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          aria-label="Next banner"
          className="absolute right-2 top-1/2 z-20 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-neutral-900 hover:bg-white sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-white" : "w-1.5 bg-white/50")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Row of small square promo tiles under the main banner (Argos/Flipkart-style ad strip) —
 * pulled from real categories so it's never fake/placeholder content. */
function PromoTilesRow() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const tiles = categories.slice(0, 3);
  if (tiles.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {tiles.map((cat) => {
          const Icon = iconFor(cat.name);
          return (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className={cn(
                "group relative flex h-24 items-center justify-between overflow-hidden rounded-md bg-gradient-to-br px-5 sm:h-28",
                gradientClassFor(cat.id)
              )}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">{cat.productCount}+ items</p>
                <h3 className="mt-0.5 text-base font-bold text-white sm:text-lg">{cat.name}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-white/80">
                  Shop now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
              <Icon className="h-12 w-12 shrink-0 text-white/15 sm:h-14 sm:w-14" strokeWidth={1} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function WhyVeluntraSection() {
  return (
    <SectionCard>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex items-center gap-2.5">
            <feature.icon className="h-4.5 w-4.5 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 sm:text-sm">{feature.title}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/** Circular icon strip, horizontally scrollable on mobile — the primary category nav. */
function CategoriesSection() {
  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  return (
    <SectionCard>
      <SectionStatus isLoading={isLoading} isError={isError} isEmpty={categories.length === 0} onRetry={refetch} />
      {!isLoading && !isError && categories.length > 0 && (
        <div className="flex items-start gap-5 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-8 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {categories.slice(0, 10).map((cat) => {
            const Icon = iconFor(cat.name);
            return (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group flex shrink-0 flex-col items-center gap-2 text-center">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br transition-transform group-hover:scale-105 sm:h-[72px] sm:w-[72px]",
                    gradientClassFor(cat.id)
                  )}
                >
                  <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={1.5} />
                </div>
                <span className="w-16 truncate text-[11px] font-medium text-neutral-700 dark:text-neutral-300 sm:w-20 sm:text-xs">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function FeaturedProductsSection() {
  // Admin-controlled: products flagged "Featured" (Admin/Seller product form) are
  // boosted to the front of the top-rated pool, so the section is never empty before
  // an admin has curated anything, but toggling Featured has an immediate, visible effect.
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "home-featured"],
    queryFn: () => productsApi.list({ sort: "rating", limit: 16 }),
  });
  const products = (data?.items || [])
    .slice()
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    .slice(0, 12)
    .map(toCardProduct);

  return (
    <ProductGridSection
      title="Handpicked For You"
      viewAllLink="/shop"
      isLoading={isLoading}
      isError={isError}
      isEmpty={products.length === 0}
      emptyLabel="No featured products yet."
      onRetry={refetch}
      products={products}
    />
  );
}

function TrendingSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "home-trending"],
    queryFn: () => productsApi.list({ sort: "newest", limit: 12 }),
  });
  const products = (data?.items || []).map(toCardProduct);

  return (
    <ProductGridSection
      icon={TrendingUp}
      title="New Arrivals"
      viewAllLink="/shop?sort=newest"
      isLoading={isLoading}
      isError={isError}
      isEmpty={products.length === 0}
      emptyLabel="No new arrivals yet."
      onRetry={refetch}
      products={products}
    />
  );
}

function FlashSaleSection() {
  const { data: promotions = [], isLoading: promosLoading } = useQuery({
    queryKey: ["promotions", "active"],
    queryFn: promotionsApi.listActive,
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
    queryKey: ["products", "flash-sale", flashSale?.id],
    queryFn: () => productsApi.list({ ...scopeParams, limit: 12 }),
    enabled: Boolean(flashSale),
  });

  const { hrs, mins, secs } = useCountdownTo(flashSale?.endsAt);
  const percentOff = Number(flashSale?.value || 0);
  const products = (data?.items || []).map((p) => {
    const card = toCardProduct(p);
    const discounted = Math.round(card.price * (1 - percentOff / 100) * 100) / 100;
    return { ...card, oldPrice: card.price, price: discounted };
  });

  if (!promosLoading && !flashSale) return null;

  return (
    <SectionCard>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-rose-600 dark:text-rose-400 sm:text-lg">
          <Flame className="h-4 w-4" /> {flashSale?.name || "Deals of the Day"}
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {products.map((product, i) => (
            <HomeProductCard key={product.id} product={product} index={i} compact />
          ))}
        </motion.div>
      )}
    </SectionCard>
  );
}

function BestSellersSection() {
  // Admin-controlled: products flagged "Best Seller" are boosted to the front of the
  // actual sales-order ranking — same never-empty-but-admin-influenced pattern as Featured.
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "best-sellers"],
    queryFn: () => productsApi.list({ sort: "best-selling", limit: 16 }),
  });
  const products = (data?.items || [])
    .slice()
    .sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0))
    .slice(0, 12)
    .map(toCardProduct);

  return (
    <ProductGridSection
      title="Best Sellers"
      viewAllLink="/shop?sort=best-selling"
      isLoading={isLoading}
      isError={isError}
      isEmpty={products.length === 0}
      emptyLabel="No sales data yet — check back once orders start rolling in."
      onRetry={refetch}
      products={products}
    />
  );
}

function CollectionsSection() {
  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });
  const featured = categories.filter((c) => c.featured);

  if (!isLoading && !isError && featured.length === 0) return null;

  return (
    <SectionCard>
      <SectionHeaderRow title="Collections Worth Exploring" />
      <SectionStatus isLoading={isLoading} isError={isError} isEmpty={false} onRetry={refetch} />
      {!isLoading && !isError && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-3 md:grid-cols-2"
        >
          {featured.map((cat) => {
            const Icon = iconFor(cat.name);
            return (
              <motion.div
                key={cat.id}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "group relative flex min-h-[140px] flex-col justify-end overflow-hidden rounded-md bg-gradient-to-br p-5",
                  gradientClassFor(cat.id)
                )}
              >
                <Icon className="absolute right-5 top-5 h-12 w-12 text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1} />
                <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">{cat.productCount}+ Products</span>
                <h3 className="text-lg font-bold text-white sm:text-xl">{cat.name}</h3>
                <Link to={`/shop?category=${cat.slug}`} className="mt-2 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-white">
                  Shop now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </SectionCard>
  );
}

function BrandsSection() {
  const { data: brands = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.list,
  });

  return (
    <SectionCard>
      <SectionHeaderRow title="Trusted Brands" />
      <SectionStatus isLoading={isLoading} isError={isError} isEmpty={brands.length === 0} onRetry={refetch} />
      {!isLoading && !isError && brands.length > 0 && (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-6">
          {brands.slice(0, 12).map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-center rounded-sm border border-black/5 py-3 opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:border-white/10"
            >
              <span className="text-xs font-bold tracking-wide text-neutral-900 dark:text-white sm:text-sm">{brand.name.toUpperCase()}</span>
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

function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const { data: testimonials = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["reviews", "featured"],
    queryFn: () => reviewsApi.listFeatured(6),
  });

  useEffect(() => {
    if (testimonials.length === 0) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  if (!isLoading && !isError && testimonials.length === 0) return null;

  const testimonial = testimonials[index];

  return (
    <SectionCard>
      <SectionHeaderRow title="What Customers Say" />
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

const INSTAGRAM_TILES = Array.from({ length: 6 }).map((_, i) => ({
  id: `ig-${i}`,
  gradient: gradientClassFor(`ig-${i}`),
}));

function InstagramSection() {
  return (
    <SectionCard>
      <SectionHeaderRow title="#PoweredByVeluntra" />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {INSTAGRAM_TILES.map((tile) => (
          <div key={tile.id} className={cn("group relative aspect-square overflow-hidden rounded-sm bg-gradient-to-br", tile.gradient)}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-5 w-5 text-white/30" strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              <span className="flex items-center gap-1 text-[10px] text-white/70">
                <AtSign className="h-2.5 w-2.5" /> Veluntra
              </span>
            </div>
          </div>
        ))}
      </div>
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

function CTASection() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: statsApi.getPublicStats });

  return (
    <div className="mx-auto max-w-7xl px-2 pb-4 sm:px-3">
      <div className="relative overflow-hidden rounded-md bg-gradient-to-br from-amber-500 via-amber-400 to-orange-400 px-6 py-8 text-center sm:px-10 sm:py-10">
        <Diamond className="relative mx-auto mb-3 h-7 w-7 text-white/80" />
        <h2 className="relative text-xl font-bold text-neutral-900 sm:text-2xl">Ready to Upgrade Your Everyday?</h2>
        <p className="relative mx-auto mt-2 max-w-md text-sm text-neutral-800/80">
          Join a growing community who trust Veluntra for quality, value and effortless shopping.
        </p>
        <div className="relative mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-sm bg-neutral-900 px-6 py-3 text-sm font-semibold text-white">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-sm border-2 border-neutral-900/20 px-6 py-3 text-sm font-semibold text-neutral-900">
            Create Account
          </Link>
        </div>
        {stats && (
          <div className="relative mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-neutral-900/10 pt-5">
            <span className="text-xs font-semibold text-neutral-900 sm:text-sm">{stats.happyCustomers}+ members</span>
            <div className="flex items-center gap-1.5">
              <StarRating rating={stats.averageRating} size="h-3.5 w-3.5" />
              <span className="text-xs font-semibold text-neutral-900 sm:text-sm">{stats.averageRating}/5 average rating</span>
            </div>
          </div>
        )}
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
  "trending_products",
  "best_sellers",
  "collections",
  "brands",
  "testimonials",
];

function Home() {
  useDocumentTitle();
  const { data: cmsSections } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: homepageApi.listPublic,
    staleTime: 5 * 60 * 1000,
  });

  // Until the admin configures the Homepage CMS (or if it's unreachable), fall back to the
  // default section order so the storefront never renders an empty page.
  const merchandisingSections =
    cmsSections && cmsSections.length > 0
      ? cmsSections.filter((s) => CMS_SECTION_COMPONENTS[s.type])
      : DEFAULT_CMS_SECTION_ORDER.map((type) => ({ id: type, type, config: null, title: null }));
  const heroSection = cmsSections?.find((s) => s.type === "hero_banner");

  return (
    <div className="min-h-screen bg-[#f1f3f6] dark:bg-neutral-950">
      <div className="pt-2 sm:pt-3">
        <CategoriesSection />
      </div>
      <div className="mt-2 sm:mt-3">
        <BannerCarousel heroConfig={heroSection?.config} />
      </div>
      <div className="flex flex-col gap-2 py-2 sm:gap-3 sm:py-3">
        <PromoTilesRow />
        <WhyVeluntraSection />
        {merchandisingSections
          .filter((s) => s.type !== "categories")
          .map((section) => {
            const SectionComponent = CMS_SECTION_COMPONENTS[section.type];
            const needsSectionProp = section.type === "announcement" || section.type === "ad_banner";
            return needsSectionProp ? (
              <SectionComponent key={section.id} section={section} />
            ) : (
              <SectionComponent key={section.id} />
            );
          })}
        <StatsSection />
        <InstagramSection />
        <TestimonialsSection />
        <FAQSection />
        <NewsletterSection />
        <CTASection />
      </div>
    </div>
  );
}

export default Home;
