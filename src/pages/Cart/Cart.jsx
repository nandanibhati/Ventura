import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  Star,
  Check,
  Sparkles,
  Lock,
  Info,
  Watch,
  Shirt,
  Footprints,
  Gem,
  Headphones,
} from "lucide-react";

const INITIAL_CART_ITEMS = [
  { id: "c1", name: "Aurora Cashmere Coat", category: "Women", size: "M", color: "Charcoal", price: 428, quantity: 1, icon: Shirt, gradient: "from-rose-600 to-neutral-900" },
  { id: "c2", name: "Nova Titanium Watch", category: "Accessories", size: "One Size", color: "Slate", price: 890, quantity: 1, icon: Watch, gradient: "from-slate-600 to-neutral-900" },
  { id: "c3", name: "Meridian Leather Loafers", category: "Footwear", size: "42", color: "Cognac", price: 265, quantity: 2, icon: Footprints, gradient: "from-amber-700 to-neutral-900" },
];

const RECOMMENDATIONS = [
  { id: "r1", name: "Onyx Wool Blazer", category: "Men", price: 340, rating: 4.7, icon: Shirt, gradient: "from-neutral-700 to-neutral-950" },
  { id: "r2", name: "Lumen Silk Scarf", category: "Accessories", price: 135, rating: 4.6, icon: Gem, gradient: "from-fuchsia-600 to-neutral-900" },
  { id: "r3", name: "Zenith Noise-Cancel Headphones", category: "Electronics", price: 349, rating: 4.8, icon: Headphones, gradient: "from-indigo-700 to-neutral-900" },
  { id: "r4", name: "Atlas Leather Belt", category: "Accessories", price: 85, rating: 4.7, icon: Gem, gradient: "from-amber-600 to-neutral-900" },
  { id: "r5", name: "Solstice Merino Sweater", category: "Men", price: 195, rating: 4.7, icon: Shirt, gradient: "from-teal-700 to-neutral-900" },
];

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Shipping", detail: "5-7 business days", price: 0 },
  { id: "express", label: "Express Shipping", detail: "2-3 business days", price: 15 },
  { id: "overnight", label: "Overnight Shipping", detail: "Next business day", price: 35 },
];

const COUPONS = {
  VENTURA10: { label: "10% off your entire order", type: "percent", value: 10 },
  FREESHIP: { label: "Free shipping, any method", type: "shipping" },
  WELCOME20: { label: "$20 off orders over $150", type: "flat", value: 20, minSubtotal: 150 },
};

function AnimatedNumber({ value, decimals = 2, className = "" }) {
  const spring = useSpring(value, { stiffness: 150, damping: 22, mass: 0.6 });
  const display = useTransform(spring, (v) => `$${v.toFixed(decimals)}`);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}

function QuantityStepper({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-black/10 px-1 py-1 dark:border-white/15">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-black/5 disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-white/10"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-4 text-center text-sm font-semibold text-neutral-900 dark:text-white">{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={quantity >= 9}
        aria-label="Increase quantity"
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-black/5 disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-white/10"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CartLineItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
      className="flex gap-4 rounded-2xl border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-neutral-900 sm:gap-5 sm:p-5"
    >
      <div
        className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${item.gradient} sm:h-28 sm:w-28`}
      >
        <item.icon className="h-10 w-10 text-white/40" strokeWidth={1} />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {item.category}
            </span>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white sm:text-base">{item.name}</h3>
            <p className="mt-0.5 text-xs text-neutral-400">
              {item.color} · Size {item.size}
            </p>
          </div>
          <span className="shrink-0 text-sm font-bold text-neutral-900 dark:text-white sm:text-base">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <QuantityStepper quantity={item.quantity} onIncrease={() => onIncrease(item.id)} onDecrease={() => onDecrease(item.id)} />
          <button
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-rose-500"
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
      <p className="mt-3 text-[11px] text-neutral-400">Try: VENTURA10, FREESHIP or WELCOME20</p>
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
              {option.price === 0 ? "Free" : `$${option.price.toFixed(2)}`}
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

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02] dark:bg-white dark:text-neutral-900">
        <Lock className="h-4 w-4" /> Proceed to Checkout
      </button>

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

function RecommendationCard({ product, onAdd }) {
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
      <div className="mt-1 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.round(product.rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-neutral-900 dark:text-white">${product.price}</span>
        <button
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to cart`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white transition-transform hover:scale-110 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
        </button>
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

function Cart() {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
  const [shippingId, setShippingId] = useState("standard");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const increaseQuantity = (id) =>
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: Math.min(9, item.quantity + 1) } : item)));

  const decreaseQuantity = (id) =>
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item)));

  const removeItem = (id) => setCartItems((items) => items.filter((item) => item.id !== id));

  const addRecommendation = (product) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) => (item.id === product.id ? { ...item, quantity: Math.min(9, item.quantity + 1) } : item));
      }
      return [...items, { ...product, quantity: 1, size: "M", color: "Standard" }];
    });
  };

  const handleCouponInputChange = (value) => {
    setCouponInput(value);
    if (couponError) setCouponError("");
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    const coupon = COUPONS[code];
    if (!code) return;
    if (!coupon) {
      setCouponError("Invalid or expired coupon code.");
      return;
    }
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      setCouponError(`This code requires a subtotal of $${coupon.minSubtotal}+.`);
      return;
    }
    setAppliedCoupon({ code, ...coupon });
    setCouponError("");
    setCouponInput("");
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const selectedShipping = SHIPPING_OPTIONS.find((option) => option.id === shippingId) ?? SHIPPING_OPTIONS[0];

  const discount = !appliedCoupon
    ? 0
    : appliedCoupon.type === "percent"
    ? subtotal * (appliedCoupon.value / 100)
    : appliedCoupon.type === "flat"
    ? Math.min(appliedCoupon.value, subtotal)
    : 0;

  const shippingCost = appliedCoupon?.type === "shipping" ? 0 : selectedShipping.price;
  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + shippingCost + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
          {cartItems.length > 0 && (
            <span className="text-sm text-neutral-400">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </AnimatePresence>

              <div className="grid gap-6 sm:grid-cols-2">
                <CouponBox
                  couponInput={couponInput}
                  onInputChange={handleCouponInputChange}
                  onApply={applyCoupon}
                  appliedCoupon={appliedCoupon}
                  onRemove={removeCoupon}
                  error={couponError}
                />
                <ShippingBox options={SHIPPING_OPTIONS} selectedId={shippingId} onSelect={setShippingId} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                shippingCost={shippingCost}
                tax={tax}
                total={total}
                appliedCoupon={appliedCoupon}
                itemCount={itemCount}
              />
            </div>
          </div>
        )}

        <div className="mt-16 md:mt-24">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-2xl">You Might Also Like</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {RECOMMENDATIONS.map((product) => (
              <RecommendationCard key={product.id} product={product} onAdd={addRecommendation} />
            ))}
          </div>
        </div>

        <div className="h-10 md:h-16" />
      </div>
    </div>
  );
}

export default Cart;
