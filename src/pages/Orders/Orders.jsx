import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, ChevronDown, Download } from "lucide-react";
import { ordersApi } from "../../api/orders";
import { Badge, LoadingSpinner, EmptyState, ErrorState, useToast } from "../../components/ui/Feedback";
import { Breadcrumb, Pagination } from "../../components/ui/Navigation";
import { OutlineButton } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

const STATUS_VARIANT = {
  pending: "warning",
  processing: "warning",
  shipped: "gold",
  delivered: "success",
  cancelled: "error",
  return_requested: "warning",
  returned: "neutral",
  exchange_requested: "warning",
  exchanged: "gold",
};

const CANCELLABLE_STATUSES = new Set(["pending", "processing"]);

function OrderRow({ order }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["orders"] });
  const cancelMutation = useMutation({
    mutationFn: (reason) => ordersApi.cancel(order.id, reason),
    onSuccess: () => { invalidate(); toast({ title: "Order cancelled", variant: "success" }); },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't cancel this order", variant: "error" }),
  });
  const returnMutation = useMutation({
    mutationFn: (reason) => ordersApi.requestReturn(order.id, reason),
    onSuccess: () => { invalidate(); toast({ title: "Return requested", variant: "success" }); },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't request a return", variant: "error" }),
  });
  const exchangeMutation = useMutation({
    mutationFn: (reason) => ordersApi.requestExchange(order.id, reason),
    onSuccess: () => { invalidate(); toast({ title: "Exchange requested", variant: "success" }); },
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't request an exchange", variant: "error" }),
  });

  const handleCancel = () => {
    const reason = window.prompt("Why are you cancelling this order? (optional)") || undefined;
    cancelMutation.mutate(reason);
  };
  const handleReturn = () => {
    const reason = window.prompt("Why are you returning this order?");
    if (reason === null) return;
    returnMutation.mutate(reason);
  };
  const handleExchange = () => {
    const reason = window.prompt("What would you like to exchange, and why?");
    if (reason === null) return;
    exchangeMutation.mutate(reason);
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-soft-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <span className="grid size-11 place-items-center rounded-full bg-gold-400/12 text-gold-500">
            <Package className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{order.orderNumber}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {new Date(order.placedAt).toLocaleDateString()} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--text-primary)]">£{Number(order.total).toFixed(2)}</span>
          <Badge variant={STATUS_VARIANT[order.status] || "neutral"}>{order.status}</Badge>
          <ChevronDown className={cn("size-4 text-[var(--text-muted)] transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] p-5">
          <ul className="flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-primary)]">
                  {item.nameSnapshot} <span className="text-[var(--text-muted)]">× {item.quantity}</span>
                </span>
                <span className="text-[var(--text-muted)]">£{(Number(item.priceSnapshot) * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          {order.trackingNumber && (
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Tracking: <span className="text-[var(--text-primary)]">{order.trackingNumber}</span>
              {order.trackingCarrier && ` (${order.trackingCarrier})`}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <OutlineButton
              size="sm"
              leftIcon={Download}
              onClick={() => ordersApi.downloadInvoice(order.id, order.orderNumber)}
            >
              Download invoice
            </OutlineButton>
            {CANCELLABLE_STATUSES.has(order.status) && (
              <OutlineButton size="sm" onClick={handleCancel} loading={cancelMutation.isPending}>
                Cancel order
              </OutlineButton>
            )}
            {order.status === "delivered" && (
              <>
                <OutlineButton size="sm" onClick={handleReturn} loading={returnMutation.isPending}>
                  Request return
                </OutlineButton>
                <OutlineButton size="sm" onClick={handleExchange} loading={exchangeMutation.isPending}>
                  Request exchange
                </OutlineButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  useDocumentTitle("My Orders");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => ordersApi.list({ page, limit: 10 }),
  });

  const orders = data?.items || [];
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <div className="mb-6">
          <Breadcrumb items={[{ label: "Orders" }]} />
        </div>
        <h1 className="mb-8 text-3xl font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
          Order History
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" label="Loading your orders..." />
          </div>
        ) : isError ? (
          <ErrorState description="We couldn't load your orders." onRetry={refetch} />
        ) : orders.length === 0 ? (
          <EmptyState icon={Package} title="No orders yet" description="Your placed orders will show up here." />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
