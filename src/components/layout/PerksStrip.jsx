import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const PERKS = [
  { icon: Truck, title: "Free shipping", subtitle: "On orders over £150" },
  { icon: ShieldCheck, title: "Secure payments", subtitle: "100% protected checkout" },
  { icon: RotateCcw, title: "Easy returns", subtitle: "30-day return window" },
  { icon: Headphones, title: "24/7 support", subtitle: "We're always here to help" },
];

function PerkItem({ perk, hidden }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 pr-16" aria-hidden={hidden || undefined}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <perk.icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 whitespace-nowrap">
        <p className="text-xs font-semibold text-neutral-900 dark:text-white">{perk.title}</p>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{perk.subtitle}</p>
      </div>
    </div>
  );
}

/** Slim reassurance bar shown under the nav on every page (Currys/Argos-style) — previously
 * this only appeared once, buried partway down the homepage. Scrolls continuously right-to-left
 * like a broadcast ticker: two identical copies of the perk list sit back to back so the loop
 * point is invisible (see the marquee-rtl keyframes in styles/theme.css). */
export default function PerksStrip() {
  return (
    <div className="overflow-hidden border-b border-black/5 bg-white dark:border-white/10 dark:bg-neutral-950">
      <div className="flex w-max animate-[marquee-rtl_22s_linear_infinite] py-3 sm:py-3.5">
        {PERKS.map((perk) => (
          <PerkItem key={perk.title} perk={perk} />
        ))}
        {PERKS.map((perk) => (
          <PerkItem key={`${perk.title}-repeat`} perk={perk} hidden />
        ))}
      </div>
    </div>
  );
}
