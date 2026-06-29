import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicTheme } from "@nice-land/contracts";
import {
  getPublicThemeDemoHref,
  getPublicThemePreference,
  publicThemes,
} from "@/lib/public-themes";
import { ThemeThumbnail } from "@/components/site/theme-thumbnail";

function buildThemeSignupHref(theme: PublicTheme, plan?: string) {
  const params = new URLSearchParams({ theme: getPublicThemePreference(theme) });
  if (plan) params.set("plan", plan);
  return `/?${params.toString()}#contact`;
}

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
        const preference = getPublicThemePreference(theme.key);

        return (
          <article
            key={theme.key}
            className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(49,92,69,0.15)] hover:border-moss/30 hover:-translate-y-1"
          >
            <Link
              href={getPublicThemeDemoHref(theme.key)}
              className={`relative block overflow-hidden ${compact ? "h-48" : "h-72"} bg-ink`}
            >
              <span className="absolute inset-0 transition duration-700 group-hover:scale-105 overflow-hidden">
                <ThemeThumbnail theme={theme.key} />
                <div className="absolute inset-0 z-10" />
              </span>
              <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink shadow-sm">
                {preference} theme
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
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={getPublicThemeDemoHref(theme.key)}
                  className="group/btn flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:border-ink/20 hover:bg-ink/5 hover:shadow-md"
                >
                  Xem website
                  <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </Link>
                <Link
                  href={buildThemeSignupHref(theme.key, selectedPlan)}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-moss px-4 text-sm font-bold text-white transition-colors hover:bg-ink"
                >
                  Chọn giao diện này
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
