export function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "gold" | "gray" | "red";
  children: React.ReactNode;
}) {
  const classes = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    gold: "bg-amber-50 text-amber-700 ring-amber-600/15",
    gray: "bg-stone-100 text-stone-600 ring-stone-500/10",
    red: "bg-red-50 text-red-700 ring-red-600/15",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${classes[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
