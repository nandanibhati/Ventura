import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import Avatar from "../Feedback/Avatar";

/**
 * ReviewCard — customer review / testimonial.
 *
 * Props:
 *  - review: { author, avatar, rating, date, title, body, verified }
 */
export default function ReviewCard({ review, className }) {
  const { author, avatar, rating, date, title, body, verified } = review;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6",
        "shadow-soft-sm",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="size-3.5" fill={n <= rating ? "var(--color-gold-400)" : "none"} stroke="var(--color-gold-400)" />
        ))}
      </div>

      {title && <h4 className="text-[15px] font-medium text-[var(--text-primary)]">{title}</h4>}
      {body && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{body}</p>}

      <div className="mt-2 flex items-center gap-3 border-t border-[var(--border)] pt-4">
        <Avatar src={avatar} name={author} size="sm" />
        <div className="flex-1">
          <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            {author}
            {verified && <CheckCircle2 className="size-3.5 text-success-500" aria-label="Verified purchase" />}
          </p>
          {date && <p className="text-xs text-[var(--text-muted)]">{date}</p>}
        </div>
      </div>
    </div>
  );
}
