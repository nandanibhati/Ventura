import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquarePlus, Send, CheckCircle2 } from "lucide-react";
import Modal from "../ui/Overlay/Modal";
import { Input, Textarea } from "../ui/Input";
import { PrimaryButton } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { suggestionsApi } from "../../api/suggestions";

/** Site-wide floating feedback widget — lets any shopper (guest or logged in) send a
 * suggestion/complaint straight to the admin dashboard, no account or order required. */
export default function SuggestionBox() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => suggestionsApi.create(form),
    onSuccess: () => setSent(true),
    onError: (err) => setError(err.response?.data?.error?.message || "Couldn't send your suggestion. Please try again."),
  });

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setError("");
      setForm({ name: "", email: "", message: "" });
    }, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.message.trim().length < 5) {
      setError("Please write a bit more detail (at least 5 characters).");
      return;
    }
    setError("");
    mutation.mutate();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send us a suggestion"
        className="fixed bottom-20 right-4 z-[70] flex items-center gap-2 rounded-full bg-gold-500 px-4 py-3 text-sm font-medium text-white shadow-soft-lg transition-transform hover:scale-105 hover:bg-gold-600 sm:bottom-6"
      >
        <MessageSquarePlus className="size-4.5" />
        <span className="hidden sm:inline">Suggestions</span>
      </button>

      <Modal
        open={open}
        onClose={close}
        title={sent ? undefined : "Got a suggestion?"}
        description={sent ? undefined : "Tell us what you'd like to see, or let us know if something's not working."}
        size="sm"
      >
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-10 text-success-500" />
            <p className="font-medium text-[var(--text-primary)]">Thanks — we got it!</p>
            <p className="text-sm text-[var(--text-muted)]">Our team reviews every suggestion.</p>
            <PrimaryButton onClick={close} className="mt-2">
              Close
            </PrimaryButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!user && (
              <>
                <Input label="Name (optional)" placeholder="Jane Doe" value={form.name} onChange={setField("name")} />
                <Input
                  label="Email (optional)"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={setField("email")}
                />
              </>
            )}
            <Textarea
              label="Your suggestion"
              placeholder="What's on your mind?"
              value={form.message}
              onChange={setField("message")}
              maxLength={2000}
              rows={5}
              required
            />
            {error && <p className="text-sm text-error-500">{error}</p>}
            <PrimaryButton type="submit" fullWidth loading={mutation.isPending} leftIcon={mutation.isPending ? undefined : Send}>
              Send suggestion
            </PrimaryButton>
          </form>
        )}
      </Modal>
    </>
  );
}
