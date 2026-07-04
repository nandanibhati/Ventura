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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { wishlistApi, notificationsApi } from "../../api/orders";

const NAV_LINKS = [
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Men", to: "/men" },
  { label: "Women", to: "/women" },
  { label: "Accessories", to: "/accessories" },
  { label: "Sale", to: "/sale", accent: true },
];

const MEGA_MENU = {
  columns: [
    { title: "Clothing", items: ["T-Shirts", "Hoodies", "Jackets", "Denim", "Activewear"] },
    { title: "Footwear", items: ["Sneakers", "Boots", "Sandals", "Formal", "Sports"] },
    { title: "Accessories", items: ["Bags", "Watches", "Sunglasses", "Belts", "Jewelry"] },
  ],
  promo: {
    title: "Autumn Collection",
    subtitle: "Up to 40% off new season essentials",
    cta: "Shop Now",
  },
};

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

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
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
    setSearchOpen(false);
  }

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    setSearchOpen(false);
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
        <p className="flex items-center gap-1.5 tracking-wide">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Complimentary shipping on orders over $150
        </p>
        <div className="flex items-center gap-6">
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
          className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <Link to="/" className="shrink-0">
            <span className="text-[1.6rem] font-bold uppercase tracking-[0.15em] text-neutral-900 dark:text-white">
              Veluntra
            </span>
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            <NavItem to="/new-arrivals" label="New Arrivals" />

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
                    className="absolute left-1/2 top-full mt-3 w-[min(92vw,900px)] -translate-x-1/2 rounded-2xl border border-black/5 bg-white/95 p-8 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/95"
                  >
                    <div className="grid grid-cols-2 gap-8 xl:grid-cols-4">
                      {MEGA_MENU.columns.map((col) => (
                        <div key={col.title}>
                          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                            {col.title}
                          </h4>
                          <ul className="space-y-3">
                            {col.items.map((item) => (
                              <li key={item}>
                                <Link
                                  to="/categories"
                                  className="group flex items-center gap-1 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                                >
                                  {item}
                                  <ChevronRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 p-6 dark:from-white/10 dark:to-white/5">
                        <span className="text-xs uppercase tracking-wider text-white/60">Limited Edition</span>
                        <h5 className="mt-1 text-lg font-semibold text-white">{MEGA_MENU.promo.title}</h5>
                        <p className="mt-1 text-sm text-white/70">{MEGA_MENU.promo.subtitle}</p>
                        <Link
                          to="/sale"
                          className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-medium text-white underline underline-offset-4"
                        >
                          {MEGA_MENU.promo.cta}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavItem to="/men" label="Men" />
            <NavItem to="/women" label="Women" />
            <NavItem to="/accessories" label="Accessories" />
            <NavItem to="/sale" label="Sale" accent />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:flex">
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.form
                    key="search-open"
                    onSubmit={handleSearchSubmit}
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative flex items-center overflow-hidden rounded-full border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/5"
                  >
                    <Search className="ml-3 h-4 w-4 shrink-0 text-neutral-400" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onBlur={() => !query && setSearchOpen(false)}
                      placeholder="Search products..."
                      className="w-full bg-transparent px-2.5 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none dark:text-white"
                    />
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-closed"
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                  >
                    <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

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
                        ...(user?.role === "admin" ? [{ icon: Settings, label: "Admin Dashboard", to: "/admin" }] : []),
                        ...(user?.role === "seller"
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
                <span className="text-xl font-bold uppercase tracking-[0.15em] text-neutral-900 dark:text-white">
                  Veluntra
                </span>
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none dark:text-white"
                />
              </form>

              <nav className="mt-2 flex flex-col px-2">
                {NAV_LINKS.map(({ label, to, accent }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `rounded-xl px-3.5 py-3 text-[0.95rem] font-medium transition-colors ${
                        accent
                          ? "text-rose-600 dark:text-rose-400"
                          : isActive
                          ? "bg-black/5 text-neutral-900 dark:bg-white/10 dark:text-white"
                          : "text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}

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
                      {MEGA_MENU.columns.flatMap((col) => col.items).map((item) => (
                        <Link
                          key={item}
                          to="/categories"
                          className="block rounded-xl px-3.5 py-2 text-sm text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          {item}
                        </Link>
                      ))}
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
