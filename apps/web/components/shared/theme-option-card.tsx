import { Check } from "lucide-react";

export function ThemeOptionCard<T extends string>({
  value,
  label,
  description,
  previewSwatches,
  selected,
  onSelect,
  tone = "light",
  emphasisTone,
}: {
  value: T;
  label: string;
  description: string;
  previewSwatches: [string, string, string, string];
  selected: boolean;
  onSelect: (value: T) => void;
  tone?: "light" | "dark";
  emphasisTone?: "warm" | "cold";
}) {
  const [panel, accent, surface, soft] = previewSwatches;
  const isWarm = emphasisTone === "warm";
  const isCold = emphasisTone === "cold";
  const selectedClassName =
    tone === "dark"
      ? isWarm
        ? "border-[#e6c9ac] bg-[#e6c9ac]/10 ring-1 ring-[#e6c9ac]/35"
        : isCold
          ? "border-[#7dd9ff] bg-[#7dd9ff]/10 ring-1 ring-[#7dd9ff]/35"
          : "border-gold bg-white/15 ring-1 ring-gold/30"
      : "border-moss bg-moss/10";
  const idleClassName =
    tone === "dark"
      ? isWarm
        ? "border-[#727a74] bg-[#202823] opacity-88 hover:border-[#8a938d] hover:bg-[#273029]"
        : isCold
          ? "border-[#727a74] bg-[#202823] opacity-88 hover:border-[#8a938d] hover:bg-[#273029]"
          : "border-[#727a74] bg-[#202823] opacity-88 hover:border-[#8a938d] hover:bg-[#273029]"
      : "border-ink/10 bg-white/50 hover:bg-white";
  const frameClassName =
    tone === "dark"
      ? isWarm
        ? "border-[#f1dec9]/25 bg-[#f4eadf]/10"
        : isCold
          ? "border-[#7dd9ff]/20 bg-[#071a2f]/65"
          : "border-white/10 bg-white/10"
      : "rounded-lg border border-ink/10 bg-white";
  const labelClassName = tone === "dark" ? "text-white" : "text-ink";
  const descriptionClassName = tone === "dark" ? "text-white/60" : "text-ink/55";
  const badgeClassName = isWarm
    ? "bg-[#e6c9ac] text-[#4f3326]"
    : isCold
      ? "bg-[#7dd9ff] text-[#08233d]"
      : tone === "dark"
        ? "bg-white/15 text-white"
        : "bg-moss/10 text-moss";
  const accentLabel = isWarm ? "Ấm áp" : isCold ? "Sắc nét" : label;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`mt-2 grid gap-2.5 border p-3 text-left transition-all duration-200 sm:gap-3 sm:p-4 ${selected ? `${selectedClassName} shadow-[0_16px_40px_rgba(0,0,0,0.18)]` : `${idleClassName} shadow-none`}`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] sm:px-3 sm:text-[11px] sm:tracking-[0.16em] ${badgeClassName}`}>
          {accentLabel}
        </span>
        {selected ? (
          <span className="inline-flex size-6 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white/85 sm:size-7">
            <Check size={13} aria-hidden="true" />
          </span>
        ) : null}
      </span>
      <span className={`grid h-16 overflow-hidden p-2 sm:h-24 sm:p-3 ${frameClassName}`}>
        <span className={`grid h-full grid-cols-[1.15fr_0.85fr] gap-2 rounded-xl p-2 sm:gap-3 sm:p-3 ${isWarm ? "bg-[#2f3a33]" : isCold ? "bg-[#0a1b30]" : ""}`}>
          <span className={`rounded-lg ${panel}`} />
        </span>
      </span>
      <span>
        <span className={`block text-sm font-extrabold sm:text-base ${labelClassName}`}>{label}</span>
        <span className={`mt-1 line-clamp-2 block text-[11px] leading-4 sm:text-xs sm:leading-5 ${descriptionClassName}`}>{description}</span>
      </span>
    </button>
  );
}
