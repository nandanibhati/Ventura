import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lock,
  ShieldCheck,
  Truck,
  Zap,
  CreditCard,
  Wallet,
  Tag,
  ChevronDown,
  CheckCircle2,
  MapPin,
  ArrowLeft,
  X,
} from "lucide-react";

import { Input, Select, Checkbox } from "../../components/ui/Input";
import { PrimaryButton, OutlineButton } from "../../components/ui/Button";
import { Badge, LoadingSpinner } from "../../components/ui/Feedback";
import { Breadcrumb } from "../../components/ui/Navigation";
import { cn } from "../../lib/utils";

/* — Sample data (wire up to real cart / API in production) — */
const CART_ITEMS = [
  { id: 1, name: "Aurora Pro Wireless Earbuds", variant: "Black · Standard", qty: 1, price: 178 },
  { id: 2, name: "Nova Titanium Smartwatch", variant: "Titanium · 44mm", qty: 1, price: 890 },
  { id: 3, name: "Meridian Mechanical Keyboard", variant: "Charcoal · Full-size", qty: 2, price: 145 },
];

const COUPONS = {
  VENTURA10: 0.1,
  WELCOME15: 0.15,
};

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard", eta: "5–7 business days", price: 0, icon: Truck },
  { id: "express", label: "Express", eta: "2–3 business days", price: 18, icon: Zap },
  { id: "nextday", label: "Next day", eta: "Arrives tomorrow", price: 32, icon: Zap },
];

const PAYMENT_OPTIONS = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "paypal", label: "PayPal", icon: Wallet },
  { id: "applepay", label: "Apple Pay", icon: Wallet },
];

const CURRENCY = "£";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function Checkout() {
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "GB",
    phone: "",
  });
  const [saveInfo, setSaveInfo] = useState(true);
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const setAddr = (field) => (e) => setAddress((a) => ({ ...a, [field]: e.target.value }));

  /* — Pricing — */
  const subtotal = useMemo(() => CART_ITEMS.reduce((sum, i) => sum + i.price * i.qty, 0), []);
  const discount = coupon ? subtotal * coupon.percent : 0;
  const deliveryCost = DELIVERY_OPTIONS.find((d) => d.id === delivery)?.price ?? 0;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const total = subtotal - discount + deliveryCost + tax;

  /* — Coupon — */
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError("");
    setTimeout(() => {
      if (COUPONS[code]) {
        setCoupon({ code, percent: COUPONS[code] });
        setCouponInput("");
      } else {
        setCouponError("This code isn't valid or has expired.");
      }
      setApplyingCoupon(false);
    }, 500);
  };
  const removeCoupon = () => setCoupon(null);

  /* — Validation — */
  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) e.email = "Enter a valid email address.";

    if (!address.firstName) e.firstName = "Required.";
    if (!address.lastName) e.lastName = "Required.";
    if (!address.line1) e.line1 = "Required.";
    if (!address.city) e.city = "Required.";
    if (!address.postalCode) e.postalCode = "Required.";

    if (payment === "card") {
      if (card.number.replace(/\s/g, "").length < 16) e.cardNumber = "Enter a valid card number.";
      if (!card.name) e.cardName = "Name on card is required.";
      if (card.expiry.length < 5) e.cardExpiry = "MM/YY";
      if (card.cvc.length < 3) e.cardCvc = "CVC";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validate()) {
      document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      setOrderPlaced(true);
    }, 1400);
  };

  if (orderPlaced) {
    return <OrderConfirmation total={total} email={email} />;
  }

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      {/* Top bar */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="/cart" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-gold-500 transition-colors">
            <ArrowLeft className="size-4" /> Back to cart
          </a>
          <span
            className="text-lg font-medium tracking-[0.2em] text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            VENTURA
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Lock className="size-3.5 text-gold-500" /> Secure checkout
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        <div className="hidden sm:block mb-6">
          <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        </div>

        {/* Mobile collapsible order summary */}
        <button
          onClick={() => setSummaryOpen((s) => !s)}
          className="mb-5 flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 sm:hidden"
        >
          <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <Tag className="size-4 text-gold-500" />
            {summaryOpen ? "Hide order summary" : "Show order summary"}
          </span>
          <span className="flex items-center gap-2">
            <span className="text-sm font-medium">{CURRENCY}{total.toFixed(2)}</span>
            <ChevronDown className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} />
          </span>
        </button>
        <AnimatePresence>
          {summaryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden sm:hidden"
            >
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                deliveryCost={deliveryCost}
                tax={tax}
                total={total}
                coupon={coupon}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                applyCoupon={applyCoupon}
                removeCoupon={removeCoupon}
                applyingCoupon={applyingCoupon}
                couponError={couponError}
                className="mb-6"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
          {/* — Form column — */}
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-10">
            {/* Contact */}
            <section>
              <SectionHeader step="01" title="Contact" />
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />
            </section>

            {/* Address */}
            <section>
              <SectionHeader step="02" title="Shipping address" icon={MapPin} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="First name" value={address.firstName} onChange={setAddr("firstName")} error={errors.firstName} required />
                <Input label="Last name" value={address.lastName} onChange={setAddr("lastName")} error={errors.lastName} required />
                <div className="sm:col-span-2">
                  <Input label="Address line 1" value={address.line1} onChange={setAddr("line1")} error={errors.line1} required />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Address line 2 (optional)" value={address.line2} onChange={setAddr("line2")} />
                </div>
                <Input label="City" value={address.city} onChange={setAddr("city")} error={errors.city} required />
                <Input label="State / County" value={address.state} onChange={setAddr("state")} />
                <Input label="Postal code" value={address.postalCode} onChange={setAddr("postalCode")} error={errors.postalCode} required />
                <Select
                  label="Country"
                  value={address.country}
                  onChange={setAddr("country")}
                  options={[
                    { value: "GB", label: "United Kingdom" },
                    { value: "US", label: "United States" },
                    { value: "FR", label: "France" },
                    { value: "AE", label: "United Arab Emirates" },
                    { value: "IN", label: "India" },
                  ]}
                />
                <div className="sm:col-span-2">
                  <Input label="Phone (optional)" type="tel" value={address.phone} onChange={setAddr("phone")} />
                </div>
              </div>
              <div className="mt-4">
                <Checkbox
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  label="Save this information for next time"
                />
              </div>
            </section>

            {/* Delivery */}
            <section>
              <SectionHeader step="03" title="Delivery method" icon={Truck} />
              <div className="flex flex-col gap-3">
                {DELIVERY_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    selected={delivery === opt.id}
                    onClick={() => setDelivery(opt.id)}
                    icon={opt.icon}
                    title={opt.label}
                    subtitle={opt.eta}
                    trailing={opt.price === 0 ? "Free" : `${CURRENCY}${opt.price.toFixed(2)}`}
                  />
                ))}
              </div>
            </section>

            {/* Payment */}
            <section>
              <SectionHeader step="04" title="Payment" icon={CreditCard} />
              <div className="grid grid-cols-3 gap-3 mb-5">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = payment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPayment(opt.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border p-4 transition-all",
                        selected
                          ? "border-gold-400 bg-gold-400/8 shadow-[0_0_0_3px_rgb(216_179_106_/_0.14)]"
                          : "border-[var(--border)] hover:border-gold-400/50"
                      )}
                    >
                      <Icon className={cn("size-5", selected ? "text-gold-500" : "text-[var(--text-muted)]")} />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {payment === "card" ? (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <div className="sm:col-span-2">
                      <Input
                        label="Card number"
                        placeholder="1234 1234 1234 1234"
                        value={card.number}
                        onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                        error={errors.cardNumber}
                        rightIcon={CreditCard}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Name on card"
                        value={card.name}
                        onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                        error={errors.cardName}
                      />
                    </div>
                    <Input
                      label="Expiry"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      error={errors.cardExpiry}
                      inputMode="numeric"
                    />
                    <Input
                      label="CVC"
                      placeholder="123"
                      value={card.cvc}
                      onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      error={errors.cardCvc}
                      inputMode="numeric"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="redirect"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] p-4 text-sm text-[var(--text-muted)]"
                  >
                    You'll be redirected to {payment === "paypal" ? "PayPal" : "Apple Pay"} to complete this payment securely after placing your order.
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Desktop submit */}
            <div className="hidden lg:block">
              <PrimaryButton type="submit" size="lg" fullWidth loading={placing} leftIcon={placing ? undefined : Lock}>
                {placing ? "Placing your order…" : `Pay ${CURRENCY}${total.toFixed(2)}`}
              </PrimaryButton>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                <ShieldCheck className="size-3.5 text-gold-500" /> Encrypted and secured by Ventura Payments
              </p>
            </div>
          </form>

          {/* — Order summary column (desktop, sticky) — */}
          <div className="hidden sm:block">
            <div className="sticky top-8">
              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                deliveryCost={deliveryCost}
                tax={tax}
                total={total}
                coupon={coupon}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                applyCoupon={applyCoupon}
                removeCoupon={removeCoupon}
                applyingCoupon={applyingCoupon}
                couponError={couponError}
              />
            </div>
          </div>
        </div>

        {/* Mobile submit */}
        <div className="mt-8 lg:hidden">
          <PrimaryButton onClick={handlePlaceOrder} size="lg" fullWidth loading={placing} leftIcon={placing ? undefined : Lock}>
            {placing ? "Placing your order…" : `Pay ${CURRENCY}${total.toFixed(2)}`}
          </PrimaryButton>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
            <ShieldCheck className="size-3.5 text-gold-500" /> Encrypted and secured by Ventura Payments
          </p>
        </div>
      </div>
    </div>
  );
}

/* — Sub-components — */

function SectionHeader({ step, title, icon: Icon }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-400/12 text-[11px] font-medium text-gold-600 dark:text-gold-300">
        {step}
      </span>
      <h2 className="text-[15px] font-medium text-[var(--text-primary)] flex items-center gap-2">
        {Icon && <Icon className="size-4 text-gold-500" aria-hidden="true" />}
        {title}
      </h2>
    </div>
  );
}

function OptionCard({ selected, onClick, icon: Icon, title, subtitle, trailing }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-[var(--radius-md)] border p-4 text-left transition-all",
        selected
          ? "border-gold-400 bg-gold-400/8 shadow-[0_0_0_3px_rgb(216_179_106_/_0.14)]"
          : "border-[var(--border)] hover:border-gold-400/50"
      )}
    >
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border",
          selected ? "border-gold-400" : "border-[var(--border)]"
        )}
      >
        <span className={cn("size-2.5 rounded-full bg-gold-400 transition-transform", selected ? "scale-100" : "scale-0")} />
      </span>
      {Icon && <Icon className={cn("size-4 shrink-0", selected ? "text-gold-500" : "text-[var(--text-muted)]")} />}
      <span className="flex-1">
        <span className="block text-sm font-medium text-[var(--text-primary)]">{title}</span>
        <span className="block text-xs text-[var(--text-muted)]">{subtitle}</span>
      </span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{trailing}</span>
    </button>
  );
}

function OrderSummary({
  subtotal,
  discount,
  deliveryCost,
  tax,
  total,
  coupon,
  couponInput,
  setCouponInput,
  applyCoupon,
  removeCoupon,
  applyingCoupon,
  couponError,
  className,
}) {
  return (
    <div className={cn("rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm", className)}>
      <h3 className="mb-5 text-[15px] font-medium text-[var(--text-primary)]">Order summary</h3>

      <ul className="flex flex-col gap-4 mb-5">
        {CART_ITEMS.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span
              className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-inset)] text-lg font-semibold text-gold-500/40"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {item.name.charAt(0)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{item.variant} · Qty {item.qty}</p>
            </div>
            <span className="text-sm text-[var(--text-primary)] shrink-0">
              {CURRENCY}{(item.price * item.qty).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      {/* Coupon */}
      <div className="mb-5">
        {coupon ? (
          <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-gold-400/40 bg-gold-400/8 px-3.5 py-2.5">
            <span className="flex items-center gap-2 text-sm text-gold-600 dark:text-gold-300">
              <Tag className="size-4" /> {coupon.code} applied
            </span>
            <button onClick={removeCoupon} aria-label="Remove coupon" className="text-[var(--text-muted)] hover:text-error-500">
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                error={couponError}
                leftIcon={Tag}
              />
            </div>
            <OutlineButton onClick={applyCoupon} disabled={!couponInput.trim() || applyingCoupon}>
              {applyingCoupon ? <LoadingSpinner size="sm" /> : "Apply"}
            </OutlineButton>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="flex flex-col gap-2.5 border-t border-[var(--border)] pt-4 text-sm">
        <Row label="Subtotal" value={`${CURRENCY}${subtotal.toLocaleString()}`} />
        {discount > 0 && (
          <Row label={`Discount (${Math.round(coupon.percent * 100)}%)`} value={`-${CURRENCY}${discount.toFixed(2)}`} valueClass="text-success-600" />
        )}
        <Row label="Delivery" value={deliveryCost === 0 ? "Free" : `${CURRENCY}${deliveryCost.toFixed(2)}`} />
        <Row label="Tax (est.)" value={`${CURRENCY}${tax.toFixed(2)}`} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
        <span className="text-base font-medium text-[var(--text-primary)]">Total</span>
        <span className="text-xl font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
          {CURRENCY}{total.toFixed(2)}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        <Badge variant="gold">Free returns</Badge>
        <Badge variant="neutral">30-day exchange</Badge>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={cn("text-[var(--text-primary)]", valueClass)}>{value}</span>
    </div>
  );
}

function OrderConfirmation({ total, email }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-muted)] px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-soft-lg"
      >
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
          className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-success-500/12"
        >
          <CheckCircle2 className="size-8 text-success-500" />
        </motion.span>
        <h1 className="text-2xl font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
          Order confirmed
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          A confirmation has been sent to <span className="text-[var(--text-primary)]">{email}</span>.
        </p>
        <div className="mt-6 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-3.5 text-sm">
          <span className="text-[var(--text-muted)]">Order number</span>
          <span className="font-medium text-[var(--text-primary)]">VNT-{Math.floor(100000 + Math.random() * 900000)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-3.5 text-sm">
          <span className="text-[var(--text-muted)]">Total paid</span>
          <span className="font-medium text-[var(--text-primary)]">£{total.toFixed(2)}</span>
        </div>
        <div className="mt-7">
          <PrimaryButton href="/orders" fullWidth>
            View order status
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
}
