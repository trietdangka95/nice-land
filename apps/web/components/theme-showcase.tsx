import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import {
  getPublicThemeDemoHref,
  publicThemes,
} from "@/lib/public-themes";
import { ThemeThumbnail } from "@/components/theme-thumbnail";

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
            className="group flex flex-col overflow-hidden border border-ink/15 bg-white"
          >
            <Link
              href={getPublicThemeDemoHref(theme.key)}
              className={`relative block overflow-hidden ${compact ? "h-48" : "h-72"} bg-ink`}
            >
              <span className="absolute inset-0 transition duration-500 group-hover:scale-[1.015]">
                <ThemeThumbnail theme={theme.key} />
              </span>
              <span className="absolute bottom-8 right-8 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink">
                Xem mẫu
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-2xl">{theme.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink/55">
                {theme.description}
              </p>
              <p className="mt-3 border-l-2 border-gold/70 pl-3 text-xs leading-5 text-ink/45">
                {theme.direction}
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Link
                  href={getPublicThemeDemoHref(theme.key)}
                  className="button-secondary min-h-11 px-4"
                >
                  Xem website
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href={`/?${selection.toString()}#contact`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 bg-moss px-4 text-sm font-bold text-white"
                >
                  <Check size={15} />
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
