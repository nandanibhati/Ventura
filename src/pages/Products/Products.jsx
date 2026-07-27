import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Search, ChevronDown, LayoutGrid, List, SlidersHorizontal, Check, X } from "lucide-react";
import { categoriesApi, brandsApi } from "../../api/catalog";
import { productsApi } from "../../api/products";
import { wishlistApi } from "../../api/orders";
import { resolveProductImageUrl } from "../../lib/api";
import ProductCard from "../../components/ui/Cards/ProductCard";
import { Checkbox } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Navigation";
import { Drawer } from "../../components/ui/Overlay";
import { OutlineButton, PrimaryButton } from "../../components/ui/Button";
import { EmptyState, ErrorState } from "../../components/ui/Feedback";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

/* -----------------------------------------------------------
   Veluntra — Products
   Filterable, sortable catalogue — same light marketplace look as Home.
   ----------------------------------------------------------- */

const MAX_PRICE = 1500;
const PAGE_SIZE = 9;

function toCardProduct(p) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand?.name || "",
    brandSlug: p.brand?.slug || "",
    category: p.category?.name || "",
    categorySlug: p.category?.slug || "",
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    rating: Number(p.ratingAvg) || 0,
    reviews: p.ratingCount || 0,
    isNew: Boolean(p.isNew),
    isTrending: Boolean(p.isTrending),
    isBestSeller: Boolean(p.isBestSeller),
    badge: p.badge,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    animationOverride: p.animationOverride,
    specifications: p.specifications || [],
    condition: p.condition || null,
    image: resolveProductImageUrl(p.images?.[0]?.url) || null,
  };
}

/** Collapsible filter group — shared shell for Category/Brand/Condition/spec facets. */
function FilterGroup({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-black/5 py-4 last:border-b-0 dark:border-white/10">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-neutral-900 dark:text-white"
      >
        {title}
        <ChevronDown className={`size-3.5 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3 flex flex-col gap-2.5">{children}</div>}
    </div>
  );
}

function CheckRow({ label, count, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2">
      <Checkbox checked={checked} onChange={onChange} label={<span className="max-w-[13rem] truncate text-sm text-neutral-700 dark:text-neutral-300">{label}</span>} />
      {count != null && <span className="text-xs text-neutral-400">{count}</span>}
    </label>
  );
}

export default function Products() {
  useDocumentTitle("Shop");
  const [search, setSearch] = useState("");
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [price, setPrice] = useState([0, MAX_PRICE]);
  const [minRating, setMinRating] = useState(0);
  const [isNewOnly, setIsNewOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ category: true, brand: true, price: true, rating: true });
  const [specFilters, setSpecFilters] = useState({});
  const [openSpecSections, setOpenSpecSections] = useState({});
  const [conditions, setConditions] = useState([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sync filters from links elsewhere in the app (navbar search, category mega-menu,
  // "New Arrivals" / "Sale" nav items) — re-applies whenever the URL's query changes, so
  // clicking a different navbar link while already on /shop updates the filters too.
  useEffect(() => {
    // Each param is authoritative, not just additive — when it's absent from the URL the
    // corresponding filter must clear too, otherwise e.g. clicking a plain category link after
    // "New Arrivals" leaves isNewOnly stuck true from the previous in-app navigation.
    setSearch(searchParams.get("search") || "");
    const category = searchParams.get("category");
    setCats(category ? [category] : []);
    const brand = searchParams.get("brand");
    setBrands(brand ? [brand] : []);
    setIsNewOnly(searchParams.get("isNew") === "true");
    setSaleOnly(searchParams.get("sale") === "true");
  }, [searchParams]);

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const { data: brandsList = [] } = useQuery({ queryKey: ["brands"], queryFn: brandsApi.list });

  const {
    data: productsResult,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products", { search, price, minRating, sortBy }],
    queryFn: () =>
      productsApi.list({
        search: search || undefined,
        minPrice: price[0] > 0 ? price[0] : undefined,
        maxPrice: price[1] < MAX_PRICE ? price[1] : undefined,
        minRating: minRating || undefined,
        sort: sortBy,
        limit: 60,
      }),
  });

  const allProducts = useMemo(() => (productsResult?.items || []).map(toCardProduct), [productsResult]);

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.list,
    enabled: isAuthenticated,
  });
  const wishedIds = useMemo(() => new Set(wishlistItems.map((w) => w.product.id)), [wishlistItems]);

  const wishlistAddMutation = useMutation({
    mutationFn: (productId) => wishlistApi.add(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });
  const wishlistRemoveMutation = useMutation({
    mutationFn: (productId) => wishlistApi.remove(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const toggleWish = (productId) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/shop" } } });
      return;
    }
    if (wishedIds.has(productId)) wishlistRemoveMutation.mutate(productId);
    else wishlistAddMutation.mutate(productId);
  };

  const handleAddToBag = async (productId) => {
    try {
      await addItem({ productId, quantity: 1 });
      toast({ title: "Added to bag", variant: "success" });
    } catch (err) {
      toast({ title: err.response?.data?.error?.message || "Couldn't add to bag", variant: "error" });
    }
  };

  const toggleSection = (key) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  const toggleSpecSection = (label) => setOpenSpecSections((s) => ({ ...s, [label]: !s[label] }));
  const toggleIn = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  const toggleSpecValue = (label, value) => {
    setSpecFilters((prev) => {
      const current = prev[label] || [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      const updated = { ...prev, [label]: next };
      if (next.length === 0) delete updated[label];
      return updated;
    });
  };

  // Category/brand are multi-select in this UI, which the backend's single-value filters don't
  // support directly — so those two are applied client-side over the (search/price/rating-filtered,
  // server-sorted) batch above. Fine for a catalogue of this size; would need a backend `categories[]`
  // param to scale past a few hundred products.
  const specFacetSource = useMemo(() => {
    return allProducts.filter((p) => {
      if (cats.length && !cats.includes(p.categorySlug)) return false;
      if (brands.length && !brands.includes(p.brandSlug)) return false;
      if (conditions.length && !conditions.includes(p.condition)) return false;
      if (isNewOnly && !p.isNew) return false;
      if (saleOnly && !p.oldPrice) return false;
      return true;
    });
  }, [allProducts, cats, brands, conditions, isNewOnly, saleOnly]);

  const conditionFacets = useMemo(() => {
    const counts = new Map();
    specFacetSource.forEach((p) => {
      if (!p.condition) return;
      counts.set(p.condition, (counts.get(p.condition) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([value, count]) => ({ value, count }));
  }, [specFacetSource]);

  // Spec-value filters (Storage Capacity, Colour, RAM, etc.) are derived from whatever
  // specifications sellers have actually entered on the currently category/brand-narrowed
  // products, so the sidebar never shows fields that don't apply to what's in view.
  const specFacets = useMemo(() => {
    const map = new Map();
    specFacetSource.forEach((p) => {
      (p.specifications || []).forEach((s) => {
        if (!s?.label || !s?.value) return;
        if (!map.has(s.label)) map.set(s.label, new Map());
        const valMap = map.get(s.label);
        valMap.set(s.value, (valMap.get(s.value) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([label, valMap]) => ({
        label,
        values: Array.from(valMap.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => a.value.localeCompare(b.value)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [specFacetSource]);

  const filtered = useMemo(() => {
    const specEntries = Object.entries(specFilters);
    if (!specEntries.length) return specFacetSource;
    return specFacetSource.filter((p) =>
      specEntries.every(([label, values]) => (p.specifications || []).some((s) => s.label === label && values.includes(s.value)))
    );
  }, [specFacetSource, specFilters]);

  useEffect(() => { setPage(1); }, [search, cats, brands, conditions, isNewOnly, saleOnly, price, minRating, sortBy, specFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearAll = () => {
    setSearch("");
    setCats([]);
    setBrands([]);
    setPrice([0, MAX_PRICE]);
    setMinRating(0);
    setIsNewOnly(false);
    setSaleOnly(false);
    setSpecFilters({});
    setConditions([]);
  };

  const catLabel = (slug) => categories.find((c) => c.slug === slug)?.name || slug;
  const brandLabel = (slug) => brandsList.find((b) => b.slug === slug)?.name || slug;

  const activeChips = [
    ...cats.map((c) => ({ key: `c-${c}`, label: catLabel(c), clear: () => toggleIn(cats, setCats, c) })),
    ...brands.map((b) => ({ key: `b-${b}`, label: brandLabel(b), clear: () => toggleIn(brands, setBrands, b) })),
    ...(isNewOnly ? [{ key: "new", label: "New arrivals", clear: () => setIsNewOnly(false) }] : []),
    ...(saleOnly ? [{ key: "sale", label: "On sale", clear: () => setSaleOnly(false) }] : []),
    ...(minRating ? [{ key: "r", label: `${minRating}+ & up`, clear: () => setMinRating(0) }] : []),
    ...(price[0] > 0 || price[1] < MAX_PRICE ? [{ key: "p", label: `£${price[0]} - £${price[1]}`, clear: () => setPrice([0, MAX_PRICE]) }] : []),
    ...Object.entries(specFilters).flatMap(([label, values]) =>
      values.map((v) => ({ key: `s-${label}-${v}`, label: `${label}: ${v}`, clear: () => toggleSpecValue(label, v) }))
    ),
    ...conditions.map((c) => ({ key: `cond-${c}`, label: c, clear: () => toggleIn(conditions, setConditions, c) })),
  ];

  const FiltersContent = () => (
    <>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">Filters</h3>
        <button onClick={clearAll} className="text-xs font-medium text-gold-600 hover:underline dark:text-gold-400">
          Clear all
        </button>
      </div>

      {/* No Category/Brand checkbox filters here on purpose — the navbar's Categories menu and
          product-page breadcrumb links already cover browsing by category/brand (via
          ?category=/?brand= URL params, which this page still reads and filters by), so a
          duplicate checkbox list here was redundant. */}

      {conditionFacets.length > 0 && (
        <FilterGroup title="Condition" open={openSections.condition} onToggle={() => toggleSection("condition")}>
          {conditionFacets.map(({ value, count }) => (
            <CheckRow key={value} label={value} count={count} checked={conditions.includes(value)} onChange={() => toggleIn(conditions, setConditions, value)} />
          ))}
        </FilterGroup>
      )}

      {specFacets.map((facet) => (
        <FilterGroup key={facet.label} title={facet.label} open={!!openSpecSections[facet.label]} onToggle={() => toggleSpecSection(facet.label)}>
          {facet.values.map(({ value, count }) => (
            <CheckRow
              key={value}
              label={value}
              count={count}
              checked={(specFilters[facet.label] || []).includes(value)}
              onChange={() => toggleSpecValue(facet.label, value)}
            />
          ))}
        </FilterGroup>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <style>{`.vp-range::-webkit-slider-thumb { pointer-events: auto; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; border: 2px solid var(--color-gold-400, #d8b36a); box-shadow: 0 1px 3px rgba(0,0,0,0.25); cursor: pointer; margin-top: 2px; } .vp-range::-moz-range-thumb { pointer-events: auto; width: 16px; height: 16px; border-radius: 50%; background: white; border: 2px solid var(--color-gold-400, #d8b36a); box-shadow: 0 1px 3px rgba(0,0,0,0.25); cursor: pointer; } .vp-range::-webkit-slider-runnable-track, .vp-range::-moz-range-track { background: transparent; }`}</style>

      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-3xl">All Products</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
            Quality electronics and everyday essentials, curated for performance, durability, and design.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3 border-y border-black/5 py-4 dark:border-white/10">
          <OutlineButton size="sm" leftIcon={SlidersHorizontal} className="lg:hidden" onClick={() => setDrawerOpen(true)}>
            Filters
          </OutlineButton>

          <div className="flex h-11 min-w-[220px] flex-1 items-center gap-2.5 rounded-full border border-black/10 bg-white px-4 dark:border-white/15 dark:bg-neutral-900">
            <Search className="size-4 shrink-0 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products or brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
              className="w-full min-w-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
              className="h-11 appearance-none rounded-full border border-black/10 bg-white pl-4 pr-9 text-sm text-neutral-900 outline-none dark:border-white/15 dark:bg-neutral-900 dark:text-white"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
          </div>

          <div className="flex overflow-hidden rounded-full border border-black/10 dark:border-white/15" role="group" aria-label="Layout view">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`grid size-11 place-items-center transition-colors ${view === "grid" ? "bg-gold-400 text-white" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"}`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`grid size-11 place-items-center border-l border-black/10 transition-colors dark:border-white/15 ${view === "list" ? "bg-gold-400 text-white" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"}`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <FiltersContent />
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Showing{" "}
                <span className="font-medium text-neutral-900 dark:text-white">
                  {pageItems.length ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of <span className="font-medium text-neutral-900 dark:text-white">{filtered.length}</span> products
              </p>
              {activeChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="flex items-center gap-1.5 rounded-full border border-black/10 bg-neutral-50 py-1.5 pl-3 pr-2 text-xs text-neutral-700 dark:border-white/15 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {chip.label}
                      <button onClick={chip.clear} aria-label={`Remove ${chip.label}`} className="text-neutral-400 hover:text-gold-500">
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {productsLoading ? (
              <div className="py-24 text-center text-sm text-neutral-400">Loading products…</div>
            ) : productsError ? (
              <ErrorState description="We couldn't load the catalogue." onRetry={() => refetchProducts()} />
            ) : pageItems.length === 0 ? (
              <EmptyState title="No products match your filters" description="Try widening your price range or clearing a filter." />
            ) : (
              <div className={view === "list" ? "flex flex-col gap-4" : "grid grid-cols-2 gap-4 sm:grid-cols-3"}>
                {pageItems.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    image={p.image}
                    index={i}
                    wished={wishedIds.has(p.id)}
                    onWishlistToggle={() => toggleWish(p.id)}
                    onAdd={() => handleAddToBag(p.id)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-12" />}
          </div>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="left"
        title="Filters"
        footer={
          <PrimaryButton className="w-full" onClick={() => setDrawerOpen(false)}>
            Show {filtered.length} results
          </PrimaryButton>
        }
      >
        <FiltersContent />
      </Drawer>
    </div>
  );
}
