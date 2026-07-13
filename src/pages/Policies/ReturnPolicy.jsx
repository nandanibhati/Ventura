import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "../../api/catalog";
import { LoadingSpinner } from "../../components/ui/Feedback";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

/* Renders a settings text block as a heading's body — lines starting with "-" or "•" become a
   bullet list, blank lines separate paragraphs, everything else is plain text. Keeps the admin
   textarea free-form (no markdown editor needed) while still reading as structured content. */
function PolicyBlock({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const blocks = [];
  let currentList = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      currentList = null;
      continue;
    }
    if (line.startsWith("-") || line.startsWith("•")) {
      const item = line.replace(/^[-•]\s*/, "");
      if (!currentList) {
        currentList = [];
        blocks.push({ type: "list", items: currentList });
      }
      currentList.push(item);
    } else {
      currentList = null;
      blocks.push({ type: "paragraph", text: line });
    }
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) =>
        block.type === "list" ? (
          <ul key={i} className="list-disc space-y-1.5 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="text-sm text-neutral-600 dark:text-neutral-300">
            {block.text}
          </p>
        )
      )}
    </div>
  );
}

export default function ReturnPolicy() {
  useDocumentTitle("Returns & Warranty");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "public"],
    queryFn: settingsApi.getPublic,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-3xl">Returns & Warranty</h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Everything you need to know about returning an item or getting it repaired under warranty.
        </p>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner size="lg" label="Loading..." />
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
                {settings?.returnWindowDays ? `${settings.returnWindowDays}-Day Return Policy` : "Return Policy"}
              </h2>
              {settings?.returnPolicy ? (
                <PolicyBlock text={settings.returnPolicy} />
              ) : (
                <p className="text-sm text-neutral-400">Return policy details coming soon — contact us if you need help with a return.</p>
              )}
            </section>

            <section className="border-t border-black/5 pt-8 dark:border-white/10">
              <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Seller Warranty</h2>
              {settings?.sellerWarranty ? (
                <PolicyBlock text={settings.sellerWarranty} />
              ) : (
                <p className="text-sm text-neutral-400">Warranty details coming soon — contact us if you have a question about a faulty item.</p>
              )}
            </section>

            {settings?.contactEmail && (
              <p className="border-t border-black/5 pt-8 text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
                Questions about a return or warranty claim? Email us at{" "}
                <a href={`mailto:${settings.contactEmail}`} className="font-medium text-neutral-900 underline dark:text-white">
                  {settings.contactEmail}
                </a>
                .
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
