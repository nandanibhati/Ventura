import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
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
  Flag,
  ZoomIn,
  Play,
  X,
  TrendingUp,
  Award,
} from "lucide-react";
import { productsApi, reviewsApi } from "../../api/products";
import { wishlistApi } from "../../api/orders";
import { resolveMediaUrl, resolveProductImageUrl } from "../../lib/api";
import { gradientClassFor as gradientFor } from "../../lib/gradientFor";
import ProductCard from "../../components/ui/Cards/ProductCard";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast, LoadingSpinner, ErrorState } from "../../components/ui/Feedback";
import { useMetaTags } from "../../lib/useMetaTags";

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

// `media` is images followed by videos, in that fixed order — activeIndex always lands on an
// image for indices < images.length, which is what the colour/storage variant-jump effect in
// the parent relies on (it computes an index directly into product.images).
function ZoomGallery({ images, videos = [], fallbackKey, activeIndex, onSelect }) {
  const media = useMemo(
    () => [...images.map((img) => ({ ...img, type: "image" })), ...videos.map((url) => ({ url, type: "video" }))],
    [images, videos]
  );
  const current = media[activeIndex] || {};
  const isZoomable = current.type !== "video" && Boolean(current.url);

  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [isHovering, setIsHovering] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    setLightboxOpen(false);
  }, [activeIndex]);

  const handleMouseMove = (e) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`);
  };

  return (
    <div>
      <div
        ref={frameRef}
        onMouseMove={isZoomable ? handleMouseMove : undefined}
        onMouseEnter={isZoomable ? () => setIsHovering(true) : undefined}
        onMouseLeave={isZoomable ? () => setIsHovering(false) : undefined}
        onClick={isZoomable ? () => setLightboxOpen(true) : undefined}
        className={`group relative aspect-square overflow-hidden rounded-3xl border border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900 ${
          isZoomable ? "cursor-zoom-in" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex h-full w-full items-center justify-center ${
              current.url ? "" : `bg-gradient-to-br ${gradientFor(fallbackKey)}`
            }`}
          >
            {current.type === "video" && current.url ? (
              <video src={current.url} className="h-full w-full object-contain" controls playsInline />
            ) : current.url ? (
              <img
                src={current.url}
                alt=""
                className="h-full w-full object-contain transition-transform duration-200 ease-out"
                style={isHovering ? { transform: "scale(2)", transformOrigin: zoomOrigin } : undefined}
              />
            ) : (
              <Sparkles className="h-28 w-28 text-white/30 md:h-36 md:w-36" strokeWidth={0.75} />
            )}
          </motion.div>
        </AnimatePresence>
        {isZoomable && (
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-3 w-3" /> Click to expand
          </span>
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {media.map((item, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              aria-label={item.type === "video" ? `Play video ${i + 1}` : `View image ${i + 1}`}
              aria-pressed={i === activeIndex}
              className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50 transition-all dark:bg-neutral-900 ${
                item.url ? "" : `bg-gradient-to-br ${gradientFor(fallbackKey)}`
              } ${i === activeIndex ? "ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-950" : "opacity-60 hover:opacity-100"}`}
            >
              {item.type === "video" ? (
                <>
                  <video src={item.url} className="h-full w-full object-contain" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </span>
                </>
              ) : item.url ? (
                <img src={item.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
              ) : (
                <Sparkles className="h-7 w-7 text-white/40" strokeWidth={1} />
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxOpen && isZoomable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={current.url}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full cursor-default object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColorSelector({ colors, selected, onSelect }) {
  if (!colors.length) return null;
  const current = colors.find((c) => c.label === selected);
  return (
    <div>
      <p className="mb-2.5 text-sm font-medium text-neutral-900 dark:text-white">
        Color — <span className="font-normal text-neutral-500 dark:text-neutral-400">{current?.label}</span>
      </p>
      <div className="flex items-center gap-2.5">
        {colors.map((color) => (
          <button
            key={color.label}
            onClick={() => onSelect(color.label)}
            aria-label={color.label}
            style={{ backgroundColor: color.extra || "#9ca3af" }}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
              color.label === selected ? "border-neutral-900 dark:border-white" : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function StorageSelector({ options, selected, onSelect }) {
  if (!options.length) return null;
  return (
    <div>
      <p className="mb-2.5 text-sm font-medium text-neutral-900 dark:text-white">Storage</p>
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.label)}
            className={`flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors ${
              selected === opt.label
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-black/10 text-neutral-700 hover:border-neutral-400 dark:border-white/15 dark:text-neutral-200 dark:hover:border-white/40"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SizeSelector({ sizes, selected, onSelect }) {
  if (!sizes.length) return null;
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

function ShareMenu({ productName }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

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
    <div className="relative" ref={menuRef}>
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
              href={`mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(window.location.href)}`}
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
        <span className="text-5xl font-bold text-neutral-900 dark:text-white">{rating.toFixed(1)}</span>
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

function ReviewCard({ review, onMarkHelpful, onReport }) {
  const initials = review.initials || review.name?.slice(0, 2)?.toUpperCase() || "??";
  return (
    <div className="border-b border-black/5 py-6 last:border-b-0 dark:border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-xs font-bold text-white">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{review.name}</p>
              {review.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
            <p className="text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} />
      </div>
      {review.title && <h4 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-white">{review.title}</h4>}
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{review.body}</p>
      {review.sellerReply && (
        <div className="mt-3 rounded-xl bg-black/[0.03] p-3 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
          <span className="font-semibold text-neutral-900 dark:text-white">Seller reply: </span>
          {review.sellerReply}
        </div>
      )}
      <div className="mt-3 flex items-center gap-4">
        <button
          onClick={() => onMarkHelpful(review.id)}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
        >
          <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({review.helpfulCount || 0})
        </button>
        <button
          onClick={() => onReport(review.id)}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
        >
          <Flag className="h-3.5 w-3.5" /> Report
        </button>
      </div>
    </div>
  );
}


function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [activeImage, setActiveImage] = useState(0);
  const [selections, setSelections] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const buyBoxRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id),
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.list,
    enabled: isAuthenticated,
  });
  const isWishlisted = wishlistItems.some((w) => w.product.id === id);

  useMetaTags({
    title: product?.name,
    description: product?.shortDescription || product?.description?.slice(0, 160),
    path: `/product/${id}`,
    structuredData: product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: (product.images || []).map((img) => resolveProductImageUrl(img.url)).filter(Boolean),
          sku: product.sku,
          ...(product.brand?.name ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
          offers: {
            "@type": "Offer",
            priceCurrency: "GBP",
            price: Number(product.price),
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `https://veluntra.co.uk/product/${product.id}`,
          },
          ...(product.ratingCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: Number(product.ratingAvg) || 0,
                  reviewCount: product.ratingCount,
                },
              }
            : {}),
        }
      : undefined,
  });

  const { data: relatedResult } = useQuery({
    queryKey: ["products", "related", product?.category?.slug],
    queryFn: () => productsApi.list({ category: product.category.slug, limit: 6 }),
    enabled: Boolean(product?.category?.slug),
  });

  const relatedProducts = useMemo(
    () =>
      (relatedResult?.items || [])
        .filter((p) => p.id !== id)
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand?.name,
          category: p.category?.name,
          price: Number(p.price),
          oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
          rating: Number(p.ratingAvg) || 0,
          reviews: p.ratingCount,
          isNew: p.isNew,
          isTrending: p.isTrending,
          isBestSeller: p.isBestSeller,
          badge: p.badge,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
          animationOverride: p.animationOverride,
          image: resolveProductImageUrl(p.images?.[0]?.url) || null,
        })),
    [relatedResult, id]
  );

  const wishlistAddMutation = useMutation({
    mutationFn: () => wishlistApi.add(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });
  const wishlistRemoveMutation = useMutation({
    mutationFn: () => wishlistApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const markHelpfulMutation = useMutation({
    mutationFn: (reviewId) => reviewsApi.markHelpful(id, reviewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product", id] }),
  });
  const reportMutation = useMutation({
    mutationFn: (reviewId) => reviewsApi.reportAbuse(id, reviewId),
    onSuccess: () => toast({ title: "Thanks — we'll take a look.", variant: "success" }),
  });
  const createReviewMutation = useMutation({
    mutationFn: (payload) => reviewsApi.create(id, payload),
    onSuccess: () => {
      toast({ title: "Review submitted for moderation", variant: "success" });
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: "", body: "" });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't submit review", variant: "error" }),
  });

  useEffect(() => {
    const node = buyBoxRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [product]);

  // Initialize option selections (first available value per kind) once the product loads. Also
  // resets the gallery and quantity picker — this component stays mounted across /product/:id
  // navigations (e.g. clicking a related-product card), so without this reset a quantity or
  // gallery position set on the previous product would otherwise carry over onto the new one.
  useEffect(() => {
    if (!product?.options) return;
    const initial = {};
    for (const opt of product.options) {
      if (!(opt.kind in initial)) initial[opt.kind] = opt.label;
    }
    setSelections(initial);
    setActiveImage(0);
    setQuantity(1);
  }, [product?.id]);

  const colorOptions = useMemo(() => (product?.options || []).filter((o) => o.kind === "color"), [product]);
  const storageOptions = useMemo(() => (product?.options || []).filter((o) => o.kind === "storage"), [product]);
  const variantKeys = useMemo(
    () => (product?.variants?.length ? Object.keys(product.variants[0].combination) : []),
    [product]
  );
  const sizeOptions = useMemo(() => {
    const sizes = (product?.options || []).filter((o) => o.kind === "size");
    if (!variantKeys.includes("size")) return sizes.map((s) => ({ label: s.label, inStock: true }));
    return sizes.map((s) => {
      const variant = product.variants.find((v) => v.combination.size === s.label);
      return { label: s.label, inStock: variant ? variant.available : true };
    });
  }, [product, variantKeys]);

  const matchedVariant = useMemo(() => {
    if (!variantKeys.length || !product?.variants) return null;
    return product.variants.find((v) => variantKeys.every((k) => v.combination[k] === selections[k])) || null;
  }, [product, variantKeys, selections]);

  const displayPrice = matchedVariant?.price != null ? Number(matchedVariant.price) : Number(product?.price || 0);
  const maxQty = matchedVariant ? matchedVariant.stock : product?.stock ?? 9;
  const lowStockThreshold = product?.lowStockThreshold ?? 10;
  const stockStatus =
    maxQty === 0
      ? { text: "Out of stock", tone: "text-rose-500" }
      : maxQty <= lowStockThreshold
      ? { text: `Only ${maxQty} left in stock`, tone: "text-amber-500" }
      : { text: `${maxQty} in stock`, tone: "text-emerald-600 dark:text-emerald-400" };

  // Defense in depth against a stale quantity exceeding stock — covers a variant switch (e.g.
  // selecting a colour with lower stock than the one previously selected), since maxQty depends
  // on the selected variant, not just the product.
  useEffect(() => {
    setQuantity((q) => Math.min(q, Math.max(maxQty, 1)));
  }, [maxQty]);

  // Jump the gallery to whichever photo was assigned to the selected colour/storage combination,
  // so the displayed image changes along with the variant — falls back to leaving it as-is when
  // that combination has no dedicated photo.
  useEffect(() => {
    if (!matchedVariant?.imageUrl || !product?.images) return;
    const idx = product.images.findIndex((img) => resolveMediaUrl(img.url) === matchedVariant.imageUrl);
    if (idx >= 0) setActiveImage(idx);
  }, [matchedVariant?.imageUrl, product?.images]);

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    if (isWishlisted) wishlistRemoveMutation.mutate();
    else wishlistAddMutation.mutate();
  };

  const handleAddToCart = async () => {
    if (maxQty === 0) return;
    try {
      const variant = variantKeys.length ? Object.fromEntries(variantKeys.map((k) => [k, selections[k]])) : undefined;
      await addItem({ productId: id, quantity: Math.min(quantity, maxQty), variant });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      toast({ title: err.response?.data?.error?.message || "Couldn't add to cart", variant: "error" });
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    createReviewMutation.mutate(reviewForm);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <LoadingSpinner size="lg" label="Loading product..." />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <ErrorState description="We couldn't load this product." onRetry={refetch} />
      </div>
    );
  }

  const gallery = product.images?.length ? product.images.map((img) => ({ url: resolveProductImageUrl(img.url) })) : [{}];
  const videos = (product.videos || []).map((url) => resolveMediaUrl(url)).filter(Boolean);
  const rating = Number(product.ratingAvg) || 0;
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const badges = [
    product.isBestSeller && { label: "Best Seller", icon: TrendingUp, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    product.isFeatured && { label: "Featured", icon: Award, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    product.isNew && { label: "New", icon: Sparkles, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    product.badge && { label: product.badge, icon: BadgeCheck, className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white pb-24 dark:bg-neutral-950 lg:pb-0">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <div className="mb-8 flex items-center gap-1.5 text-xs text-neutral-400">
          <Link to="/" className="hover:text-neutral-900 dark:hover:text-white">
            Home
          </Link>
          {product.category?.slug && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/shop?category=${product.category.slug}`} className="hover:text-neutral-900 dark:hover:text-white">
                {product.category.name}
              </Link>
            </>
          )}
          {product.brand?.slug && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                to={`/shop?category=${product.category?.slug || ""}&brand=${product.brand.slug}`}
                className="hover:text-neutral-900 dark:hover:text-white"
              >
                {product.brand.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-600 dark:text-neutral-300">{product.name}</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ZoomGallery images={gallery} videos={videos} fallbackKey={product.id} activeIndex={activeImage} onSelect={setActiveImage} />

          <div ref={buyBoxRef} className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {product.category?.name}
              </span>
              {product.brand?.slug && (
                <>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <Link
                    to={`/shop?category=${product.category?.slug || ""}&brand=${product.brand.slug}`}
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 hover:underline dark:text-neutral-300 dark:hover:text-white"
                  >
                    {product.brand.name}
                  </Link>
                </>
              )}
            </div>

            {badges.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {badges.map((b) => (
                  <span
                    key={b.label}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${b.className}`}
                  >
                    <b.icon className="h-3 w-3" /> {b.label}
                  </span>
                ))}
              </div>
            )}

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-3xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <RatingStars rating={rating} />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {rating.toFixed(1)} ({product.ratingCount} reviews)
              </span>
              {product.condition && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {product.condition}
                </span>
              )}
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">£{displayPrice.toFixed(2)}</span>
              {oldPrice && <span className="text-lg text-neutral-400 line-through">£{oldPrice.toFixed(2)}</span>}
              {oldPrice && (
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  Save £{(oldPrice - displayPrice).toFixed(0)}
                </span>
              )}
            </div>

            {product.highlights?.length > 0 && (
              <ul className="mt-6 space-y-2">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" /> {highlight}
                  </li>
                ))}
              </ul>
            )}

            {(colorOptions.length > 0 || sizeOptions.length > 0 || storageOptions.length > 0) && (
              <div className="mt-8 space-y-6 border-t border-black/5 pt-7 dark:border-white/10">
                <ColorSelector
                  colors={colorOptions}
                  selected={selections.color}
                  onSelect={(label) => setSelections((s) => ({ ...s, color: label }))}
                />
                <StorageSelector
                  options={storageOptions}
                  selected={selections.storage}
                  onSelect={(label) => setSelections((s) => ({ ...s, storage: label }))}
                />
                <SizeSelector
                  sizes={sizeOptions}
                  selected={selections.size}
                  onSelect={(label) => setSelections((s) => ({ ...s, size: label }))}
                />
              </div>
            )}

            <p className={`mt-6 text-xs font-semibold ${stockStatus.tone}`}>{stockStatus.text}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <QuantityStepper
                quantity={quantity}
                onIncrease={() => setQuantity((q) => Math.min(maxQty || 9, q + 1))}
                onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              />

              <button
                onClick={handleAddToCart}
                disabled={maxQty === 0}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-40 dark:bg-white dark:text-neutral-900"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {maxQty === 0 ? (
                    <motion.span key="oos">Out of Stock</motion.span>
                  ) : addedToCart ? (
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
                onClick={handleToggleWishlist}
                aria-label="Add to wishlist"
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isWishlisted
                    ? "border-rose-500 bg-rose-50 text-rose-500 dark:bg-rose-500/10"
                    : "border-black/10 text-neutral-600 hover:bg-black/5 dark:border-white/15 dark:text-neutral-300 dark:hover:bg-white/10"
                }`}
              >
                <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
              </button>

              <ShareMenu productName={product.name} />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-black/5 pt-7 dark:border-white/10">
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
                {tab.id === "reviews" && <span className="text-xs text-neutral-400">({product.ratingCount})</span>}
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
                  <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-300 whitespace-pre-line">{product.description}</p>
                </motion.div>
              )}

              {activeTab === "specifications" && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-5xl"
                >
                  {(product.specifications || []).length === 0 ? (
                    <p className="text-sm text-neutral-400">No specifications listed for this product.</p>
                  ) : (
                    <div className="grid gap-x-12 sm:grid-cols-2">
                      {product.specifications.map((spec) => (
                        <div key={spec.label} className="flex gap-6 border-b border-black/5 py-3 dark:border-white/10">
                          <span className="w-40 shrink-0 text-sm text-neutral-400">{spec.label}</span>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <Link to="/returns" className="inline-block text-sm font-medium text-neutral-900 underline dark:text-white">
                    View full return policy & seller warranty
                  </Link>
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
                  <RatingBreakdown rating={rating} reviewCount={product.ratingCount} breakdown={product.ratingBreakdown || []} />
                  <div className="mt-8 border-t border-black/5 dark:border-white/10">
                    {(product.reviews || []).length === 0 ? (
                      <p className="py-6 text-sm text-neutral-400">No reviews yet — be the first to share your thoughts.</p>
                    ) : (
                      product.reviews.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          onMarkHelpful={(reviewId) => markHelpfulMutation.mutate(reviewId)}
                          onReport={(reviewId) => reportMutation.mutate(reviewId)}
                        />
                      ))
                    )}
                  </div>

                  {showReviewForm ? (
                    <form onSubmit={handleSubmitReview} className="mt-4 space-y-3 rounded-2xl border border-black/10 p-5 dark:border-white/15">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">Your rating:</span>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            type="button"
                            key={n}
                            aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
                            aria-pressed={n === reviewForm.rating}
                            onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                          >
                            <Star
                              className={`h-5 w-5 ${n <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"}`}
                            />
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Title"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm dark:border-white/15 dark:bg-neutral-900 dark:text-white"
                      />
                      <textarea
                        required
                        rows={4}
                        placeholder="Share your experience..."
                        value={reviewForm.body}
                        onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                        className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm dark:border-white/15 dark:bg-neutral-900 dark:text-white"
                      />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={createReviewMutation.isPending}
                          className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
                        >
                          {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="rounded-full border border-black/10 px-6 py-2.5 text-sm font-semibold text-neutral-700 dark:border-white/15 dark:text-neutral-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => (isAuthenticated ? setShowReviewForm(true) : navigate("/login", { state: { from: { pathname: `/product/${id}` } } }))}
                      className="mt-2 inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
                    >
                      Write a Review
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-4 md:mt-8">
            <h2 className="mb-8 text-xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-2xl">You May Also Like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {relatedProducts.map((p, i) => (
                <div key={p.id} className="w-[190px] shrink-0 sm:w-[220px]">
                  <ProductCard product={p} image={p.image} index={i} onAdd={() => addItem({ productId: p.id, quantity: 1 })} />
                </div>
              ))}
            </div>
          </div>
        )}
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
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{product.name}</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">£{displayPrice.toFixed(2)}</p>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={maxQty === 0}
                className="flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
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
