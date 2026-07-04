import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  Settings,
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
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Crown,
  UserPlus,
  Watch,
  Keyboard,
  Headphones,
  Laptop,
  Lamp,
} from "lucide-react";

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
  { id: "7d", label: "Last 7 days", days: 7, base: 3400, volatility: 850, trend: 55 },
  { id: "30d", label: "Last 30 days", days: 30, base: 2600, volatility: 700, trend: 22 },
  { id: "90d", label: "Last 90 days", days: 90, base: 1900, volatility: 620, trend: 9 },
];

const CONVERSION_BY_RANGE = {
  "7d": { value: 3.8, delta: 0.6, trend: [3.1, 3.3, 3.0, 3.5, 3.6, 3.4, 3.8] },
  "30d": { value: 3.4, delta: 0.3, trend: [3.0, 3.1, 2.9, 3.2, 3.3, 3.1, 3.4] },
  "90d": { value: 3.1, delta: -0.2, trend: [3.3, 3.2, 3.0, 3.1, 2.9, 3.0, 3.1] },
};

const CATEGORY_SALES = [
  { category: "Audio", revenue: 48200 },
  { category: "Computing", revenue: 31500 },
  { category: "Wearables", revenue: 27800 },
  { category: "Smart Home", revenue: 19600 },
  { category: "Home & Kitchen", revenue: 14300 },
];

const TOP_PRODUCTS = [
  { id: "p1", name: "Aurora Pro Wireless Earbuds", sku: "VNT-APE-2041", category: "Audio", icon: Headphones, price: 178, sold: 214, revenue: 38092, stock: 18 },
  { id: "p2", name: "Nova Titanium Smartwatch", sku: "VNT-NTS-1187", category: "Wearables", icon: Watch, price: 890, sold: 98, revenue: 87220, stock: 6 },
  { id: "p3", name: "Meridian Mechanical Keyboard", sku: "VNT-MMK-0742", category: "Computing", icon: Keyboard, price: 145, sold: 156, revenue: 22620, stock: 0 },
  { id: "p4", name: "Zenith Noise-Cancel Headphones", sku: "VNT-ZNH-3390", category: "Audio", icon: Headphones, price: 349, sold: 312, revenue: 108888, stock: 42 },
  { id: "p5", name: "Onyx 14\" Ultrabook", sku: "VNT-OUB-2205", category: "Computing", icon: Laptop, price: 1340, sold: 47, revenue: 62980, stock: 24 },
  { id: "p6", name: "Lumen Smart Desk Lamp", sku: "VNT-LSD-0899", category: "Smart Home", icon: Lamp, price: 65, sold: 76, revenue: 4940, stock: 3 },
];

const RECENT_ORDERS = [
  { id: "VNT-10486", customer: "Priya Sharma", initials: "PS", date: "Jul 4, 2026", items: 2, amount: 963.0, status: "Pending" },
  { id: "VNT-10485", customer: "David Lin", initials: "DL", date: "Jul 4, 2026", items: 1, amount: 210.0, status: "Shipped" },
  { id: "VNT-10484", customer: "Marcus Thompson", initials: "MT", date: "Jul 3, 2026", items: 3, amount: 684.0, status: "Delivered" },
  { id: "VNT-10483", customer: "Sarah Mitchell", initials: "SM", date: "Jul 3, 2026", items: 1, amount: 428.0, status: "Delivered" },
  { id: "VNT-10482", customer: "James Rodriguez", initials: "JR", date: "Jul 3, 2026", items: 1, amount: 265.0, status: "Shipped" },
  { id: "VNT-10481", customer: "Elena Kowalski", initials: "EK", date: "Jul 2, 2026", items: 2, amount: 563.0, status: "Cancelled" },
  { id: "VNT-10480", customer: "Grace Whitfield", initials: "GW", date: "Jul 2, 2026", items: 4, amount: 1240.0, status: "Delivered" },
  { id: "VNT-10479", customer: "Naomi Chen", initials: "NC", date: "Jul 1, 2026", items: 1, amount: 349.0, status: "Pending" },
];

const CUSTOMERS = [
  { id: "cu1", name: "Sarah Mitchell", email: "sarah.m@example.com", initials: "SM", location: "New York, US", orders: 14, spent: 5240, segment: "VIP" },
  { id: "cu2", name: "James Rodriguez", email: "james.r@example.com", initials: "JR", location: "Los Angeles, US", orders: 6, spent: 1890, segment: "Returning" },
  { id: "cu3", name: "Elena Kowalski", email: "elena.k@example.com", initials: "EK", location: "Berlin, DE", orders: 2, spent: 642, segment: "New" },
  { id: "cu4", name: "Marcus Thompson", email: "marcus.t@example.com", initials: "MT", location: "Toronto, CA", orders: 9, spent: 3120, segment: "Returning" },
  { id: "cu5", name: "Priya Sharma", email: "priya.s@example.com", initials: "PS", location: "Mumbai, IN", orders: 17, spent: 6870, segment: "VIP" },
  { id: "cu6", name: "David Lin", email: "david.l@example.com", initials: "DL", location: "Singapore, SG", orders: 1, spent: 210, segment: "New" },
];

const ORDER_STATUS_CONFIG = {
  Delivered: { color: "#0ca30c", bg: "rgba(12,163,12,0.1)", icon: CheckCircle2 },
  Shipped: { color: "#52514e", bg: "rgba(82,81,78,0.08)", icon: Package },
  Pending: { color: "#fab219", bg: "rgba(250,178,25,0.14)", icon: Clock },
  Cancelled: { color: "#d03b3b", bg: "rgba(208,59,59,0.1)", icon: XCircle },
};

const STOCK_STATUS_CONFIG = {
  in: { label: "In Stock", color: "#0ca30c", bg: "rgba(12,163,12,0.1)", icon: CheckCircle2 },
  low: { label: "Low Stock", color: "#fab219", bg: "rgba(250,178,25,0.14)", icon: AlertTriangle },
  out: { label: "Out of Stock", color: "#d03b3b", bg: "rgba(208,59,59,0.1)", icon: XCircle },
};

function generateSeries(days, base, volatility, trend) {
  const data = [];
  let value = base;
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    value = Math.max(200, value + (Math.random() - 0.42) * volatility + trend);
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    data.push({
     label: date.toLocaleDateString("en-GB", {month: "short", day: "numeric",}),
      revenue: Math.round(value),
      orders: Math.max(1, Math.round(value / 34 + (Math.random() - 0.5) * 6)),
    });
  }
  return data;
}

const SERIES_BY_RANGE = Object.fromEntries(
  RANGE_OPTIONS.map((opt) => [opt.id, generateSeries(opt.days, opt.base, opt.volatility, opt.trend)])
);

function average(list, key) {
  return list.reduce((sum, item) => sum + item[key], 0) / (list.length || 1);
}

function summarize(data) {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const mid = Math.max(1, Math.floor(data.length / 2));
  const firstHalf = data.slice(0, mid);
  const secondHalf = data.slice(mid);
  const revenueDelta = ((average(secondHalf, "revenue") - average(firstHalf, "revenue")) / average(firstHalf, "revenue")) * 100;
  const ordersDelta = ((average(secondHalf, "orders") - average(firstHalf, "orders")) / average(firstHalf, "orders")) * 100;
  return { totalRevenue, totalOrders, avgOrderValue, revenueDelta, ordersDelta };
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
              {opt.id.toUpperCase()}
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

function OverviewTab({ tokens, categoryColors, range, onRangeChange, revenueData, summary, conversion }) {
  const recentPoints = revenueData.slice(-12);
  const aovPoints = recentPoints.map((d) => ({ ...d, aov: d.orders ? d.revenue / d.orders : 0 }));
  const conversionPoints = conversion.trend.map((v, i) => ({ i, v }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          delta={summary.revenueDelta}
          sparkData={recentPoints}
          sparkKey="revenue"
          color={tokens.blue}
        />
        <StatTile
          icon={ShoppingBag}
          label="Total Orders"
          value={summary.totalOrders.toLocaleString()}
          delta={summary.ordersDelta}
          sparkData={recentPoints}
          sparkKey="orders"
          color={tokens.blue}
        />
        <StatTile
          icon={Package}
          label="Avg. Order Value"
          value={formatCurrency(summary.avgOrderValue)}
          delta={summary.revenueDelta - summary.ordersDelta}
          sparkData={aovPoints}
          sparkKey="aov"
          color={tokens.blue}
        />
        <StatTile
          icon={Percent}
          label="Conversion Rate"
          value={`${conversion.value}%`}
          delta={conversion.delta}
          sparkData={conversionPoints}
          sparkKey="v"
          color={tokens.blue}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <RevenueChart data={revenueData} tokens={tokens} range={range} onRangeChange={onRangeChange} />
        </div>
        <div className="xl:col-span-2">
          <CategorySalesChart data={CATEGORY_SALES} tokens={tokens} categoryColors={categoryColors} />
        </div>
      </div>

      <OrdersChart data={revenueData} tokens={tokens} />
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 p-5 dark:border-white/10">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Recent Orders</h3>
            <p className="text-xs text-neutral-400">{RECENT_ORDERS.length} orders this period</p>
          </div>
          <button className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-black/5 dark:border-white/15 dark:text-neutral-200 dark:hover:bg-white/10">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
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
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((order) => (
                <tr key={order.id} className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                  <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white">{order.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-[10px] font-bold text-white">
                        {order.initials}
                      </div>
                      <span className="text-neutral-700 dark:text-neutral-200">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{order.date}</td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{order.items}</td>
                  <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-white">£{order.amount.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <Pill config={{ ...ORDER_STATUS_CONFIG[order.status], label: order.status }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ tokens, categoryColors }) {
  const sorted = [...TOP_PRODUCTS].sort((a, b) => b.revenue - a.revenue);
  return (
    <div className="space-y-6">
      <CategorySalesChart data={CATEGORY_SALES} tokens={tokens} categoryColors={categoryColors} />
      <div className="rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="border-b border-black/5 p-5 dark:border-white/10">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Top Products</h3>
          <p className="text-xs text-neutral-400">Ranked by revenue this period</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-neutral-400 dark:border-white/10">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Units Sold</th>
                <th className="px-5 py-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((product) => (
                <tr key={product.id} className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950">
                        <product.icon className="h-4 w-4 text-white/60" />
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{product.category}</td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">£{product.price}</td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{product.sold}</td>
                  <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-white">£{product.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InventoryTab() {
  const counts = TOP_PRODUCTS.reduce(
    (acc, product) => {
      acc[stockStatus(product.stock)] += 1;
      return acc;
    },
    { in: 0, low: 0, out: 0 }
  );

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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-neutral-400 dark:border-white/10">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Stock Level</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map((product) => (
                <tr key={product.id} className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                  <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white">{product.name}</td>
                  <td className="px-5 py-4 text-neutral-400">{product.sku}</td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{product.category}</td>
                  <td className="px-5 py-4">
                    <StockMeter stock={product.stock} />
                  </td>
                  <td className="px-5 py-4">
                    <Pill config={STOCK_STATUS_CONFIG[stockStatus(product.stock)]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomersTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={Users} label="Total Customers" value="12,480" delta={8.2} />
        <StatTile icon={UserPlus} label="New This Period" value="284" delta={14.6} />
        <StatTile icon={Crown} label="Returning Rate" value="64.2%" delta={2.1} />
      </div>
      <div className="rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="border-b border-black/5 p-5 dark:border-white/10">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Top Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-neutral-400 dark:border-white/10">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Total Spent</th>
                <th className="px-5 py-3 font-medium">Segment</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((customer) => (
                <tr key={customer.id} className="border-b border-black/5 last:border-b-0 dark:border-white/10">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-xs font-bold text-white">
                        {customer.initials}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{customer.name}</p>
                        <p className="text-xs text-neutral-400">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{customer.location}</td>
                  <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">{customer.orders}</td>
                  <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-white">£{customer.spent.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <SegmentBadge segment={customer.segment} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white">
            <Settings className="h-4 w-4" /> Settings
          </button>
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
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState("30d");
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
  const revenueData = SERIES_BY_RANGE[range];
  const summary = summarize(revenueData);
  const conversion = CONVERSION_BY_RANGE[range];
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
            <OverviewTab
              tokens={tokens}
              categoryColors={categoryColors}
              range={range}
              onRangeChange={setRange}
              revenueData={revenueData}
              summary={summary}
              conversion={conversion}
            />
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
