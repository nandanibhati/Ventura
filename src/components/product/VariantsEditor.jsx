import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "../ui/Input";
import { OutlineButton } from "../ui/Button";
import { Chip } from "../ui/Feedback";

// Combination keys match `ProductOption.kind` ("color" / "storage"), not the display label —
// the storefront's existing variant-matching logic (ProductDetails.jsx) keys selections by kind.
function combinationKey(combination) {
  return JSON.stringify(combination);
}

function computeCombinations(colorOptions, storageOptions) {
  if (!colorOptions.length && !storageOptions.length) return [];
  const colors = colorOptions.length ? colorOptions : [null];
  const storages = storageOptions.length ? storageOptions : [null];
  const combos = [];
  for (const c of colors) {
    for (const s of storages) {
      const combination = {};
      if (c) combination.color = c.label;
      if (s) combination.storage = s;
      combos.push(combination);
    }
  }
  return combos;
}

/** Regenerates `variants` from the current option value lists, preserving
 * price/stock/image/sku already entered for combinations that still exist. */
function syncVariants(f, colorOptions, storageOptions) {
  const combos = computeCombinations(colorOptions, storageOptions);
  const existingByKey = new Map((f.variants || []).map((v) => [combinationKey(v.combination), v]));
  const variants = combos.map(
    (combination) => existingByKey.get(combinationKey(combination)) || { combination, price: "", stock: 0, imageUrl: null, sku: "" }
  );
  return { ...f, colorOptions, storageOptions, variants };
}

function combinationLabel(combination) {
  return [combination.color, combination.storage].filter(Boolean).join(" / ");
}

/** Converts a saved product's flat `options` rows + `variants` back into this editor's form shape. */
export function variantsFormStateFromProduct(p) {
  return {
    colorOptions: (p.options || []).filter((o) => o.kind === "color").map((o) => ({ label: o.label, hex: o.extra || "" })),
    storageOptions: (p.options || []).filter((o) => o.kind === "storage").map((o) => o.label),
    variants: (p.variants || []).map((v) => ({
      combination: v.combination,
      price: v.price ?? "",
      stock: v.stock ?? 0,
      imageUrl: v.imageUrl || null,
      sku: v.sku || "",
    })),
  };
}

/** Converts this editor's form shape into the `options`/`variants` the backend expects. */
export function buildOptionsAndVariantsPayload(form) {
  const options = [
    ...(form.colorOptions || []).map((c) => ({ kind: "color", label: c.label, extra: c.hex || undefined })),
    ...(form.storageOptions || []).map((label) => ({ kind: "storage", label })),
  ];
  const variants = (form.variants || []).map((v) => ({
    combination: v.combination,
    price: v.price === "" || v.price == null ? null : Number(v.price),
    stock: Number(v.stock) || 0,
    imageUrl: v.imageUrl || null,
    ...(v.sku?.trim() ? { sku: v.sku.trim() } : {}),
  }));
  return { options, variants };
}

// Common colour names auto-fill the swatch picker as you type, so typing "Green" and hitting
// Add actually gives you a green swatch instead of whatever the picker happened to be left on
// (the bug that shipped real listings with 3 different colour names all rendered as near-black).
const NAMED_COLOR_HEX = {
  black: "#171717",
  white: "#f5f5f5",
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#9333ea",
  violet: "#7c3aed",
  pink: "#ec4899",
  gray: "#6b7280",
  grey: "#6b7280",
  silver: "#c0c0c0",
  gold: "#d4af37",
  brown: "#78350f",
  navy: "#1e3a8a",
  teal: "#0d9488",
  beige: "#e8dcc8",
  cream: "#f5f0dc",
  maroon: "#7f1d1d",
  turquoise: "#06b6d4",
  lavender: "#c4b5fd",
  "rose gold": "#b76e79",
  "space gray": "#4b4b4d",
  "space grey": "#4b4b4d",
};

function ColorOptionEditor({ values, onAdd, onRemove }) {
  const [draft, setDraft] = useState("");
  const [hex, setHex] = useState("#111111");
  const [hexTouched, setHexTouched] = useState(false);

  const handleDraftChange = (value) => {
    setDraft(value);
    if (!hexTouched) {
      const guess = NAMED_COLOR_HEX[value.trim().toLowerCase()];
      if (guess) setHex(guess);
    }
  };

  const submit = () => {
    if (!draft.trim()) return;
    onAdd({ label: draft.trim(), hex });
    setDraft("");
    setHex("#111111");
    setHexTouched(false);
  };
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Colour</p>
      <div className="mb-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <Chip key={v.label} onRemove={() => onRemove(v.label)}>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: v.hex || "#9ca3af" }} />
            {v.label}
          </Chip>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => {
            setHex(e.target.value);
            setHexTouched(true);
          }}
          className="h-11 w-11 shrink-0 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1"
          aria-label="Swatch colour"
        />
        <div className="flex-1">
          <Input
            placeholder="Add a colour value (e.g. Black)"
            helperText="The swatch on the left auto-fills for common colour names, or pick your own."
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
          />
        </div>
        <OutlineButton size="sm" leftIcon={Plus} onClick={submit}>
          Add
        </OutlineButton>
      </div>
    </div>
  );
}

function StorageOptionEditor({ values, onAdd, onRemove }) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft("");
  };
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Storage</p>
      <div className="mb-2 flex flex-wrap gap-2">
        {values.map((v) => (
          <Chip key={v} onRemove={() => onRemove(v)}>
            {v}
          </Chip>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            placeholder="Add a storage value (e.g. 128GB)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
          />
        </div>
        <OutlineButton size="sm" leftIcon={Plus} onClick={submit}>
          Add
        </OutlineButton>
      </div>
    </div>
  );
}

function VariantRow({ variant, images, onChange }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-3">
      <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">{combinationLabel(variant.combination)}</p>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price override"
          type="number"
          placeholder="Same as base price"
          value={variant.price ?? ""}
          onChange={(e) => onChange({ ...variant, price: e.target.value })}
        />
        <Input label="Stock" type="number" value={variant.stock ?? 0} onChange={(e) => onChange({ ...variant, stock: e.target.value })} />
      </div>
      <div className="mt-3">
        <Input
          label="SKU"
          placeholder="Auto-generated if left blank"
          value={variant.sku ?? ""}
          onChange={(e) => onChange({ ...variant, sku: e.target.value })}
        />
      </div>
      {images.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs text-[var(--text-muted)]">Photo shown when a shopper selects this option</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...variant, imageUrl: null })}
              className={`flex h-12 w-12 items-center justify-center rounded-lg border text-[10px] text-[var(--text-muted)] ${
                !variant.imageUrl ? "border-gold-400 ring-1 ring-gold-400" : "border-[var(--border)]"
              }`}
            >
              None
            </button>
            {images.map((url) => (
              <button
                type="button"
                key={url}
                onClick={() => onChange({ ...variant, imageUrl: url })}
                className={`h-12 w-12 overflow-hidden rounded-lg border ${
                  variant.imageUrl === url ? "border-gold-400 ring-1 ring-gold-400" : "border-[var(--border)]"
                }`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VariantsEditor({ form, setForm }) {
  const colorOptions = form.colorOptions || [];
  const storageOptions = form.storageOptions || [];
  const variants = form.variants || [];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-[var(--text-primary)]">
        Variants <span className="font-normal text-[var(--text-muted)]">(optional — e.g. Colour and Storage, each with its own price/stock/photo)</span>
      </p>
      <ColorOptionEditor
        values={colorOptions}
        onAdd={(v) => setForm((f) => syncVariants(f, [...(f.colorOptions || []), v], f.storageOptions || []))}
        onRemove={(label) => setForm((f) => syncVariants(f, (f.colorOptions || []).filter((x) => x.label !== label), f.storageOptions || []))}
      />
      <StorageOptionEditor
        values={storageOptions}
        onAdd={(v) => setForm((f) => syncVariants(f, f.colorOptions || [], [...(f.storageOptions || []), v]))}
        onRemove={(v) => setForm((f) => syncVariants(f, f.colorOptions || [], (f.storageOptions || []).filter((x) => x !== v)))}
      />

      {variants.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Variant details <span className="font-normal text-[var(--text-muted)]">({variants.length} combination{variants.length === 1 ? "" : "s"})</span>
          </p>
          {variants.map((variant) => (
            <VariantRow
              key={combinationKey(variant.combination)}
              variant={variant}
              images={form.images || []}
              onChange={(updated) =>
                setForm((f) => ({
                  ...f,
                  variants: f.variants.map((v) => (combinationKey(v.combination) === combinationKey(variant.combination) ? updated : v)),
                }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
