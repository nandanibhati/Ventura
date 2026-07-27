import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Package,
  Boxes,
  Wallet,
  ShieldCheck,
  Layers,
  Send,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileCheck,
  Truck,
} from "lucide-react";
import { partnerApplicationsApi } from "../../api/partnerApplications";
import { settingsApi } from "../../api/catalog";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { PrimaryButton, SecondaryButton } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

const BENEFITS = [
  { icon: Layers, text: "Wide catalogue of refurbished phones & electronics available at wholesale volume" },
  { icon: Wallet, text: "Competitive wholesale pricing so you keep a healthy margin when you resell" },
  { icon: Boxes, text: "Bulk stock ready to ship — no minimum order quantity to get started" },
  { icon: Truck, text: "Fast, tracked UK dispatch on every order" },
  { icon: ShieldCheck, text: "Every device quality-checked and backed by our warranty" },
  { icon: CheckCircle2, text: "No monthly fees or subscription — pay only for what you order" },
];

const STEPS = [
  {
    icon: ClipboardList,
    title: "Apply for a wholesale account",
    text: "Fill in the form below with a bit about your business. We review every application by hand.",
  },
  {
    icon: FileCheck,
    title: "Get approved & see pricing",
    text: "Once approved, we'll be in touch with your wholesale pricing and the full product catalogue.",
  },
  {
    icon: Package,
    title: "Request bulk orders",
    text: "Browse the catalogue and request stock for your own resale, at whatever quantity you need.",
  },
  {
    icon: Truck,
    title: "We ship to you",
    text: "We pick, pack and ship your order straight to your business address.",
  },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: "", label: "Select an option" },
  { value: "retailer", label: "Retailer" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "distributor", label: "Distributor" },
  { value: "other", label: "Other" },
];

const VOLUME_OPTIONS = [
  { value: "", label: "Select an option" },
  { value: "under-10", label: "Under 10 units" },
  { value: "10-50", label: "10 - 50 units" },
  { value: "50-200", label: "50 - 200 units" },
  { value: "200-plus", label: "200+ units" },
];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  companyName: "",
  website: "",
  taxId: "",
  addressLine1: "",
  city: "",
  country: "",
  postalCode: "",
  businessType: "",
  expectedVolume: "",
  message: "",
};

export default function Wholesale() {
  useDocumentTitle("Wholesale Program");
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
    mutationFn: () => {
      const { businessType, expectedVolume, message, ...rest } = form;
      const qualifiers = [
        businessType && `Business type: ${businessType}`,
        expectedVolume && `Expected monthly volume: ${expectedVolume}`,
      ]
        .filter(Boolean)
        .join("\n");
      return partnerApplicationsApi.create({
        type: "wholesale",
        ...rest,
        message: qualifiers ? `${qualifiers}\n\n${message}` : message,
      });
    },
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
    if (form.message.trim().length < 5) nextErrors.message = "Tell us a little more about your business.";
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
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-4xl">Wholesale</h1>
            <p className="mt-3 max-w-xl text-sm text-neutral-500 dark:text-neutral-400 md:text-base">
              Buy Veluntra's refurbished phones and electronics in bulk, at wholesale prices, for your own resale
              business.
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
          Why buy wholesale from Veluntra?
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
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-2xl">Apply for a wholesale account</h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Tell us about your business — we review every application and get back to you by email.
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
              <Input label="Company name" value={form.companyName} onChange={setField("companyName")} />
              <Input label="Website (optional)" value={form.website} onChange={setField("website")} />
            </div>
            <Input label="Tax ID / VAT number (optional)" value={form.taxId} onChange={setField("taxId")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Business type" value={form.businessType} onChange={setField("businessType")} options={BUSINESS_TYPE_OPTIONS} />
              <Select
                label="Expected monthly purchase volume"
                value={form.expectedVolume}
                onChange={setField("expectedVolume")}
                options={VOLUME_OPTIONS}
              />
            </div>

            <div className="mt-2 border-t border-black/5 pt-4 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Business address (optional)</p>
              <div className="mt-3 flex flex-col gap-4">
                <Input label="Address line 1" value={form.addressLine1} onChange={setField("addressLine1")} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="City" value={form.city} onChange={setField("city")} />
                  <Input label="Country" value={form.country} onChange={setField("country")} />
                  <Input label="Postal code" value={form.postalCode} onChange={setField("postalCode")} />
                </div>
              </div>
            </div>

            <Textarea
              label="Tell us about your business *"
              placeholder="What do you sell, where do you sell it, and how often would you order from us?"
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
