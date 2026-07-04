import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  ShoppingBag,
  Heart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Flame,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Quote,
  Mail,
  Send,
  Plus,
  Eye,
  Check,
  Award,
  Users,
  Package,
  Globe2,
  Play,
  Diamond,
  Camera,
  AtSign,
  Watch,
  Sofa,
  Sparkles,
  Baby,
  ThumbsUp,
  Coffee,
  Lamp,
  Smartphone,
  Laptop,
  Speaker,
} from "lucide-react";
import {
  HeadphonesIllustration,
  SmartwatchIllustration,
  PhoneIllustration,
  SpeakerIllustration,
} from "../../components/illustrations/DeviceIllustrations";
import { categoriesApi, brandsApi, statsApi, promotionsApi } from "../../api/catalog";
import { productsApi, reviewsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { LoadingSpinner, EmptyState } from "../../components/ui/Feedback";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const TILE_GRADIENTS = [
  "from-neutral-700 to-neutral-950",
  "from-amber-600 to-neutral-900",
  "from-rose-600 to-neutral-900",
  "from-indigo-600 to-neutral-900",
  "from-emerald-600 to-neutral-900",
  "from-sky-600 to-neutral-900",
  "from-fuchsia-600 to-neutral-900",
  "from-teal-600 to-neutral-900",
];

function gradientFor(id) {
  const hash = String(id)
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return TILE_GRADIENTS[hash % TILE_GRADIENTS.length];
}

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
  { icon: Truck, title: "Free Worldwide Shipping", desc: "Complimentary delivery on all orders over £150, everywhere we ship." },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Bank-grade encryption keeps every transaction fully protected." },
  { icon: RotateCcw, title: "Easy 30-Day Returns", desc: "Changed your mind? Send it back, no questions asked." },
  { icon: Headphones, title: "24/7 Support Team", desc: "Our support team is on hand around the clock." },
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

function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className={`mx-auto mb-14 max-w-2xl ${align === "center" ? "text-center" : "text-left"}`}
    >
      <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {eyebrow}
      </span>
      <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400 md:text-lg">{subtitle}</p>}
    </motion.div>
  );
}

function SectionStatus({ isLoading, isError, isEmpty, onRetry, emptyLabel = "Nothing to show here yet." }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
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
    return <EmptyState title={emptyLabel} className="py-16" />;
  }
  return null;
}

function toCardProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category?.name,
    icon: iconFor(product.category?.name),
    gradient: gradientFor(product.id),
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    rating: product.ratingAvg,
    reviews: product.ratingCount,
    badge: product.isNew ? "New" : product.oldPrice ? "Sale" : undefined,
  };
}

function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem, isMutating } = useCart();

  return (
    <motion.div
      variants={fadeUp}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/10 dark:border-white/10 dark:bg-neutral-900"
    >
      <Link to={`/product/${product.id}`} className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${product.gradient} block`}>
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-900 backdrop-blur">
            {product.badge}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-90 transition-transform duration-500 group-hover:scale-110">
          <product.icon className="h-16 w-16 text-white/40" strokeWidth={1} />
        </div>
        <div className="absolute inset-0 flex translate-y-full items-center justify-center gap-2 bg-black/40 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              setWishlisted((w) => !w);
            }}
            aria-label="Add to wishlist"
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              wishlisted ? "bg-rose-500 text-white" : "bg-white text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <Heart className="h-4 w-4" fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button aria-label="Quick view" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 hover:bg-neutral-100">
            <Eye className="h-4 w-4" />
          </button>
          <button
            disabled={isMutating}
            onClick={(e) => {
              e.preventDefault();
              addItem({ productId: product.id, quantity: 1 });
            }}
            className="flex h-10 items-center gap-1.5 rounded-full bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {product.category}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1">
          <StarRating rating={product.rating} />
          <span className="text-xs text-neutral-400">({product.reviews})</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-bold text-neutral-900 dark:text-white">£{product.price}</span>
          {product.oldPrice && <span className="text-sm text-neutral-400 line-through">£{product.oldPrice}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function HeroVisual() {
  const tiles = [
    { Illustration: HeadphonesIllustration, gradient: "from-amber-400 to-orange-500", duration: 5, offset: -14 },
    { Illustration: SmartwatchIllustration, gradient: "from-indigo-500 to-neutral-900", duration: 4.5, offset: 14 },
    { Illustration: PhoneIllustration, gradient: "from-sky-500 to-neutral-900", duration: 5.5, offset: 10 },
    { Illustration: SpeakerIllustration, gradient: "from-emerald-500 to-neutral-900", duration: 4.8, offset: -10 },
  ];
  return (
    <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 shadow-2xl shadow-black/50 md:h-[560px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_60%)]" />
      <div className="grid grid-cols-2 gap-6 p-10 md:gap-8 md:p-14">
        {tiles.map(({ Illustration, gradient, duration, offset }, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, offset, 0] }}
            transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
            className={`flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${gradient} p-6 shadow-xl md:h-36 md:w-36 md:p-8`}
          >
            <Illustration className="h-full w-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 pt-8">
      <FloatingBlob className="left-[-10%] top-[-10%] h-[420px] w-[420px] bg-amber-500/20" />
      <FloatingBlob className="bottom-[-15%] right-[-10%] h-[500px] w-[500px] bg-indigo-500/10" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> New Arrivals Are Live
          </span>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Upgrade Your
            <span className="block bg-gradient-to-r from-amber-300 via-amber-100 to-white bg-clip-text text-transparent">
              Everyday Tech
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base text-white/60 md:text-lg">
            Discover a curated range of premium electronics and everyday essentials — engineered for those who refuse to
            compromise.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.03]"
            >
              Shop Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Play className="h-3.5 w-3.5" /> Explore Collections
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-8 border-t border-white/10 pt-8">
            <div className="flex items-center gap-2 text-white/70">
              <ShieldCheck className="h-4 w-4 text-amber-400" /> <span className="text-xs">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Truck className="h-4 w-4 text-amber-400" /> <span className="text-xs">Free Global Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <RotateCcw className="h-4 w-4 text-amber-400" /> <span className="text-xs">30-Day Returns</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Award className="h-4 w-4 text-amber-400" /> <span className="text-xs">1-Year Warranty</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative"
        >
          <HeroVisual />
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/40 md:flex"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ArrowDown className="h-4 w-4" />
      </motion.div>
    </section>
  );
}

function WhyVenturaSection() {
  return (
    <section className="border-b border-black/5 bg-white py-16 dark:border-white/10 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={fadeUp} className="flex flex-col items-start gap-4 sm:items-center sm:text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-400/10">
                <feature.icon className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 sm:mx-auto sm:max-w-[220px]">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  return (
    <section className="bg-white py-20 dark:bg-neutral-950 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Find What You Need"
          subtitle="Explore our thoughtfully curated categories, each crafted with the same obsession for quality and design."
        />
        <SectionStatus isLoading={isLoading} isError={isError} isEmpty={categories.length === 0} onRetry={refetch} />
        {!isLoading && !isError && categories.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
          >
            {categories.slice(0, 8).map((cat) => {
              const Icon = iconFor(cat.name);
              return (
                <motion.div key={cat.id} variants={fadeUp} whileHover={{ y: -6 }}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-black/5 bg-neutral-50 p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5 dark:border-white/10 dark:bg-neutral-900"
                  >
                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientFor(cat.id)}`}>
                      <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{cat.name}</h3>
                    <p className="mt-1 text-xs text-neutral-400">{cat.productCount}+ items</p>
                    <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-600" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
        <div className="mt-10 flex justify-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
          >
            Browse All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedProductsSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "home-featured"],
    queryFn: () => productsApi.list({ sort: "rating", limit: 8 }),
  });
  const products = (data?.items || []).map(toCardProduct);

  return (
    <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Featured
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-5xl">Handpicked For You</h2>
          </div>
          <Link to="/shop" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
            View All Products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <SectionStatus isLoading={isLoading} isError={isError} isEmpty={products.length === 0} onRetry={refetch} emptyLabel="No featured products yet." />
        {!isLoading && !isError && products.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function TrendingSection() {
  const scrollRef = useRef(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "home-trending"],
    queryFn: () => productsApi.list({ sort: "newest", limit: 8 }),
  });
  const products = (data?.items || []).map(toCardProduct);

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction * 320, behavior: "smooth" });
  };

  return (
    <section className="bg-white py-20 dark:bg-neutral-950 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-3.5 w-3.5" /> New Arrivals
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-5xl">
              Just Landed
            </h2>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => scrollByAmount(-1)}
              aria-label="Scroll left"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-neutral-600 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-neutral-300 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollByAmount(1)}
              aria-label="Scroll right"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-neutral-600 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-neutral-300 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <SectionStatus isLoading={isLoading} isError={isError} isEmpty={products.length === 0} onRetry={refetch} emptyLabel="No new arrivals yet." />
        {!isLoading && !isError && products.length > 0 && (
          <motion.div
            ref={scrollRef}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div key={product.id} className="w-[240px] shrink-0 sm:w-[260px]">
                <ProductCard product={product} />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
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
    queryFn: () => productsApi.list({ ...scopeParams, limit: 6 }),
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
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-950 via-neutral-950 to-neutral-900 py-20 md:py-28">
      <FloatingBlob className="left-[-5%] top-[10%] h-72 w-72 bg-rose-500/20" />
      <FloatingBlob className="bottom-[-10%] right-[5%] h-96 w-96 bg-amber-500/10" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
              <Flame className="h-3.5 w-3.5" /> Flash Sale
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{flashSale?.name || "Limited-Time Offer"}</h2>
            <p className="mt-3 text-white/50">{percentOff}% off — prices this good disappear fast.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
              <span className="text-2xl font-bold tabular-nums text-white md:text-3xl">{String(hrs).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/60">Hours</span>
            </div>
            <span className="text-2xl font-bold text-white/30">:</span>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
              <span className="text-2xl font-bold tabular-nums text-white md:text-3xl">{String(mins).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/60">Minutes</span>
            </div>
            <span className="text-2xl font-bold text-white/30">:</span>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
              <span className="text-2xl font-bold tabular-nums text-white md:text-3xl">{String(secs).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/60">Seconds</span>
            </div>
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
            className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-6"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10"
              >
                <Link to={`/product/${product.id}`}>
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white">
                    -{percentOff}%
                  </span>
                  <div className={`relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${product.gradient}`}>
                    <product.icon className="h-10 w-10 text-white/40 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
                  </div>
                  <h4 className="truncate text-sm font-semibold text-white">{product.name}</h4>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-sm font-bold text-white">£{product.price}</span>
                    <span className="text-xs text-white/40 line-through">£{product.oldPrice}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function BestSellersSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["products", "best-sellers"],
    queryFn: () => productsApi.list({ sort: "best-selling", limit: 8 }),
  });
  const products = (data?.items || []).map(toCardProduct);

  return (
    <section className="bg-white py-20 dark:bg-neutral-950 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Customer Favorites"
          title="Our Best Sellers"
          subtitle="The products our community can't stop buying — and re-buying."
        />
        <SectionStatus
          isLoading={isLoading}
          isError={isError}
          isEmpty={products.length === 0}
          onRetry={refetch}
          emptyLabel="No sales data yet — check back once orders start rolling in."
        />
        {!isLoading && !isError && products.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 gap-5 sm:grid-cols-4"
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900"
              >
                <Link to={`/product/${product.id}`}>
                  <span className="absolute left-3 top-3 z-10 text-4xl font-bold text-black/10 dark:text-white/10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${product.gradient}`}>
                    <product.icon className="h-14 w-14 text-white/40 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{product.name}</h4>
                    <div className="mt-1.5 flex items-center gap-1">
                      <StarRating rating={product.rating} size="h-3 w-3" />
                      <span className="text-[11px] text-neutral-400">{product.rating?.toFixed?.(1)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">£{product.price}</span>
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <ThumbsUp className="h-3 w-3" /> {product.reviews} reviews
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        <div className="mt-10 flex justify-center">
          <Link
            to="/shop?sort=best-selling"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
          >
            Shop All Best Sellers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
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
    <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Curated Collections"
          title="Collections Worth Exploring"
          subtitle="Each collection is thoughtfully curated to fit effortlessly into your daily routine."
        />
        <SectionStatus isLoading={isLoading} isError={isError} isEmpty={false} onRetry={refetch} />
        {!isLoading && !isError && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {featured.map((cat) => {
              const Icon = iconFor(cat.name);
              return (
                <motion.div
                  key={cat.id}
                  variants={fadeUp}
                  whileHover={{ scale: 1.01 }}
                  className={`group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${gradientFor(cat.id)} p-8`}
                >
                  <Icon className="absolute right-6 top-6 h-16 w-16 text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1} />
                  <span className="absolute left-8 top-8 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                    <Sparkles className="h-3 w-3" /> Featured
                  </span>
                  <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">{cat.productCount}+ Products</span>
                  <h3 className="text-2xl font-bold text-white md:text-3xl">{cat.name}</h3>
                  <Link to={`/shop?category=${cat.slug}`} className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white">
                    Discover Collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function BrandsSection() {
  const { data: brands = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.list,
  });

  return (
    <section className="border-y border-black/5 bg-white py-16 dark:border-white/10 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-600">
          Trusted by leading names in tech & lifestyle
        </p>
        <SectionStatus isLoading={isLoading} isError={isError} isEmpty={brands.length === 0} onRetry={refetch} />
        {!isLoading && !isError && brands.length > 0 && (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
            {brands.slice(0, 10).map((brand) => (
              <div
                key={brand.id}
                className="flex items-center justify-center opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              >
                <span className="text-lg font-bold tracking-widest text-neutral-900 dark:text-white">{brand.name.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Interested in partnering with Ventura?</p>
          <Link to="/signup" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-white">
            Get in touch <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatItem({ icon: Icon, value, decimals = 0, suffix = "", label }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  const startCounting = () => {
    if (started.current) return;
    started.current = true;
    const duration = 1600;
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
      className="flex flex-col items-center gap-3 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
        <Icon className="h-6 w-6 text-amber-400" strokeWidth={1.75} />
      </div>
      <span className="text-3xl font-bold tabular-nums text-white md:text-4xl">
        {decimals ? display.toFixed(decimals) : formatCompact(display)}
        {suffix}
      </span>
      <span className="text-sm text-white/60">{label}</span>
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
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-black py-20 md:py-28">
      <FloatingBlob className="left-[10%] top-[-10%] h-72 w-72 bg-amber-500/10" />
      <FloatingBlob className="bottom-[-10%] right-[10%] h-96 w-96 bg-indigo-500/10" />
      <div className="relative mx-auto max-w-7xl px-6">
        {isLoading || isError ? (
          <SectionStatus isLoading={isLoading} isError={isError} isEmpty={false} onRetry={refetch} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 gap-10 md:grid-cols-4"
          >
            {items.map((stat) => (
              <StatItem key={stat.label} {...stat} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
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
    <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved By Thousands"
          subtitle="Real words from real members of the Ventura community."
        />
        <SectionStatus isLoading={isLoading} isError={isError} isEmpty={false} onRetry={refetch} />
        {!isLoading && !isError && testimonial && (
          <div className="relative rounded-3xl border border-black/5 bg-white p-10 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-neutral-900 md:p-14">
            <Quote className="mb-6 h-10 w-10 text-amber-400" />
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-xl font-medium leading-relaxed text-neutral-800 dark:text-neutral-100 md:text-2xl">
                  &quot;{testimonial.body}&quot;
                </p>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-sm font-bold text-white">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-xs text-neutral-400">On {testimonial.productName}</p>
                    </div>
                  </div>
                  <StarRating rating={testimonial.rating} size="h-4 w-4" />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
                aria-label="Previous testimonial"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-neutral-500 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? "w-6 bg-neutral-900 dark:bg-white" : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
                aria-label="Next testimonial"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-neutral-500 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const INSTAGRAM_TILES = Array.from({ length: 8 }).map((_, i) => ({
  id: `ig-${i}`,
  gradient: TILE_GRADIENTS[i % TILE_GRADIENTS.length],
}));

function InstagramSection() {
  return (
    <section className="bg-white py-20 dark:bg-neutral-950 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Follow the Journey"
          title="#PoweredByVentura"
          subtitle="Tag us in your setup for a chance to be featured."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {INSTAGRAM_TILES.map((tile) => (
            <motion.div
              key={tile.id}
              variants={fadeUp}
              className={`group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${tile.gradient}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-8 w-8 text-white/30" strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center gap-1 text-xs text-white/70">
                  <AtSign className="h-3 w-3" /> ventura.tech
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-10 flex justify-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
          >
            <AtSign className="h-4 w-4" /> Follow @ventura.tech
          </a>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-black/5 last:border-b-0 dark:border-white/10">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 py-5 text-left">
        <span className="text-base font-medium text-neutral-900 dark:text-white md:text-lg">{faq.question}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 transition-transform duration-300 dark:border-white/15 ${
            isOpen ? "rotate-45 border-transparent bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-500"
          }`}
        >
          <Plus className="h-4 w-4" />
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
            <p className="pb-5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 md:text-base">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          eyebrow="Need Help?"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know before you shop with us."
        />
        <div className="rounded-3xl border border-black/5 bg-white px-6 dark:border-white/10 dark:bg-neutral-900 md:px-10">
          {FAQS.map((faq, i) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((cur) => (cur === i ? -1 : i))}
            />
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-white px-6 py-5 text-center dark:border-white/10 dark:bg-neutral-900 sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Still have questions?</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Our support team is here to help, day or night.</p>
          </div>
          <Link
            to="/orders"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
          >
            Contact Support <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
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
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black py-20 md:py-28">
      <FloatingBlob className="left-1/4 top-[-20%] h-80 w-80 bg-amber-500/10" />
      <FloatingBlob className="bottom-[-20%] right-1/4 h-80 w-80 bg-indigo-500/10" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
          <Mail className="h-6 w-6 text-amber-400" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Join the Inner Circle</h2>
        <p className="mx-auto mt-4 max-w-md text-white/60">
          Subscribe for early access to new drops, member-only pricing and curated picks just for you.
        </p>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-sm font-medium text-white"
            >
              <Check className="h-4 w-4 text-emerald-400" /> You&apos;re on the list — welcome to Ventura.
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.03]"
              >
                Subscribe <Send className="h-3.5 w-3.5" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        <p className="mt-4 text-xs text-white/30">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

function CTASection() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: statsApi.getPublicStats });

  return (
    <section className="bg-white px-6 py-20 dark:bg-neutral-950 md:py-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500 via-amber-400 to-orange-400 px-8 py-16 text-center md:px-16 md:py-24">
        <FloatingBlob className="left-[-10%] top-[-20%] h-72 w-72 bg-white/20" />
        <FloatingBlob className="bottom-[-20%] right-[-5%] h-96 w-96 bg-black/10" />
        <Diamond className="relative mx-auto mb-6 h-10 w-10 text-white/80" />
        <h2 className="relative text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
          Ready to Upgrade Your Everyday?
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-neutral-800/80 md:text-lg">
          Join a growing community who trust Ventura for premium quality, smart design and effortless shopping.
        </p>
        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full border-2 border-neutral-900/20 px-8 py-4 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-900/10"
          >
            Create Account
          </Link>
        </div>
        {stats && (
          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-neutral-900/10 pt-8">
            <span className="text-sm font-semibold text-neutral-900">{stats.happyCustomers}+ members</span>
            <div className="flex items-center gap-2">
              <StarRating rating={stats.averageRating} size="h-4 w-4" />
              <span className="text-sm font-semibold text-neutral-900">{stats.averageRating}/5 average rating</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Home() {
  return (
    <div className="bg-white dark:bg-neutral-950">
      <HeroSection />
      <WhyVenturaSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <TrendingSection />
      <FlashSaleSection />
      <BestSellersSection />
      <CollectionsSection />
      <BrandsSection />
      <StatsSection />
      <TestimonialsSection />
      <InstagramSection />
      <FAQSection />
      <NewsletterSection />
      <CTASection />
      <div className="h-10 md:h-16" />
    </div>
  );
}

export default Home;
