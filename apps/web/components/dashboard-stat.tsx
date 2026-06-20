import type { LucideIcon } from "lucide-react";

export function DashboardStat({
  label,
  value,
  detail,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "green" | "gold" | "blue" | "gray";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    gold: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    gray: "bg-stone-100 text-stone-600",
  };

  return (
    <article className="motion-card border border-ink/10 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-ink/45">{label}</p>
          <strong className="mt-3 block font-display text-4xl font-medium">{value}</strong>
        </div>
        <span className={`grid size-10 place-items-center rounded-full ${tones[tone]}`}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-5 border-t border-ink/10 pt-4 text-xs text-ink/45">{detail}</p>
    </article>
  );
}
