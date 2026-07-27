import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Gift,
  Wallet,
  Link2,
  Send,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Share2,
  TrendingUp,
} from "lucide-react";
import { partnerApplicationsApi } from "../../api/partnerApplications";
import { settingsApi } from "../../api/catalog";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

const BENEFITS = [
  { icon: Wallet, text: "Earn a commission on every sale your referral link brings in" },
  { icon: Link2, text: "Your own personal referral link — share it anywhere: blog, YouTube, TikTok, Instagram" },
  { icon: Gift, text: "No cost to join and no minimum audience size required" },
  { icon: TrendingUp, text: "Track your clicks, sales, and commission from your account" },
];

const STEPS = [
  {
    icon: ClipboardList,
    title: "Apply to the program",
    text: "Fill in the form below and tell us a bit about where you'll be sharing Veluntra.",
  },
  {
    icon: CheckCircle2,
    title: "Get approved",
    text: "We review every application by hand and set up your referral code once approved.",
  },
  {
    icon: Share2,
    title: "Share your link",
    text: "Post your personal referral link on your site, channel, or social profiles.",
  },
  {
    icon: Wallet,
    title: "Earn commission",
    text: "Track your earnings from My Account and get paid out as commissions are approved.",
  },
];

const PLATFORM_OPTIONS = [
  { value: "", label: "Select an option" },
  { value: "blog", label: "Blog / Website" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  website: "",
  referralSource: "",
  message: "",
};

export default function Affiliate() {
  useDocumentTitle("Affiliate / Influencer Program");
  const { toast } = useToast();
  const { data: storeSettings } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60 * 1000,
  });

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submitMutation = useMutation({
    mutationFn: () => partnerApplicationsApi.create({ type: "affiliate", ...form }),
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast({ title: err.response?.data?.error?.message || "Couldn't submit application", variant: "error" }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (form.message.trim().length < 5) nextErrors.message = "Tell us a little about where you'll share Veluntra.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    submitMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <div className="border-b border-black/5 dark:border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between md:py-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Partner Program</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-4xl">
              Affiliate &amp; Influencer
            </h1>
            <p className="mt-3 max-w-xl text-sm text-neutral-500 dark:text-neutral-400 md:text-base">
              Share Veluntra with your audience and earn a commission on every sale your referral link brings in.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link to="/shop">
              <SecondaryButton>See More Products</SecondaryButton>
            </Link>
            <a href="#apply">
              <PrimaryButton rightIcon={ArrowRight}>Apply Now</PrimaryButton>
            </a>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-2xl">
          Why join the Veluntra affiliate program?
        </h2>
        <div className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.text} className="flex items-start gap-3">
              <b.icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="border-y border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-2xl">How it works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-500">Step {i + 1}</p>
                <h3 className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">{step.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application form */}
      <div id="apply" className="mx-auto max-w-2xl scroll-mt-24 px-6 py-12 md:py-16">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-2xl">Apply to the program</h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Tell us a bit about yourself and where you'll be sharing Veluntra — we review every application and get back
          to you by email.
        </p>

        {submitted ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-base font-semibold text-neutral-900 dark:text-white">Application submitted!</p>
            <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
              Thanks for applying — our team will review your details and email you at {form.email} once it's been looked at.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First name *" value={form.firstName} onChange={setField("firstName")} error={errors.firstName} />
              <Input label="Last name *" value={form.lastName} onChange={setField("lastName")} error={errors.lastName} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email *" type="email" value={form.email} onChange={setField("email")} error={errors.email} />
              <Input label="Phone number *" type="tel" value={form.phone} onChange={setField("phone")} error={errors.phone} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Where will you share Veluntra?" value={form.referralSource} onChange={setField("referralSource")} options={PLATFORM_OPTIONS} />
              <Input label="Website / social profile link" value={form.website} onChange={setField("website")} />
            </div>

            <Textarea
              label="Tell us about your audience *"
              placeholder="What kind of content do you make, roughly how many people see it, and where do they find you?"
              value={form.message}
              onChange={setField("message")}
              error={errors.message}
              maxLength={2000}
            />

            <div className="mt-2">
              <PrimaryButton type="submit" fullWidth loading={submitMutation.isPending} leftIcon={submitMutation.isPending ? undefined : Send}>
                Submit Application
              </PrimaryButton>
            </div>

            {storeSettings?.contactEmail && (
              <p className="text-center text-xs text-neutral-400">
                Prefer email? Reach us directly at{" "}
                <a href={`mailto:${storeSettings.contactEmail}`} className="underline">
                  {storeSettings.contactEmail}
                </a>
                .
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
