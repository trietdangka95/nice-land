export function ThemeOptionCard<T extends string>({
  value,
  label,
  description,
  previewSwatches,
  selected,
  onSelect,
  tone = "light",
}: {
  value: T;
  label: string;
  description: string;
  previewSwatches: [string, string, string, string];
  selected: boolean;
  onSelect: (value: T) => void;
  tone?: "light" | "dark";
}) {
  const [panel, accent, surface, soft] = previewSwatches;
  const selectedClassName =
    tone === "dark" ? "border-gold bg-white/15" : "border-moss bg-moss/10";
  const idleClassName =
    tone === "dark"
      ? "border-white/15 bg-white/5 hover:border-white/35"
      : "border-ink/10 bg-white/50 hover:bg-white";
  const frameClassName =
    tone === "dark"
      ? "border-white/10 bg-white/10"
      : "rounded-lg border border-ink/10 bg-white";
  const labelClassName = tone === "dark" ? "text-white" : "text-ink";
  const descriptionClassName = tone === "dark" ? "text-white/60" : "text-ink/55";

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`grid gap-3 border p-4 text-left transition-colors ${selected ? selectedClassName : idleClassName}`}
    >
      <span className={`grid h-24 grid-cols-[0.9fr_1.1fr] gap-2 overflow-hidden p-2 ${frameClassName}`}>
        <span className={panel} />
        <span className="grid gap-2">
          <span className={accent} />
          <span className={surface} />
          <span className={soft} />
        </span>
      </span>
      <span>
        <span className={`block text-sm font-extrabold ${labelClassName}`}>{label}</span>
        <span className={`mt-1 block text-xs leading-5 ${descriptionClassName}`}>{description}</span>
      </span>
    </button>
  );
}
