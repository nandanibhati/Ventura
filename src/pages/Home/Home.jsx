import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  Zap,
  Crown,
  Diamond,
  Camera,
  AtSign,
  Venus,
  Mars,
  Footprints,
  Watch,
  Sofa,
  Sparkles,
  Baby,
  Shirt,
  Gem,
  ThumbsUp,
  Glasses,
  Coffee,
  Lamp,
  Snowflake,
  CreditCard,
  Leaf,
} from "lucide-react";
import heroImage from "../../assets/hero.png";

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

const FEATURES = [
  { icon: Truck, title: "Free Worldwide Shipping", desc: "Complimentary delivery on all orders over $150, everywhere we ship." },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Bank-grade encryption keeps every transaction fully protected." },
  { icon: RotateCcw, title: "Easy 30-Day Returns", desc: "Changed your mind? Send it back, no questions asked." },
  { icon: Headphones, title: "24/7 Concierge Support", desc: "Our style concierge team is on hand around the clock." },
];

const CATEGORIES = [
  { id: 1, name: "Women", icon: Venus, count: "1,240+ styles", gradient: "from-rose-500 to-orange-400" },
  { id: 2, name: "Men", icon: Mars, count: "980+ styles", gradient: "from-blue-500 to-cyan-400" },
  { id: 3, name: "Footwear", icon: Footprints, count: "620+ styles", gradient: "from-amber-500 to-yellow-400" },
  { id: 4, name: "Accessories", icon: Watch, count: "410+ styles", gradient: "from-purple-500 to-indigo-400" },
  { id: 5, name: "Electronics", icon: Headphones, count: "310+ items", gradient: "from-slate-600 to-slate-400" },
  { id: 6, name: "Home & Living", icon: Sofa, count: "540+ items", gradient: "from-emerald-500 to-teal-400" },
  { id: 7, name: "Beauty", icon: Sparkles, count: "290+ items", gradient: "from-pink-500 to-fuchsia-400" },
  { id: 8, name: "Kids", icon: Baby, count: "180+ items", gradient: "from-sky-500 to-blue-400" },
];

const FEATURED_PRODUCTS = [
  { id: "f1", name: "Aurora Cashmere Coat", category: "Women", icon: Shirt, gradient: "from-rose-600 to-neutral-900", price: 428, oldPrice: 560, rating: 4.9, reviews: 214, badge: "Featured", colors: ["bg-neutral-900", "bg-rose-500", "bg-amber-200"] },
  { id: "f2", name: "Meridian Leather Loafers", category: "Footwear", icon: Footprints, gradient: "from-amber-700 to-neutral-900", price: 265, oldPrice: null, rating: 4.8, reviews: 156, badge: "Featured", colors: ["bg-amber-800", "bg-neutral-900"] },
  { id: "f3", name: "Nova Titanium Watch", category: "Accessories", icon: Watch, gradient: "from-slate-600 to-neutral-900", price: 890, oldPrice: 1050, rating: 5.0, reviews: 98, badge: "Featured", colors: ["bg-slate-500", "bg-neutral-900"] },
  { id: "f4", name: "Onyx Wool Blazer", category: "Men", icon: Shirt, gradient: "from-neutral-700 to-neutral-950", price: 340, oldPrice: null, rating: 4.7, reviews: 187, badge: "Featured", colors: ["bg-neutral-900", "bg-neutral-400"] },
  { id: "f5", name: "Lumen Silk Scarf", category: "Accessories", icon: Gem, gradient: "from-fuchsia-600 to-neutral-900", price: 135, oldPrice: 180, rating: 4.6, reviews: 76, badge: "Featured", colors: ["bg-fuchsia-500", "bg-rose-300", "bg-neutral-900"] },
  { id: "f6", name: "Terra Suede Handbag", category: "Women", icon: ShoppingBag, gradient: "from-orange-700 to-neutral-900", price: 510, oldPrice: null, rating: 4.9, reviews: 240, badge: "Featured", colors: ["bg-orange-700", "bg-neutral-900"] },
  { id: "f7", name: "Zenith Noise-Cancel Headphones", category: "Electronics", icon: Headphones, gradient: "from-indigo-700 to-neutral-900", price: 349, oldPrice: 420, rating: 4.8, reviews: 312, badge: "Featured", colors: ["bg-indigo-600", "bg-neutral-900", "bg-neutral-200"] },
  { id: "f8", name: "Solstice Merino Sweater", category: "Men", icon: Shirt, gradient: "from-teal-700 to-neutral-900", price: 195, oldPrice: null, rating: 4.7, reviews: 129, badge: "Featured", colors: ["bg-teal-600", "bg-neutral-900"] },
];

const TRENDING_PRODUCTS = [
  { id: "t1", name: "Drift Performance Sneaker", category: "Footwear", icon: Footprints, gradient: "from-blue-600 to-neutral-900", price: 178, oldPrice: null, rating: 4.7, reviews: 203, badge: "Trending", colors: ["bg-blue-600", "bg-neutral-900", "bg-neutral-200"] },
  { id: "t2", name: "Halo Diamond Studs", category: "Accessories", icon: Gem, gradient: "from-pink-600 to-neutral-900", price: 320, oldPrice: null, rating: 4.9, reviews: 88, badge: "Trending", colors: ["bg-pink-400", "bg-neutral-200"] },
  { id: "t3", name: "Ridge Canvas Backpack", category: "Accessories", icon: ShoppingBag, gradient: "from-emerald-700 to-neutral-900", price: 145, oldPrice: null, rating: 4.6, reviews: 167, badge: "Trending", colors: ["bg-emerald-600", "bg-neutral-900"] },
  { id: "t4", name: "Pulse Smart Ring", category: "Electronics", icon: Watch, gradient: "from-cyan-600 to-neutral-900", price: 249, oldPrice: null, rating: 4.5, reviews: 94, badge: "Trending", colors: ["bg-cyan-500", "bg-neutral-900"] },
  { id: "t5", name: "Ember Linen Shirt", category: "Men", icon: Shirt, gradient: "from-orange-600 to-neutral-900", price: 98, oldPrice: null, rating: 4.6, reviews: 142, badge: "Trending", colors: ["bg-orange-500", "bg-neutral-200", "bg-neutral-900"] },
  { id: "t6", name: "Glacier Puffer Vest", category: "Women", icon: Shirt, gradient: "from-sky-600 to-neutral-900", price: 220, oldPrice: null, rating: 4.8, reviews: 176, badge: "Trending", colors: ["bg-sky-500", "bg-neutral-900"] },
  { id: "t7", name: "Atlas Leather Belt", category: "Accessories", icon: Gem, gradient: "from-amber-600 to-neutral-900", price: 85, oldPrice: null, rating: 4.7, reviews: 110, badge: "Trending", colors: ["bg-amber-700", "bg-neutral-900"] },
  { id: "t8", name: "Nimbus Running Jacket", category: "Men", icon: Shirt, gradient: "from-slate-500 to-neutral-900", price: 210, oldPrice: null, rating: 4.8, reviews: 198, badge: "Trending", colors: ["bg-slate-400", "bg-neutral-900"] },
];

const FLASH_SALE_PRODUCTS = [
  { id: "s1", name: "Vertex Sunglasses", icon: Glasses, gradient: "from-purple-600 to-neutral-900", discount: 45, price: 89, oldPrice: 162, claimed: 72 },
  { id: "s2", name: "Cobalt Denim Jacket", icon: Shirt, gradient: "from-blue-700 to-neutral-900", discount: 35, price: 130, oldPrice: 200, claimed: 58 },
  { id: "s3", name: "Marble Ceramic Mug Set", icon: Coffee, gradient: "from-neutral-500 to-neutral-800", discount: 50, price: 40, oldPrice: 80, claimed: 91 },
  { id: "s4", name: "Aria Wireless Earbuds", icon: Headphones, gradient: "from-indigo-600 to-neutral-900", discount: 30, price: 126, oldPrice: 180, claimed: 64 },
  { id: "s5", name: "Sable Wool Beanie", icon: Snowflake, gradient: "from-teal-600 to-neutral-900", discount: 40, price: 42, oldPrice: 70, claimed: 83 },
  { id: "s6", name: "Quartz Table Lamp", icon: Lamp, gradient: "from-amber-600 to-neutral-900", discount: 25, price: 150, oldPrice: 200, claimed: 46 },
];

const BEST_SELLERS = [
  { id: "b1", name: "Classic Oxford Shirt", icon: Shirt, gradient: "from-sky-700 to-neutral-900", price: 78, sold: "12.4K", rating: 4.7 },
  { id: "b2", name: "Essential Crewneck Tee", icon: Shirt, gradient: "from-neutral-600 to-neutral-900", price: 45, sold: "24K", rating: 4.8 },
  { id: "b3", name: "Signature Leather Wallet", icon: CreditCard, gradient: "from-amber-800 to-neutral-900", price: 95, sold: "9.8K", rating: 4.9 },
  { id: "b4", name: "Comfort-Fit Chinos", icon: Shirt, gradient: "from-orange-700 to-neutral-900", price: 88, sold: "15K", rating: 4.6 },
  { id: "b5", name: "Everyday Tote Bag", icon: ShoppingBag, gradient: "from-rose-700 to-neutral-900", price: 120, sold: "11K", rating: 4.8 },
  { id: "b6", name: "Premium Cotton Hoodie", icon: Shirt, gradient: "from-indigo-700 to-neutral-900", price: 110, sold: "18K", rating: 4.9 },
  { id: "b7", name: "Classic Aviator Sunglasses", icon: Glasses, gradient: "from-amber-700 to-neutral-900", price: 135, sold: "7.6K", rating: 4.7 },
  { id: "b8", name: "Minimalist Steel Watch", icon: Watch, gradient: "from-slate-700 to-neutral-900", price: 210, sold: "10K", rating: 4.8 },
];

const COLLECTIONS = [
  { id: "c1", title: "The Monochrome Edit", subtitle: "Timeless black, white & grey essentials for every wardrobe.", itemCount: 48, icon: Diamond, gradient: "from-neutral-900 to-neutral-700" },
  { id: "c2", title: "Autumn Heritage", subtitle: "Rich textures and warm tones for the new season.", itemCount: 62, icon: Leaf, gradient: "from-amber-800 to-orange-600" },
  { id: "c3", title: "Athleisure Redefined", subtitle: "Performance fabrics that move effortlessly into everyday style.", itemCount: 35, icon: Zap, gradient: "from-sky-700 to-cyan-600" },
  { id: "c4", title: "Gilded Evening", subtitle: "Statement pieces designed for after-dark occasions.", itemCount: 27, icon: Crown, gradient: "from-fuchsia-800 to-rose-600" },
];

const BRANDS = ["AURELIA", "NORDLINE", "VESPERA", "KODEX", "MERIDIAN", "HALCYON", "OBSIDIAN", "LUMORA", "STRAND & CO.", "VELVET NOIR"];

const STATS = [
  { icon: Users, value: 250000, suffix: "+", label: "Happy Customers", decimals: 0 },
  { icon: Package, value: 1200000, suffix: "+", label: "Products Delivered", decimals: 0 },
  { icon: Globe2, value: 45, suffix: "+", label: "Countries Served", decimals: 0 },
  { icon: Star, value: 4.9, suffix: "/5", label: "Average Rating", decimals: 1 },
];

const TESTIMONIALS = [
  { id: "r1", name: "Sarah Mitchell", role: "Verified Buyer · New York", initials: "SM", rating: 5, quote: "The quality exceeded every expectation. This is fast becoming my go-to for anything I wear on repeat." },
  { id: "r2", name: "James Rodriguez", role: "Verified Buyer · Los Angeles", initials: "JR", rating: 5, quote: "Fast shipping, flawless packaging, and the fit was perfect straight out of the box." },
  { id: "r3", name: "Elena Kowalski", role: "Verified Buyer · Berlin", initials: "EK", rating: 4, quote: "I've shopped luxury before, but Ventura's attention to detail is genuinely next level." },
  { id: "r4", name: "Marcus Thompson", role: "Verified Buyer · Toronto", initials: "MT", rating: 5, quote: "Customer service went above and beyond when I needed a size exchange. Truly impressive." },
  { id: "r5", name: "Priya Sharma", role: "Verified Buyer · Mumbai", initials: "PS", rating: 5, quote: "Every piece feels considered — from the stitching to the packaging. Worth every penny." },
  { id: "r6", name: "David Lin", role: "Verified Buyer · Singapore", initials: "DL", rating: 4, quote: "My wardrobe has never looked this put-together. Ventura just gets it." },
];

const INSTAGRAM_POSTS = [
  { id: "ig1", handle: "ventura.style", likes: "2.4K" },
  { id: "ig2", handle: "ventura.style", likes: "1.8K" },
  { id: "ig3", handle: "ventura.style", likes: "3.1K" },
  { id: "ig4", handle: "ventura.style", likes: "942" },
  { id: "ig5", handle: "ventura.style", likes: "5.2K" },
  { id: "ig6", handle: "ventura.style", likes: "1.1K" },
  { id: "ig7", handle: "ventura.style", likes: "2.7K" },
  { id: "ig8", handle: "ventura.style", likes: "890" },
].map((post, i) => ({ ...post, gradient: TILE_GRADIENTS[i % TILE_GRADIENTS.length] }));

const FAQS = [
  { question: "What is your return policy?", answer: "We offer a 30-day hassle-free return policy on all unworn items with original tags attached. Refunds are processed within 5-7 business days of receiving your return." },
  { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days within the country. Express shipping options are available at checkout for 1-2 day delivery." },
  { question: "Do you offer international shipping?", answer: "Yes, we ship to over 45 countries worldwide. International delivery times vary between 7-14 business days depending on destination." },
  { question: "Can I track my order?", answer: "Absolutely. Once your order ships, you will receive a tracking link via email so you can follow your package every step of the way." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit and debit cards, along with popular digital wallets. All transactions are secured with end-to-end encryption." },
  { question: "Is gift wrapping available?", answer: "Yes, complimentary gift wrapping with a handwritten note is available at checkout for all orders." },
  { question: "How do I know my size?", answer: "Each product page includes a detailed size guide. If you are ever unsure, our style concierge team is happy to help you find the perfect fit." },
  { question: "Do you offer price matching?", answer: "If you find an identical item at a lower price within 14 days of purchase, we will happily match it and refund the difference." },
  { question: "How can I contact customer support?", answer: "Reach our concierge team any time via live chat, email or phone — we typically respond within minutes, not hours." },
];

function formatCompact(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${Math.floor(n / 1000)}K`;
  return `${Math.floor(n)}`;
}

function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    hrs: Math.floor(seconds / 3600),
    mins: Math.floor((seconds % 3600) / 60),
    secs: seconds % 60,
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

function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/10 dark:border-white/10 dark:bg-neutral-900"
    >
      <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${product.gradient}`}>
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-900 backdrop-blur">
            {product.badge}
          </span>
        )}
        {product.oldPrice && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white">
            Sale
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-90 transition-transform duration-500 group-hover:scale-110">
          <product.icon className="h-16 w-16 text-white/40" strokeWidth={1} />
        </div>
        <div className="absolute inset-0 flex translate-y-full items-center justify-center gap-2 bg-black/40 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={() => setWishlisted((w) => !w)}
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
          <button className="flex h-10 items-center gap-1.5 rounded-full bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-800">
            <ShoppingBag className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {product.category}
        </span>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{product.name}</h3>
        <div className="flex items-center gap-1">
          <StarRating rating={product.rating} />
          <span className="text-xs text-neutral-400">({product.reviews})</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-bold text-neutral-900 dark:text-white">${product.price}</span>
          {product.oldPrice && <span className="text-sm text-neutral-400 line-through">${product.oldPrice}</span>}
        </div>
        {product.colors && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {product.colors.map((color, i) => (
              <span key={i} className={`h-3 w-3 rounded-full border border-black/10 dark:border-white/20 ${color}`} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CountdownBox({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
      <span className="text-2xl font-bold tabular-nums text-white md:text-3xl">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wider text-white/60">{label}</span>
    </div>
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

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 pt-8">
      <FloatingBlob className="left-[-10%] top-[-10%] h-[420px] w-[420px] bg-amber-500/20" />
      <FloatingBlob className="bottom-[-15%] right-[-10%] h-[500px] w-[500px] bg-indigo-500/10" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> New Season Collection is Live
          </span>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Elevate Your
            <span className="block bg-gradient-to-r from-amber-300 via-amber-100 to-white bg-clip-text text-transparent">
              Everyday Style
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base text-white/60 md:text-lg">
            Discover a curated edit of premium apparel, footwear and accessories — engineered for those who refuse to
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
              to="/collections"
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
              <Award className="h-4 w-4 text-amber-400" /> <span className="text-xs">Complimentary Gift Wrapping</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50">
            <img src={heroImage} alt="Ventura seasonal collection" className="h-[420px] w-full object-cover md:h-[560px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-6 top-10 hidden w-48 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-xl sm:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20">
                <Award className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Premium Quality</p>
                <p className="text-[11px] text-white/50">Certified Materials</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -right-4 w-52 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:bg-neutral-900/95"
          >
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-neutral-300 to-neutral-500 dark:border-neutral-900"
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">+12K</span>
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">joined this week</p>
          </motion.div>
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
  return (
    <section className="bg-white py-20 dark:bg-neutral-950 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Find Your Perfect Fit"
          subtitle="Explore our thoughtfully curated categories, each crafted with the same obsession for quality and design."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-black/5 bg-neutral-50 p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5 dark:border-white/10 dark:bg-neutral-900"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient}`}>
                <cat.icon className="h-6 w-6 text-white" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{cat.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">{cat.count}</p>
              <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-600" />
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-10 flex justify-center">
          <Link
            to="/categories"
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
        >
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TrendingSection() {
  const scrollRef = useRef(null);

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
              <TrendingUp className="h-3.5 w-3.5" /> Trending Now
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-5xl">
              What Everyone&apos;s Wearing
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
        <motion.div
          ref={scrollRef}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TRENDING_PRODUCTS.map((product) => (
            <div key={product.id} className="w-[240px] shrink-0 sm:w-[260px]">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FlashSaleSection() {
  const { hrs, mins, secs } = useCountdown(6 * 3600 + 45 * 60 + 30);
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
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">Up to 50% Off — Today Only</h2>
            <p className="mt-3 text-white/50">Prices this good disappear fast. Grab them before the clock runs out.</p>
          </div>
          <div className="flex items-center gap-3">
            <CountdownBox value={hrs} label="Hours" />
            <span className="text-2xl font-bold text-white/30">:</span>
            <CountdownBox value={mins} label="Minutes" />
            <span className="text-2xl font-bold text-white/30">:</span>
            <CountdownBox value={secs} label="Seconds" />
          </div>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-6"
        >
          {FLASH_SALE_PRODUCTS.map((product) => (
            <motion.div
              key={product.id}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10"
            >
              <span className="absolute right-3 top-3 z-10 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white">
                -{product.discount}%
              </span>
              <div
                className={`relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${product.gradient}`}
              >
                <product.icon className="h-10 w-10 text-white/40 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
              </div>
              <h4 className="truncate text-sm font-semibold text-white">{product.name}</h4>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-sm font-bold text-white">${product.price}</span>
                <span className="text-xs text-white/40 line-through">${product.oldPrice}</span>
              </div>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                  style={{ width: `${product.claimed}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/40">{product.claimed}% claimed</p>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-10 flex justify-center">
          <Link
            to="/sale"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.03]"
          >
            View All Deals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BestSellersSection() {
  return (
    <section className="bg-white py-20 dark:bg-neutral-950 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Customer Favorites"
          title="Our Best Sellers"
          subtitle="The pieces our community can't stop buying — and re-buying."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-5 sm:grid-cols-4"
        >
          {BEST_SELLERS.map((product, i) => (
            <motion.div
              key={product.id}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900"
            >
              <span className="absolute left-3 top-3 z-10 text-4xl font-bold text-black/10 dark:text-white/10">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${product.gradient}`}>
                <product.icon
                  className="h-14 w-14 text-white/40 transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1}
                />
              </div>
              <div className="p-4">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{product.name}</h4>
                <div className="mt-1.5 flex items-center gap-1">
                  <StarRating rating={product.rating} size="h-3 w-3" />
                  <span className="text-[11px] text-neutral-400">{product.rating}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">${product.price}</span>
                  <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <ThumbsUp className="h-3 w-3" /> {product.sold} sold
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-10 flex justify-center">
          <Link
            to="/best-sellers"
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
  return (
    <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Curated Collections"
          title="Stories Worth Wearing"
          subtitle="Each collection is a considered narrative — designed to move seamlessly from day to night."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {COLLECTIONS.map((collection) => (
            <motion.div
              key={collection.id}
              variants={fadeUp}
              whileHover={{ scale: 1.01 }}
              className={`group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${collection.gradient} p-8`}
            >
              <collection.icon
                className="absolute right-6 top-6 h-16 w-16 text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                strokeWidth={1}
              />
              <span className="absolute left-8 top-8 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                <Sparkles className="h-3 w-3" /> Just Dropped
              </span>
              <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                {collection.itemCount} Pieces
              </span>
              <h3 className="text-2xl font-bold text-white md:text-3xl">{collection.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-white/70">{collection.subtitle}</p>
              <Link to="/collections" className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white">
                Discover Collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BrandsSection() {
  return (
    <section className="border-y border-black/5 bg-white py-16 dark:border-white/10 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-600">
          Trusted by leading names in fashion & lifestyle
        </p>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
          {BRANDS.map((brand) => (
            <div
              key={brand}
              className="flex items-center justify-center opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <span className="text-lg font-bold tracking-widest text-neutral-900 dark:text-white">{brand}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Interested in partnering with Ventura?</p>
          <Link to="/contact" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-white">
            Get in touch <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-black py-20 md:py-28">
      <FloatingBlob className="left-[10%] top-[-10%] h-72 w-72 bg-amber-500/10" />
      <FloatingBlob className="bottom-[-10%] right-[10%] h-96 w-96 bg-indigo-500/10" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 gap-10 md:grid-cols-4"
        >
          {STATS.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(id);
  }, []);

  const testimonial = TESTIMONIALS[index];

  return (
    <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved By Thousands"
          subtitle="Real words from real members of the Ventura community."
        />
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
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-sm font-bold text-white">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-xs text-neutral-400">{testimonial.role}</p>
                  </div>
                </div>
                <StarRating rating={testimonial.rating} size="h-4 w-4" />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              aria-label="Previous testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-neutral-500 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((t, i) => (
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
              onClick={() => setIndex((i) => (i + 1) % TESTIMONIALS.length)}
              aria-label="Next testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-neutral-500 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstagramSection() {
  return (
    <section className="bg-white py-20 dark:bg-neutral-950 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Follow the Journey"
          title="#WornByVentura"
          subtitle="Tag us in your favorite looks for a chance to be featured."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {INSTAGRAM_POSTS.map((post) => (
            <motion.div
              key={post.id}
              variants={fadeUp}
              className={`group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${post.gradient}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-8 w-8 text-white/30" strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-center gap-1.5 text-white">
                  <Heart className="h-4 w-4 fill-white" /> <span className="text-sm font-semibold">{post.likes}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-white/70">
                  <AtSign className="h-3 w-3" /> {post.handle}
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
            <AtSign className="h-4 w-4" /> Follow @ventura.style
          </a>
        </div>
      </div>
    </section>
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
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Our style concierge team is here to help, day or night.</p>
          </div>
          <Link
            to="/contact"
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
          Subscribe for early access to new drops, member-only pricing and style edits curated just for you.
        </p>
        <div className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Early Access
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/70">
            <Award className="h-3.5 w-3.5 text-amber-400" /> Member Rewards
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/70">
            <ThumbsUp className="h-3.5 w-3.5 text-amber-400" /> Curated Style Edits
          </span>
        </div>
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
        <p className="mt-1 text-xs text-white/30">Join 250,000+ subscribers already receiving our style edit.</p>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-white px-6 py-20 dark:bg-neutral-950 md:py-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500 via-amber-400 to-orange-400 px-8 py-16 text-center md:px-16 md:py-24">
        <FloatingBlob className="left-[-10%] top-[-20%] h-72 w-72 bg-white/20" />
        <FloatingBlob className="bottom-[-20%] right-[-5%] h-96 w-96 bg-black/10" />
        <Diamond className="relative mx-auto mb-6 h-10 w-10 text-white/80" />
        <h2 className="relative text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
          Ready to Redefine Your Wardrobe?
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-neutral-800/80 md:text-lg">
          Join over 250,000 members who trust Ventura for premium quality, timeless design and effortless shopping.
        </p>
        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border-2 border-neutral-900/20 px-8 py-4 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-900/10"
          >
            Contact Us
          </Link>
        </div>
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-neutral-900/10 pt-8">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-amber-300 bg-gradient-to-br from-neutral-800 to-neutral-950" />
              ))}
            </div>
            <span className="text-sm font-semibold text-neutral-900">250K+ members</span>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={5} size="h-4 w-4" />
            <span className="text-sm font-semibold text-neutral-900">4.9/5 average rating</span>
          </div>
        </div>
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
