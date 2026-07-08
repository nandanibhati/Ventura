import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Users as UsersIcon,
  Package,
  Tags,
  Ticket,
  Percent as PercentIcon,
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
  Store,
  Star,
  Layout,
  Settings as SettingsIcon,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Copy,
  KeyRound,
  X,
  UserPlus,
  ShieldOff,
  Award,
  Monitor,
  Tablet,
  Smartphone,
  GripVertical,
  Eye,
  EyeOff,
  Upload,
  Undo2,
  Redo2,
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
import { Input, Select, Checkbox } from "../../components/ui/Input";
import { SearchInput } from "../../components/ui/Input";
import { Badge, Chip, Avatar, EmptyState, useToast } from "../../components/ui/Feedback";
import { Modal, Drawer, Dropdown } from "../../components/ui/Overlay";
import { Pagination } from "../../components/ui/Navigation";
import { SectionTitle } from "../../components/ui/Typography";
import { StatCard } from "../../components/ui/Cards";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import { AnimatedCard, ANIMATION_PRESETS, DEFAULT_ANIMATION_CONFIG } from "../../lib/animations";
import { DEFAULT_THEME, FONT_PRESETS, applyTheme } from "../../lib/themePresets";
import { CARD_TEMPLATES } from "../../lib/cardTemplates";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/admin";
import { productsApi, uploadsApi } from "../../api/products";
import { resolveMediaUrl } from "../../lib/api";
import { categoriesApi, brandsApi, promotionsApi, settingsApi, homepageApi, permissionsApi } from "../../api/catalog";
import { couponsApi } from "../../api/cart";

const CURRENCY = "£";
const CHART_GOLD = "#d8b36a";
const CHART_INK = "#4a4855";
const PIE_COLORS = ["#d8b36a", "#8f8d99", "#6fae76", "#e0645f"];
const PAGE_SIZE = 10;

/* — Nav — */
const NAV_GROUPS = [
  {
    label: "Manage",
    items: [
      { id: "users", label: "Users", icon: UsersIcon },
      { id: "sellers", label: "Sellers", icon: Store },
      { id: "orders", label: "Orders", icon: ShoppingCart },
      { id: "products", label: "Products", icon: Package },
      { id: "categories", label: "Categories", icon: Tags },
      { id: "brands", label: "Brands", icon: Award },
      { id: "coupons", label: "Coupons", icon: Ticket },
      { id: "promotions", label: "Offers", icon: PercentIcon },
      { id: "reviews", label: "Reviews", icon: Star },
      { id: "homepage", label: "Homepage CMS", icon: Layout },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "analytics", label: "Analytics", icon: LineChartIcon },
      { id: "charts", label: "Charts", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { id: "settings", label: "Store Settings", icon: SettingsIcon },
      { id: "permissions", label: "Roles & Permissions", icon: ShieldCheck },
      { id: "logs", label: "Activity Logs", icon: History },
    ],
  },
];
const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const EDIT_ENTITY_TAB = { category: "categories", product: "products", brand: "brands" };

export default function AdminDashboard() {
  useDocumentTitle("Admin Dashboard");
  const [activeTab, setActiveTab] = useState("users");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { role } = useAuth();
  const navGroups = useMemo(
    () =>
      role === "superadmin"
        ? NAV_GROUPS
        : NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.id !== "permissions") })),
    [role]
  );
  const activeItem = ALL_NAV_ITEMS.find((n) => n.id === activeTab);

  // Homepage CMS's live preview iframe posts this when an admin clicks an image directly in
  // the preview (e.g. a category tile) — jump straight to that exact item's editor instead of
  // making them find it in the nav. See Home.jsx's useCmsEditClick / CmsEditOverlay.
  const [pendingEdit, setPendingEdit] = useState(null);
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "veluntra-cms-edit-request") return;
      const tab = EDIT_ENTITY_TAB[e.data.entityType];
      if (!tab) return;
      setActiveTab(tab);
      setPendingEdit({ entityType: e.data.entityType, entityId: e.data.entityId });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  const clearPendingEdit = () => setPendingEdit(null);

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
          <SidebarContent groups={navGroups} active={activeTab} onSelect={setActiveTab} />
        </aside>

        <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} side="left" title="Admin Panel" width="290px">
          <SidebarContent groups={navGroups} active={activeTab} onSelect={(id) => { setActiveTab(id); setMobileNavOpen(false); }} embedded />
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
              {activeTab === "sellers" && <SellersSection />}
              {activeTab === "orders" && <OrdersSection />}
              {activeTab === "products" && (
                <ProductsSection
                  pendingEditId={pendingEdit?.entityType === "product" ? pendingEdit.entityId : null}
                  onConsumePendingEdit={clearPendingEdit}
                />
              )}
              {activeTab === "categories" && (
                <CategoriesSection
                  pendingEditId={pendingEdit?.entityType === "category" ? pendingEdit.entityId : null}
                  onConsumePendingEdit={clearPendingEdit}
                />
              )}
              {activeTab === "brands" && (
                <BrandsSection
                  pendingEditId={pendingEdit?.entityType === "brand" ? pendingEdit.entityId : null}
                  onConsumePendingEdit={clearPendingEdit}
                />
              )}
              {activeTab === "coupons" && <CouponsSection />}
              {activeTab === "promotions" && <PromotionsSection />}
              {activeTab === "reviews" && <ReviewsSection />}
              {activeTab === "homepage" && <HomepageCmsSection />}
              {activeTab === "analytics" && <AnalyticsSection />}
              {activeTab === "charts" && <ChartsSection />}
              {activeTab === "settings" && <SettingsSection />}
              {activeTab === "permissions" && <PermissionsSection />}
              {activeTab === "logs" && <ActivityLogsSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* — Sidebar — */

function SidebarContent({ groups, active, onSelect, embedded }) {
  return (
    <div className={cn("flex flex-col gap-7", !embedded && "sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto")}>
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

      {groups.map((group) => (
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
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
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

function ErrorNotice({ onRetry }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-error-500/30 bg-error-500/5 p-6 text-center">
      <p className="text-sm text-error-600">Something went wrong loading this section.</p>
      <button onClick={onRetry} className="mt-2 text-sm font-medium text-gold-600 hover:underline">Try again</button>
    </div>
  );
}

/* — Users — */

const USER_ROLES = ["all", "customer", "seller", "admin", "superadmin"];

function AddAdminModal({ open, onClose, onCreate, isPending }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add admin account"
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton
            loading={isPending}
            onClick={() => onCreate(form, () => setForm({ name: "", email: "", password: "" }))}
          >
            Create admin
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <Input
          label="Password"
          type="password"
          helperText="At least 12 characters."
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
      </div>
    </Modal>
  );
}

function UsersSection() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { role } = useAuth();
  const isSuperAdmin = role === "superadmin";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users", { search, roleFilter, page }],
    queryFn: () => adminApi.listUsers({ search: search || undefined, role: roleFilter, page, limit: PAGE_SIZE }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.setUserStatus(id, status),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: invalidate,
  });
  const resetPasswordMutation = useMutation({
    mutationFn: (id) => adminApi.resetUserPassword(id),
    onSuccess: () => toast({ title: "Password reset email sent", variant: "success" }),
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't send reset email", variant: "error" }),
  });
  const roleMutation = useMutation({
    mutationFn: ({ id, role: newRole }) => adminApi.setUserRole(id, newRole),
    onSuccess: () => {
      invalidate();
      toast({ title: "Role updated", variant: "success" });
    },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't update role", variant: "error" }),
  });
  const createAdminMutation = useMutation({
    mutationFn: (payload) => adminApi.createAdmin(payload),
    onSuccess: () => {
      invalidate();
      setAddAdminOpen(false);
      toast({ title: "Admin account created", variant: "success" });
    },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't create admin", variant: "error" }),
  });
  const handleCreateAdmin = (payload, resetForm) => createAdminMutation.mutate(payload, { onSuccess: resetForm });

  const users = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.meta?.total || 0) / PAGE_SIZE));

  return (
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Users"
        description="Everyone with an account on the platform."
        action={
          isSuperAdmin && (
            <PrimaryButton leftIcon={UserPlus} onClick={() => setAddAdminOpen(true)}>
              Add admin
            </PrimaryButton>
          )
        }
      />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }}>
        {USER_ROLES.map((r) => (
          <Chip key={r} selected={roleFilter === r} onClick={() => { setRoleFilter(r); setPage(1); }}>
            {r === "all" ? "All roles" : r[0].toUpperCase() + r.slice(1)}
          </Chip>
        ))}
      </Toolbar>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading users…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Try a different search or filter." />
      ) : (
        <TableShell>
          <thead className="border-b border-[var(--border)]">
            <tr><Th>Name</Th><Th>Role</Th><Th>Status</Th><Th>Joined</Th><Th className="text-right">Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.map((u) => (
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
                <Td className="text-[var(--text-muted)]">{new Date(u.createdAt).toLocaleDateString()}</Td>
                <Td className="text-right">
                  <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                    <Dropdown.Item icon={KeyRound} onClick={() => resetPasswordMutation.mutate(u.id)}>Reset password</Dropdown.Item>
                    <Dropdown.Item
                      icon={u.status === "active" ? Ban : CheckCircle2}
                      onClick={() => statusMutation.mutate({ id: u.id, status: u.status === "active" ? "suspended" : "active" })}
                    >
                      {u.status === "active" ? "Suspend" : "Reactivate"}
                    </Dropdown.Item>
                    {isSuperAdmin && (u.role === "customer" || u.role === "admin") && (
                      <Dropdown.Item
                        icon={u.role === "admin" ? ShieldOff : ShieldCheck}
                        onClick={() => roleMutation.mutate({ id: u.id, role: u.role === "admin" ? "customer" : "admin" })}
                      >
                        {u.role === "admin" ? "Remove admin access" : "Make admin"}
                      </Dropdown.Item>
                    )}
                    <Dropdown.Separator />
                    <Dropdown.Item icon={Trash2} destructive onClick={() => deleteMutation.mutate(u.id)}>Delete</Dropdown.Item>
                  </Dropdown>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <div className="mt-6"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>

      {isSuperAdmin && (
        <AddAdminModal
          open={addAdminOpen}
          onClose={() => setAddAdminOpen(false)}
          onCreate={handleCreateAdmin}
          isPending={createAdminMutation.isPending}
        />
      )}
    </div>
  );
}

/* — Sellers — */

function SellersSection() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [commissionDraft, setCommissionDraft] = useState({});
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-sellers", { search, statusFilter, page }],
    queryFn: () => adminApi.listStores({ search: search || undefined, status: statusFilter, page, limit: PAGE_SIZE }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
  const statusMutation = useMutation({ mutationFn: ({ id, status }) => adminApi.setStoreStatus(id, status), onSuccess: invalidate });
  const commissionMutation = useMutation({
    mutationFn: ({ id, commissionPercent }) => adminApi.setStoreCommission(id, commissionPercent),
    onSuccess: invalidate,
  });

  const stores = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.meta?.total || 0) / PAGE_SIZE));

  return (
    <div>
      <SectionTitle eyebrow="Manage" title="Sellers" description="Seller stores, approval status, and commission rates." />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }}>
        {["all", "pending", "approved", "suspended"].map((s) => (
          <Chip key={s} selected={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      </Toolbar>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading sellers…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : stores.length === 0 ? (
        <EmptyState icon={Store} title="No sellers found" description="Try a different search or filter." />
      ) : (
        <TableShell>
          <thead className="border-b border-[var(--border)]">
            <tr><Th>Store</Th><Th>Owner</Th><Th>Products</Th><Th>Orders</Th><Th>Commission</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {stores.map((s) => (
              <tr key={s.id}>
                <Td className="font-medium">{s.name}</Td>
                <Td>
                  <p>{s.ownerName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{s.ownerEmail}</p>
                </Td>
                <Td>{s.productCount}</Td>
                <Td>{s.orderCount}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Input
                      className="w-20"
                      placeholder="Default"
                      value={commissionDraft[s.id] ?? (s.commissionPercent ?? "")}
                      onChange={(e) => setCommissionDraft((d) => ({ ...d, [s.id]: e.target.value }))}
                    />
                    <button
                      className="text-xs font-medium text-gold-600 hover:underline"
                      onClick={() =>
                        commissionMutation.mutate({
                          id: s.id,
                          commissionPercent: commissionDraft[s.id] === "" ? null : Number(commissionDraft[s.id] ?? s.commissionPercent),
                        })
                      }
                    >
                      Save
                    </button>
                  </div>
                </Td>
                <Td>
                  <Badge variant={s.status === "approved" ? "success" : s.status === "pending" ? "warning" : "error"}>
                    {s.status[0].toUpperCase() + s.status.slice(1)}
                  </Badge>
                </Td>
                <Td className="text-right">
                  <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                    {s.status !== "approved" && (
                      <Dropdown.Item icon={CheckCircle2} onClick={() => statusMutation.mutate({ id: s.id, status: "approved" })}>
                        Approve
                      </Dropdown.Item>
                    )}
                    {s.status !== "suspended" && (
                      <Dropdown.Item icon={Ban} destructive onClick={() => statusMutation.mutate({ id: s.id, status: "suspended" })}>
                        Suspend
                      </Dropdown.Item>
                    )}
                    {s.status === "suspended" && (
                      <Dropdown.Item icon={CheckCircle2} onClick={() => statusMutation.mutate({ id: s.id, status: "approved" })}>
                        Reinstate
                      </Dropdown.Item>
                    )}
                  </Dropdown>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <div className="mt-6"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
    </div>
  );
}

/* — Orders — */

const ORDER_STATUS_VARIANT = {
  pending: "neutral",
  processing: "warning",
  shipped: "gold",
  delivered: "success",
  cancelled: "error",
  return_requested: "warning",
  returned: "error",
  exchange_requested: "warning",
  exchanged: "gold",
};
const PAYMENT_STATUS_VARIANT = { paid: "success", pending: "warning", refunded: "neutral" };
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "return_requested", "returned", "exchange_requested", "exchanged"];

function OrdersSection() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-orders", { search, statusFilter, page }],
    queryFn: () => adminApi.listOrders({ search: search || undefined, status: statusFilter, page, limit: PAGE_SIZE }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateOrderStatus(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const orders = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.meta?.total || 0) / PAGE_SIZE));

  return (
    <div>
      <SectionTitle eyebrow="Manage" title="Orders" description="Every transaction across the storefront, in one queue." />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }}>
        {["all", ...ORDER_STATUSES].map((s) => (
          <Chip key={s} selected={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </Chip>
        ))}
      </Toolbar>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading orders…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Try a different search or filter." />
      ) : (
        <TableShell>
          <thead className="border-b border-[var(--border)]">
            <tr><Th>Order</Th><Th>Customer</Th><Th>Date</Th><Th>Total</Th><Th>Status</Th><Th>Payment</Th><Th className="text-right">Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {orders.map((o) => (
              <tr key={o.id}>
                <Td className="font-medium">{o.orderNumber}</Td>
                <Td>{o.customer}</Td>
                <Td className="text-[var(--text-muted)]">{new Date(o.placedAt).toLocaleDateString()}</Td>
                <Td>{CURRENCY}{Number(o.total).toLocaleString()}</Td>
                <Td><Badge variant={ORDER_STATUS_VARIANT[o.status]}>{o.status.replace(/_/g, " ")}</Badge></Td>
                <Td><Badge variant={PAYMENT_STATUS_VARIANT[o.paymentStatus]}>{o.paymentStatus}</Badge></Td>
                <Td className="text-right">
                  <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                    <Dropdown.Item icon={Download} onClick={() => adminApi.downloadInvoice(o.id, o.orderNumber)}>Download invoice</Dropdown.Item>
                    <Dropdown.Separator />
                    {ORDER_STATUSES.filter((s) => s !== o.status).map((s) => (
                      <Dropdown.Item key={s} icon={CheckCircle2} onClick={() => statusMutation.mutate({ id: o.id, status: s })}>
                        Mark as {s.replace(/_/g, " ")}
                      </Dropdown.Item>
                    ))}
                  </Dropdown>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <div className="mt-6"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
    </div>
  );
}

/* — Products — */

const PRODUCT_STATUSES = ["draft", "published", "archived", "hidden", "upcoming", "discontinued"];

function ProductsSection({ pendingEditId, onConsumePendingEdit } = {}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-products", { search, page }],
    queryFn: () => adminApi.listProducts({ search: search || undefined, page, limit: PAGE_SIZE }),
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: brandsApi.list });
  const { data: sellersResult } = useQuery({ queryKey: ["admin-sellers-all"], queryFn: () => adminApi.listStores({ limit: 100 }) });
  const stores = sellersResult?.items || [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-products"] });

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
      name: "", description: "", categoryId: categories[0]?.id, brandId: brands[0]?.id, storeId: stores[0]?.id,
      price: "", stock: 0, status: "draft", images: [],
      isFeatured: false, isTrending: false, isBestSeller: false, isNew: false, badge: "",
      animationOverride: null,
    });
    setModalOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, price: p.price, stock: p.stock, status: p.status, categoryId: p.categoryId, brandId: p.brandId,
      images: p.images?.map((i) => resolveMediaUrl(i.url)) || [],
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

  // Clicked straight through from the Homepage CMS live preview — the target product might
  // not be on the currently-loaded/filtered page of the list, so fetch it directly by id
  // rather than searching `products`.
  useEffect(() => {
    if (!pendingEditId) return;
    let cancelled = false;
    productsApi.getByIdForManage(pendingEditId).then((p) => {
      if (!cancelled) openEdit(p);
      onConsumePendingEdit?.();
    }).catch(() => onConsumePendingEdit?.());
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEditId]);

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
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Products"
        description="Catalogue inventory, pricing, and publish status across every store."
        action={<PrimaryButton leftIcon={Plus} onClick={openCreate}>Add product</PrimaryButton>}
      />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading products…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try a different search." />
      ) : (
        <TableShell>
          <thead className="border-b border-[var(--border)]">
            <tr><Th>Product</Th><Th>Category</Th><Th>Brand</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {products.map((p) => (
              <tr key={p.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-inset)] font-medium text-gold-500"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {p.images?.[0]?.url ? <img src={resolveMediaUrl(p.images[0].url)} alt="" className="h-full w-full object-cover" /> : p.name.charAt(0)}
                    </span>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </Td>
                <Td className="text-[var(--text-muted)]">{p.category?.name}</Td>
                <Td className="text-[var(--text-muted)]">{p.brand?.name}</Td>
                <Td>{CURRENCY}{Number(p.price).toLocaleString()}</Td>
                <Td>
                  <span className={cn("flex items-center gap-1.5", p.stock === 0 ? "text-error-500" : p.stock < 5 ? "text-warning-500" : "")}>
                    {p.stock < 5 && p.stock > 0 && <AlertTriangle className="size-3.5" />}
                    {p.stock === 0 ? "Out of stock" : p.stock}
                  </span>
                </Td>
                <Td><Badge variant={p.status === "published" ? "success" : "neutral"}>{p.status}</Badge></Td>
                <Td className="text-right">
                  <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                    <Dropdown.Item icon={Pencil} onClick={() => openEdit(p)}>Edit product</Dropdown.Item>
                    <Dropdown.Item icon={Copy} onClick={() => duplicateMutation.mutate(p.id)}>Duplicate</Dropdown.Item>
                    <Dropdown.Item
                      icon={CheckCircle2}
                      onClick={() => updateMutation.mutate({ id: p.id, payload: { status: p.status === "published" ? "archived" : "published" } })}
                    >
                      {p.status === "published" ? "Archive" : "Publish"}
                    </Dropdown.Item>
                    <Dropdown.Separator />
                    <Dropdown.Item icon={Trash2} destructive onClick={() => removeMutation.mutate(p.id)}>Delete</Dropdown.Item>
                  </Dropdown>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <div className="mt-6"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>

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
            <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Images</p>
            <div className="flex flex-wrap gap-2">
              {(form.images || []).map((url) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-[var(--border)]">
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
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)]">
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
              className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm"
              rows={3}
            />
          )}
          {!editing && (
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
              <Select label="Brand" value={form.brandId} onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))} options={brands.map((b) => ({ value: b.id, label: b.name }))} />
            </div>
          )}
          {!editing && (
            <Select label="Store" value={form.storeId} onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))} options={stores.map((s) => ({ value: s.id, label: s.name }))} />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" leftIcon={DollarSign} value={form.price ?? ""} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            <Input label="Stock quantity" type="number" value={form.stock ?? ""} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
          </div>
          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} options={PRODUCT_STATUSES.map((s) => ({ value: s, label: s }))} />

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Homepage merchandising</p>
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
            <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Animation</p>
            <Checkbox
              label="Enable animation for this product"
              checked={form.animationOverride?.enabled !== false}
              onChange={(e) =>
                setForm((f) => ({ ...f, animationOverride: { ...f.animationOverride, enabled: e.target.checked } }))
              }
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

/* — Categories — */

function CategoriesSection({ pendingEditId, onConsumePendingEdit } = {}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", imageUrl: null });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [], isLoading, isError, refetch } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const createMutation = useMutation({ mutationFn: (payload) => categoriesApi.create(payload), onSuccess: () => { invalidate(); setModalOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => categoriesApi.update(id, payload), onSuccess: () => { invalidate(); setModalOpen(false); } });
  const removeMutation = useMutation({ mutationFn: (id) => categoriesApi.remove(id), onSuccess: invalidate });
  const reorderMutation = useMutation({ mutationFn: (items) => categoriesApi.reorder(items), onSuccess: invalidate });

  const move = (index, dir) => {
    const next = [...categories];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    reorderMutation.mutate(next.map((c, i) => ({ id: c.id, position: i })));
  };

  const openCreate = () => { setEditing(null); setForm({ name: "", slug: "", imageUrl: null }); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, slug: c.slug, imageUrl: c.imageUrl ? resolveMediaUrl(c.imageUrl) : null }); setModalOpen(true); };
  const submitForm = () => (editing ? updateMutation.mutate({ id: editing.id, payload: form }) : createMutation.mutate(form));

  // Clicked straight through from the Homepage CMS live preview.
  useEffect(() => {
    if (!pendingEditId || categories.length === 0) return;
    const match = categories.find((c) => c.id === pendingEditId);
    if (match) openEdit(match);
    onConsumePendingEdit?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEditId, categories]);

  const handleImageUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const { urls } = await uploadsApi.uploadImages([files[0]]);
      setForm((f) => ({ ...f, imageUrl: resolveMediaUrl(urls[0]) }));
    } catch {
      toast({ title: "Image upload failed", variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Categories"
        description="Top-level groupings used across the storefront and filters."
        action={<PrimaryButton leftIcon={Plus} onClick={openCreate}>Add category</PrimaryButton>}
      />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading categories…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft-sm">
              <div className="flex items-center gap-3">
                {c.imageUrl ? (
                  <img src={resolveMediaUrl(c.imageUrl)} alt="" className="size-10 shrink-0 rounded-[var(--radius-sm)] border border-[var(--border)] object-cover" />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-400/12 text-gold-500">
                    <Tags className="size-4.5" />
                  </span>
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{c.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{c.productCount} products</p>
                </div>
              </div>
              <div className="flex gap-1">
                <IconButton icon={ArrowUp} size="sm" aria-label="Move up" onClick={() => move(i, -1)} />
                <IconButton icon={ArrowDown} size="sm" aria-label="Move down" onClick={() => move(i, 1)} />
                <IconButton icon={Pencil} size="sm" aria-label="Edit category" onClick={() => openEdit(c)} />
                <IconButton icon={Trash2} size="sm" aria-label="Delete category" onClick={() => removeMutation.mutate(c.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit category" : "Add category"} footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submitForm}>{editing ? "Save changes" : "Save category"}</PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Category name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Slug (optional)" helperText="Used in the storefront URL." value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Photo</span>
            <p className="text-xs text-[var(--text-muted)]">Shown on the homepage category strip in place of the generic icon.</p>
            <div className="flex items-center gap-3">
              {form.imageUrl && (
                <img src={form.imageUrl} alt="" className="size-16 rounded-[var(--radius-md)] border border-[var(--border)] object-cover" />
              )}
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium">
                {uploading ? "Uploading…" : form.imageUrl ? "Replace" : "Upload photo"}
                <input type="file" accept="image/*" hidden disabled={uploading} onChange={(e) => handleImageUpload(e.target.files)} />
              </label>
              {form.imageUrl && (
                <SecondaryButton size="sm" onClick={() => setForm((f) => ({ ...f, imageUrl: null }))}>
                  Remove
                </SecondaryButton>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* — Brands — */

function BrandsSection({ pendingEditId, onConsumePendingEdit } = {}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", logoUrl: null });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: brands = [], isLoading, isError, refetch } = useQuery({ queryKey: ["brands"], queryFn: brandsApi.list });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["brands"] });

  const createMutation = useMutation({
    mutationFn: (payload) => brandsApi.create(payload),
    onSuccess: () => { invalidate(); setModalOpen(false); },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't create brand", variant: "error" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => brandsApi.update(id, payload),
    onSuccess: () => { invalidate(); setModalOpen(false); },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't update brand", variant: "error" }),
  });
  const removeMutation = useMutation({ mutationFn: (id) => brandsApi.remove(id), onSuccess: invalidate });
  const reorderMutation = useMutation({ mutationFn: (items) => brandsApi.reorder(items), onSuccess: invalidate });

  const move = (index, dir) => {
    const next = [...brands];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    reorderMutation.mutate(next.map((b, i) => ({ id: b.id, position: i })));
  };

  const openCreate = () => { setEditing(null); setForm({ name: "", slug: "", logoUrl: null }); setModalOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name, slug: b.slug, logoUrl: b.logoUrl ? resolveMediaUrl(b.logoUrl) : null }); setModalOpen(true); };
  const submitForm = () => (editing ? updateMutation.mutate({ id: editing.id, payload: form }) : createMutation.mutate(form));

  // Clicked straight through from the Homepage CMS live preview.
  useEffect(() => {
    if (!pendingEditId || brands.length === 0) return;
    const match = brands.find((b) => b.id === pendingEditId);
    if (match) openEdit(match);
    onConsumePendingEdit?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEditId, brands]);

  const handleLogoUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const { urls } = await uploadsApi.uploadImages([files[0]]);
      setForm((f) => ({ ...f, logoUrl: resolveMediaUrl(urls[0]) }));
    } catch {
      toast({ title: "Logo upload failed", variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Brands"
        description="Brand logos shown on the homepage and product filters."
        action={<PrimaryButton leftIcon={Plus} onClick={openCreate}>Add brand</PrimaryButton>}
      />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading brands…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b, i) => (
            <div key={b.id} className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gold-400/12 text-gold-500">
                  {b.logoUrl ? <img src={resolveMediaUrl(b.logoUrl)} alt="" className="size-full object-contain" /> : <Award className="size-4.5" />}
                </span>
                <p className="text-sm font-medium text-[var(--text-primary)]">{b.name}</p>
              </div>
              <div className="flex gap-1">
                <IconButton icon={ArrowUp} size="sm" aria-label="Move up" onClick={() => move(i, -1)} />
                <IconButton icon={ArrowDown} size="sm" aria-label="Move down" onClick={() => move(i, 1)} />
                <IconButton icon={Pencil} size="sm" aria-label="Edit brand" onClick={() => openEdit(b)} />
                <IconButton icon={Trash2} size="sm" aria-label="Delete brand" onClick={() => removeMutation.mutate(b.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit brand" : "Add brand"} footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submitForm}>{editing ? "Save changes" : "Save brand"}</PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Brand name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Slug (optional)" helperText="Used in the storefront URL." value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Logo</p>
            <div className="flex items-center gap-3">
              {form.logoUrl && (
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-[var(--border)] p-1">
                  <img src={form.logoUrl} alt="" className="size-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, logoUrl: null }))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)]">
                {uploading ? "…" : <Plus className="h-4 w-4" />}
                <input type="file" accept="image/*" hidden onChange={(e) => handleLogoUpload(e.target.files)} />
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* — Coupons — */

function CouponsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", usageLimit: 100, expiresAt: "" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin-coupons"], queryFn: () => couponsApi.list({ limit: 50 }) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });

  const createMutation = useMutation({
    mutationFn: (payload) => couponsApi.create(payload),
    onSuccess: () => { invalidate(); setModalOpen(false); },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't create coupon", variant: "error" }),
  });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => couponsApi.update(id, payload), onSuccess: invalidate });
  const removeMutation = useMutation({ mutationFn: (id) => couponsApi.remove(id), onSuccess: invalidate });

  const coupons = data?.items || [];

  return (
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Coupons"
        description="Discount codes, usage caps, and expiry windows."
        action={<PrimaryButton leftIcon={Plus} onClick={() => setModalOpen(true)}>Create coupon</PrimaryButton>}
      />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading coupons…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No coupons yet" description="Create your first coupon code." />
      ) : (
        <TableShell>
          <thead className="border-b border-[var(--border)]">
            <tr><Th>Code</Th><Th>Type</Th><Th>Usage</Th><Th>Expires</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {coupons.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium tracking-wide">{c.code}</Td>
                <Td className="text-[var(--text-muted)]">
                  {c.type} · {c.type === "percent" ? `${Number(c.value)}%` : c.type === "fixed" ? `${CURRENCY}${Number(c.value)}` : "—"}
                </Td>
                <Td>
                  <div className="flex items-center gap-2 w-36">
                    <div className="h-1.5 flex-1 rounded-full bg-[var(--surface-inset)] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-100" style={{ width: `${Math.min(100, (c.usageCount / c.usageLimit) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-[var(--text-muted)] shrink-0">{c.usageCount}/{c.usageLimit}</span>
                  </div>
                </Td>
                <Td className="text-[var(--text-muted)]">{new Date(c.expiresAt).toLocaleDateString()}</Td>
                <Td>
                  <Badge variant={c.enabled && new Date(c.expiresAt) > new Date() ? "success" : "neutral"}>
                    {c.enabled && new Date(c.expiresAt) > new Date() ? "Active" : "Inactive"}
                  </Badge>
                </Td>
                <Td className="text-right">
                  <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                    <Dropdown.Item icon={c.enabled ? Ban : CheckCircle2} onClick={() => updateMutation.mutate({ id: c.id, payload: { enabled: !c.enabled } })}>
                      {c.enabled ? "Disable" : "Enable"}
                    </Dropdown.Item>
                    <Dropdown.Separator />
                    <Dropdown.Item icon={Trash2} destructive onClick={() => removeMutation.mutate(c.id)}>Delete</Dropdown.Item>
                  </Dropdown>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create coupon" footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => createMutation.mutate({ ...form, value: Number(form.value), usageLimit: Number(form.usageLimit) })} loading={createMutation.isPending}>
            Create coupon
          </PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Coupon code" placeholder="SUMMER20" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Discount type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} options={[{ value: "percent", label: "Percentage" }, { value: "fixed", label: "Fixed amount" }, { value: "free_shipping", label: "Free shipping" }]} />
            <Input label="Value" leftIcon={Percent} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Usage limit" type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} />
            <Input label="Expires" type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* — Promotions / Offers — */

const PROMOTION_TYPES = ["flash_sale", "deal_of_day", "bogo", "percentage", "fixed", "category_discount", "brand_discount", "product_discount", "first_order", "festival"];

function PromotionsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "flash_sale", value: "", startsAt: "", endsAt: "" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin-promotions"], queryFn: () => promotionsApi.list({ limit: 50 }) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });

  const createMutation = useMutation({
    mutationFn: (payload) => promotionsApi.create(payload),
    onSuccess: () => { invalidate(); setModalOpen(false); },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't create offer", variant: "error" }),
  });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => promotionsApi.update(id, payload), onSuccess: invalidate });
  const removeMutation = useMutation({ mutationFn: (id) => promotionsApi.remove(id), onSuccess: invalidate });

  const promotions = data?.items || [];
  const STATUS_VARIANT = { active: "success", scheduled: "warning", ended: "neutral", disabled: "neutral" };

  return (
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Offers"
        description="Flash sales, deals of the day, and scoped discounts — status is always computed live."
        action={<PrimaryButton leftIcon={Plus} onClick={() => setModalOpen(true)}>Create offer</PrimaryButton>}
      />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading offers…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : promotions.length === 0 ? (
        <EmptyState icon={PercentIcon} title="No offers yet" description="Create your first promotional offer." />
      ) : (
        <TableShell>
          <thead className="border-b border-[var(--border)]">
            <tr><Th>Name</Th><Th>Type</Th><Th>Value</Th><Th>Window</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {promotions.map((p) => (
              <tr key={p.id}>
                <Td className="font-medium">{p.name}</Td>
                <Td className="text-[var(--text-muted)]">{p.type.replace(/_/g, " ")}</Td>
                <Td>{p.value != null ? `${p.value}${p.type === "fixed" ? CURRENCY : "%"}` : "—"}</Td>
                <Td className="text-[var(--text-muted)] text-xs">
                  {new Date(p.startsAt).toLocaleDateString()} – {new Date(p.endsAt).toLocaleDateString()}
                </Td>
                <Td><Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge></Td>
                <Td className="text-right">
                  <Dropdown trigger={<IconButton icon={MoreVertical} size="sm" aria-label="Row actions" />}>
                    <Dropdown.Item icon={p.enabled ? Ban : CheckCircle2} onClick={() => updateMutation.mutate({ id: p.id, payload: { enabled: !p.enabled } })}>
                      {p.enabled ? "Disable" : "Enable"}
                    </Dropdown.Item>
                    <Dropdown.Separator />
                    <Dropdown.Item icon={Trash2} destructive onClick={() => removeMutation.mutate(p.id)}>Delete</Dropdown.Item>
                  </Dropdown>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create offer" footer={
        <>
          <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={() => createMutation.mutate({ ...form, value: form.value ? Number(form.value) : undefined })}
            loading={createMutation.isPending}
          >
            Create offer
          </PrimaryButton>
        </>
      }>
        <div className="flex flex-col gap-4">
          <Input label="Offer name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} options={PROMOTION_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))} />
          <Input label="Value (% or flat amount, if applicable)" type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Starts" type="datetime-local" value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} />
            <Input label="Ends" type="datetime-local" value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* — Reviews — */

function ReviewsSection() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-reviews", { statusFilter, page }],
    queryFn: () => adminApi.listReviews({ status: statusFilter, page, limit: PAGE_SIZE }),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });

  const approveMutation = useMutation({ mutationFn: (id) => adminApi.approveReview(id), onSuccess: invalidate });
  const rejectMutation = useMutation({ mutationFn: (id) => adminApi.rejectReview(id), onSuccess: invalidate });
  const featureMutation = useMutation({ mutationFn: ({ id, isFeatured }) => adminApi.setReviewFeatured(id, isFeatured), onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: (id) => adminApi.deleteReview(id), onSuccess: invalidate });

  const reviews = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.meta?.total || 0) / PAGE_SIZE));

  return (
    <div>
      <SectionTitle eyebrow="Manage" title="Reviews" description="Moderate customer reviews before they go live." />

      <Toolbar search="" onSearch={() => {}}>
        {["pending", "approved", "rejected", "all"].map((s) => (
          <Chip key={s} selected={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s[0].toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      </Toolbar>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading reviews…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews here" description="Nothing to moderate in this filter." />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{r.reviewer}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">on {r.productName}</p>
                  {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{r.body}</p>
                </div>
                <Badge variant={r.status === "approved" ? "success" : r.status === "rejected" ? "error" : "warning"}>{r.status}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {r.status !== "approved" && (
                  <OutlineButton size="sm" leftIcon={CheckCircle2} onClick={() => approveMutation.mutate(r.id)}>Approve</OutlineButton>
                )}
                {r.status !== "rejected" && (
                  <OutlineButton size="sm" leftIcon={Ban} onClick={() => rejectMutation.mutate(r.id)}>Reject</OutlineButton>
                )}
                <OutlineButton size="sm" leftIcon={Star} onClick={() => featureMutation.mutate({ id: r.id, isFeatured: !r.isFeatured })}>
                  {r.isFeatured ? "Unfeature" : "Feature"}
                </OutlineButton>
                <OutlineButton size="sm" leftIcon={Trash2} onClick={() => deleteMutation.mutate(r.id)}>Delete</OutlineButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
    </div>
  );
}

/* — Homepage CMS — */

const SECTION_TYPES = ["hero_banner", "slider", "categories", "featured_products", "trending_products", "best_sellers", "flash_sale", "collections", "brands", "testimonials", "announcement", "ad_banner", "custom"];

// Section types whose product grid is driven by a selectable "product source" (Home.jsx's
// resolveProductSourceParams) — flash_sale shows the grid too but is always tied to the
// active promotion, so it gets count/columns but not a source picker.
const PRODUCT_SOURCE_TYPES = new Set(["featured_products", "trending_products", "best_sellers"]);
const GRID_SETTINGS_TYPES = new Set([...PRODUCT_SOURCE_TYPES, "flash_sale"]);
const TITLE_ONLY_TYPES = new Set(["collections", "brands", "testimonials"]);

const CONFIGURABLE_SECTION_TYPES = new Set([
  "hero_banner",
  "announcement",
  "ad_banner",
  ...GRID_SETTINGS_TYPES,
  ...TITLE_ONLY_TYPES,
]);

const PRODUCT_SOURCE_OPTIONS = [
  { value: "featured", label: "Featured products" },
  { value: "trending", label: "Trending products" },
  { value: "bestSeller", label: "Best sellers" },
  { value: "newest", label: "Newest arrivals" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "category", label: "Specific category" },
  { value: "brand", label: "Specific brand" },
  { value: "seller", label: "Specific seller" },
  { value: "manual", label: "Manual selection (product IDs)" },
];

const SOURCE_VALUE_LABEL = {
  category: "Category slug",
  brand: "Brand slug",
  seller: "Seller store ID",
  manual: "Product IDs (comma-separated)",
};

const DEVICE_OPTIONS = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

/** Formats a Date/ISO-string for a <input type="datetime-local"> value, or "" if unset. */
function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** One draggable row in the Homepage CMS section list — drag the handle to reorder;
 * the up/down arrows stay alongside as a keyboard/no-drag fallback. */
function SortableSectionRow({ section: s, onMoveUp, onMoveDown, onEdit, onToggle, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex cursor-pointer items-center justify-between gap-3 bg-[var(--surface)] px-3 py-2.5 transition-colors hover:bg-gold-400/5"
      onClick={onEdit}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="shrink-0 cursor-grab text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 active:cursor-grabbing"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <Layout className="size-4 shrink-0 text-[var(--text-muted)]" />
        <span className={cn("truncate text-sm", s.enabled ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] line-through")}>
          {s.title || s.type.replace(/_/g, " ")}
        </span>
        {s.draft && <Badge variant="warning" className="shrink-0">Draft</Badge>}
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <IconButton icon={ArrowUp} size="sm" aria-label="Move up" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} />
        <IconButton icon={ArrowDown} size="sm" aria-label="Move down" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} />
        <IconButton icon={s.enabled ? Eye : EyeOff} size="sm" aria-label={s.enabled ? "Hide" : "Show"} onClick={(e) => { e.stopPropagation(); onToggle(); }} />
        <IconButton icon={Trash2} size="sm" aria-label="Remove" onClick={(e) => { e.stopPropagation(); onRemove(); }} />
      </div>
    </div>
  );
}

const PREVIEW_VIEWPORTS = [
  { value: "desktop", icon: Monitor, width: "100%" },
  { value: "tablet", icon: Tablet, width: 460 },
  { value: "mobile", icon: Smartphone, width: 320 },
];

function HomepageCmsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: "announcement", title: "", config: {}, startsAt: "", endsAt: "" });
  const [heroUploading, setHeroUploading] = useState(false);

  // Undo/redo for the editor panel: rather than rewiring every individual field's onChange,
  // this just observes `form` and snapshots the previous value whenever it changes (skipping
  // the change caused by undo/redo itself, tracked via the ref flag below).
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const isUndoRedoRef = useRef(false);
  const prevFormRef = useRef(form);
  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      prevFormRef.current = form;
      return;
    }
    if (modalOpen && prevFormRef.current !== form) {
      setPast((p) => [...p, prevFormRef.current]);
      setFuture([]);
    }
    prevFormRef.current = form;
  }, [form, modalOpen]);
  const undo = () => {
    if (past.length === 0) return;
    isUndoRedoRef.current = true;
    setFuture((f) => [form, ...f]);
    setForm(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
  };
  const redo = () => {
    if (future.length === 0) return;
    isUndoRedoRef.current = true;
    setPast((p) => [...p, form]);
    setForm(future[0]);
    setFuture((f) => f.slice(1));
  };
  const [previewViewport, setPreviewViewport] = useState("desktop");
  const [previewReady, setPreviewReady] = useState(false);
  const previewFrameRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sections = [], isLoading, isError, refetch } = useQuery({ queryKey: ["admin-homepage"], queryFn: homepageApi.listAll });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-homepage"] });
    // Home.jsx's public section list is a separate cached query — without this, a
    // published change wouldn't show up on the live site for up to its 5-minute staleTime.
    queryClient.invalidateQueries({ queryKey: ["homepage-sections"] });
  };

  // Substitutes the in-progress form into the section list so the preview reflects
  // unsaved edits the instant they're made — no save-then-reload round trip needed.
  const previewSections = useMemo(() => {
    if (!modalOpen) return sections;
    const usesConfigTitle = GRID_SETTINGS_TYPES.has(form.type) || TITLE_ONLY_TYPES.has(form.type);
    const draft = {
      id: editing?.id || "__draft__",
      type: form.type,
      title: form.title,
      config: usesConfigTitle ? { ...form.config, title: form.title || undefined } : form.config,
      enabled: editing ? editing.enabled : true,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };
    return editing ? sections.map((s) => (s.id === editing.id ? draft : s)) : [...sections, draft];
  }, [sections, modalOpen, editing, form]);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "veluntra-cms-preview-ready") setPreviewReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!previewReady) return;
    previewFrameRef.current?.contentWindow?.postMessage(
      { type: "veluntra-cms-preview", sections: previewSections },
      window.location.origin
    );
  }, [previewReady, previewSections]);

  const createMutation = useMutation({ mutationFn: (payload) => homepageApi.create(payload), onSuccess: () => { invalidate(); setModalOpen(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }) => homepageApi.update(id, payload), onSuccess: () => { invalidate(); setModalOpen(false); } });
  const removeMutation = useMutation({ mutationFn: (id) => homepageApi.remove(id), onSuccess: invalidate });
  const reorderMutation = useMutation({ mutationFn: (items) => homepageApi.reorder(items), onSuccess: invalidate });
  const saveDraftMutation = useMutation({
    mutationFn: ({ id, payload }) => homepageApi.saveDraft(id, payload),
    onSuccess: () => { invalidate(); setModalOpen(false); toast({ title: "Draft saved — not visible to visitors yet", variant: "success" }); },
  });
  const publishDraftMutation = useMutation({
    mutationFn: (id) => homepageApi.publishDraft(id),
    onSuccess: () => { invalidate(); setModalOpen(false); toast({ title: "Draft published", variant: "success" }); },
  });
  const discardDraftMutation = useMutation({
    mutationFn: (id) => homepageApi.discardDraft(id),
    onSuccess: () => { invalidate(); setModalOpen(false); toast({ title: "Draft discarded", variant: "success" }); },
  });

  const [view, setView] = useState("sections"); // "sections" | "history"
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["admin-homepage-history"],
    queryFn: () => homepageApi.getHistory(),
    enabled: view === "history",
  });
  const restoreMutation = useMutation({
    mutationFn: (logId) => homepageApi.restoreSection(logId),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-history"] });
      toast({ title: "Section restored", variant: "success" });
    },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't restore that entry", variant: "error" }),
  });

  const move = (index, dir) => {
    const next = [...sections];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    reorderMutation.mutate(next.map((s, i) => ({ id: s.id, position: i })));
  };

  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(sections, oldIndex, newIndex);
    reorderMutation.mutate(next.map((s, i) => ({ id: s.id, position: i })));
  };

  /** Downloads every current section as a JSON file — portable across environments (e.g.
   * staging -> production) since it only carries type/title/config/enabled/schedule, not ids. */
  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      sections: sections.map((s) => ({
        type: s.type,
        title: s.title,
        config: s.config,
        enabled: s.enabled,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `homepage-sections-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Imports sections from a previously exported JSON file. Always ADDS them as new sections
   * (never overwrites or deletes existing ones) — the safe default; unwanted ones can be
   * removed individually afterwards the same way any section is removed. */
  const handleImportFile = async (files) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedSections = Array.isArray(parsed) ? parsed : parsed.sections;
      if (!Array.isArray(importedSections) || importedSections.length === 0) {
        throw new Error("No sections found in this file.");
      }
      for (const s of importedSections) {
        if (!s.type) continue;
        await homepageApi.create({
          type: s.type,
          title: s.title ?? null,
          config: s.config ?? {},
          enabled: s.enabled !== false,
          startsAt: s.startsAt ?? null,
          endsAt: s.endsAt ?? null,
        });
      }
      invalidate();
      toast({ title: `Imported ${importedSections.length} section(s)`, variant: "success" });
    } catch (err) {
      toast({ title: err.message || "Couldn't import that file", variant: "error" });
    }
  };

  const openCreate = () => {
    setEditing(null);
    const initial = { type: "announcement", title: "", config: {}, startsAt: "", endsAt: "" };
    setForm(initial);
    prevFormRef.current = initial;
    setPast([]);
    setFuture([]);
    setModalOpen(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    // Resume editing the pending draft if one exists (per-field fallback to the live value —
    // a draft only ever contains the fields that were actually changed since it was created).
    const d = s.draft || {};
    const initial = {
      type: s.type,
      title: d.title ?? s.title ?? "",
      config: d.config ?? s.config ?? {},
      startsAt: toDatetimeLocal(d.startsAt ?? s.startsAt),
      endsAt: toDatetimeLocal(d.endsAt ?? s.endsAt),
    };
    setForm(initial);
    prevFormRef.current = initial;
    setPast([]);
    setFuture([]);
    setModalOpen(true);
  };
  const buildPayload = () => {
    // Home.jsx reads the heading for these section types from `config.title`, not the
    // top-level `title` column — mirror the one "Title" field the admin actually sees
    // into config so it shows up on the live page without a second, confusing input.
    const usesConfigTitle = GRID_SETTINGS_TYPES.has(form.type) || TITLE_ONLY_TYPES.has(form.type);
    const config = usesConfigTitle ? { ...form.config, title: form.title || undefined } : form.config;
    return {
      title: form.title,
      config,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };
  };
  // "Publish" writes straight to the live section, exactly like this editor's only button
  // used to behave — creating a new section has no draft concept, so it only ever publishes.
  const handlePublish = () => {
    const payload = buildPayload();
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
      if (editing.draft) discardDraftMutation.mutate(editing.id); // a direct publish supersedes any pending draft
    } else {
      createMutation.mutate({ ...payload, type: form.type });
    }
  };
  const handleSaveDraft = () => {
    if (!editing) return; // brand-new sections have nothing published yet to protect — publish only
    saveDraftMutation.mutate({ id: editing.id, payload: buildPayload() });
  };
  const setConfig = (key, value) => setForm((f) => ({ ...f, config: { ...f.config, [key]: value } }));

  const handleHeroImageUpload = async (files) => {
    if (!files.length) return;
    setHeroUploading(true);
    try {
      const { urls } = await uploadsApi.uploadImages(Array.from(files));
      setConfig("backgroundImage", resolveMediaUrl(urls[0]));
    } catch {
      toast({ title: "Image upload failed", variant: "error" });
    } finally {
      setHeroUploading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr]">
    <div>
      <SectionTitle
        eyebrow="Manage"
        title="Homepage CMS"
        description="Control which merchandising sections appear on the homepage, their order, visibility, and content."
        action={
          <div className="flex items-center gap-2">
            <SecondaryButton size="sm" leftIcon={Download} onClick={handleExport}>Export</SecondaryButton>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-btn,999px)] border border-[var(--border)] px-4 py-2 text-xs font-medium">
              <Upload className="size-3.5" /> Import
              <input type="file" accept="application/json" hidden onChange={(e) => handleImportFile(e.target.files)} />
            </label>
          </div>
        }
      />

      <div className="mb-4 flex gap-1 rounded-full bg-[var(--surface-inset)] p-1 w-fit">
        {[
          { value: "sections", label: "Sections" },
          { value: "history", label: "History" },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setView(t.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              view === t.value ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-soft-sm" : "text-[var(--text-muted)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "history" ? (
        historyLoading ? (
          <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading history…</div>
        ) : !history?.items?.length ? (
          <EmptyState icon={History} title="No changes yet" description="Every add, edit, removal, and reorder will show up here." />
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] divide-y divide-[var(--border)]">
            {history.items.map((log) => {
              const canRestore = log.entityId !== "bulk" && log.previousValue;
              return (
                <div key={log.id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[var(--text-primary)]">{log.action}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {log.actorName} &middot; {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {canRestore && (
                    <SecondaryButton size="sm" loading={restoreMutation.isPending} onClick={() => restoreMutation.mutate(log.id)}>
                      Restore
                    </SecondaryButton>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading sections…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : sections.length === 0 ? (
        <EmptyState
          icon={Layout}
          title="No sections configured"
          description="Add a section to control the homepage."
          action={<PrimaryButton leftIcon={Plus} onClick={openCreate}>Add section</PrimaryButton>}
        />
      ) : (
        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] divide-y divide-[var(--border)]">
              {sections.map((s, i) => (
                <SortableSectionRow
                  key={s.id}
                  section={s}
                  onMoveUp={() => move(i, -1)}
                  onMoveDown={() => move(i, 1)}
                  onEdit={() => openEdit(s)}
                  onToggle={() => updateMutation.mutate({ id: s.id, payload: { enabled: !s.enabled } })}
                  onRemove={() => removeMutation.mutate(s.id)}
                />
              ))}
              <button
                type="button"
                onClick={openCreate}
                className="flex w-full items-center gap-2 bg-[var(--surface)] px-3 py-2.5 text-left text-sm text-gold-600 transition-colors hover:bg-gold-400/5"
              >
                <Plus className="size-4" /> Add section
              </button>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {modalOpen && (
      <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{editing ? "Edit section" : "Add homepage section"}</h3>
            {editing?.draft && <Badge variant="warning">Unpublished draft</Badge>}
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon={Undo2} size="sm" aria-label="Undo" disabled={past.length === 0} onClick={undo} />
            <IconButton icon={Redo2} size="sm" aria-label="Redo" disabled={future.length === 0} onClick={redo} />
            <IconButton icon={X} size="sm" aria-label="Close" onClick={() => setModalOpen(false)} />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {!editing && (
            <Select label="Section type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, config: {} }))} options={SECTION_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))} />
          )}
          <Input label="Title (optional)" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />

          {form.type === "announcement" && (
            <>
              <Input label="Announcement text" value={form.config.text || ""} onChange={(e) => setConfig("text", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Link (optional)" value={form.config.link || ""} onChange={(e) => setConfig("link", e.target.value)} />
                <Input label="Link label (optional)" value={form.config.linkLabel || ""} onChange={(e) => setConfig("linkLabel", e.target.value)} />
              </div>
            </>
          )}
          {form.type === "ad_banner" && (
            <>
              <Input label="Banner image URL" value={form.config.imageUrl || ""} onChange={(e) => setConfig("imageUrl", e.target.value)} />
              <Input label="Link (optional)" value={form.config.link || ""} onChange={(e) => setConfig("link", e.target.value)} />
            </>
          )}
          {form.type === "hero_banner" && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Background image</span>
                {form.config.backgroundImage && (
                  <img src={form.config.backgroundImage} alt="" className="h-28 w-full rounded-[var(--radius-md)] object-cover" />
                )}
                <div className="flex items-center gap-2">
                  <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium">
                    {heroUploading ? "Uploading…" : form.config.backgroundImage ? "Replace" : "Upload image"}
                    <input type="file" accept="image/*" hidden disabled={heroUploading} onChange={(e) => handleHeroImageUpload(e.target.files)} />
                  </label>
                  {form.config.backgroundImage && (
                    <SecondaryButton size="sm" onClick={() => setConfig("backgroundImage", null)}>
                      Remove
                    </SecondaryButton>
                  )}
                </div>
              </div>
              <Input label="Headline" value={form.config.headline || ""} onChange={(e) => setConfig("headline", e.target.value)} />
              <Input label="Subheadline" value={form.config.subheadline || ""} onChange={(e) => setConfig("subheadline", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="CTA text" value={form.config.ctaText || ""} onChange={(e) => setConfig("ctaText", e.target.value)} />
                <Input label="CTA link" value={form.config.ctaLink || ""} onChange={(e) => setConfig("ctaLink", e.target.value)} />
              </div>
              <Input
                label="Background video URL (optional)"
                helperText="Takes priority over the image when set."
                value={form.config.backgroundVideo || ""}
                onChange={(e) => setConfig("backgroundVideo", e.target.value)}
              />
            </>
          )}
          {GRID_SETTINGS_TYPES.has(form.type) && (
            <>
              <div className="rounded-[var(--radius-md)] border border-gold-400/30 bg-gold-400/5 p-3 text-xs text-[var(--text-muted)]">
                <strong className="text-[var(--text-primary)]">No image field here on purpose</strong> — this section shows real product
                photos automatically, pulled from whichever products match the source below. To change a photo, edit that
                product directly: Admin → Products → open it → Images.
              </div>
              {PRODUCT_SOURCE_TYPES.has(form.type) && (
                <>
                  <Select
                    label="Product source"
                    value={form.config.productSource || "featured"}
                    onChange={(e) => setConfig("productSource", e.target.value)}
                    options={PRODUCT_SOURCE_OPTIONS}
                  />
                  {SOURCE_VALUE_LABEL[form.config.productSource] && (
                    <Input
                      label={SOURCE_VALUE_LABEL[form.config.productSource]}
                      value={form.config.sourceValue || ""}
                      onChange={(e) => setConfig("sourceValue", e.target.value)}
                    />
                  )}
                  <Input label="Subtitle (optional)" value={form.config.subtitle || ""} onChange={(e) => setConfig("subtitle", e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Button text" placeholder="View all" value={form.config.buttonText || ""} onChange={(e) => setConfig("buttonText", e.target.value)} />
                    <Input label="Button link" placeholder="/products" value={form.config.buttonLink || ""} onChange={(e) => setConfig("buttonLink", e.target.value)} />
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  min={1}
                  max={24}
                  label="Product count"
                  value={form.config.productCount || ""}
                  onChange={(e) => setConfig("productCount", e.target.value)}
                />
                <Select
                  label="Columns"
                  value={String(form.config.columns || 6)}
                  onChange={(e) => setConfig("columns", e.target.value)}
                  options={[2, 3, 4, 5, 6, 8].map((n) => ({ value: String(n), label: `${n} columns` }))}
                />
              </div>
              <Select
                label="Card template"
                helperText="Leave as default to follow the site-wide template set in Settings > Theme & Design."
                value={form.config.cardTemplate || ""}
                onChange={(e) => setConfig("cardTemplate", e.target.value || undefined)}
                options={[{ value: "", label: "Default (site-wide)" }, ...Object.entries(CARD_TEMPLATES).map(([value, t]) => ({ value, label: t.label }))]}
              />
            </>
          )}
          {TITLE_ONLY_TYPES.has(form.type) && (
            <>
              <p className="text-xs text-[var(--text-muted)]">Set the "Title" field above to override this section's default heading.</p>
              <div className="rounded-[var(--radius-md)] border border-gold-400/30 bg-gold-400/5 p-3 text-xs text-[var(--text-muted)]">
                <strong className="text-[var(--text-primary)]">No image field here on purpose</strong> — this section shows real
                {form.type === "brands" ? " brand logos" : form.type === "collections" ? " category photos" : " customer review data"} automatically.
                To change a photo, edit it directly: Admin → {form.type === "brands" ? "Brands" : form.type === "collections" ? "Categories" : "Reviews"}.
              </div>
            </>
          )}
          {!CONFIGURABLE_SECTION_TYPES.has(form.type) && (
            <p className="text-xs text-[var(--text-muted)]">This section pulls live data automatically — nothing else to configure.</p>
          )}

          {CONFIGURABLE_SECTION_TYPES.has(form.type) && (
            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Visibility</span>
              <div className="flex flex-wrap gap-4">
                {DEVICE_OPTIONS.map((d) => {
                  const devices = form.config.visibility?.devices || [];
                  const checked = devices.length === 0 || devices.includes(d.value);
                  return (
                    <Checkbox
                      key={d.value}
                      label={d.label}
                      checked={checked}
                      onChange={(e) => {
                        const current = form.config.visibility?.devices || DEVICE_OPTIONS.map((o) => o.value);
                        const next = e.target.checked ? [...new Set([...current, d.value])] : current.filter((v) => v !== d.value);
                        setConfig("visibility", { ...form.config.visibility, devices: next.length === DEVICE_OPTIONS.length ? [] : next });
                      }}
                    />
                  );
                })}
              </div>
              <Select
                label="Show to"
                value={form.config.visibility?.audience || "all"}
                onChange={(e) => setConfig("visibility", { ...form.config.visibility, audience: e.target.value })}
                options={[
                  { value: "all", label: "Everyone" },
                  { value: "guest", label: "Guests only (logged out)" },
                  { value: "loggedIn", label: "Logged-in customers only" },
                ]}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
            <Input
              type="datetime-local"
              label="Show from (optional)"
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
            />
            <Input
              type="datetime-local"
              label="Show until (optional)"
              value={form.endsAt}
              onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <div className="flex gap-2">
            {editing?.draft && (
              <>
                <OutlineButton size="sm" loading={discardDraftMutation.isPending} onClick={() => discardDraftMutation.mutate(editing.id)}>
                  Discard draft
                </OutlineButton>
                <OutlineButton size="sm" loading={publishDraftMutation.isPending} onClick={() => publishDraftMutation.mutate(editing.id)}>
                  Publish draft as-is
                </OutlineButton>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setModalOpen(false)}>Cancel</SecondaryButton>
            {editing && (
              <SecondaryButton onClick={handleSaveDraft} loading={saveDraftMutation.isPending}>
                Save draft
              </SecondaryButton>
            )}
            <PrimaryButton onClick={handlePublish} loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? "Publish" : "Add section"}
            </PrimaryButton>
          </div>
        </div>
      </div>
      )}
    </div>

    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-soft-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Live preview</span>
          <div className="flex items-center gap-1 rounded-full bg-[var(--surface-muted,rgba(0,0,0,0.04))] p-1">
            {PREVIEW_VIEWPORTS.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={value}
                onClick={() => setPreviewViewport(value)}
                className={cn(
                  "grid size-7 place-items-center rounded-full transition-colors",
                  previewViewport === value ? "bg-[var(--surface)] text-gold-500 shadow-soft-sm" : "text-[var(--text-muted)]"
                )}
              >
                <Icon className="size-3.5" />
              </button>
            ))}
          </div>
        </div>
        <p className="mb-2 text-[11px] text-[var(--text-muted)]">
          Updates instantly as you edit below — no need to open the live site to check.
        </p>
        <div
          className="mx-auto overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-neutral-100"
          style={{ width: PREVIEW_VIEWPORTS.find((v) => v.value === previewViewport)?.width, height: 640, maxWidth: "100%" }}
        >
          <iframe
            ref={previewFrameRef}
            src="/?cms_preview=1"
            title="Homepage live preview"
            className="h-full w-full border-0"
            onLoad={() => setPreviewReady(false)}
          />
        </div>
      </div>
    </div>
    </div>
  );
}

/* — Analytics — */

function AnalyticsSection() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin-analytics"], queryFn: () => adminApi.analytics() });

  if (isLoading) return <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading analytics…</div>;
  if (isError) return <ErrorNotice onRetry={refetch} />;

  const overview = data?.overview || {};
  const revenueTrend = data?.revenueTrend || [];
  const topProducts = data?.topProducts || [];

  return (
    <div>
      <SectionTitle eyebrow="Insights" title="Analytics" description="Key performance indicators at a glance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total revenue" value={`${CURRENCY}${Number(overview.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Total orders" value={overview.totalOrders || 0} icon={ShoppingCart} />
        <StatCard label="Avg. order value" value={`${CURRENCY}${overview.avgOrderValue || 0}`} icon={TrendingUp} />
        <StatCard label="Refund rate" value={`${overview.refundRate || 0}%`} icon={Percent} />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm mb-8">
        <h3 className="text-[15px] font-medium text-[var(--text-primary)] mb-5">Revenue trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_GOLD} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke={CHART_INK} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={CHART_INK} fontSize={12} tickLine={false} axisLine={false} width={48} />
              <ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} formatter={(v) => [`${CURRENCY}${Number(v).toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke={CHART_GOLD} strokeWidth={2.5} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-soft-sm">
        <div className="p-6 pb-0"><h3 className="text-[15px] font-medium text-[var(--text-primary)] mb-1">Top products</h3></div>
        {topProducts.length === 0 ? (
          <div className="p-6 text-sm text-[var(--text-muted)]">No sales data yet.</div>
        ) : (
          <TableShell>
            <thead className="border-b border-[var(--border)]">
              <tr><Th>Product</Th><Th>Category</Th><Th>Units sold</Th><Th className="text-right">Revenue</Th></tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {topProducts.map((p) => (
                <tr key={p.id}>
                  <Td className="font-medium">{p.name}</Td>
                  <Td className="text-[var(--text-muted)]">{p.category}</Td>
                  <Td>{p.unitsSold}</Td>
                  <Td className="text-right">{CURRENCY}{Number(p.revenue).toLocaleString()}</Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </div>
    </div>
  );
}

/* — Charts — */

function ChartsSection() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin-analytics"], queryFn: () => adminApi.analytics() });

  if (isLoading) return <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading charts…</div>;
  if (isError) return <ErrorNotice onRetry={refetch} />;

  const ordersByCategory = data?.ordersByCategory || [];
  const paymentSplit = data?.paymentSplit || [];
  const customerTrend = data?.customerTrend || [];

  return (
    <div>
      <SectionTitle eyebrow="Insights" title="Charts" description="Visual breakdowns across orders, payments, and customers." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Orders by category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersByCategory}>
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
              <Pie data={paymentSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {paymentSplit.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New vs. returning customers" span>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerTrend}>
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

/* — Store Settings — */

const FEATURE_FLAG_LABELS = {
  wishlist: "Wishlist",
  reviews: "Reviews",
  coupons: "Coupons",
  flashSale: "Flash Sale",
  cod: "Cash on Delivery",
  loyaltyPoints: "Loyalty Points",
  referrals: "Referrals",
  guestCheckout: "Guest Checkout",
  sellerCoupons: "Seller Coupons",
  emailNotifications: "Email Notifications",
  pushNotifications: "Push Notifications",
  cookieConsent: "Cookie Consent Banner",
  demoCard: "Demo Card Payment (test checkout, no real gateway)",
};

const DEFAULT_POPUP_BANNER = { enabled: false, title: "", body: "", imageUrl: null, ctaText: "", ctaLink: "" };

const DEFAULT_VIP_TIERS = { enabled: false, silverThreshold: 100, goldThreshold: 500, platinumThreshold: 1000 };

const PRESET_LABELS = {
  apple: "Apple",
  nike: "Nike",
  samsung: "Samsung",
  luxury: "Luxury",
  minimal: "Minimal",
  gaming: "Gaming",
  glass: "Glass",
  neon: "Neon",
  modern: "Modern",
  corporate: "Corporate",
};

function SettingsSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [popupUploading, setPopupUploading] = useState(false);

  const { data: settings, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: settingsApi.getForAdmin,
  });

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  const current = form || settings;
  const themePreviewRef = useRef(null);
  useEffect(() => {
    if (themePreviewRef.current) applyTheme(current?.themeColors, themePreviewRef.current);
  }, [current?.themeColors]);

  const updateMutation = useMutation({
    mutationFn: (payload) => settingsApi.update(payload),
    onSuccess: (s) => {
      setForm(s);
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      // Every storefront page (Navbar, ThemeProvider, animations, card templates, Home.jsx)
      // reads the SAME "settings/public" query — without this, a saved change (theme color,
      // card template, animation preset, popup banner...) silently doesn't show up anywhere
      // outside this page until its 5-minute staleTime happens to expire on its own.
      queryClient.invalidateQueries({ queryKey: ["settings", "public"] });
      toast({ title: "Settings saved", variant: "success" });
    },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't save settings", variant: "error" }),
  });

  if (isLoading || !current) return <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading settings…</div>;
  if (isError) return <ErrorNotice onRetry={refetch} />;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setFlag = (key, value) => setForm((f) => ({ ...f, featureFlags: { ...f.featureFlags, [key]: value } }));
  const setSocialLink = (platform, value) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [platform]: value } }));
  const setCloudinary = (key, value) => setForm((f) => ({ ...f, cloudinaryConfig: { ...f.cloudinaryConfig, [key]: value } }));
  const cloudinaryConfigured =
    current.cloudinaryConfig?.cloudName === "••••••••" ||
    current.cloudinaryConfig?.apiKey === "••••••••" ||
    current.cloudinaryConfig?.apiSecret === "••••••••";
  const currentAnim = { ...DEFAULT_ANIMATION_CONFIG, ...(current.animationConfig || {}) };
  const setAnim = (key, value) => setForm((f) => ({ ...f, animationConfig: { ...DEFAULT_ANIMATION_CONFIG, ...f.animationConfig, [key]: value } }));
  const applyPreset = (presetName) =>
    setForm((f) => ({ ...f, animationConfig: { preset: presetName, ...ANIMATION_PRESETS[presetName] } }));

  const currentTheme = { ...DEFAULT_THEME, ...(current.themeColors || {}) };
  const setTheme = (key, value) => {
    const next = { ...DEFAULT_THEME, ...form.themeColors, [key]: value };
    setForm((f) => ({ ...f, themeColors: next }));
    // Scoped to the little preview card below, not the rest of the dashboard — actual
    // storefront pages only pick this up once "Save settings" is clicked.
    if (themePreviewRef.current) applyTheme(next, themePreviewRef.current);
  };

  const handleLogoUpload = async (files) => {
    if (!files.length) return;
    setLogoUploading(true);
    try {
      const { urls } = await uploadsApi.uploadImages(Array.from(files));
      set("logoUrl", resolveMediaUrl(urls[0]));
    } catch {
      toast({ title: "Logo upload failed", variant: "error" });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFaviconUpload = async (files) => {
    if (!files.length) return;
    setFaviconUploading(true);
    try {
      const { urls } = await uploadsApi.uploadImages(Array.from(files));
      setTheme("faviconUrl", resolveMediaUrl(urls[0]));
    } catch {
      toast({ title: "Favicon upload failed", variant: "error" });
    } finally {
      setFaviconUploading(false);
    }
  };

  const currentPopup = { ...DEFAULT_POPUP_BANNER, ...(current.popupBanner || {}) };
  const setPopup = (key, value) => setForm((f) => ({ ...f, popupBanner: { ...DEFAULT_POPUP_BANNER, ...f.popupBanner, [key]: value } }));

  const currentVip = { ...DEFAULT_VIP_TIERS, ...(current.vipTiers || {}) };
  const setVip = (key, value) => setForm((f) => ({ ...f, vipTiers: { ...DEFAULT_VIP_TIERS, ...f.vipTiers, [key]: value } }));

  const handlePopupImageUpload = async (files) => {
    if (!files.length) return;
    setPopupUploading(true);
    try {
      const { urls } = await uploadsApi.uploadImages(Array.from(files));
      setPopup("imageUrl", resolveMediaUrl(urls[0]));
    } catch {
      toast({ title: "Image upload failed", variant: "error" });
    } finally {
      setPopupUploading(false);
    }
  };

  return (
    <div>
      <SectionTitle eyebrow="System" title="Store Settings" description="Everything here is editable without a code change." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm">
          <h3 className="mb-4 text-[15px] font-medium">Store info</h3>
          <div className="flex flex-col gap-4">
            <Input label="Store name" value={current.storeName || ""} onChange={(e) => set("storeName", e.target.value)} />
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Store logo</span>
              <div className="flex items-center gap-3">
                {current.logoUrl ? (
                  <img src={resolveMediaUrl(current.logoUrl)} alt="Logo" className="h-10 w-auto max-w-[160px] rounded-[var(--radius-sm)] border border-[var(--border)] object-contain p-1" />
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">No logo uploaded — the store name is shown instead.</span>
                )}
                <label className="inline-flex w-fit shrink-0 cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium">
                  {logoUploading ? "Uploading…" : current.logoUrl ? "Replace" : "Upload logo"}
                  <input type="file" accept="image/*" hidden disabled={logoUploading} onChange={(e) => handleLogoUpload(e.target.files)} />
                </label>
                {current.logoUrl && (
                  <SecondaryButton size="sm" onClick={() => set("logoUrl", null)}>
                    Remove
                  </SecondaryButton>
                )}
              </div>
            </div>
            <Input label="Currency" value={current.currency || ""} onChange={(e) => set("currency", e.target.value)} />
            <Input label="Contact email" value={current.contactEmail || ""} onChange={(e) => set("contactEmail", e.target.value)} />
            <Input label="Contact phone" value={current.contactPhone || ""} onChange={(e) => set("contactPhone", e.target.value)} />
            <div className="col-span-2">
              <Input
                label="Contact address"
                value={current.contactAddress || ""}
                onChange={(e) => set("contactAddress", e.target.value)}
                placeholder="Shown in the site footer, e.g. 123 High Street, London, E1 6AN"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm">
          <h3 className="mb-1 text-[15px] font-medium">Social links</h3>
          <p className="mb-4 text-xs text-[var(--text-muted)]">
            Shown as icons in the site footer. Leave any blank to hide that icon's link (it still shows, just unlinked).
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Instagram URL"
              value={current.socialLinks?.instagram || ""}
              onChange={(e) => setSocialLink("instagram", e.target.value)}
              placeholder="https://instagram.com/yourstore"
            />
            <Input
              label="X (Twitter) URL"
              value={current.socialLinks?.twitter || ""}
              onChange={(e) => setSocialLink("twitter", e.target.value)}
              placeholder="https://x.com/yourstore"
            />
            <Input
              label="Pinterest URL"
              value={current.socialLinks?.pinterest || ""}
              onChange={(e) => setSocialLink("pinterest", e.target.value)}
              placeholder="https://pinterest.com/yourstore"
            />
            <Input
              label="YouTube URL"
              value={current.socialLinks?.youtube || ""}
              onChange={(e) => setSocialLink("youtube", e.target.value)}
              placeholder="https://youtube.com/@yourstore"
            />
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm">
          <h3 className="mb-1 text-[15px] font-medium">Image storage (Cloudinary)</h3>
          <p className="mb-4 text-xs text-[var(--text-muted)]">
            {cloudinaryConfigured ? (
              "Configured — uploaded images (logo, products, categories, banners) are stored permanently on Cloudinary."
            ) : (
              <>
                Without this, uploaded images are stored on the server's local disk, which is wiped every time the
                site is redeployed — this is why logos or photos you upload can suddenly disappear. Create a free
                account at cloudinary.com, copy your Cloud name / API key / API secret from its dashboard, and paste
                them below to fix this permanently. All three fields are masked once saved — if you need to change
                one, re-enter all three together.
              </>
            )}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Cloud name"
              value={current.cloudinaryConfig?.cloudName || ""}
              onChange={(e) => setCloudinary("cloudName", e.target.value)}
            />
            <Input
              label="API key"
              value={current.cloudinaryConfig?.apiKey || ""}
              onChange={(e) => setCloudinary("apiKey", e.target.value)}
            />
            <Input
              label="API secret"
              type="password"
              value={current.cloudinaryConfig?.apiSecret || ""}
              onChange={(e) => setCloudinary("apiSecret", e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm">
          <h3 className="mb-4 text-[15px] font-medium">Business rules</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tax %" type="number" value={current.taxPercent ?? ""} onChange={(e) => set("taxPercent", e.target.value)} />
            <Input label="Platform commission %" type="number" value={current.platformCommissionPercent ?? ""} onChange={(e) => set("platformCommissionPercent", e.target.value)} />
            <Input label="Default shipping" type="number" value={current.defaultShippingCost ?? ""} onChange={(e) => set("defaultShippingCost", e.target.value)} />
            <Input label="Free shipping over" type="number" value={current.freeShippingThreshold ?? ""} onChange={(e) => set("freeShippingThreshold", e.target.value)} />
            <Input label="COD charge" type="number" value={current.codCharge ?? ""} onChange={(e) => set("codCharge", e.target.value)} />
            <Input label="Min order value" type="number" value={current.minOrderValue ?? ""} onChange={(e) => set("minOrderValue", e.target.value)} />
            <Input label="Return window (days)" type="number" value={current.returnWindowDays ?? ""} onChange={(e) => set("returnWindowDays", e.target.value)} />
            <Input label="Exchange window (days)" type="number" value={current.exchangeWindowDays ?? ""} onChange={(e) => set("exchangeWindowDays", e.target.value)} />
            <Input label="Cancellation window (hrs)" type="number" value={current.cancellationWindowHours ?? ""} onChange={(e) => set("cancellationWindowHours", e.target.value)} />
            <Input label="Loyalty points per unit" type="number" value={current.loyaltyPointsPerUnit ?? ""} onChange={(e) => set("loyaltyPointsPerUnit", e.target.value)} />
            <Input label="Referral bonus" type="number" value={current.referralBonusAmount ?? ""} onChange={(e) => set("referralBonusAmount", e.target.value)} />
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm lg:col-span-2">
          <h3 className="mb-4 text-[15px] font-medium">Feature flags</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(FEATURE_FLAG_LABELS).map(([key, label]) => (
              <Checkbox
                key={key}
                label={label}
                checked={current.featureFlags?.[key] !== false}
                onChange={(e) => setFlag(key, e.target.checked)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm lg:col-span-2">
          <h3 className="mb-1 text-[15px] font-medium">Theme &amp; Design</h3>
          <p className="mb-4 text-xs text-[var(--text-muted)]">
            Brand colors, typography, buttons, and card/animation presets — applied site-wide immediately as a
            live preview. Click "Save settings" below to make it permanent for every visitor.
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Primary color</label>
              <input type="color" value={currentTheme.primary} onChange={(e) => setTheme("primary", e.target.value)} className="h-10 w-full cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Accent color</label>
              <input type="color" value={currentTheme.accent} onChange={(e) => setTheme("accent", e.target.value)} className="h-10 w-full cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Secondary color</label>
              <input type="color" value={currentTheme.secondary} onChange={(e) => setTheme("secondary", e.target.value)} className="h-10 w-full cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Light surface</label>
              <input type="color" value={currentTheme.surfaceLight} onChange={(e) => setTheme("surfaceLight", e.target.value)} className="h-10 w-full cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Dark surface</label>
              <input type="color" value={currentTheme.surfaceDark} onChange={(e) => setTheme("surfaceDark", e.target.value)} className="h-10 w-full cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)]" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:max-w-md">
            <Select
              label="Font pairing"
              value={currentTheme.font}
              onChange={(e) => setTheme("font", e.target.value)}
              options={Object.entries(FONT_PRESETS).map(([value, p]) => ({ value, label: p.label }))}
            />
            <Select
              label="Button style"
              value={currentTheme.buttonStyle}
              onChange={(e) => setTheme("buttonStyle", e.target.value)}
              options={[
                { value: "rounded", label: "Rounded" },
                { value: "pill", label: "Pill" },
                { value: "square", label: "Square" },
              ]}
            />
            <Select
              label="Product card template"
              value={currentTheme.cardTemplate}
              onChange={(e) => setTheme("cardTemplate", e.target.value)}
              options={Object.entries(CARD_TEMPLATES).map(([value, t]) => ({ value, label: t.label }))}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Favicon</span>
            <div className="flex items-center gap-3">
              {currentTheme.faviconUrl ? (
                <img src={resolveMediaUrl(currentTheme.faviconUrl)} alt="Favicon" className="size-8 rounded-[var(--radius-sm)] border border-[var(--border)] object-contain p-1" />
              ) : (
                <span className="text-xs text-[var(--text-muted)]">Using the default site favicon.</span>
              )}
              <label className="inline-flex w-fit shrink-0 cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium">
                {faviconUploading ? "Uploading…" : currentTheme.faviconUrl ? "Replace" : "Upload favicon"}
                <input type="file" accept="image/*" hidden disabled={faviconUploading} onChange={(e) => handleFaviconUpload(e.target.files)} />
              </label>
              {currentTheme.faviconUrl && (
                <SecondaryButton size="sm" onClick={() => setTheme("faviconUrl", null)}>
                  Remove
                </SecondaryButton>
              )}
            </div>
          </div>

          <div className="my-6 border-t border-[var(--border)]" />

          <p className="mb-4 text-xs text-[var(--text-muted)]">
            Card &amp; animation presets applied to every product and category card storefront-wide.
            Individual products can still override this from their own edit form.
          </p>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Select
                label="Preset"
                value={currentAnim.preset}
                onChange={(e) => applyPreset(e.target.value)}
                options={Object.entries(PRESET_LABELS).map(([value, label]) => ({ value, label }))}
              />
              <Select
                label="Speed"
                value={currentAnim.speed}
                onChange={(e) => setAnim("speed", e.target.value)}
                options={["slow", "normal", "fast"].map((v) => ({ value: v, label: v }))}
              />
              <Input
                label="Duration (s)"
                type="number"
                step="0.1"
                min="0.1"
                max="3"
                value={currentAnim.duration}
                onChange={(e) => setAnim("duration", Number(e.target.value))}
              />
              <Select
                label="Intensity"
                value={currentAnim.intensity}
                onChange={(e) => setAnim("intensity", e.target.value)}
                options={["subtle", "normal", "strong"].map((v) => ({ value: v, label: v }))}
              />
              <Select
                label="Hover animation"
                value={currentAnim.hover}
                onChange={(e) => setAnim("hover", e.target.value)}
                options={["lift", "tilt", "zoom", "glow", "none"].map((v) => ({ value: v, label: v }))}
              />
              <Select
                label="Idle animation"
                value={currentAnim.idle}
                onChange={(e) => setAnim("idle", e.target.value)}
                options={["float", "breathe", "pulse", "none"].map((v) => ({ value: v, label: v }))}
              />
              <Select
                label="Shadow"
                value={currentAnim.shadow}
                onChange={(e) => setAnim("shadow", e.target.value)}
                options={["none", "soft", "medium", "strong"].map((v) => ({ value: v, label: v }))}
              />
              <Select
                label="Border radius"
                value={currentAnim.borderRadius}
                onChange={(e) => setAnim("borderRadius", e.target.value)}
                options={["sharp", "soft", "rounded", "pill"].map((v) => ({ value: v, label: v }))}
              />
              <Select
                label="Card style"
                value={currentAnim.cardStyle}
                onChange={(e) => setAnim("cardStyle", e.target.value)}
                options={["flat", "elevated", "glass", "bordered"].map((v) => ({ value: v, label: v }))}
              />
              <Input
                label="Stagger delay (s)"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={currentAnim.delay}
                onChange={(e) => setAnim("delay", Number(e.target.value))}
              />
              <Checkbox label="Glow" checked={!!currentAnim.glow} onChange={(e) => setAnim("glow", e.target.checked)} />
              <Checkbox label="Loop idle animation" checked={!!currentAnim.loop} onChange={(e) => setAnim("loop", e.target.checked)} />
            </div>

            <div ref={themePreviewRef} className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Live preview</span>
              <AnimatedCard settings={currentAnim} disableEntrance className="w-full max-w-[220px] p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-amber-600 text-2xl font-semibold text-white">
                    V
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Sample Product</p>
                  <p className="text-xs text-[var(--text-muted)]">Hover to preview</p>
                </div>
              </AnimatedCard>
              <PrimaryButton size="sm" className="mt-2 w-full">Button preview</PrimaryButton>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm lg:col-span-2">
          <h3 className="mb-1 text-[15px] font-medium">Promotional popup</h3>
          <p className="mb-4 text-xs text-[var(--text-muted)]">
            Shows once per visitor session when enabled — good for a welcome offer or an announcement.
          </p>
          <Checkbox label="Enable popup" checked={!!currentPopup.enabled} onChange={(e) => setPopup("enabled", e.target.checked)} />
          {currentPopup.enabled && (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <Input label="Title" value={currentPopup.title} onChange={(e) => setPopup("title", e.target.value)} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Body</label>
                  <textarea
                    rows={3}
                    value={currentPopup.body}
                    onChange={(e) => setPopup("body", e.target.value)}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Button text" placeholder="Shop now" value={currentPopup.ctaText} onChange={(e) => setPopup("ctaText", e.target.value)} />
                  <Input label="Button link" placeholder="/shop" value={currentPopup.ctaLink} onChange={(e) => setPopup("ctaLink", e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Image (optional)</span>
                {currentPopup.imageUrl && (
                  <img src={currentPopup.imageUrl} alt="" className="h-32 w-full rounded-[var(--radius-md)] object-cover" />
                )}
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium">
                  {popupUploading ? "Uploading…" : currentPopup.imageUrl ? "Replace" : "Upload image"}
                  <input type="file" accept="image/*" hidden disabled={popupUploading} onChange={(e) => handlePopupImageUpload(e.target.files)} />
                </label>
                {currentPopup.imageUrl && (
                  <SecondaryButton size="sm" onClick={() => setPopup("imageUrl", null)}>
                    Remove
                  </SecondaryButton>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm lg:col-span-2">
          <h3 className="mb-1 text-[15px] font-medium">VIP tiers</h3>
          <p className="mb-4 text-xs text-[var(--text-muted)]">
            Silver / Gold / Platinum, assigned automatically by lifetime spend once an order is marked delivered.
            Any tier gets free shipping on every order.
          </p>
          <Checkbox label="Enable VIP tiers" checked={!!currentVip.enabled} onChange={(e) => setVip("enabled", e.target.checked)} />
          {currentVip.enabled && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label={`Silver threshold (${current.currencySymbol || "£"})`}
                type="number"
                min={0}
                value={currentVip.silverThreshold}
                onChange={(e) => setVip("silverThreshold", e.target.value)}
              />
              <Input
                label={`Gold threshold (${current.currencySymbol || "£"})`}
                type="number"
                min={0}
                value={currentVip.goldThreshold}
                onChange={(e) => setVip("goldThreshold", e.target.value)}
              />
              <Input
                label={`Platinum threshold (${current.currencySymbol || "£"})`}
                type="number"
                min={0}
                value={currentVip.platinumThreshold}
                onChange={(e) => setVip("platinumThreshold", e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft-sm lg:col-span-2">
          <h3 className="mb-4 text-[15px] font-medium">Policies</h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <textarea placeholder="Return policy" value={current.returnPolicy || ""} onChange={(e) => set("returnPolicy", e.target.value)} rows={4} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm" />
            <textarea placeholder="Privacy policy" value={current.privacyPolicy || ""} onChange={(e) => set("privacyPolicy", e.target.value)} rows={4} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm" />
            <textarea placeholder="Terms of service" value={current.termsOfService || ""} onChange={(e) => set("termsOfService", e.target.value)} rows={4} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm" />
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 mt-6 flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-soft-lg">
        <p className="text-xs text-[var(--text-muted)]">
          Uploading a photo or picking a color doesn't save it by itself — click Save to make it permanent.
        </p>
        <PrimaryButton onClick={() => updateMutation.mutate(form)} loading={updateMutation.isPending} className="shrink-0">
          Save settings
        </PrimaryButton>
      </div>
    </div>
  );
}

/* — Roles & Permissions — */

function PermissionsSection() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["permissions"], queryFn: permissionsApi.getGrid, enabled: role === "superadmin" });

  const bulkSetMutation = useMutation({
    mutationFn: (items) => permissionsApi.bulkSet(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });

  if (role !== "superadmin") {
    return <EmptyState icon={ShieldCheck} title="Super Admin only" description="Only the Super Admin account can configure role permissions." />;
  }
  if (isLoading) return <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading permissions…</div>;
  if (isError) return <ErrorNotice onRetry={refetch} />;

  const { permissions, grid } = data;

  const toggle = (roleName, permission, allowed) => {
    bulkSetMutation.mutate([{ role: roleName, permission, allowed }]);
  };

  return (
    <div>
      <SectionTitle eyebrow="System" title="Roles & Permissions" description="Configure exactly what each role can do — no code changes needed." />

      <TableShell>
        <thead className="border-b border-[var(--border)]">
          <tr>
            <Th>Permission</Th>
            {grid.map((g) => <Th key={g.role} className="text-center">{g.role}</Th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {permissions.map((perm) => (
            <tr key={perm}>
              <Td className="font-medium">{perm.replace(/\./g, " › ")}</Td>
              {grid.map((g) => (
                <Td key={g.role} className="text-center">
                  <input
                    type="checkbox"
                    checked={g.permissions[perm]}
                    onChange={(e) => toggle(g.role, perm, e.target.checked)}
                    className="size-4 accent-[var(--gold-500,#d8b36a)]"
                  />
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

/* — Activity Logs — */

const SCOPE_META = {
  users: { label: "Users", variant: "neutral" },
  orders: { label: "Orders", variant: "gold" },
  products: { label: "Products", variant: "success" },
  catalog: { label: "Catalog", variant: "success" },
  coupons: { label: "Coupons", variant: "warning" },
  promotions: { label: "Offers", variant: "warning" },
  settings: { label: "Settings", variant: "neutral" },
  reviews: { label: "Reviews", variant: "gold" },
  roles: { label: "Roles", variant: "error" },
  homepage: { label: "Homepage", variant: "gold" },
  system: { label: "System", variant: "neutral" },
};

function ActivityLogsSection() {
  const [scope, setScope] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-activity-logs", { scope, search, page }],
    queryFn: () => adminApi.listActivityLogs({ scope, search: search || undefined, page, limit: PAGE_SIZE }),
  });

  const logs = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.meta?.total || 0) / PAGE_SIZE));

  return (
    <div>
      <SectionTitle eyebrow="System" title="Activity Logs" description="A running audit trail of admin and system actions." />

      <Toolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }}>
        {["all", ...Object.keys(SCOPE_META)].map((s) => (
          <Chip key={s} selected={scope === s} onClick={() => { setScope(s); setPage(1); }}>
            {s === "all" ? "All" : SCOPE_META[s].label}
          </Chip>
        ))}
      </Toolbar>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading activity…</div>
      ) : isError ? (
        <ErrorNotice onRetry={refetch} />
      ) : logs.length === 0 ? (
        <EmptyState icon={History} title="No matching activity" description="Try a different filter or search term." />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-soft-sm divide-y divide-[var(--border)]">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 p-5">
              <Avatar name={log.actor} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="font-medium">{log.actor}</span> {log.action}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
              <Badge variant={SCOPE_META[log.scope]?.variant || "neutral"}>{SCOPE_META[log.scope]?.label || log.scope}</Badge>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
    </div>
  );
}
