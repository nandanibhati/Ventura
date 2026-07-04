import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "../../../lib/utils";

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
  xl: "size-20 text-xl",
};

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/**
 * Avatar — image with graceful fallback to initials, then a generic icon.
 *
 * Props:
 *  - src: image url
 *  - name: used for initials fallback and alt text
 *  - status: "online" | "offline" — optional presence dot
 */
export default function Avatar({ src, name, size = "md", status, className }) {
  const [errored, setErrored] = useState(false);
  const initials = getInitials(name);

  return (
    <span className={cn("relative inline-flex shrink-0 rounded-full", SIZES[size], className)}>
      {src && !errored ? (
        <img
          src={src}
          alt={name || "User avatar"}
          onError={() => setErrored(true)}
          className="size-full rounded-full object-cover border border-[var(--border)]"
        />
      ) : (
        <span
          className={cn(
            "flex size-full items-center justify-center rounded-full font-medium",
            "bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950 border border-gold-400/40"
          )}
        >
          {initials || <User className="size-1/2" aria-hidden="true" />}
        </span>
      )}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--surface)]",
            status === "online" ? "bg-success-500" : "bg-ink-400"
          )}
          aria-label={status}
        />
      )}
    </span>
  );
}
