import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Truck, RotateCcw, PackageSearch, Phone, Send } from "lucide-react";
import Modal from "../ui/Overlay/Modal";
import { Input } from "../ui/Input";
import { PrimaryButton, OutlineButton } from "../ui/Button";
import { settingsApi } from "../../api/catalog";
import { ordersApi } from "../../api/orders";

const TOPICS = [
  { id: "shipping", label: "Shipping & delivery", icon: Truck },
  { id: "returns", label: "Returns & exchanges", icon: RotateCcw },
  { id: "track", label: "Track my order", icon: PackageSearch },
  { id: "contact", label: "Contact us", icon: Phone },
];

/** Rule-based FAQ assistant — no AI/LLM involved, so it's free to run and answers only what's
 * covered below. Branded as "Veluntra Assistant"; answers are pulled live from Settings/order
 * data rather than hardcoded, so they never go stale as the admin changes policy.
 *
 * `open`/`onOpenChange` are controlled from MainLayout — opened via the header's "Veluntra
 * Assistant" link (beside Track Order). */
export default function ChatbotWidget({ open, onOpenChange }) {
  const [view, setView] = useState("menu"); // "menu" | "shipping" | "returns" | "contact" | "track"
  const [trackForm, setTrackForm] = useState({ orderNumber: "", email: "" });
  const [trackError, setTrackError] = useState("");

  const { data: settings } = useQuery({ queryKey: ["settings", "public"], queryFn: settingsApi.getPublic, staleTime: 5 * 60 * 1000 });

  const trackMutation = useMutation({
    mutationFn: () => ordersApi.track(trackForm.orderNumber.trim(), trackForm.email.trim()),
    onError: (err) => setTrackError(err.response?.data?.error?.message || "Couldn't find that order."),
  });

  const close = () => {
    onOpenChange(false);
    setTimeout(() => {
      setView("menu");
      setTrackForm({ orderNumber: "", email: "" });
      setTrackError("");
      trackMutation.reset();
    }, 200);
  };

  const symbol = settings?.currencySymbol || "£";

  const submitTrack = (e) => {
    e.preventDefault();
    setTrackError("");
    trackMutation.mutate();
  };

  return (
    <Modal open={open} onClose={close} title="Veluntra Assistant" description="Quick answers, no waiting." size="sm">
        {view === "menu" && (
          <div className="flex flex-col gap-2">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3.5 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-gold-400 hover:bg-gold-400/5"
              >
                <t.icon className="size-4.5 shrink-0 text-gold-500" />
                {t.label}
              </button>
            ))}
          </div>
        )}

        {view === "shipping" && (
          <ChatAnswer onBack={() => setView("menu")}>
            <p>
              Standard shipping costs {symbol}
              {Number(settings?.defaultShippingCost || 0).toFixed(2)}.
              {settings?.freeShippingThreshold != null && (
                <>
                  {" "}
                  Orders over {symbol}
                  {Number(settings.freeShippingThreshold).toFixed(2)} ship free.
                </>
              )}
            </p>
            <p>Exact delivery estimates are shown at checkout based on your address and the shipping method you choose.</p>
          </ChatAnswer>
        )}

        {view === "returns" && (
          <ChatAnswer onBack={() => setView("menu")}>
            <p>You can cancel an order within {settings?.cancellationWindowHours ?? 24} hours of placing it, no questions asked.</p>
            <p>
              Returns are accepted within {settings?.returnWindowDays ?? 30} days of delivery, and exchanges within{" "}
              {settings?.exchangeWindowDays ?? 30} days.
            </p>
            {settings?.returnPolicy && <p className="whitespace-pre-wrap text-[var(--text-muted)]">{settings.returnPolicy}</p>}
          </ChatAnswer>
        )}

        {view === "contact" && (
          <ChatAnswer onBack={() => setView("menu")}>
            {settings?.contactEmail && <p>Email: {settings.contactEmail}</p>}
            {settings?.contactPhone && <p>Phone: {settings.contactPhone}</p>}
            {settings?.contactAddress && <p>{settings.contactAddress}</p>}
            {!settings?.contactEmail && !settings?.contactPhone && !settings?.contactAddress && (
              <p>Use the Suggestions button to send us a message and we'll get back to you.</p>
            )}
          </ChatAnswer>
        )}

        {view === "track" && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setView("menu");
                trackMutation.reset();
                setTrackError("");
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>

            {trackMutation.isSuccess ? (
              <div className="flex flex-col gap-2 text-sm">
                <p className="font-semibold text-[var(--text-primary)]">Order {trackMutation.data.orderNumber}</p>
                <p className="capitalize text-[var(--text-primary)]">Status: {trackMutation.data.status.replace(/_/g, " ")}</p>
                {trackMutation.data.trackingNumber && (
                  <p className="text-[var(--text-muted)]">
                    Tracking: {trackMutation.data.trackingNumber}
                    {trackMutation.data.trackingCarrier ? ` (${trackMutation.data.trackingCarrier})` : ""}
                  </p>
                )}
                <ul className="mt-1 list-disc pl-5 text-[var(--text-muted)]">
                  {trackMutation.data.items.map((i, idx) => (
                    <li key={idx}>
                      {i.name} × {i.quantity}
                    </li>
                  ))}
                </ul>
                <OutlineButton size="sm" onClick={() => trackMutation.reset()} className="mt-2">
                  Track another order
                </OutlineButton>
              </div>
            ) : (
              <form onSubmit={submitTrack} className="flex flex-col gap-3">
                <p className="text-sm text-[var(--text-muted)]">Enter your order number and the email you used to order.</p>
                <Input
                  label="Order number"
                  placeholder="VNT-123456"
                  value={trackForm.orderNumber}
                  onChange={(e) => setTrackForm((f) => ({ ...f, orderNumber: e.target.value }))}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={trackForm.email}
                  onChange={(e) => setTrackForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
                {trackError && <p className="text-sm text-error-500">{trackError}</p>}
                <PrimaryButton type="submit" fullWidth loading={trackMutation.isPending} leftIcon={trackMutation.isPending ? undefined : Send}>
                  Track order
                </PrimaryButton>
              </form>
            )}
          </div>
        )}
    </Modal>
  );
}

function ChatAnswer({ children, onBack }) {
  return (
    <div className="flex flex-col gap-3">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="size-3.5" /> Back
      </button>
      <div className="flex flex-col gap-2 text-sm text-[var(--text-primary)]">{children}</div>
    </div>
  );
}
