import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users as UsersIcon,
  Package,
  Tags,
  Ticket,
  FileBarChart,
  LineChart as LineChartIcon,
  BarChart3,
  History,
  Menu,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  Download,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts";

import { PrimaryButton, SecondaryButton, OutlineButton, IconButton } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { SearchInput } from "../../components/ui/Input";
import { Badge, Chip, Avatar, EmptyState } from "../../components/ui/Feedback";
import { Modal, Drawer, Dropdown } from "../../components/ui/Overlay";
import { Pagination } from "../../components/ui/Navigation";
import { SectionTitle } from "../../components/ui/Typography";
import { StatCard } from "../../components/ui/Cards";
import { cn } from "../../lib/utils";

const CURRENCY = "£";
const CHART_GOLD = "#d8b36a";
const CHART_INK = "#4a4855";
const PIE_COLORS = ["#d8b36a", "#8f8d99", "#6fae76", "#e0645f"];

/* — Nav — */
const NAV_GROUPS = [
  {
    label: "Manage",
    items: [
      { id: "users", label: "Users", icon: UsersIcon },
      { id: "orders", label: "Orders", icon: ShoppingCart },
      { id: "products", label: "Products", icon: Package },
      { id: "categories", label: "Categories", icon: Tags },
      { id: "coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "reports", label: "Reports", icon: FileBarChart },
      { id: "analytics", label: "Analytics", icon: LineChartIcon },
      { id: "charts", label: "Charts", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [{ id: "logs", label: "Activity Logs", icon: History }],
  },
];
const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

/* — Sample data — */
const USERS = [
  { id: 1, name: "Alexandra Wren", email: "alexandra.wren@example.com", role: "Customer", status: "active", joined: "12 Mar 2024" },
  { id: 2, name: "Marcus Bellucci", email: "marcus.b@example.com", role: "Admin", status: "active", joined: "04 Jan 2023" },
  { id: 3, name: "Sofia Reyes", email: "sofia.reyes@example.com", role: "Editor", status: "active", joined: "22 Jul 2024" },
  { id: 4, name: "James Norlen", email: "j.norlen@example.com", role: "Customer", status: "suspended", joined: "09 Sep 2023" },
  { id: 5, name: "Priya Aurelio", email: "priya.a@example.com", role: "Customer", status: "active", joined: "30 Nov 2024" },
  { id: 6, name: "Daniel Sabrine", email: "d.sabrine@example.com", role: "Editor", status: "active", joined: "15 Feb 2025" },
];

const ADMIN_ORDERS = [
  { id: 1, number: "VNT-284915", customer: "Alexandra Wren", date: "28 Jun 2026", items: 2, total: 2640, status: "shipped", payment: "paid" },
  { id: 2, number: "VNT-281203", customer: "Priya Aurelio", date: "14 Jun 2026", items: 2, total: 520, status: "delivered", payment: "paid" },
  { id: 3, number: "VNT-276810", customer: "James Norlen", date: "02 Jun 2026", items: 1, total: 3200, status: "processing", payment: "pending" },
  { id: 4, number: "VNT-269944", customer: "Sofia Reyes", date: "19 May 2026", items: 2, total: 1670, status: "delivered", payment: "paid" },
  { id: 5, number: "VNT-261102", customer: "Daniel Sabrine", date: "30 Apr 2026", items: 1, total: 225, status: "cancelled", payment: "refunded" },
  { id: 6, number: "VNT-259887", customer: "Marcus Bellucci", date: "22 Apr 2026", items: 3, total: 4980, status: "shipped", payment: "paid" },
];

const ADMIN_PRODUCTS = [
  { id: 1, name: "Aurora Pro Wireless Earbuds", category: "Audio", brand: "Veluntra", price: 178, stock: 14, status: "active" },
  { id: 2, name: "Nova Titanium Smartwatch", category: "Wearables", brand: "Nexora", price: 890, stock: 3, status: "active" },
  { id: 3, name: "Meridian Mechanical Keyboard", category: "Computing", brand: "Meridian", price: 145, stock: 0, status: "draft" },
  { id: 4, name: "Zenith Noise-Cancel Headphones", category: "Audio", brand: "Circuit & Co.", price: 349, stock: 42, status: "active" },
  { id: 5, name: "Onyx 14\" Ultrabook", category: "Computing", brand: "Veluntra", price: 1340, stock: 24, status: "active" },
  { id: 6, name: "Lumen Smart Desk Lamp", category: "Smart Home", brand: "Nordline", price: 65, stock: 3, status: "active" },
];

const CATEGORIES = [
  { id: 1, name: "Audio", count: 48 },
  { id: 2, name: "Wearables", count: 22 },
  { id: 3, name: "Computing", count: 36 },
  { id: 4, name: "Smart Home", count: 19 },
  { id: 5, name: "Home & Kitchen", count: 27 },
  { id: 6, name: "Mobile & Tablets", count: 41 },
];

const COUPONS = [
  { id: 1, code: "Veluntra10", type: "Percent", value: "10%", used: 284, limit: 500, expires: "31 Aug 2026", status: "active" },
  { id: 2, code: "WELCOME15", type: "Percent", value: "15%", used: 612, limit: 1000, expires: "30 Sep 2026", status: "active" },
  { id: 3, code: "FREESHIP", type: "Fixed", value: `${CURRENCY}18`, used: 190, limit: 200, expires: "10 Jul 2026", status: "active" },
  { id: 4, code: "SPRING24", type: "Percent", value: "20%", used: 500, limit: 500, expires: "01 Jun 2026", status: "expired" },
];

const REPORTS = [
  { id: 1, name: "Monthly Sales Report", range: "Jun 2026", format: "PDF", generated: "01 Jul 2026" },
  { id: 2, name: "Inventory Snapshot", range: "As of 30 Jun 2026", format: "XLSX", generated: "30 Jun 2026" },
  { id: 3, name: "Customer Cohort Report", range: "Q2 2026", format: "PDF", generated: "28 Jun 2026" },
  { id: 4, name: "Coupon Performance", range: "Jan – Jun 2026", format: "XLSX", generated: "25 Jun 2026" },
];

const ACTIVITY_LOGS = [
  { id: 1, actor: "Marcus Bellucci", action: "Suspended user James Norlen", scope: "users", time: "12 min ago" },
  { id: 2, actor: "Sofia Reyes", action: "Published product “Lumen Smart Desk Lamp”", scope: "products", time: "1h ago" },
  { id: 3, actor: "System", action: "Order VNT-276810 payment marked pending", scope: "orders", time: "2h ago" },
  { id: 4, actor: "Daniel Sabrine", action: "Created coupon FREESHIP", scope: "coupons", time: "5h ago" },
  { id: 5, actor: "Marcus Bellucci", action: "Updated category “Home & Kitchen” description", scope: "products", time: "1d ago" },
  { id: 6, actor: "System", action: "Generated Monthly Sales Report", scope: "system", time: "1d ago" },
  { id: 7, actor: "Sofia Reyes", action: "Refunded order VNT-261102", scope: "orders", time: "3d ago" },
  { id: 8, actor: "Marcus Bellucci", action: "Added new admin Daniel Sabrine", scope: "users", time: "6d ago" },
];

const REVENUE_TREND = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 38500 }, { month: "Mar", revenue: 51000 },
  { month: "Apr", revenue: 47800 }, { month: "May", revenue: 58200 }, { month: "Jun", revenue: 64500 },
];
const ORDERS_BY_CATEGORY = [
  { category: "Audio", orders: 128 }, { category: "Wearables", orders: 64 }, { category: "Computing", orders: 92 },
  { category: "Smart Home", orders: 156 }, { category: "Home & Kitchen", orders: 74 }, { category: "Mobile", orders: 88 },
];
const PAYMENT_SPLIT = [
  { name: "Card", value: 62 }, { name: "PayPal", value: 24 }, { name: "Apple Pay", value: 11 }, { name: "Other", value: 3 },
];
const CUSTOMER_TREND = [
  { month: "Jan", newC: 210, returning: 340 }, { month: "Feb", newC: 190, returning: 360 },
  { month: "Mar", newC: 260, returning: 400 }, { month: "Apr", newC: 240, returning: 420 },
  { month: "May", newC: 310, returning: 460 }, { month: "Jun", newC: 340, returning: 500 },
];

const PAGE_SIZE = 5;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeItem = ALL_NAV_ITEMS.find((n) => n.id === activeTab);

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 lg:hidden">
        <button onClick={() => setMobileNavOpen(true)} className="flex items-center gap-2 text-[var(--text-primary)]">
          <Menu className="size-5" />
          <span className="text-sm font-medium">{activeItem?.label}</span>
        </button>
        <span className="text-base tracking-[0.2em] font-medium" style={{ fontFamily: "var(--font-display)" }}>
          Veluntra <span className="text-gold-500">Admin</span>
        </span>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-8 px-5 py-6 sm:px-8 lg:py-10">
        <aside className="hidden lg:block w-[250px] shrink-0">
          <SidebarContent active={activeTab} onSelect={setActiveTab} />
        </aside>

        <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} side="left" title="Admin Panel" width="290px">
          <SidebarContent active={activeTab} onSelect={(id) => { setActiveTab(id); setMobileNavOpen(false); }} embedded />
        </Drawer>

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === "users" && <UsersSection />}
              {activeTab === "orders" && <OrdersSection />}
              {activeTab === "products" && <ProductsSection />}
              {activeTab === "categories" && <CategoriesSection />}
              {activeTab === "coupons" && <CouponsSection />}
              {activeTab === "reports" && <ReportsSection />}
              {activeTab === "analytics" && <AnalyticsSection />}
              {activeTab === "charts" && <ChartsSection />}
              {activeTab === "logs" && <ActivityLogsSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* — Sidebar — */

function SidebarContent({ active, onSelect, embedded }) {
  return (
    <div className={cn("flex flex-col gap-7", !embedded && "sticky top-8")}>
      {!embedded && (
        <div className="flex items-center gap-3 px-1">
          <span className="grid size-9 place-items-center rounded-[var(--radius-sm)] bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950 font-medium">
            V
          </span>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Veluntra Admin</p>
            <p className="text-xs text-[var(--text-muted)]">Operations console</p>
          </div>
        </div>
      )}

      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-4 mb-2 text-[10.5px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{group.label}</p>
          <nav className="flex flex-col gap-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-left transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-gold-400/15 to-transparent text-gold-600 dark:text-gold-300 font-medium"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-inset)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}

/* — Shared bits — */

function Toolbar({ search, onSearch, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="w-full sm:w-72">
        <SearchInput value={search} onChange={(e) => onSearch(e.target.value)} onClear={() => onSearch("")} placeholder="Search…" />
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function TableShell({ children }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-soft-sm">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
function Th({ children, className }) {
  return (
    <th className={cn("px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]", className)}>
      {children}
    </th>
  );
}
function Td({ children, className }) {
  return <td className={cn("px-5 py-4 text-[var(--text-primary)]", className)}>{children}</td>;
}

function usePagedFilter(list, matchFn, page, setPage) {
  const filtered = useMemo(() => list.filter(matchFn), [list, matchFn]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  return { filtered, totalPages, pageItems, safePage };
}

/* — Users — */

function UsersSection() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState(USERS);

  const matchFn = (u) =>
    (roleFilter === "all" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const { totalPages, pageItems, safePage } = usePagedFilter(rows, matchFn, page, setPage);

  const toggleStatus = (id) =>
    setRows((r) => r.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u)));
  const removeUser = (id) => setRows((r) => r.filter((u) => u.id !== id));

  return (
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Users"
        description="Everyone with access to storefront accounts or the admin console."
        action={<PrimaryButton leftIcon={Plus} onClick={() => setModalOpen(true)}>Add user</PrimaryButton>}
      />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }}>
        {["all", "Customer", "Admin", "Editor"].map((r) => (
          <Chip key={r} selected={roleFilter === r} onClick={() => { setRoleFilter(r); setPage(1); }}>
            {r === "all" ? "All roles" : r}
          </Chip>
        ))}
      </Toolbar>

      {pageItems.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Try a different search or filter." />
      ) : (
        <TableShell>
          <thead className="border-b border-[var(--border)]">
            <tr><Th>Name</Th><Th>Role</Th><Th>Status</Th><Th>Joined</Th><Th className="text-right">Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {pageItems.map((u) => (
              <tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                    </div>
                  </div>
                </Td>
                <Td><Badge variant="neutral">{u.role}</Badge></Td>
                <Td>
                  <Badge variant={u.status === "active" ? "success" : "error"}>
                    {u.status === "active" ? "Active" : "Suspended"}
                  </Badge>
                </Td>
                <Td className="text-[var(--text-muted)]">{u.joined}</Td>
                <Td className="text-right">
                  <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                    <Dropdown.Item icon={Pencil}>Edit user</Dropdown.Item>
                    <Dropdown.Item icon={u.status === "active" ? Ban : CheckCircle2} onClick={() => toggleStatus(u.id)}>
                      {u.status === "active" ? "Suspend" : "Reactivate"}
                    </Dropdown.Item>
                    <Dropdown.Separator />
                    <Dropdown.Item icon={Trash2} destructive onClick={() => removeUser(u.id)}>Delete</Dropdown.Item>
                  </Dropdown>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <div className="mt-6"><Pagination page={safePage} totalPages={totalPages} onChange={setPage} /></div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add user" footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => setModalOpen(false)}>Send invite</PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Full name" placeholder="Jane Doe" />
          <Input label="Email" type="email" placeholder="jane@example.com" />
          <Select label="Role" defaultValue="Customer" options={[{ value: "Customer", label: "Customer" }, { value: "Editor", label: "Editor" }, { value: "Admin", label: "Admin" }]} />
        </div>
      </Modal>
    </div>
  );
}

/* — Orders — */

const ORDER_STATUS_VARIANT = { processing: "warning", shipped: "gold", delivered: "success", cancelled: "error" };
const PAYMENT_STATUS_VARIANT = { paid: "success", pending: "warning", refunded: "neutral" };

function OrdersSection() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const matchFn = (o) =>
    (statusFilter === "all" || o.status === statusFilter) &&
    (o.number.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()));

  const { totalPages, pageItems, safePage } = usePagedFilter(ADMIN_ORDERS, matchFn, page, setPage);

  return (
    <div>
      <SectionTitle eyebrow="Manage" title="Orders" description="Every transaction across the storefront, in one queue." />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }}>
        {["all", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <Chip key={s} selected={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      </Toolbar>

      {pageItems.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Try a different search or filter." />
      ) : (
        <TableShell>
          <thead className="border-b border-[var(--border)]">
            <tr><Th>Order</Th><Th>Customer</Th><Th>Date</Th><Th>Total</Th><Th>Status</Th><Th>Payment</Th><Th className="text-right">Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {pageItems.map((o) => (
              <tr key={o.id}>
                <Td className="font-medium">{o.number}</Td>
                <Td>{o.customer}</Td>
                <Td className="text-[var(--text-muted)]">{o.date}</Td>
                <Td>{CURRENCY}{o.total.toLocaleString()}</Td>
                <Td><Badge variant={ORDER_STATUS_VARIANT[o.status]}>{o.status[0].toUpperCase() + o.status.slice(1)}</Badge></Td>
                <Td><Badge variant={PAYMENT_STATUS_VARIANT[o.payment]}>{o.payment[0].toUpperCase() + o.payment.slice(1)}</Badge></Td>
                <Td className="text-right">
                  <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                    <Dropdown.Item icon={Pencil}>View details</Dropdown.Item>
                    <Dropdown.Item icon={CheckCircle2}>Mark as shipped</Dropdown.Item>
                    <Dropdown.Separator />
                    <Dropdown.Item icon={Ban} destructive>Cancel order</Dropdown.Item>
                  </Dropdown>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <div className="mt-6"><Pagination page={safePage} totalPages={totalPages} onChange={setPage} /></div>
    </div>
  );
}

/* — Products — */

function ProductsSection() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const matchFn = (p) => p.name.toLowerCase().includes(search.toLowerCase());
  const { totalPages, pageItems, safePage } = usePagedFilter(ADMIN_PRODUCTS, matchFn, page, setPage);

  return (
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Products"
        description="Catalogue inventory, pricing, and publish status."
        action={<PrimaryButton leftIcon={Plus} onClick={() => setModalOpen(true)}>Add product</PrimaryButton>}
      />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} />

      <TableShell>
        <thead className="border-b border-[var(--border)]">
          <tr><Th>Product</Th><Th>Category</Th><Th>Brand</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {pageItems.map((p) => (
            <tr key={p.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-inset)] font-medium text-gold-500"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {p.name.charAt(0)}
                  </span>
                  <span className="font-medium">{p.name}</span>
                </div>
              </Td>
              <Td className="text-[var(--text-muted)]">{p.category}</Td>
              <Td className="text-[var(--text-muted)]">{p.brand}</Td>
              <Td>{CURRENCY}{p.price.toLocaleString()}</Td>
              <Td>
                <span className={cn("flex items-center gap-1.5", p.stock === 0 ? "text-error-500" : p.stock < 5 ? "text-warning-500" : "")}>
                  {p.stock < 5 && p.stock > 0 && <AlertTriangle className="size-3.5" />}
                  {p.stock === 0 ? "Out of stock" : p.stock}
                </span>
              </Td>
              <Td><Badge variant={p.status === "active" ? "success" : "neutral"}>{p.status === "active" ? "Active" : "Draft"}</Badge></Td>
              <Td className="text-right">
                <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                  <Dropdown.Item icon={Pencil}>Edit product</Dropdown.Item>
                  <Dropdown.Item icon={CheckCircle2}>{p.status === "active" ? "Unpublish" : "Publish"}</Dropdown.Item>
                  <Dropdown.Separator />
                  <Dropdown.Item icon={Trash2} destructive>Delete</Dropdown.Item>
                </Dropdown>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableShell>

      <div className="mt-6"><Pagination page={safePage} totalPages={totalPages} onChange={setPage} /></div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add product" footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => setModalOpen(false)}>Save product</PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Product name" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" options={CATEGORIES.map((c) => ({ value: c.name, label: c.name }))} />
            <Input label="Brand" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" leftIcon={DollarSign} />
            <Input label="Stock quantity" type="number" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* — Categories — */

function CategoriesSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Categories"
        description="Top-level groupings used across the storefront and filters."
        action={<PrimaryButton leftIcon={Plus} onClick={() => setModalOpen(true)}>Add category</PrimaryButton>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-gold-400/12 text-gold-500">
                <Tags className="size-4.5" />
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{c.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{c.count} products</p>
              </div>
            </div>
            <div className="flex gap-1">
              <IconButton icon={Pencil} size="sm" aria-label="Edit category" />
              <IconButton icon={Trash2} size="sm" aria-label="Delete category" />
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add category" footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => setModalOpen(false)}>Save category</PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Category name" />
          <Input label="Slug" helperText="Used in the storefront URL." />
        </div>
      </Modal>
    </div>
  );
}

/* — Coupons — */

function CouponsSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Coupons"
        description="Discount codes, usage caps, and expiry windows."
        action={<PrimaryButton leftIcon={Plus} onClick={() => setModalOpen(true)}>Create coupon</PrimaryButton>}
      />

      <TableShell>
        <thead className="border-b border-[var(--border)]">
          <tr><Th>Code</Th><Th>Type</Th><Th>Usage</Th><Th>Expires</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {COUPONS.map((c) => (
            <tr key={c.id}>
              <Td className="font-medium tracking-wide">{c.code}</Td>
              <Td className="text-[var(--text-muted)]">{c.type} · {c.value}</Td>
              <Td>
                <div className="flex items-center gap-2 w-36">
                  <div className="h-1.5 flex-1 rounded-full bg-[var(--surface-inset)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-100"
                      style={{ width: `${Math.min(100, (c.used / c.limit) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-muted)] shrink-0">{c.used}/{c.limit}</span>
                </div>
              </Td>
              <Td className="text-[var(--text-muted)]">{c.expires}</Td>
              <Td><Badge variant={c.status === "active" ? "success" : "neutral"}>{c.status === "active" ? "Active" : "Expired"}</Badge></Td>
              <Td className="text-right">
                <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                  <Dropdown.Item icon={Pencil}>Edit coupon</Dropdown.Item>
                  <Dropdown.Separator />
                  <Dropdown.Item icon={Trash2} destructive>Delete</Dropdown.Item>
                </Dropdown>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableShell>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create coupon" footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => setModalOpen(false)}>Create coupon</PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Coupon code" placeholder="SUMMER20" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Discount type" options={[{ value: "percent", label: "Percentage" }, { value: "fixed", label: "Fixed amount" }]} />
            <Input label="Value" leftIcon={Percent} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Usage limit" type="number" />
            <Input label="Expires" type="date" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* — Reports — */

function ReportsSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <SectionTitle
        eyebrow="Insights"
        title="Reports"
        description="Generate and download exportable reports for finance and ops."
        action={<PrimaryButton leftIcon={Plus} onClick={() => setModalOpen(true)}>Generate report</PrimaryButton>}
      />

      <div className="flex flex-col gap-3">
        {REPORTS.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft-sm">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-[var(--radius-sm)] bg-gold-400/12 text-gold-500">
                <FileBarChart className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{r.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{r.range} · Generated {r.generated}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="neutral">{r.format}</Badge>
              <OutlineButton size="sm" leftIcon={Download}>Download</OutlineButton>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generate report" footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => setModalOpen(false)}>Generate</PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Select label="Report type" options={[
            { value: "sales", label: "Sales report" },
            { value: "inventory", label: "Inventory snapshot" },
            { value: "customers", label: "Customer cohort" },
            { value: "coupons", label: "Coupon performance" },
          ]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="From" type="date" />
            <Input label="To" type="date" />
          </div>
          <Select label="Format" defaultValue="pdf" options={[{ value: "pdf", label: "PDF" }, { value: "xlsx", label: "XLSX" }]} />
        </div>
      </Modal>
    </div>
  );
}

/* — Analytics — */

function AnalyticsSection() {
  return (
    <div>
      <SectionTitle eyebrow="Insights" title="Analytics" description="Key performance indicators at a glance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Revenue (MTD)" value={`${CURRENCY}64,500`} icon={DollarSign} trend={{ direction: "up", value: "10.8%" }} />
        <StatCard label="Orders (MTD)" value="602" icon={ShoppingCart} trend={{ direction: "up", value: "4.2%" }} />
        <StatCard label="Avg. order value" value={`${CURRENCY}214`} icon={TrendingUp} trend={{ direction: "up", value: "1.9%" }} />
        <StatCard label="Conversion rate" value="3.4%" icon={Percent} trend={{ direction: "down", value: "0.3%" }} />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm mb-8">
        <h3 className="text-[15px] font-medium text-[var(--text-primary)] mb-5">Revenue trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_TREND}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_GOLD} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke={CHART_INK} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={CHART_INK} fontSize={12} tickLine={false} axisLine={false} width={48} />
              <ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} formatter={(v) => [`${CURRENCY}${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke={CHART_GOLD} strokeWidth={2.5} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-soft-sm">
        <div className="p-6 pb-0"><h3 className="text-[15px] font-medium text-[var(--text-primary)] mb-1">Top products</h3></div>
        <TableShell>
          <thead className="border-b border-[var(--border)]">
            <tr><Th>Product</Th><Th>Category</Th><Th>Units sold</Th><Th className="text-right">Revenue</Th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {ADMIN_PRODUCTS.slice(0, 4).map((p, i) => (
              <tr key={p.id}>
                <Td className="font-medium">{p.name}</Td>
                <Td className="text-[var(--text-muted)]">{p.category}</Td>
                <Td>{(80 - i * 12)}</Td>
                <Td className="text-right">{CURRENCY}{((80 - i * 12) * p.price).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>
    </div>
  );
}

/* — Charts — */

function ChartsSection() {
  return (
    <div>
      <SectionTitle eyebrow="Insights" title="Charts" description="Visual breakdowns across orders, payments, and customers." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Orders by category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ORDERS_BY_CATEGORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="category" stroke={CHART_INK} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={CHART_INK} fontSize={12} tickLine={false} axisLine={false} width={36} />
              <ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} />
              <Bar dataKey="orders" fill={CHART_GOLD} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment method split">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={PAYMENT_SPLIT} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {PAYMENT_SPLIT.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New vs. returning customers" span>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CUSTOMER_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke={CHART_INK} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={CHART_INK} fontSize={12} tickLine={false} axisLine={false} width={40} />
              <ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="newC" name="New" stroke={CHART_GOLD} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="returning" name="Returning" stroke={CHART_INK} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, span }) {
  return (
    <div className={cn("rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm", span && "lg:col-span-2")}>
      <h3 className="text-[15px] font-medium text-[var(--text-primary)] mb-5">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

/* — Activity Logs — */

const SCOPE_META = {
  users: { label: "Users", variant: "neutral" },
  orders: { label: "Orders", variant: "gold" },
  products: { label: "Products", variant: "success" },
  coupons: { label: "Coupons", variant: "warning" },
  system: { label: "System", variant: "neutral" },
};

function ActivityLogsSection() {
  const [scope, setScope] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = ACTIVITY_LOGS.filter(
    (l) => (scope === "all" || l.scope === scope) && l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionTitle eyebrow="System" title="Activity Logs" description="A running audit trail of admin and system actions." />

      <Toolbar search={search} onSearch={setSearch}>
        {["all", "users", "orders", "products", "coupons", "system"].map((s) => (
          <Chip key={s} selected={scope === s} onClick={() => setScope(s)}>
            {s === "all" ? "All" : SCOPE_META[s].label}
          </Chip>
        ))}
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="No matching activity" description="Try a different filter or search term." />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-soft-sm divide-y divide-[var(--border)]">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-center gap-4 p-5">
              <Avatar name={log.actor} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="font-medium">{log.actor}</span> {log.action}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{log.time}</p>
              </div>
              <Badge variant={SCOPE_META[log.scope].variant}>{SCOPE_META[log.scope].label}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
