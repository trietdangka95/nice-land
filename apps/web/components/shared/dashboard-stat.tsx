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
    <article className="motion-card glass-card rounded-2xl p-6 relative overflow-hidden group">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">{label}</p>
          <strong className="mt-3 block font-display text-4xl font-medium text-gradient drop-shadow-sm">{value}</strong>
        </div>
        <span className={`grid size-10 place-items-center rounded-full ${tones[tone]}`}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-6 border-t border-ink/5 pt-4 text-xs font-medium text-ink/50 relative z-10">{detail}</p>
      {/* Decorative gradient blur based on tone */}
      <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${
        tone === 'green' ? 'bg-emerald-500' : 
        tone === 'gold' ? 'bg-amber-500' : 
        tone === 'blue' ? 'bg-sky-500' : 'bg-stone-500'
      }`}></div>
    </article>
  );
}
