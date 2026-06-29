import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PublicTheme } from "@nice-land/contracts";
import { Logo } from "@/components/marketing/logo";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ThemeThumbnail } from "@/components/site/theme-thumbnail";
import {
  getPublicThemeDemoHref,
  getPublicThemePreference,
  publicThemes,
} from "@/lib/public-themes";

function buildThemeSignupHref(theme: PublicTheme, plan?: string) {
  const params = new URLSearchParams({ theme: getPublicThemePreference(theme) });
  if (plan) params.set("plan", plan);
  return `/?${params.toString()}#contact`;
}

export default async function ThemeGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

  return (
    <main className="min-h-screen bg-cream">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/90 backdrop-blur-xl supports-[backdrop-filter]:bg-cream/75">
        <div className="page-shell flex h-20 items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink/10 bg-white/70 px-4 text-sm font-bold transition-colors hover:bg-white">
            <ArrowLeft size={16} />
            Về Nice Land
          </Link>
        </div>
      </header>
      <section className="warm-surface relative overflow-hidden py-16 sm:py-24">
        <div className="page-shell relative z-10">
          <div className="mx-auto mb-16 max-w-3xl text-center" data-reveal="soft">
            <SectionHeading
              eyebrow="Giao diện thiết kế chuẩn mực"
              title="Khẳng định phong cách riêng của bạn."
              align="center"
            />
            <p className="mt-6 text-lg leading-relaxed text-ink/70">
              Chọn phong cách <strong className="text-moss">Warm</strong> gần gũi hoặc <strong className="text-moss">Cold</strong> sắc nét trước khi gửi yêu cầu tạo website. Superadmin sẽ xác nhận lại theme này khi khởi tạo tenant.
            </p>
          </div>
          <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-2" data-reveal="up">
            {publicThemes.map((theme) => {
              const preference = getPublicThemePreference(theme.key);

              return (
                <article key={theme.key} className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-ink/10">
                  <div className="relative aspect-[16/10] bg-white">
                    <ThemeThumbnail theme={theme.key} />
                    <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink shadow-sm">
                      {preference} theme
                    </span>
                  </div>
                  <div className="border-t border-ink/10 p-6">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss">{theme.fontStyle} / {theme.density}</p>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-ink">{theme.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-ink/60">{theme.description}</p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={getPublicThemeDemoHref(theme.key)}
                        target="_blank"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white px-4 text-sm font-bold text-ink transition-colors hover:bg-ink/5"
                      >
                        Review thumbnail
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        href={buildThemeSignupHref(theme.key, plan)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-moss px-4 text-sm font-bold text-white transition-colors hover:bg-ink"
                      >
                        Chọn giao diện này
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="relative z-10 mt-6 flex flex-col items-center justify-center gap-4 lg:col-span-2 sm:flex-row">
              {plan && (
                <span className="rounded-full border border-moss/20 bg-white px-4 py-3 text-sm font-semibold text-moss">
                  Gói đang quan tâm: {plan}
                </span>
              )}
              <Link
                href="/demo"
                target="_blank"
                className="button-primary group/btn flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                Trải nghiệm theme mặc định
                <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
