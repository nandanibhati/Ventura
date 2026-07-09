import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { sellerApi } from "../../api/seller";
import { productsApi } from "../../api/products";
import { categoriesApi, brandsApi } from "../../api/catalog";
import { uploadsApi } from "../../api/products";
import { resolveMediaUrl } from "../../lib/api";
import { useToast } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Store,
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  DollarSign,
  ShoppingBag,
  Percent,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Crown,
  UserPlus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Plus,
  History,
  X,
} from "lucide-react";
import { PrimaryButton, SecondaryButton, OutlineButton, IconButton } from "../../components/ui/Button";
import { Input, Select, Checkbox } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/Feedback";
import { Modal, Drawer, Dropdown } from "../../components/ui/Overlay";
import { Pagination } from "../../components/ui/Navigation";

const CHART_TOKENS = {
  light: {
    surface: "#fcfcfb",
    primary: "#0b0b0b",
    secondary: "#52514e",
    muted: "#898781",
    grid: "#e1e0d9",
    axis: "#c3c2b7",
    border: "rgba(11,11,11,0.10)",
    blue: "#2a78d6",
  },
  dark: {
    surface: "#1a1a19",
    primary: "#ffffff",
    secondary: "#c3c2b7",
    muted: "#898781",
    grid: "#2c2c2a",
    axis: "#383835",
    border: "rgba(255,255,255,0.10)",
    blue: "#3987e5",
  },
};

const CATEGORY_COLORS = {
  light: { Audio: "#2a78d6", Computing: "#1baf7a", Wearables: "#eda100", "Smart Home": "#008300", "Home & Kitchen": "#4a3aa7" },
  dark: { Audio: "#3987e5", Computing: "#199e70", Wearables: "#c98500", "Smart Home": "#008300", "Home & Kitchen": "#9085e9" },
};

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "customers", label: "Customers", icon: Users },
];

const RANGE_OPTIONS = [
  { id: "day", label: "Daily" },
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
];

const ORDER_STATUS_CONFIG = {
  pending: { color: "#52514e", bg: "rgba(82,81,78,0.08)", icon: Clock, label: "Pending" },
  processing: { color: "#fab219", bg: "rgba(250,178,25,0.14)", icon: Clock, label: "Processing" },
  shipped: { color: "#2a78d6", bg: "rgba(42,120,214,0.1)", icon: Package, label: "Shipped" },
  delivered: { color: "#0ca30c", bg: "rgba(12,163,12,0.1)", icon: CheckCircle2, label: "Delivered" },
  cancelled: { color: "#d03b3b", bg: "rgba(208,59,59,0.1)", icon: XCircle, label: "Cancelled" },
  return_requested: { color: "#fab219", bg: "rgba(250,178,25,0.14)", icon: AlertTriangle, label: "Return requested" },
  returned: { color: "#d03b3b", bg: "rgba(208,59,59,0.1)", icon: XCircle, label: "Returned" },
  exchange_requested: { color: "#fab219", bg: "rgba(250,178,25,0.14)", icon: AlertTriangle, label: "Exchange requested" },
  exchanged: { color: "#2a78d6", bg: "rgba(42,120,214,0.1)", icon: CheckCircle2, label: "Exchanged" },
};
const ORDER_STATUSES = Object.keys(ORDER_STATUS_CONFIG);
const PRODUCT_STATUSES = ["draft", "published", "archived", "hidden", "upcoming", "discontinued"];
const PAGE_SIZE = 10;

const STOCK_STATUS_CONFIG = {
  in: { label: "In Stock", color: "#0ca30c", bg: "rgba(12,163,12,0.1)", icon: CheckCircle2 },
  low: { label: "Low Stock", color: "#fab219", bg: "rgba(250,178,25,0.14)", icon: AlertTriangle },
  out: { label: "Out of Stock", color: "#d03b3b", bg: "rgba(208,59,59,0.1)", icon: XCircle },
};

function average(list, key) {
  return list.reduce((sum, item) => sum + Number(item[key] || 0), 0) / (list.length || 1);
}

/** Trend deltas (this period's second half vs first half) computed from the real revenue-trend series. */
function summarizeTrend(data) {
  if (!data.length) return { revenueDelta: 0, ordersDelta: 0 };
  const mid = Math.max(1, Math.floor(data.length / 2));
  const firstHalf = data.slice(0, mid);
  const secondHalf = data.slice(mid);
  const firstRevenue = average(firstHalf, "revenue");
  const firstOrders = average(firstHalf, "orders");
  const revenueDelta = firstRevenue ? ((average(secondHalf, "revenue") - firstRevenue) / firstRevenue) * 100 : 0;
  const ordersDelta = firstOrders ? ((average(secondHalf, "orders") - firstOrders) / firstOrders) * 100 : 0;
  return { revenueDelta, ordersDelta };
}

function stockStatus(stock) {
  if (stock === 0) return "out";
  if (stock <= 10) return "low";
  return "in";
}

function formatCurrency(value) {
  return `£${Math.round(value).toLocaleString()}`;
}

function formatCompact(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

function ChartTooltip({ active, payload, label, tokens, valuePrefix = "", valueSuffix = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 shadow-lg"
      style={{ background: tokens.surface, borderColor: tokens.border }}
    >
      <p className="text-xs" style={{ color: tokens.secondary }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="mt-0.5 flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="text-sm font-semibold" style={{ color: tokens.primary }}>
            {valuePrefix}
            {Number(entry.value).toLocaleString()}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ data, dataKey, color }) {
  const gradientId = `spark-${dataKey}`;
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, delta, sparkData, sparkKey, color }) {
  const isPositive = delta >= 0;
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-400/10">
          <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
        </div>
        {sparkData && <Sparkline data={sparkData} dataKey={sparkKey} color={color} />}
      </div>
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <span className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</span>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
          }`}
        >
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function Pill({ config }) {
  const Icon = config.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <Icon className="h-3 w-3" /> {config.label}
    </span>
  );
}

function StockMeter({ stock, max = 60 }) {
  const percent = Math.min(100, (stock / max) * 100);
  const status = stockStatus(stock);
  const fillColor = STOCK_STATUS_CONFIG[status].color;
  const trackColor = status === "out" ? "rgba(208,59,59,0.15)" : status === "low" ? "rgba(250,178,25,0.15)" : "rgba(12,163,12,0.15)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ backgroundColor: trackColor }}>
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: fillColor }} />
      </div>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{stock} left</span>
    </div>
  );
}

function SegmentBadge({ segment }) {
  if (segment === "VIP") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
        <Crown className="h-3 w-3" /> VIP
      </span>
    );
  }
  if (segment === "Returning") {
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
        Returning
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
      <UserPlus className="h-3 w-3" /> New
    </span>
  );
}

function RevenueChart({ data, tokens, range, onRangeChange }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Revenue</h3>
          <p className="text-xs text-neutral-400">Gross revenue over time</p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-black/10 p-1 dark:border-white/15">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onRangeChange(opt.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                range === opt.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tokens.blue} stopOpacity={0.22} />
                <stop offset="100%" stopColor={tokens.blue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={tokens.grid} />
            <XAxis
              dataKey="label"
              tick={{ fill: tokens.muted, fontSize: 11 }}
              axisLine={{ stroke: tokens.axis }}
              tickLine={false}
              interval={Math.max(0, Math.floor(data.length / 6) - 1)}
            />
            <YAxis
              tick={{ fill: tokens.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `£${formatCompact(v)}`}
              width={48}
            />
            <Tooltip content={<ChartTooltip tokens={tokens} valuePrefix="£" />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={tokens.blue}
              strokeWidth={2}
              fill="url(#revenue-fill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: tokens.surface }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OrdersChart({ data, tokens }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
      <h3 className="text-base font-bold text-neutral-900 dark:text-white">Orders</h3>
      <p className="text-xs text-neutral-400">Orders placed per day</p>
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={tokens.grid} />
            <XAxis
              dataKey="label"
              tick={{ fill: tokens.muted, fontSize: 11 }}
              axisLine={{ stroke: tokens.axis }}
              tickLine={false}
              interval={Math.max(0, Math.floor(data.length / 6) - 1)}
            />
            <YAxis tick={{ fill: tokens.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip content={<ChartTooltip tokens={tokens} valueSuffix=" orders" />} cursor={{ fill: tokens.grid, opacity: 0.5 }} />
            <Bar dataKey="orders" fill={tokens.blue} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CategorySalesChart({ data, tokens, categoryColors }) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
      <h3 className="text-base font-bold text-neutral-900 dark:text-white">Sales by Category</h3>
      <p className="text-xs text-neutral-400">Revenue share across categories</p>
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 48, bottom: 0, left: 8 }}>
            <CartesianGrid horizontal={false} stroke={tokens.grid} />
            <XAxis
              type="number"
              tick={{ fill: tokens.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `£${formatCompact(v)}`}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fill: tokens.primary, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip content={<ChartTooltip tokens={tokens} valuePrefix="£" />} cursor={{ fill: tokens.grid, opacity: 0.4 }} />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {sorted.map((entry) => (
                <Cell key={entry.category} fill={categoryColors[entry.category]} />
              ))}
              <LabelList dataKey="revenue" position="right" formatter={(v) => `£${formatCompact(v)}`} fill={tokens.secondary} fontSize={11} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OverviewTab({ tokens, categoryColors, range, onRangeChange }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller-overview", range],
    queryFn: () => sellerApi.overview({ period: range }),
  });

  if (isLoading) return <div className="py-16 text-center text-sm text-neutral-400">Loading overview…</div>;
  if (isError) return <ErrorNotice onRetry={refetch} />;

  const { stats, revenueTrend, categorySales } = data;
  const recentPoints = revenueTrend.slice(-12);
  const aovPoints = recentPoints.map((d) => ({ ...d, aov: d.orders ? d.revenue / d.orders : 0 }));
  const trend = summarizeTrend(revenueTrend);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          delta={trend.revenueDelta}
          sparkData={recentPoints}
          sparkKey="revenue"
          color={tokens.blue}
        />
        <StatTile
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          delta={trend.ordersDelta}
          sparkData={recentPoints}
          sparkKey="orders"
          color={tokens.blue}
        />
        <StatTile
          icon={Package}
          label="Avg. Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          delta={trend.revenueDelta - trend.ordersDelta}
          sparkData={aovPoints}
          sparkKey="aov"
          color={tokens.blue}
        />
        <StatTile
          icon={Percent}
          label="Refund Rate"
          value={`${stats.refundRate}%`}
          delta={-stats.refundRate}
          sparkData={recentPoints}
          sparkKey="orders"
          color={tokens.blue}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <RevenueChart data={revenueTrend} tokens={tokens} range={range} onRangeChange={onRangeChange} />
        </div>
        <div className="xl:col-span-2">
          <CategorySalesChart data={categorySales} tokens={tokens} categoryColors={categoryColors} />
        </div>
      </div>

      <OrdersChart data={revenueTrend} tokens={tokens} />
    </div>
  );
}

function ErrorNotice({ onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-400/20 dark:bg-rose-400/10">
      <p className="text-sm text-rose-600 dark:text-rose-400">Something went wrong loading this section.</p>
      <button onClick={onRetry} className="mt-2 text-sm font-medium text-amber-600 hover:underline">Try again</button>
    </div>
  );
}

function OrdersTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller-orders", { page, statusFilter }],
    queryFn: () => sellerApi.listOrders({ page, limit: PAGE_SIZE, status: statusFilter }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => sellerApi.updateOrderStatus(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-orders"] }),
  });

  const orders = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.meta?.total || 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 p-5 dark:border-white/10">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Orders</h3>
            <p className="text-xs text-neutral-400">{data?.meta?.total ?? 0} orders total</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["all", ...ORDER_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-black/10 text-neutral-500 hover:border-neutral-400 dark:border-white/15 dark:text-neutral-400"
                }`}
              >
                {s === "all" ? "All" : ORDER_STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-neutral-400">Loading orders…</div>
        ) : isError ? (
          <div className="p-6"><ErrorNotice onRetry={refetch} /></div>
        ) : orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders found" description="Try a different filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-neutral-400 dark:border-white/10">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                    <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white">{order.orderNumber}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-[10px] font-bold text-white">
                          {order.customer?.slice(0, 2)?.toUpperCase()}
                        </div>
                        <span className="text-neutral-700 dark:text-neutral-200">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{new Date(order.placedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{order.itemCount}</td>
                    <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-white">£{Number(order.total).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <Pill config={ORDER_STATUS_CONFIG[order.status]} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                        {ORDER_STATUSES.filter((s) => s !== order.status).map((s) => (
                          <Dropdown.Item key={s} icon={CheckCircle2} onClick={() => statusMutation.mutate({ id: order.id, status: s })}>
                            Mark as {ORDER_STATUS_CONFIG[s].label}
                          </Dropdown.Item>
                        ))}
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function ProductsTab({ tokens, categoryColors }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller-products", { search, page }],
    queryFn: () => sellerApi.listProducts({ search: search || undefined, page, limit: PAGE_SIZE }),
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: brandsApi.list });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["seller-products"] });
  const createMutation = useMutation({
    mutationFn: (payload) => productsApi.create(payload),
    onSuccess: () => { invalidate(); setModalOpen(false); toast({ title: "Product created", variant: "success" }); },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't create product", variant: "error" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => productsApi.update(id, payload),
    onSuccess: () => { invalidate(); setModalOpen(false); toast({ title: "Product updated", variant: "success" }); },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't update product", variant: "error" }),
  });
  const removeMutation = useMutation({ mutationFn: (id) => productsApi.remove(id), onSuccess: invalidate });
  const duplicateMutation = useMutation({ mutationFn: (id) => productsApi.duplicate(id), onSuccess: invalidate });

  const products = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.meta?.total || 0) / PAGE_SIZE));

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "", description: "", categoryId: categories[0]?.id, brandId: brands[0]?.id, price: "", stock: 0, status: "draft", images: [],
      isFeatured: false, isTrending: false, isBestSeller: false, isNew: false, badge: "",
      animationOverride: null,
    });
    setModalOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, price: p.price, stock: p.stock, status: p.status, images: p.images?.map((i) => resolveMediaUrl(i.url)) || [],
      isFeatured: !!p.isFeatured, isTrending: !!p.isTrending, isBestSeller: !!p.isBestSeller, isNew: !!p.isNew,
      badge: p.badge || "",
      animationOverride: p.animationOverride || null,
    });
    setModalOpen(true);
  };
  const handleImageUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const { urls } = await uploadsApi.uploadImages(Array.from(files));
      setForm((f) => ({ ...f, images: [...(f.images || []), ...urls.map(resolveMediaUrl)] }));
    } catch {
      toast({ title: "Image upload failed", variant: "error" });
    } finally {
      setUploading(false);
    }
  };
  const submitForm = () => {
    const merchandising = {
      isFeatured: form.isFeatured, isTrending: form.isTrending, isBestSeller: form.isBestSeller, isNew: form.isNew,
      badge: form.badge || null,
      animationOverride: form.animationOverride,
    };
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        payload: { name: form.name, price: Number(form.price), stock: Number(form.stock), status: form.status, images: form.images, ...merchandising },
      });
    } else {
      createMutation.mutate({ ...form, ...merchandising, price: Number(form.price), stock: Number(form.stock) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 p-5 dark:border-white/10">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">My Products</h3>
            <p className="text-xs text-neutral-400">{data?.meta?.total ?? 0} products</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products…"
              className="rounded-full border border-black/10 bg-transparent px-4 py-2 text-xs dark:border-white/15 dark:text-white"
            />
            <PrimaryButton size="sm" leftIcon={Plus} onClick={openCreate}>Add product</PrimaryButton>
          </div>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-neutral-400">Loading products…</div>
        ) : isError ? (
          <div className="p-6"><ErrorNotice onRetry={refetch} /></div>
        ) : products.length === 0 ? (
          <EmptyState icon={Package} title="No products yet" description="Add your first product to start selling." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-neutral-400 dark:border-white/10">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950">
                          {product.images?.[0]?.url ? (
                            <img src={resolveMediaUrl(product.images[0].url)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-white/60" />
                          )}
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{product.category?.name}</td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">£{Number(product.price)}</td>
                    <td className="px-5 py-4">
                      <StockMeter stock={product.stock} />
                    </td>
                    <td className="px-5 py-4">
                      <Pill config={{ ...STOCK_STATUS_CONFIG[stockStatus(product.stock)], label: product.status }} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                        <Dropdown.Item icon={Pencil} onClick={() => openEdit(product)}>Edit</Dropdown.Item>
                        <Dropdown.Item icon={Copy} onClick={() => duplicateMutation.mutate(product.id)}>Duplicate</Dropdown.Item>
                        <Dropdown.Item
                          icon={CheckCircle2}
                          onClick={() => updateMutation.mutate({ id: product.id, payload: { status: product.status === "published" ? "archived" : "published" } })}
                        >
                          {product.status === "published" ? "Archive" : "Publish"}
                        </Dropdown.Item>
                        <Dropdown.Separator />
                        <Dropdown.Item icon={Trash2} destructive onClick={() => removeMutation.mutate(product.id)}>Delete</Dropdown.Item>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit product" : "Add product"} footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submitForm} loading={createMutation.isPending || updateMutation.isPending}>
            {editing ? "Save changes" : "Save product"}
          </PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Product name" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />

          <div>
            <p className="mb-2 text-sm font-medium text-neutral-900 dark:text-white">Images</p>
            <div className="flex flex-wrap gap-2">
              {(form.images || []).map((url) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-black/20 text-xs text-neutral-400 dark:border-white/20">
                {uploading ? "…" : <Plus className="h-4 w-4" />}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => handleImageUpload(e.target.files)} />
              </label>
            </div>
          </div>

          {!editing && (
            <textarea
              placeholder="Description"
              value={form.description || ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-[var(--radius-md)] border border-black/10 bg-transparent px-4 py-2.5 text-sm dark:border-white/15"
              rows={3}
            />
          )}
          {!editing && (
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
              <Select label="Brand" value={form.brandId} onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))} options={brands.map((b) => ({ value: b.id, label: b.name }))} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" leftIcon={DollarSign} value={form.price ?? ""} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            <Input label="Stock quantity" type="number" value={form.stock ?? ""} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
          </div>
          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} options={PRODUCT_STATUSES.map((s) => ({ value: s, label: s }))} />

          <div>
            <p className="mb-2 text-sm font-medium text-neutral-900 dark:text-white">Homepage merchandising</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Checkbox label="Featured" checked={!!form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
              <Checkbox label="Trending" checked={!!form.isTrending} onChange={(e) => setForm((f) => ({ ...f, isTrending: e.target.checked }))} />
              <Checkbox label="Best Seller" checked={!!form.isBestSeller} onChange={(e) => setForm((f) => ({ ...f, isBestSeller: e.target.checked }))} />
              <Checkbox label="New" checked={!!form.isNew} onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))} />
            </div>
            <div className="mt-3">
              <Input label="Badge text (optional)" placeholder="e.g. Limited Edition" value={form.badge || ""} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-neutral-900 dark:text-white">Animation</p>
            <Checkbox
              label="Enable animation for this product"
              checked={form.animationOverride?.enabled !== false}
              onChange={(e) => setForm((f) => ({ ...f, animationOverride: { ...f.animationOverride, enabled: e.target.checked } }))}
            />
            {form.animationOverride?.enabled !== false && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Select
                  label="Type override (optional)"
                  value={form.animationOverride?.type || ""}
                  onChange={(e) => setForm((f) => ({ ...f, animationOverride: { ...f.animationOverride, type: e.target.value || undefined } }))}
                  options={[{ value: "", label: "Inherit global" }, ...["float", "breathe", "tilt", "glow", "shine", "pulse", "none"].map((v) => ({ value: v, label: v }))]}
                />
                <Select
                  label="Intensity override (optional)"
                  value={form.animationOverride?.intensity || ""}
                  onChange={(e) => setForm((f) => ({ ...f, animationOverride: { ...f.animationOverride, intensity: e.target.value || undefined } }))}
                  options={[{ value: "", label: "Inherit global" }, ...["subtle", "normal", "strong"].map((v) => ({ value: v, label: v }))]}
                />
                <Checkbox
                  label="Highlight in Hero"
                  checked={!!form.animationOverride?.heroHighlight}
                  onChange={(e) => setForm((f) => ({ ...f, animationOverride: { ...f.animationOverride, heroHighlight: e.target.checked } }))}
                />
                <Checkbox
                  label="Highlight on Homepage"
                  checked={!!form.animationOverride?.homepageHighlight}
                  onChange={(e) => setForm((f) => ({ ...f, animationOverride: { ...f.animationOverride, homepageHighlight: e.target.checked } }))}
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InventoryTab() {
  const [page, setPage] = useState(1);
  const [historyProduct, setHistoryProduct] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller-inventory", page],
    queryFn: () => sellerApi.listProducts({ page, limit: PAGE_SIZE }),
  });

  const { data: historyData } = useQuery({
    queryKey: ["product-inventory-history", historyProduct?.id],
    queryFn: () => productsApi.inventoryHistory(historyProduct.id),
    enabled: Boolean(historyProduct),
  });

  const adjustMutation = useMutation({
    mutationFn: ({ id, quantity, reason }) => productsApi.adjustStock(id, { quantity, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-inventory"] });
      toast({ title: "Stock adjusted", variant: "success" });
    },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't adjust stock", variant: "error" }),
  });

  const products = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.meta?.total || 0) / PAGE_SIZE));
  const counts = products.reduce(
    (acc, product) => { acc[stockStatus(product.stock)] += 1; return acc; },
    { in: 0, low: 0, out: 0 }
  );

  const handleAdjust = (product) => {
    const input = window.prompt(`Adjust stock for "${product.name}" — enter a signed amount (e.g. -5 for damaged stock, 10 for a restock):`);
    if (input === null || input.trim() === "") return;
    const quantity = Number(input);
    if (Number.isNaN(quantity)) return;
    const reason = window.prompt("Reason for this adjustment:") || "Manual adjustment";
    adjustMutation.mutate({ id: product.id, quantity, reason });
  };

  if (isLoading) return <div className="py-16 text-center text-sm text-neutral-400">Loading inventory…</div>;
  if (isError) return <ErrorNotice onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900">
          <p className="text-xs text-neutral-400">In Stock</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{counts.in}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900">
          <p className="text-xs text-neutral-400">Low Stock</p>
          <p className="mt-1 text-2xl font-bold text-amber-500">{counts.low}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900">
          <p className="text-xs text-neutral-400">Out of Stock</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">{counts.out}</p>
        </div>
      </div>

      {counts.low + counts.out > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {counts.low + counts.out} products need restocking attention.
        </div>
      )}

      <div className="rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="border-b border-black/5 p-5 dark:border-white/10">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Inventory</h3>
        </div>
        {products.length === 0 ? (
          <EmptyState icon={Boxes} title="No products yet" description="Add products to track inventory." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-neutral-400 dark:border-white/10">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Stock Level</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                    <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white">{product.name}</td>
                    <td className="px-5 py-4 text-neutral-400">{product.sku}</td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{product.category?.name}</td>
                    <td className="px-5 py-4">
                      <StockMeter stock={product.stock} />
                    </td>
                    <td className="px-5 py-4">
                      <Pill config={STOCK_STATUS_CONFIG[stockStatus(product.stock)]} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <OutlineButton size="sm" leftIcon={History} onClick={() => setHistoryProduct(product)}>History</OutlineButton>
                        <OutlineButton size="sm" onClick={() => handleAdjust(product)}>Adjust</OutlineButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <Drawer open={Boolean(historyProduct)} onClose={() => setHistoryProduct(null)} title={`Inventory history — ${historyProduct?.name || ""}`}>
        <div className="flex flex-col gap-3">
          {(historyData?.items || []).length === 0 ? (
            <p className="text-sm text-neutral-400">No stock changes recorded yet.</p>
          ) : (
            historyData.items.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-black/5 p-3 text-sm dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{entry.type.replace(/_/g, " ")}</span>
                  <span className={entry.delta >= 0 ? "text-emerald-600" : "text-rose-500"}>
                    {entry.delta >= 0 ? "+" : ""}{entry.delta}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{entry.quantityBefore} → {entry.quantityAfter} · {entry.actorName}</p>
                {entry.reason && <p className="mt-1 text-xs text-neutral-500">{entry.reason}</p>}
                <p className="mt-1 text-[11px] text-neutral-400">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </Drawer>
    </div>
  );
}

function CustomersTab() {
  const { data: customers = [], isLoading, isError, refetch } = useQuery({ queryKey: ["seller-customers"], queryFn: sellerApi.listCustomers });

  if (isLoading) return <div className="py-16 text-center text-sm text-neutral-400">Loading customers…</div>;
  if (isError) return <ErrorNotice onRetry={refetch} />;

  const newCount = customers.filter((c) => c.segment === "New").length;
  const returningCount = customers.filter((c) => c.segment !== "New").length;
  const returningRate = customers.length ? Math.round((returningCount / customers.length) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={Users} label="Total Customers" value={customers.length.toLocaleString()} delta={0} />
        <StatTile icon={UserPlus} label="New Customers" value={newCount.toLocaleString()} delta={0} />
        <StatTile icon={Crown} label="Returning Rate" value={`${returningRate}%`} delta={0} />
      </div>
      <div className="rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="border-b border-black/5 p-5 dark:border-white/10">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Customers</h3>
        </div>
        {customers.length === 0 ? (
          <EmptyState icon={Users} title="No customers yet" description="Customers will appear here once they order from your store." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-neutral-400 dark:border-white/10">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium">Total Spent</th>
                  <th className="px-5 py-3 font-medium">Segment</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-xs font-bold text-white">
                          {customer.name?.slice(0, 2)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{customer.name}</p>
                          <p className="text-xs text-neutral-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{customer.orders}</td>
                    <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-white">£{Number(customer.spent).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <SegmentBadge segment={customer.segment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Sidebar({ activeTab, onSelect, isOpen, onClose }) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}
      </AnimatePresence>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-white/10 bg-neutral-950 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6">
          <span className="text-xl font-bold uppercase tracking-[0.15em] text-white">Veluntra</span>
        </div>
        <p className="px-6 pb-4 text-[11px] font-medium uppercase tracking-wider text-neutral-500">Seller Dashboard</p>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === item.id ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 px-3 py-4">
          <Link
            to="/"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4 w-4" /> Back to Store
          </Link>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, onMenuClick, isDark, onToggleDark }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-black/5 bg-white/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/80 sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h1>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            placeholder="Search orders, products..."
            className="w-56 rounded-full border border-black/10 bg-transparent py-2 pl-9 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-amber-400 focus:outline-none dark:border-white/15 dark:text-white"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <button
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-2 border-l border-black/10 pl-3 dark:border-white/15">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-xs font-bold text-white">
            VS
          </div>
          <span className="hidden text-sm font-medium text-neutral-700 dark:text-neutral-200 sm:block">Veluntra Seller</span>
        </div>
      </div>
    </header>
  );
}

function SellerDashboard() {
  useDocumentTitle("Seller Dashboard");
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState("month");
  const [isDark, setIsDark] = useState(() => {                   
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("Veluntra-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    localStorage.setItem("Veluntra-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const tokens = isDark ? CHART_TOKENS.dark : CHART_TOKENS.light;
  const categoryColors = isDark ? CATEGORY_COLORS.dark : CATEGORY_COLORS.light;
  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeTab);

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={activeNavItem?.label ?? "Overview"}
          onMenuClick={() => setSidebarOpen(true)}
          isDark={isDark}
          onToggleDark={() => setIsDark((d) => !d)}
        />
        <main className="flex-1 p-4 sm:p-6">
          {activeTab === "overview" && (
            <OverviewTab tokens={tokens} categoryColors={categoryColors} range={range} onRangeChange={setRange} />
          )}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "products" && <ProductsTab tokens={tokens} categoryColors={categoryColors} />}
          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "customers" && <CustomersTab />}
        </main>
      </div>
    </div>
  );
}

export default SellerDashboard;
