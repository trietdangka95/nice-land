import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import {
  getPublicThemeDemoHref,
  publicThemes,
} from "@/lib/public-themes";
import { ThemeThumbnail } from "@/components/site/theme-thumbnail";

export function ThemeShowcase({
  selectedPlan,
  compact = false,
}: {
  selectedPlan?: string;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-6 ${compact ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2"}`}>
      {publicThemes.map((theme) => {
        const selection = new URLSearchParams({ theme: theme.key });
        if (selectedPlan) selection.set("plan", selectedPlan);

        return (
          <article
            key={theme.key}
            className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(49,92,69,0.15)] hover:border-moss/30 hover:-translate-y-1"
          >
            <Link
              href={getPublicThemeDemoHref(theme.key)}
              className={`relative block overflow-hidden ${compact ? "h-48" : "h-72"} bg-ink`}
            >
              <span className="absolute inset-0 transition duration-700 group-hover:scale-105">
                <ThemeThumbnail theme={theme.key} />
              </span>
              <span className="absolute bottom-4 right-4 rounded-full bg-moss/90 backdrop-blur-md shadow-lg border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-300 group-hover:bg-moss group-hover:scale-105">
                Xem mẫu
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-2xl font-semibold text-ink">{theme.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60">
                {theme.description}
              </p>
              <p className="mt-4 border-l-2 border-gold/70 pl-3 text-xs leading-5 text-ink/50 italic">
                {theme.direction}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href={getPublicThemeDemoHref(theme.key)}
                  className="group/btn flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:border-ink/20 hover:bg-ink/5 hover:shadow-md"
                >
                  Xem website
                  <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </Link>
                <Link
                  href={`/?${selection.toString()}#contact`}
                  className="group/btn flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-moss to-[#17211b] px-4 text-sm font-bold text-white shadow-md border border-moss/50 transition-all hover:shadow-[0_10px_20px_rgba(49,92,69,0.2)] hover:-translate-y-0.5"
                >
                  <Check size={16} className="text-gold" />
                  Chọn mẫu
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
