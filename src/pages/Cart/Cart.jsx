import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useSpring, useTransform } from "framer-motion";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Tag,
  Truck,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Check,
  Sparkles,
  Lock,
  Info,
  Package,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { shippingApi, settingsApi } from "../../api/catalog";
import { productsApi } from "../../api/products";
import { resolveProductImageUrl } from "../../lib/api";
import { gradientClassFor as gradientFor } from "../../lib/gradientFor";
import { LoadingSpinner } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import ProductCard from "../../components/ui/Cards/ProductCard";

function AnimatedNumber({ value, decimals = 2, className = "" }) {
  const spring = useSpring(value, { stiffness: 150, damping: 22, mass: 0.6 });
  const display = useTransform(spring, (v) => `£${v.toFixed(decimals)}`);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}

function QuantityStepper({ quantity, onDecrease, onIncrease, disabled }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-black/10 px-1 py-1 dark:border-white/15">
      <button
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-black/5 disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-white/10"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-4 text-center text-sm font-semibold text-neutral-900 dark:text-white">{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={disabled || quantity >= 9}
        aria-label="Increase quantity"
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-black/5 disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-white/10"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CartLineItem({ item, onIncrease, onDecrease, onRemove, isMutating }) {
  const variantLabel = item.variant && Object.keys(item.variant).length
    ? Object.entries(item.variant).map(([k, v]) => `${v}`).join(" · ")
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
      className="flex gap-4 rounded-2xl border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-neutral-900 sm:gap-5 sm:p-5"
    >
      <Link
        to={`/product/${item.productId}`}
        className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-28 sm:w-28 ${
          item.image ? "" : `bg-gradient-to-br ${gradientFor(item.productId)}`
        }`}
      >
        {item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <Package className="h-10 w-10 text-white/40" strokeWidth={1} />
        )}
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to={`/product/${item.productId}`}>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white sm:text-base">{item.name}</h3>
            </Link>
            {variantLabel && <p className="mt-0.5 text-xs text-neutral-400">{variantLabel}</p>}
          </div>
          <span className="shrink-0 text-sm font-bold text-neutral-900 dark:text-white sm:text-base">
            £{(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <QuantityStepper
            quantity={item.quantity}
            disabled={isMutating}
            onIncrease={() => onIncrease(item)}
            onDecrease={() => onDecrease(item)}
          />
          <button
            onClick={() => onRemove(item.id)}
            disabled={isMutating}
            aria-label="Remove item"
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-rose-500 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CouponBox({ couponInput, onInputChange, onApply, appliedCoupon, onRemove, error }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900 sm:p-6">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
        <Tag className="h-4 w-4 text-amber-500" /> Coupon Code
      </h3>
      <AnimatePresence mode="wait">
        {appliedCoupon ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-400/10"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{appliedCoupon.code}</p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">{appliedCoupon.label}</p>
              </div>
            </div>
            <button onClick={onRemove} className="shrink-0 text-xs font-medium text-emerald-700 underline dark:text-emerald-300">
              Remove
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onApply} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Enter coupon code"
              className="w-full rounded-full border border-black/10 bg-transparent px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-amber-400 focus:outline-none dark:border-white/15 dark:text-white"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              Apply
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center gap-1.5 overflow-hidden text-xs text-rose-500"
          >
            <Info className="h-3.5 w-3.5 shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
      <p className="mt-3 text-[11px] text-neutral-400">Try: Veluntra10, FREESHIP or WELCOME20</p>
    </div>
  );
}

function ShippingBox({ options, selectedId, onSelect }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900 sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
        <Truck className="h-4 w-4 text-amber-500" /> Shipping Method
      </h3>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors ${
              selectedId === option.id
                ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-white/5"
                : "border-black/10 hover:border-neutral-300 dark:border-white/15 dark:hover:border-white/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  selectedId === option.id ? "border-neutral-900 dark:border-white" : "border-neutral-300 dark:border-neutral-600"
                }`}
              >
                {selectedId === option.id && <span className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-white" />}
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{option.label}</p>
                <p className="text-xs text-neutral-400">{option.detail}</p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-white">
              {option.price === 0 ? "Free" : `£${option.price.toFixed(2)}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderSummary({ subtotal, discount, shippingCost, tax, total, appliedCoupon, itemCount }) {
  return (
    <div className="sticky top-24 rounded-2xl border border-black/5 bg-neutral-50 p-6 dark:border-white/10 dark:bg-neutral-900/60">
      <h3 className="text-base font-bold text-neutral-900 dark:text-white">Order Summary</h3>
      <p className="mt-0.5 text-xs text-neutral-400">
        {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
      </p>

      <div className="mt-5 space-y-3 border-b border-black/5 pb-5 dark:border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
          <AnimatedNumber value={subtotal} className="font-medium text-neutral-900 dark:text-white" />
        </div>

        <AnimatePresence>
          {discount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between overflow-hidden text-sm"
            >
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" /> Discount {appliedCoupon && `(${appliedCoupon.code})`}
              </span>
              <span className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                -<AnimatedNumber value={discount} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">Shipping</span>
          {shippingCost === 0 ? (
            <span className="font-medium text-neutral-900 dark:text-white">Free</span>
          ) : (
            <AnimatedNumber value={shippingCost} className="font-medium text-neutral-900 dark:text-white" />
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">Estimated Tax</span>
          <AnimatedNumber value={tax} className="font-medium text-neutral-900 dark:text-white" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-base font-bold text-neutral-900 dark:text-white">Total</span>
        <span className="text-2xl font-bold text-neutral-900 dark:text-white">
          <AnimatedNumber value={total} />
        </span>
      </div>

      <Link
        to="/checkout"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02] dark:bg-white dark:text-neutral-900"
      >
        <Lock className="h-4 w-4" /> Proceed to Checkout
      </Link>

      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-neutral-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Secure Checkout
        </span>
        <span className="flex items-center gap-1">
          <Truck className="h-3.5 w-3.5" /> Free Returns
        </span>
      </div>
    </div>
  );
}


function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-black/5 bg-neutral-50 px-6 py-20 text-center dark:border-white/10 dark:bg-neutral-900/40"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-black/5 dark:bg-neutral-900"
      >
        <ShoppingBag className="h-9 w-9 text-neutral-300 dark:text-neutral-600" strokeWidth={1.5} />
      </motion.div>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white md:text-2xl">Your cart is empty</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
        Looks like you haven&apos;t added anything yet. Explore our curated collections and find something you&apos;ll love.
      </p>
      <Link
        to="/shop"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] dark:bg-white dark:text-neutral-900"
      >
        Start Shopping <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}

function couponLabel(coupon) {
  if (!coupon) return "";
  if (coupon.type === "percent") return `${Number(coupon.value)}% off your order`;
  if (coupon.type === "fixed") return `£${Number(coupon.value)} off your order`;
  if (coupon.type === "free_shipping") return "Free shipping, any method";
  return "Discount applied";
}

function Cart() {
  useDocumentTitle("Your Cart");
  const { cart, isLoading, addItem, updateItem, removeItem, applyCoupon, removeCoupon, isMutating, couponError } = useCart();
  const [shippingId, setShippingId] = useState(null);
  const [couponInput, setCouponInput] = useState("");

  const { data: shippingMethods = [] } = useQuery({ queryKey: ["shipping-methods"], queryFn: shippingApi.list });
  const { data: settings } = useQuery({ queryKey: ["settings-public"], queryFn: settingsApi.getPublic });

  useEffect(() => {
    if (!shippingId && shippingMethods.length) setShippingId(shippingMethods[0].id);
  }, [shippingMethods, shippingId]);

  const cartProductIds = useMemo(() => new Set(cart.items.map((i) => i.productId)), [cart.items]);
  const { data: recsResult } = useQuery({
    queryKey: ["products", "cart-recommendations"],
    queryFn: () => productsApi.list({ sort: "best-selling", limit: 8 }),
  });
  const recommendations = useMemo(
    () =>
      (recsResult?.items || [])
        .filter((p) => !cartProductIds.has(p.id))
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
    [recsResult, cartProductIds]
  );

  const handleCouponInputChange = (value) => setCouponInput(value);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyCoupon(couponInput.trim()).then(() => setCouponInput(""));
  };

  const selectedShipping = shippingMethods.find((option) => option.id === shippingId) ?? shippingMethods[0];
  const shippingPrice = selectedShipping ? Number(selectedShipping.price) : 0;

  const subtotal = cart.subtotal;
  const discount = cart.discount + (cart.promotionDiscount || 0);
  const shippingCost = cart.coupon?.type === "free_shipping" ? 0 : shippingPrice;
  const taxPercent = settings ? Number(settings.taxPercent) : 0;
  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = Math.round(taxableAmount * (taxPercent / 100) * 100) / 100;
  const total = taxableAmount + shippingCost + tax;
  const itemCount = cart.itemCount;

  const appliedCouponDisplay = cart.coupon ? { code: cart.coupon.code, label: couponLabel(cart.coupon) } : null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <LoadingSpinner size="lg" label="Loading your cart..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-neutral-400">
          <Link to="/" className="hover:text-neutral-900 dark:hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-600 dark:text-neutral-300">Cart</span>
        </div>
        <div className="mb-10 flex items-end justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-4xl">Shopping Cart</h1>
          {cart.items.length > 0 && (
            <span className="text-sm text-neutral-400">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {cart.items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <AnimatePresence mode="popLayout">
                {cart.items.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    isMutating={isMutating}
                    onIncrease={(i) => updateItem(i.id, Math.min(9, i.quantity + 1))}
                    onDecrease={(i) => updateItem(i.id, Math.max(1, i.quantity - 1))}
                    onRemove={removeItem}
                  />
                ))}
              </AnimatePresence>

              <div className="grid gap-6 sm:grid-cols-2">
                <CouponBox
                  couponInput={couponInput}
                  onInputChange={handleCouponInputChange}
                  onApply={handleApplyCoupon}
                  appliedCoupon={appliedCouponDisplay}
                  onRemove={removeCoupon}
                  error={couponError}
                />
                {shippingMethods.length > 0 && (
                  <ShippingBox
                    options={shippingMethods.map((m) => ({ id: m.id, label: m.name, detail: `${m.etaDays} days`, price: Number(m.price) }))}
                    selectedId={shippingId}
                    onSelect={setShippingId}
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                shippingCost={shippingCost}
                tax={tax}
                total={total}
                appliedCoupon={appliedCouponDisplay}
                itemCount={itemCount}
              />
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-16 md:mt-24">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-2xl">You Might Also Like</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recommendations.map((product, i) => (
                <div key={product.id} className="w-[190px] shrink-0 sm:w-[220px]">
                  <ProductCard
                    product={product}
                    image={product.image}
                    index={i}
                    onAdd={() => addItem({ productId: product.id, quantity: 1 })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-10 md:h-16" />
      </div>
    </div>
  );
}

export default Cart;
