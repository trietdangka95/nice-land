import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { SectionHeading } from "@/components/marketing/section-heading";

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
              Giao diện <strong className="text-moss">Personal Broker</strong> tập trung vào việc làm nổi bật uy tín và câu chuyện của bạn. Thiết kế tinh tế, sang trọng, tương thích hoàn hảo trên mọi thiết bị.
            </p>
          </div>
          <div className="relative mx-auto max-w-5xl group" data-reveal="up">
            <div className="absolute -inset-1 bg-gradient-to-b from-moss/20 to-gold/20 rounded-[2rem] blur-2xl opacity-70 group-hover:opacity-100 transition duration-1000 pointer-events-none"></div>

            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-ink/10 transition-transform duration-700 hover:-translate-y-2">
              <div className="flex items-center bg-[#f1f1f1] px-4 py-3 border-b border-ink/5">
                <div className="flex gap-2">
                  <div className="size-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                  <div className="size-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                  <div className="size-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                </div>
                <div className="mx-auto flex h-6 w-1/2 items-center justify-center rounded-md bg-white text-[11px] font-medium text-ink/40 shadow-sm border border-ink/5">
                  demo.nice-land.id.vn
                </div>
              </div>

              <div className="relative bg-white aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                <iframe
                  src="/demo"
                  className="w-full h-full border-none"
                  title="Personal Broker Theme Preview"
                />
              </div>
            </div>

            <div className="relative z-10 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
                Trải nghiệm toàn màn hình
                <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
