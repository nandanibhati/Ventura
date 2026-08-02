import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const PERKS = [
  { icon: Truck, title: "Free shipping", subtitle: "On orders over £150" },
  { icon: ShieldCheck, title: "Secure payments", subtitle: "100% protected checkout" },
  { icon: RotateCcw, title: "Easy returns", subtitle: "30-day return window" },
  { icon: Headphones, title: "24/7 support", subtitle: "We're always here to help" },
];

/** Slim reassurance bar shown under the nav on every page (Currys/Argos-style) — previously
 * this only appeared once, buried partway down the homepage. */
export default function PerksStrip() {
  return (
    <div className="border-b border-black/5 bg-white dark:border-white/10 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-6 py-3 sm:grid-cols-4 sm:gap-4 sm:py-3.5">
        {PERKS.map((perk) => (
          <div
            key={perk.title}
            className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-[var(--surface)] p-2.5 sm:border-0 sm:bg-transparent sm:p-0 dark:border-white/10"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-600 dark:text-gold-300">
              <perk.icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">{perk.title}</p>
              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">{perk.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
