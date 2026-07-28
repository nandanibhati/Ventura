import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Heart,
  ShoppingBag,
  Bell,
  User,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  CircleDollarSign,
  Sparkles,
  Package,
  Settings,
  LogOut,
  Truck,
  RotateCcw,
  HelpCircle,
  Bot,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { wishlistApi, notificationsApi } from "../../api/orders";
import { settingsApi, categoriesApi } from "../../api/catalog";
import { productsApi } from "../../api/products";
import { resolveMediaUrl, resolveProductImageUrl } from "../../lib/api";

const LANGUAGES = ["English", "Français", "Deutsch", "Español", "日本語"];
const CURRENCIES = ["£", "EUR", "GBP", "JPY", "INR"];

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NavItem({ to, label, accent }) {
  return (
    <NavLink to={to} className="group relative py-2 text-[0.925rem] font-medium">
      {({ isActive }) => (
        <>
          <span
            className={
              accent
                ? "text-rose-600 dark:text-rose-400"
                : isActive
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-600 transition-colors group-hover:text-neutral-900 dark:text-neutral-300 dark:group-hover:text-white"
            }
          >
            {label}
          </span>
          <span
            className={`absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left transition-transform duration-300 ease-out ${
              isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            } ${accent ? "bg-rose-500" : "bg-neutral-900 dark:bg-white"}`}
          />
        </>
      )}
    </NavLink>
  );
}

function IconButton({ icon: Icon, count, onClick, active, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors dark:text-neutral-200 ${
        active ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white"
        >
          {count}
        </motion.span>
      )}
    </button>
  );
}

function UtilityDropdown({ icon: Icon, options, selected, onSelect, isOpen, onToggle }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
      >
        <Icon className="h-3.5 w-3.5" />
        {selected}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-10 mt-2 w-32 rounded-xl border border-black/5 bg-white/95 py-1.5 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                className={`block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-white/5 ${
                  opt === selected ? "font-semibold text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Navbar({ onOpenChatbot }) {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("£");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("Veluntra-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const queryClient = useQueryClient();

  const { data: storeSettings } = useQuery({ queryKey: ["settings", "public"], queryFn: settingsApi.getPublic, staleTime: 5 * 60 * 1000 });
  // Falls back to the store name as text if the logo file is missing (e.g. wiped by a redeploy
  // on hosts with non-persistent disk) instead of showing a broken-image icon.
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = storeSettings?.logoUrl && !logoFailed;

  // Real categories from the store's actual catalog — the nav used to hardcode fashion-retail
  // links (Men/Women/Accessories) and a "Clothing/Footwear" mega-menu that led nowhere (those
  // routes never existed), completely disconnected from whatever this store actually sells.
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list, staleTime: 5 * 60 * 1000 });
  const categoriesWithStock = categories.filter((c) => c.productCount > 0);
  const featuredCategories = categoriesWithStock.filter((c) => c.featured).slice(0, 3);
  const quickNavCategories = (featuredCategories.length ? featuredCategories : categoriesWithStock).slice(0, 3);

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.list,
    enabled: isAuthenticated,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    localStorage.setItem("Veluntra-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Live search-as-you-type: wait for a short pause in typing before hitting the API, so we're
  // not firing a request on every single keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const { data: searchSuggestions = [] } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: () => productsApi.list({ search: debouncedQuery, limit: 6 }).then((r) => r.items),
    enabled: debouncedQuery.length >= 2,
  });

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const goToSuggestedProduct = (id) => {
    navigate(`/product/${id}`);
    setQuery("");
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const toggleMenu = (name) => setOpenMenu((m) => (m === name ? null : name));

  const handleNotificationsOpen = () => {
    toggleMenu("notif");
    if (openMenu !== "notif" && unreadCount > 0) {
      notificationsApi.markAllRead().then(() => queryClient.invalidateQueries({ queryKey: ["notifications"] }));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header ref={navRef} className="sticky top-0 z-50">
      <div
        className={`hidden border-b border-black/5 px-6 text-xs text-neutral-500 transition-all duration-300 dark:border-white/10 dark:text-neutral-400 lg:flex lg:items-center lg:justify-between ${
          scrolled ? "h-0 overflow-hidden opacity-0" : "h-9 opacity-100"
        } bg-white/70 backdrop-blur-xl dark:bg-neutral-950/70`}
      >
        <div className="w-60 shrink-0 overflow-hidden">
          <div className="flex w-max animate-[marquee-ltr_14s_linear_infinite]">
            <p className="flex shrink-0 items-center gap-1.5 whitespace-nowrap pr-12 tracking-wide">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              Complimentary shipping on orders over £150
            </p>
            <p aria-hidden="true" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap pr-12 tracking-wide">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              Complimentary shipping on orders over £150
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-black/10 pr-6 dark:border-white/10">
            <Link to="/orders" className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white">
              <Truck className="h-3.5 w-3.5" /> Track Order
            </Link>
            <button
              type="button"
              onClick={onOpenChatbot}
              className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white"
            >
              <Bot className="h-3.5 w-3.5" /> Veluntra Assistant
            </button>
            <Link to="/orders" className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white">
              <RotateCcw className="h-3.5 w-3.5" /> Returns
            </Link>
            <a
              href={storeSettings?.contactEmail ? `mailto:${storeSettings.contactEmail}` : "/orders"}
              className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white"
            >
              <HelpCircle className="h-3.5 w-3.5" /> Help
            </a>
          </div>
          <UtilityDropdown
            icon={Globe}
            options={LANGUAGES}
            selected={language}
            onSelect={(v) => {
              setLanguage(v);
              setOpenMenu(null);
            }}
            isOpen={openMenu === "lang"}
            onToggle={() => toggleMenu("lang")}
          />
          <UtilityDropdown
            icon={CircleDollarSign}
            options={CURRENCIES}
            selected={currency}
            onSelect={(v) => {
              setCurrency(v);
              setOpenMenu(null);
            }}
            isOpen={openMenu === "currency"}
            onToggle={() => toggleMenu("currency")}
          />
        </div>
      </div>

      <nav
        className={`border-b border-black/5 bg-white/70 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-950/70 ${
          scrolled ? "shadow-sm shadow-black/[0.03]" : ""
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center gap-4 px-6 transition-all duration-300 sm:gap-6 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <Link to="/" className="shrink-0">
            {showLogo ? (
              <img
                src={resolveMediaUrl(storeSettings.logoUrl)}
                alt={storeSettings.storeName || "Store logo"}
                onError={() => setLogoFailed(true)}
                className={`w-auto max-w-[220px] object-contain transition-all duration-300 ${scrolled ? "h-12" : "h-16"}`}
              />
            ) : (
              <span className="text-[1.6rem] font-bold uppercase tracking-[0.15em] text-neutral-900 dark:text-white">
                {storeSettings?.storeName || "Veluntra"}
              </span>
            )}
          </Link>

          <div className="relative hidden max-w-2xl flex-1 md:block">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center rounded-full border border-black/10 bg-black/[0.03] px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
            >
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                aria-label="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpenMenu("search")}
                placeholder="Search products, brands & more..."
                className="w-full bg-transparent px-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus-visible:outline-none dark:text-white"
                autoComplete="off"
              />
              <button type="submit" aria-label="Submit search" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 text-white transition-colors hover:bg-gold-600">
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            {openMenu === "search" && debouncedQuery.length >= 2 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-black/5 bg-white p-2 shadow-xl shadow-black/10 dark:border-white/10 dark:bg-neutral-900">
                {searchSuggestions.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-neutral-400">No products match "{debouncedQuery}"</p>
                ) : (
                  <>
                    {searchSuggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => goToSuggestedProduct(p.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--surface-inset)]">
                          {p.images?.[0]?.url ? (
                            <img src={resolveProductImageUrl(p.images[0].url)} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Search className="h-4 w-4 text-neutral-300" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-neutral-900 dark:text-white">{p.name}</span>
                          <span className="text-xs text-neutral-400">£{Number(p.price).toFixed(2)}</span>
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="mt-1 w-full rounded-xl px-3 py-2 text-center text-sm font-medium text-gold-600 transition-colors hover:bg-black/5 dark:text-gold-400 dark:hover:bg-white/10"
                    >
                      See all results for "{debouncedQuery}"
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10 md:hidden"
            >
              <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
            </button>

            <button
              onClick={() => setIsDark((d) => !d)}
              aria-label="Toggle dark mode"
              className="hidden h-10 w-10 items-center justify-center overflow-hidden rounded-full text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10 sm:flex"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <div className="hidden sm:block">
              <IconButton icon={Heart} count={wishlist.length} label="Wishlist" onClick={() => navigate("/wishlist")} />
            </div>

            <IconButton
              icon={ShoppingBag}
              count={itemCount}
              label="Cart"
              onClick={() => navigate("/cart")}
            />

            <div className="relative hidden sm:block">
              <IconButton
                icon={Bell}
                count={unreadCount}
                label="Notifications"
                active={openMenu === "notif"}
                onClick={handleNotificationsOpen}
              />
              <AnimatePresence>
                {openMenu === "notif" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-black/5 bg-white/95 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/95"
                  >
                    <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Notifications</h4>
                      <span className="text-xs text-neutral-400">{notifications.length} total</span>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-neutral-400">You're all caught up.</p>
                    ) : (
                      <ul className="max-h-80 overflow-y-auto py-1">
                        {notifications.slice(0, 8).map((n) => (
                          <li
                            key={n.id}
                            className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/5"
                          >
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{n.title}</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{n.body}</span>
                            <span className="mt-0.5 text-[11px] text-neutral-400">{timeAgo(n.createdAt)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => toggleMenu("profile")}
                  aria-label="Account"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    openMenu === "profile"
                      ? "border-neutral-900 dark:border-white"
                      : "border-black/10 hover:border-neutral-400 dark:border-white/15 dark:hover:border-white/40"
                  }`}
                >
                  <User className="h-[1.05rem] w-[1.05rem] text-neutral-700 dark:text-neutral-200" strokeWidth={1.75} />
                </button>
                <AnimatePresence>
                  {openMenu === "profile" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-black/5 bg-white/95 py-2 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/95"
                    >
                      <div className="border-b border-black/5 px-4 py-3 dark:border-white/10">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.email}</p>
                      </div>
                      {[
                        { icon: User, label: "My Profile", to: "/account" },
                        { icon: Package, label: "Orders", to: "/orders" },
                        { icon: Heart, label: "Wishlist", to: "/wishlist" },
                        ...(user?.role === "admin" || user?.role === "superadmin"
                          ? [{ icon: Settings, label: "Admin Dashboard", to: "/admin" }]
                          : []),
                        ...(user?.role === "seller" ||
                        user?.role === "dropshipper" ||
                        user?.role === "admin" ||
                        user?.role === "superadmin"
                          ? [{ icon: Settings, label: "Seller Dashboard", to: "/seller/dashboard" }]
                          : []),
                      ].map(({ icon: Icon, label, to }) => (
                        <Link
                          key={label}
                          to={to}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-black/[0.03] hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-white"
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                          {label}
                        </Link>
                      ))}
                      <div className="mt-1 border-t border-black/5 pt-1 dark:border-white/10">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        >
                          <LogOut className="h-4 w-4" strokeWidth={1.75} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="hidden border-t border-black/5 dark:border-white/10 lg:block">
          <div className="mx-auto flex h-12 max-w-7xl items-center gap-9 px-6">
            <NavItem to="/shop?isNew=true" label="New Arrivals" />

            <div
              className="relative"
              onMouseEnter={() => setOpenMenu("mega")}
              onMouseLeave={() => setOpenMenu((m) => (m === "mega" ? null : m))}
            >
              <button className="relative flex items-center gap-1 py-2 text-[0.925rem] font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
                Categories
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    openMenu === "mega" ? "rotate-180" : ""
                  }`}
                />
                <span
                  className={`absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left bg-neutral-900 transition-transform duration-300 dark:bg-white ${
                    openMenu === "mega" ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>

              <AnimatePresence>
                {openMenu === "mega" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    // Anchored to the trigger's left edge, not centered on it — the button sits
                    // near the left of the nav, so a centered 900px panel overflowed off the left
                    // edge of the viewport on anything narrower than ~1400px.
                    className="absolute left-0 top-full z-20 mt-3 w-[min(92vw,900px)] rounded-2xl border border-black/5 bg-white p-8 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-neutral-900"
                  >
                    {/* flex, not grid — a grid-cols-2/xl:grid-cols-4 combo jumped between two very
                        different layouts right at the xl breakpoint (full-width categories below
                        1280px, 3/4-width above it), which read as the promo card overlapping/
                        crowding the category grid at in-between widths. Flex-basis scales the two
                        panels smoothly at every width instead of snapping between two layouts. */}
                    <div className="flex flex-col gap-8 md:flex-row">
                      <div className="md:flex-[3]">
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          Shop by category
                        </h4>
                        {categoriesWithStock.length === 0 ? (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">No categories yet.</p>
                        ) : (
                          <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                            {categoriesWithStock.map((cat) => (
                              <li key={cat.id}>
                                <Link
                                  to={`/shop?category=${cat.slug}`}
                                  onClick={() => setOpenMenu(null)}
                                  className="group flex flex-col items-center gap-2 text-center"
                                >
                                  <span className="block size-16 overflow-hidden rounded-full border border-black/5 bg-neutral-100 transition-transform duration-300 group-hover:scale-105 dark:border-white/10 dark:bg-white/5">
                                    {cat.imageUrl && (
                                      <img
                                        src={resolveMediaUrl(cat.imageUrl)}
                                        alt=""
                                        className="size-full object-cover"
                                      />
                                    )}
                                  </span>
                                  <span className="text-xs font-medium text-neutral-600 transition-colors group-hover:text-neutral-900 dark:text-neutral-300 dark:group-hover:text-white">
                                    {cat.name}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 p-6 dark:from-white/10 dark:to-white/5 md:w-64 md:flex-1 md:shrink-0">
                        <span className="text-xs uppercase tracking-wider text-white/60">Limited Time</span>
                        <h5 className="mt-1 text-lg font-semibold text-white">Current Deals</h5>
                        <p className="mt-1 text-sm text-white/70">Save on selected items, while stock lasts</p>
                        <Link
                          to="/shop?sale=true"
                          onClick={() => setOpenMenu(null)}
                          className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-medium text-white underline underline-offset-4"
                        >
                          Shop Sale
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {quickNavCategories.map((cat) => (
              <NavItem key={cat.id} to={`/shop?category=${cat.slug}`} label={cat.name} />
            ))}
            <NavItem to="/shop?sale=true" label="Sale" accent />
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl dark:bg-neutral-950 lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/10">
                {showLogo ? (
                  <img
                    src={resolveMediaUrl(storeSettings.logoUrl)}
                    alt={storeSettings.storeName || "Store logo"}
                    onError={() => setLogoFailed(true)}
                    className="h-10 w-auto max-w-[180px] object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold uppercase tracking-[0.15em] text-neutral-900 dark:text-white">
                    {storeSettings?.storeName || "Veluntra"}
                  </span>
                )}
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="mx-5 mt-4 flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-2.5 dark:border-white/10 dark:bg-white/5"
              >
                <Search className="h-4 w-4 shrink-0 text-neutral-400" />
                <input
                  aria-label="Search products"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 dark:text-white"
                />
              </form>

              <nav className="mt-2 flex flex-col px-2">
                <NavLink
                  to="/shop?isNew=true"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3.5 py-3 text-[0.95rem] font-medium text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                >
                  New Arrivals
                </NavLink>
                {quickNavCategories.map((cat) => (
                  <NavLink
                    key={cat.id}
                    to={`/shop?category=${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3.5 py-3 text-[0.95rem] font-medium text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                  >
                    {cat.name}
                  </NavLink>
                ))}
                <NavLink
                  to="/shop?sale=true"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3.5 py-3 text-[0.95rem] font-medium text-rose-600 dark:text-rose-400"
                >
                  Sale
                </NavLink>

                <button
                  onClick={() => setMobileCategoriesOpen((v) => !v)}
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[0.95rem] font-medium text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                >
                  Categories
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      mobileCategoriesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {mobileCategoriesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-4"
                    >
                      {categoriesWithStock.length === 0 ? (
                        <p className="px-3.5 py-2 text-sm text-neutral-500 dark:text-neutral-400">No categories yet.</p>
                      ) : (
                        categoriesWithStock.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/shop?category=${cat.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="block rounded-xl px-3.5 py-2 text-sm text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            {cat.name}
                          </Link>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </nav>

              <div className="mt-2 grid grid-cols-2 gap-2 px-5">
                <Link
                  to="/wishlist"
                  className="flex items-center gap-2 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium text-neutral-700 dark:border-white/10 dark:text-neutral-200"
                >
                  <Heart className="h-4 w-4" /> Wishlist
                </Link>
                {isAuthenticated ? (
                  <Link
                    to="/account"
                    className="flex items-center gap-2 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium text-neutral-700 dark:border-white/10 dark:text-neutral-200"
                  >
                    <User className="h-4 w-4" /> Account
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium text-neutral-700 dark:border-white/10 dark:text-neutral-200"
                  >
                    <User className="h-4 w-4" /> Sign in
                  </Link>
                )}
              </div>
              {isAuthenticated && (
                <div className="mt-2 px-5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm font-medium text-rose-600 dark:border-white/10"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-black/5 px-5 py-4 dark:border-white/10">
                <button
                  onClick={() => setIsDark((d) => !d)}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <UtilityDropdown
                    icon={Globe}
                    options={LANGUAGES}
                    selected={language}
                    onSelect={setLanguage}
                    isOpen={openMenu === "mLang"}
                    onToggle={() => toggleMenu("mLang")}
                  />
                  <UtilityDropdown
                    icon={CircleDollarSign}
                    options={CURRENCIES}
                    selected={currency}
                    onSelect={setCurrency}
                    isOpen={openMenu === "mCurrency"}
                    onToggle={() => toggleMenu("mCurrency")}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
