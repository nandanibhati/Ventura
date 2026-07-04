import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ZoomIn,
  Share2,
  Copy,
  Mail,
  Heart,
  Star,
  ChevronRight,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ShoppingBag,
  ThumbsUp,
  BadgeCheck,
  Ruler,
  MessageSquare,
  FileText,
  Package,
  Sparkles,
  Watch,
  Laptop,
  Keyboard,
  Lamp,
  Speaker,
  Headphones,
} from "lucide-react";

const PRODUCT = {
  name: "Nova Titanium Smartwatch",
  category: "Wearables / Smartwatches",
  sku: "VNT-NTS-3312",
  price: 890,
  oldPrice: 1050,
  rating: 5.0,
  reviewCount: 98,
  icon: Watch,
  gallery: [
    { gradient: "from-slate-600 to-neutral-900" },
    { gradient: "from-neutral-700 to-neutral-950" },
    { gradient: "from-amber-700 to-neutral-900" },
    { gradient: "from-slate-800 to-neutral-950" },
  ],
  colors: [
    { name: "Titanium", swatch: "bg-slate-500" },
    { name: "Midnight Black", swatch: "bg-neutral-900" },
    { name: "Silver", swatch: "bg-neutral-300" },
    { name: "Rose Gold", swatch: "bg-rose-300" },
  ],
  sizes: [
    { label: "40mm", inStock: true },
    { label: "42mm", inStock: true },
    { label: "44mm", inStock: true },
    { label: "46mm", inStock: false },
  ],
  highlights: [
    "Grade 5 titanium unibody case, ultra-lightweight",
    "Up to 7-day battery life on a single charge",
    "Always-on AMOLED display, 2000 nits peak brightness",
    "Water resistant to 50m (5 ATM)",
  ],
  description:
    "The Nova Titanium Smartwatch pairs an aerospace-grade titanium case with a always-on AMOLED display built to keep up with every part of your day. A week-long battery, precise health tracking and seamless phone integration mean fewer charges and less friction — designed to be worn for years, not just a season.",
  specifications: [
    { label: "Material", value: "Grade 5 Titanium" },
    { label: "Display", value: "1.9\" AMOLED, always-on" },
    { label: "Battery", value: "Up to 7 days" },
    { label: "Water Resistance", value: "5 ATM (50m)" },
    { label: "Connectivity", value: "Bluetooth 5.3, Wi-Fi" },
    { label: "Weight", value: "38g" },
  ],
};

const RATING_BREAKDOWN = [
  { stars: 5, percent: 72 },
  { stars: 4, percent: 18 },
  { stars: 3, percent: 6 },
  { stars: 2, percent: 3 },
  { stars: 1, percent: 1 },
];

const REVIEWS = [
  {
    id: "rv1",
    name: "Isabelle Moreau",
    initials: "IM",
    rating: 5,
    verified: true,
    date: "March 2, 2026",
    title: "Exceeds every expectation",
    body: "The display quality and battery life are unlike anything else I own. It looks stunning but performs even better in daily use — worth every penny.",
    helpful: 42,
  },
  {
    id: "rv2",
    name: "Grace Whitfield",
    initials: "GW",
    rating: 5,
    verified: true,
    date: "February 18, 2026",
    title: "My new everyday essential",
    body: "Battery easily lasts a full week. I went up a size for a slightly looser fit and it's perfect for sleep tracking too.",
    helpful: 27,
  },
  {
    id: "rv3",
    name: "Naomi Chen",
    initials: "NC",
    rating: 4,
    verified: true,
    date: "January 29, 2026",
    title: "Great watch, screen needs care",
    body: "Beautiful watch, just be mindful with the display. I'd recommend a screen protector to keep it looking new.",
    helpful: 15,
  },
  {
    id: "rv4",
    name: "Priya Anand",
    initials: "PA",
    rating: 5,
    verified: false,
    date: "January 12, 2026",
    title: "Worth the investment",
    body: "Compared this to two other premium smartwatches before buying and the build quality here is noticeably better.",
    helpful: 9,
  },
];

const RELATED_PRODUCTS = [
  { id: "rp1", name: "Onyx 14\" Ultrabook", category: "Computing", price: 1340, rating: 4.7, icon: Laptop, gradient: "from-neutral-700 to-neutral-950" },
  { id: "rp2", name: "Meridian Mechanical Keyboard", category: "Computing", price: 145, rating: 4.8, icon: Keyboard, gradient: "from-amber-700 to-neutral-900" },
  { id: "rp3", name: "Lumen Smart Desk Lamp", category: "Smart Home", price: 65, rating: 4.6, icon: Lamp, gradient: "from-fuchsia-600 to-neutral-900" },
  { id: "rp4", name: "Zenith Noise-Cancel Headphones", category: "Audio", price: 349, rating: 4.8, icon: Headphones, gradient: "from-indigo-700 to-neutral-900" },
  { id: "rp5", name: "Halo Portable Bluetooth Speaker", category: "Audio", price: 96, rating: 4.7, icon: Speaker, gradient: "from-teal-700 to-neutral-900" },
];

const TABS = [
  { id: "description", label: "Description", icon: FileText },
  { id: "specifications", label: "Specifications", icon: Package },
  { id: "shipping", label: "Shipping & Returns", icon: Truck },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
];

function RatingStars({ rating, size = "h-3.5 w-3.5" }) {
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

function ZoomGallery({ images, icon: Icon, activeIndex, onSelect }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div>
      <div
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-black/5 dark:border-white/10"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${images[activeIndex].gradient}`}
            style={{ transform: isZoomed ? "scale(1.7)" : "scale(1)", transformOrigin: origin, transition: "transform 0.2s ease-out" }}
          >
            <Icon className="h-28 w-28 text-white/30 md:h-36 md:w-36" strokeWidth={0.75} />
          </motion.div>
        </AnimatePresence>
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/40 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur">
          <ZoomIn className="h-3 w-3" /> Hover to zoom
        </span>
      </div>
      <div className="mt-4 flex gap-3">
        {images.map((image, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br transition-all ${
              image.gradient
            } ${i === activeIndex ? "ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-950" : "opacity-60 hover:opacity-100"}`}
          >
            <Icon className="h-7 w-7 text-white/40" strokeWidth={1} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorSelector({ colors, selected, onSelect }) {
  return (
    <div>
      <p className="mb-2.5 text-sm font-medium text-neutral-900 dark:text-white">
        Color — <span className="font-normal text-neutral-500 dark:text-neutral-400">{colors[selected].name}</span>
      </p>
      <div className="flex items-center gap-2.5">
        {colors.map((color, i) => (
          <button
            key={color.name}
            onClick={() => onSelect(i)}
            aria-label={color.name}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${color.swatch} ${
              i === selected ? "border-neutral-900 dark:border-white" : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SizeSelector({ sizes, selected, onSelect }) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">Size</p>
        <button className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
          <Ruler className="h-3.5 w-3.5" /> Size Guide
        </button>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {sizes.map((size) => (
          <button
            key={size.label}
            disabled={!size.inStock}
            onClick={() => onSelect(size.label)}
            className={`flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors ${
              !size.inStock
                ? "cursor-not-allowed border-black/5 text-neutral-300 line-through dark:border-white/10 dark:text-neutral-700"
                : selected === size.label
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-black/10 text-neutral-700 hover:border-neutral-400 dark:border-white/15 dark:text-neutral-200 dark:hover:border-white/40"
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuantityStepper({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center gap-4 rounded-full border border-black/10 px-2 py-1.5 dark:border-white/15">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-black/5 disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-white/10"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-4 text-center text-sm font-semibold text-neutral-900 dark:text-white">{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={quantity >= 9}
        aria-label="Increase quantity"
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-black/5 disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-white/10"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function ShareMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Share product"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-neutral-600 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-neutral-300 dark:hover:bg-white/10"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-10 mt-2 w-52 rounded-2xl border border-black/5 bg-white p-1.5 shadow-xl shadow-black/10 dark:border-white/10 dark:bg-neutral-900"
          >
            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Link copied!" : "Copy link"}
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent(PRODUCT.name)}&body=${encodeURIComponent(window.location.href)}`}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
            >
              <Mail className="h-4 w-4" /> Share via email
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RatingBreakdown({ rating, reviewCount, breakdown }) {
  return (
    <div className="grid gap-8 sm:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center justify-center gap-2 sm:items-start">
        <span className="text-5xl font-bold text-neutral-900 dark:text-white">{rating}</span>
        <RatingStars rating={rating} size="h-4 w-4" />
        <p className="text-xs text-neutral-400">Based on {reviewCount} reviews</p>
      </div>
      <div className="space-y-2">
        {breakdown.map((row) => (
          <div key={row.stars} className="flex items-center gap-3 text-xs">
            <span className="w-10 shrink-0 text-neutral-500 dark:text-neutral-400">{row.stars} star</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${row.percent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full bg-amber-400"
              />
            </div>
            <span className="w-9 shrink-0 text-right text-neutral-400">{row.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review, helpfulCount, onMarkHelpful }) {
  return (
    <div className="border-b border-black/5 py-6 last:border-b-0 dark:border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-xs font-bold text-white">
            {review.initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{review.name}</p>
              {review.verified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
            <p className="text-xs text-neutral-400">{review.date}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} />
      </div>
      <h4 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-white">{review.title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{review.body}</p>
      <button
        onClick={() => onMarkHelpful(review.id)}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
      >
        <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({helpfulCount})
      </button>
    </div>
  );
}

function RelatedProductCard({ product }) {
  return (
    <div className="w-[190px] shrink-0 rounded-2xl border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-neutral-900 sm:w-[220px]">
      <div
        className={`relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${product.gradient}`}
      >
        <product.icon className="h-10 w-10 text-white/40" strokeWidth={1} />
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {product.category}
      </span>
      <h4 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{product.name}</h4>
      <div className="mt-1 flex items-center gap-1">
        <RatingStars rating={product.rating} size="h-3 w-3" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-neutral-900 dark:text-white">£{product.price}</span>
        <button
          aria-label={`Add ${product.name} to cart`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white transition-transform hover:scale-110 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ProductDetails() {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [helpfulCounts, setHelpfulCounts] = useState(() =>
    Object.fromEntries(REVIEWS.map((review) => [review.id, review.helpful]))
  );

  const buyBoxRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const node = buyBoxRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const markHelpful = (id) => setHelpfulCounts((counts) => ({ ...counts, [id]: counts[id] + 1 }));

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white pb-24 dark:bg-neutral-950 lg:pb-0">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <div className="mb-8 flex items-center gap-1.5 text-xs text-neutral-400">
          <Link to="/" className="hover:text-neutral-900 dark:hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{PRODUCT.category.split(" / ")[0]}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-600 dark:text-neutral-300">{PRODUCT.name}</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <ZoomGallery images={PRODUCT.gallery} icon={PRODUCT.icon} activeIndex={activeImage} onSelect={setActiveImage} />

          <div ref={buyBoxRef} className="lg:sticky lg:top-24 lg:self-start">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {PRODUCT.category}
            </span>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-3xl">
              {PRODUCT.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={PRODUCT.rating} />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {PRODUCT.rating} ({PRODUCT.reviewCount} reviews)
              </span>
              <span className="text-xs text-neutral-300 dark:text-neutral-700">SKU {PRODUCT.sku}</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">£{PRODUCT.price}</span>
              {PRODUCT.oldPrice && <span className="text-lg text-neutral-400 line-through">£{PRODUCT.oldPrice}</span>}
              {PRODUCT.oldPrice && (
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  Save £{(PRODUCT.oldPrice - PRODUCT.price).toFixed(0)}
                </span>
              )}
            </div>

            <ul className="mt-5 space-y-1.5">
              {PRODUCT.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" /> {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-7 space-y-6 border-t border-black/5 pt-6 dark:border-white/10">
              <ColorSelector colors={PRODUCT.colors} selected={selectedColor} onSelect={setSelectedColor} />
              <SizeSelector sizes={PRODUCT.sizes} selected={selectedSize} onSelect={setSelectedSize} />
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <QuantityStepper quantity={quantity} onIncrease={() => setQuantity((q) => Math.min(9, q + 1))} onDecrease={() => setQuantity((q) => Math.max(1, q - 1))} />

              <button
                onClick={handleAddToCart}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.02] dark:bg-white dark:text-neutral-900"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {addedToCart ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" /> Added to Cart
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" /> Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={() => setIsWishlisted((w) => !w)}
                aria-label="Add to wishlist"
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isWishlisted
                    ? "border-rose-500 bg-rose-50 text-rose-500 dark:bg-rose-500/10"
                    : "border-black/10 text-neutral-600 hover:bg-black/5 dark:border-white/15 dark:text-neutral-300 dark:hover:bg-white/10"
                }`}
              >
                <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
              </button>

              <ShareMenu />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-black/5 pt-6 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <Truck className="h-4 w-4 shrink-0 text-amber-500" /> Free shipping over £150
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <RotateCcw className="h-4 w-4 shrink-0 text-amber-500" /> 30-day free returns
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500" /> Secure checkout
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <BadgeCheck className="h-4 w-4 shrink-0 text-amber-500" /> Authenticity guaranteed
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <div className="flex gap-2 overflow-x-auto border-b border-black/5 dark:border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "reviews" && <span className="text-xs text-neutral-400">({PRODUCT.reviewCount})</span>}
                {activeTab === tab.id && (
                  <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-neutral-900 dark:bg-white" />
                )}
              </button>
            ))}
          </div>

          <div className="py-10">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-3xl"
                >
                  <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-300">{PRODUCT.description}</p>
                </motion.div>
              )}

              {activeTab === "specifications" && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="grid max-w-3xl gap-x-10 gap-y-4 sm:grid-cols-2"
                >
                  {PRODUCT.specifications.map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/10">
                      <span className="text-sm text-neutral-400">{spec.label}</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{spec.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-3xl space-y-5"
                >
                  <div className="flex gap-4 rounded-2xl border border-black/5 p-5 dark:border-white/10">
                    <Truck className="h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">Complimentary Standard Shipping</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Free on all orders over £150. Delivered within 5-7 business days. Express and overnight options available at
                        checkout.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-2xl border border-black/5 p-5 dark:border-white/10">
                    <RotateCcw className="h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">30-Day Returns</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Not the right fit? Return unused items in original packaging within 30 days for a full refund.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-2xl border border-black/5 p-5 dark:border-white/10">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">Secure Packaging</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Every order ships in protective, gift-ready packaging with a handwritten note on request.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-3xl"
                >
                  <RatingBreakdown rating={PRODUCT.rating} reviewCount={PRODUCT.reviewCount} breakdown={RATING_BREAKDOWN} />
                  <div className="mt-8 border-t border-black/5 dark:border-white/10">
                    {REVIEWS.map((review) => (
                      <ReviewCard key={review.id} review={review} helpfulCount={helpfulCounts[review.id]} onMarkHelpful={markHelpful} />
                    ))}
                  </div>
                  <button className="mt-2 inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10">
                    Write a Review
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 md:mt-8">
          <h2 className="mb-8 text-xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-2xl">You May Also Like</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {RELATED_PRODUCTS.map((product) => (
              <RelatedProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/90 lg:hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{PRODUCT.name}</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">£{PRODUCT.price}</p>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductDetails;
