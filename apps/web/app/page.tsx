import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  Globe2,
  MessageCircle,
  MousePointerClick,
  Palette,
  PhoneCall,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ContactForm } from "@/components/marketing/contact-form";
import { Faq } from "@/components/marketing/faq";
import { ThemeShowcase } from "@/components/marketing/theme-showcase";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { properties } from "@/lib/data";
import { getPlatformStats, getPublicPlans, getPublicSystemSetting } from "@/lib/server-api";
import type { SubscriptionPlan } from "@nice-land/contracts";
import { ViewTracker } from "@/components/marketing/view-tracker";

function getPlanPresentation(plan: SubscriptionPlan) {
  const isPopular = plan.isPopular;
  const isTrial = plan.price === 0;

  return {
    popular: isPopular,
    description: isTrial
      ? `Trải nghiệm ${plan.durationDays} ngày với bộ công cụ cốt lõi để bắt đầu website.`
      : plan.maxPosts >= 100
        ? "Cho đội nhóm cần vận hành nội dung thường xuyên và tối ưu trải nghiệm khách hàng."
        : "Dành cho môi giới cá nhân bắt đầu xây dựng thương hiệu với dữ liệu rõ ràng.",
    features: [
      `${new Intl.NumberFormat("vi-VN").format(plan.maxPosts)} tin đăng`,
      `${plan.maxImagesPerPost} ảnh mỗi tin`,
      `Chu kỳ ${plan.durationDays} ngày`,
      isTrial ? "Hỗ trợ tiêu chuẩn" : isPopular ? "Hỗ trợ ưu tiên" : "Website theo thương hiệu",
    ],
  };
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; theme?: string }>;
}) {
  const query = await searchParams;
  const selectedPlan = query.plan?.slice(0, 120);
  const initialThemePreference = query.theme === "cold" ? "cold" : "warm";
  const stats = await getPlatformStats();
  const plans = await getPublicPlans();
  const systemSetting = await getPublicSystemSetting();
  const featuredPreview = properties[0];
  const supportZaloPhone = systemSetting?.supportZaloPhone?.replace(/\D/g, "") ?? "";

  return (
    <main className="overflow-hidden">
      <ViewTracker />
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/90 backdrop-blur-xl supports-[backdrop-filter]:bg-cream/75">
        <div className="page-shell flex min-h-20 items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-1 rounded-full border border-ink/10 bg-white/70 p-1 text-sm font-semibold shadow-sm lg:flex" aria-label="Điều hướng chính">
            <a href="#features" className="rounded-full px-4 py-2.5 text-ink/65 transition-colors hover:bg-moss/10 hover:text-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">Tính năng</a>
            <Link href="/themes" className="rounded-full px-4 py-2.5 text-ink/65 transition-colors hover:bg-moss/10 hover:text-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">Giao diện mẫu</Link>
            <a href="#process" className="rounded-full px-4 py-2.5 text-ink/65 transition-colors hover:bg-moss/10 hover:text-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">Cách hoạt động</a>
            <a href="#pricing" className="rounded-full px-4 py-2.5 text-ink/65 transition-colors hover:bg-moss/10 hover:text-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">Bảng giá</a>
            <a href="#faq" className="rounded-full px-4 py-2.5 text-ink/65 transition-colors hover:bg-moss/10 hover:text-moss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">Hỏi đáp</a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/themes" className="button-secondary !min-h-11 !px-5 !py-2.5">
              Xem mẫu
            </Link>
            <a href="#contact" className="button-primary !min-h-11 !px-5 !py-2.5">
              Tạo website
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <MobileNavigation
            label="Mở menu"
            title="Nice Land"
            triggerClassName="grid size-11 place-items-center rounded-full border border-ink/10 bg-white/80 shadow-sm transition-colors hover:bg-white sm:hidden"
            contentClassName="overflow-hidden rounded-l-[1.75rem] border-l border-y border-ink/10 bg-[linear-gradient(180deg,rgba(253,250,243,0.98),rgba(245,243,237,0.98))] text-ink shadow-[0_28px_80px_rgba(23,33,27,0.18)]"
          >
            <nav className="flex flex-col gap-4 p-4" aria-label="Điều hướng chính trên di động">
              <div className="rounded-2xl border border-ink/10 bg-white/75 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-moss">Khám phá nhanh</p>
                <p className="mt-1 text-sm leading-6 text-ink/60">
                  Chạm vào các phần quan trọng để xem cách Nice Land trình bày thương hiệu của bạn.
                </p>
              </div>
              <div className="space-y-2">
                <a
                  href="#features"
                  className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 px-4 py-4 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-moss/20 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <span>Tính năng</span>
                  <ArrowRight size={16} className="text-moss" aria-hidden="true" />
                </a>
                <Link
                  href="/themes"
                  className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 px-4 py-4 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-moss/20 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <span>Giao diện mẫu</span>
                  <ArrowRight size={16} className="text-moss" aria-hidden="true" />
                </Link>
                <a
                  href="#process"
                  className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 px-4 py-4 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-moss/20 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <span>Cách hoạt động</span>
                  <ArrowRight size={16} className="text-moss" aria-hidden="true" />
                </a>
                <a
                  href="#pricing"
                  className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 px-4 py-4 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-moss/20 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <span>Bảng giá</span>
                  <ArrowRight size={16} className="text-moss" aria-hidden="true" />
                </a>
                <a
                  href="#faq"
                  className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 px-4 py-4 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-moss/20 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <span>Hỏi đáp</span>
                  <ArrowRight size={16} className="text-moss" aria-hidden="true" />
                </a>
              </div>
            </nav>
            <div className="mt-auto space-y-3 border-t border-ink/10 bg-[#f8f4ea] p-4">
              <Link href="/themes" className="button-secondary w-full">
                Xem website mẫu
              </Link>
              <a href="#contact" className="button-primary w-full">
                Tạo website
              </a>
            </div>
          </MobileNavigation>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-surface relative overflow-hidden py-4 lg:py-8">
        <div className="page-shell relative z-10 grid min-h-[clamp(560px,calc(100dvh-5rem),760px)] gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(390px,0.95fr)] lg:items-center">
          <div className="max-w-2xl" data-reveal="soft">
            <div className="inline-flex items-center gap-2 rounded-full border border-moss/15 bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-moss shadow-sm sm:text-xs">
              <Sparkles size={14} aria-hidden="true" />
              <span>Nền tảng website cho chuyên gia bất động sản</span>
            </div>

            <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.02] min-[420px]:text-5xl sm:text-6xl lg:text-[68px]">
              Website tin đăng <span className="text-gradient">mang thương hiệu bạn.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
              Xây thương hiệu riêng, quản lý tin mua bán - cho thuê thông minh và biến mỗi lượt xem thành một cơ hội kết nối với khách hàng thật.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#contact" className="button-primary group w-full sm:w-auto">
                Bắt đầu website của bạn
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
              </a>
              <Link href="/themes" className="button-secondary w-full sm:w-auto">
                Xem website mẫu
                <LayoutDashboard size={17} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7 grid max-w-xl gap-2 text-sm font-semibold text-ink/65 sm:grid-cols-3">
              {["Dùng thử 14 ngày", "Không cần thẻ", "Thiết lập nhanh chống"].map((item) => (
                <span key={item} className="flex items-center gap-2 rounded-full border border-ink/8 bg-white/55 px-3 py-2 text-xs sm:text-sm">
                  <span className="flex size-5 items-center justify-center rounded-full bg-moss/10">
                    <Check className="text-moss" size={12} aria-hidden="true" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative" data-reveal="right">
            <div className="hero-preview-shadow absolute inset-x-8 bottom-0 top-10 rounded-[2rem]"></div>
            <div className="relative mx-auto max-w-[760px] overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_24px_70px_rgba(23,33,27,0.14)]">
              <div className="flex items-center justify-between border-b border-ink/10 bg-white px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-400"></span>
                  <span className="size-3 rounded-full bg-gold"></span>
                  <span className="size-3 rounded-full bg-leaf"></span>
                </div>
                <span className="rounded-full bg-cream px-4 py-1 text-[11px] font-bold text-ink/45">ten-cua-ban.nice-land.id.vn</span>
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-[1.1fr_0.9fr] sm:p-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
                  <Image src={featuredPreview.images[0]} alt={featuredPreview.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 540px" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-moss shadow-sm">Tin nổi bật</span>
                </div>
                <div className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl bg-cream p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Giao diện của bạn</p>
                    <h2 className="mt-2 line-clamp-2 font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">{featuredPreview.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-ink/60">Tin đăng, thương hiệu và liên hệ được trình bày rõ ràng trên cùng một website.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["CTA", "hiển thị nổi bật"],
                      ["LIVE", "website sẵn sàng"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-xl bg-white p-3">
                        <strong className="block font-display text-xl text-moss">{value}</strong>
                        <span className="mt-1 block text-xs font-semibold text-ink/45">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-ink/10 bg-[#f9faf7] p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {["Căn hộ", "Đất", "Cho thuê"].map((label) => (
                      <span key={label} className="rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-bold text-ink/60">{label}</span>
                    ))}
                  </div>
                  <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-moss px-5 text-sm font-bold text-white">
                    <PhoneCall size={16} />
                    Gọi tư vấn
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Stats Section */}
      <section className="relative z-20 pb-8">
        <div className="page-shell">
          <div className="glass-panel rounded-3xl grid gap-8 sm:gap-5 text-center sm:grid-cols-3 sm:text-left p-10 mx-auto max-w-5xl" data-reveal-group>
            {[
              [
                new Intl.NumberFormat("vi-VN").format(stats.totalSites) + "+",
                "website đã khởi tạo",
              ],
              [
                new Intl.NumberFormat("vi-VN").format(stats.totalPosts) + "+",
                "tin đăng được quản lý",
              ],
              [
                new Intl.NumberFormat("vi-VN").format(stats.totalThemes),
                "giao diện đang vận hành",
              ],
            ].map(([value, label], index) => (
              <div key={label} className="flex flex-col sm:flex-row items-center gap-3 sm:justify-start">
                <strong className="font-display text-4xl font-semibold text-gradient drop-shadow-sm">{value}</strong>
                <span className="text-sm font-medium text-ink/60 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Theme Showcase */}
      <section id="themes" className="warm-surface relative overflow-hidden py-14 sm:py-16">
        <div className="page-shell relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16" data-reveal="soft">
            <SectionHeading
              eyebrow="Giao diện thiết kế chuẩn mực"
              title="Khẳng định phong cách riêng của bạn."
              align="center"
            />
            <p className="mt-6 text-lg leading-relaxed text-ink/70">
              Xem trực tiếp cả hai phong cách <strong className="text-moss">Warm</strong> và <strong className="text-moss">Cold</strong> ngay trên landing page, rồi chọn giao diện phù hợp để bắt đầu website của bạn.
            </p>
          </div>
          <div data-reveal="up">
            <ThemeShowcase selectedPlan={selectedPlan} />
          </div>
          <div className="mt-10 flex justify-center" data-reveal="soft">
            <Link
              href="/themes"
              className="button-secondary !min-h-11 !px-5 !py-2.5"
            >
              Xem gallery đầy đủ
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section (Bento Grid) */}
      <section id="features" className="py-14 sm:py-16 relative">
        <div className="absolute inset-0 bg-white/40 -z-10 backdrop-blur-3xl"></div>
        <div className="page-shell">
          <div className="text-center max-w-2xl mx-auto" data-reveal="soft">
            <SectionHeading
              eyebrow="Một nơi để vận hành"
              title="Tập trung vào khách hàng. Phần còn lại để chúng tôi lo."
              align="center"
            />
            <p className="mt-6 text-base leading-relaxed text-ink/60 mx-auto max-w-lg">
              Từ một tin đăng mới đến hình ảnh thương hiệu nhất quán, mọi công cụ đều được thiết kế
              cho nhịp làm việc thực tế của môi giới.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[auto]" data-reveal-group>
            {/* Large Bento Box 1 */}
            <div className="glass-card md:col-span-2 rounded-3xl p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-moss/5 rounded-full blur-3xl group-hover:bg-moss/10 transition-all duration-700"></div>
              <div className="relative z-10">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-ink/5 mb-8">
                  <Building2 className="text-moss" size={28} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-3xl font-medium mb-3">Quản lý tin đăng thông minh</h3>
                <p className="text-ink/60 max-w-md leading-relaxed text-lg">Tạo, chỉnh sửa, phân loại và theo dõi trạng thái tin đăng với giao diện trực quan chỉ trong vài thao tác cơ bản.</p>
              </div>
            </div>

            {/* Normal Bento Box 1 */}
            <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between group">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-white shadow-sm border border-ink/5 mb-6">
                <Palette className="text-gold" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-2xl font-medium mb-2">Thương hiệu riêng</h3>
                <p className="text-sm text-ink/60 leading-relaxed">Đồng bộ logo, màu sắc và nhận diện thương hiệu trên toàn website.</p>
              </div>
            </div>

            {/* Normal Bento Box 2 */}
            <div className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between group">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-white shadow-sm border border-ink/5 mb-6">
                <Globe2 className="text-leaf" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-2xl font-medium mb-2">Tên miền độc lập</h3>
                <p className="text-sm text-ink/60 leading-relaxed">Mỗi khách hàng có một subdomain hoặc tùy chỉnh tên miền riêng dễ dàng.</p>
              </div>
            </div>

            {/* Large Bento Box 2 */}
            <div className="glass-card md:col-span-2 rounded-3xl p-8 sm:p-10 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/15 transition-all duration-700"></div>
              <div className="relative z-10">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-ink/5 mb-8">
                  <MousePointerClick className="text-moss" size={28} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-3xl font-medium mb-3">Tối ưu tỷ lệ chuyển đổi</h3>
                <p className="text-ink/60 max-w-md text-lg leading-relaxed">Nút gọi điện, Zalo và biểu mẫu liên hệ luôn được bố trí thông minh ở đúng nơi khách hàng cần để tối đa hóa lượng leads thu về.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="dark-surface relative overflow-hidden py-14 sm:py-16">
        <div className="page-shell relative z-10 text-white">
          <SectionHeading
            eyebrow="Đơn giản từ ngày đầu"
            title="Ba bước để có một không gian số của riêng bạn."
            description="Không dự án kéo dài hàng tháng. Bạn cung cấp thông tin, chúng tôi chuẩn bị nền móng, và website sẵn sàng đón khách."
          />
          <div className="mt-16 grid gap-6 lg:grid-cols-3" data-reveal-group>
            {[
              ["01", "Chọn gói & giao diện", "Xem các website mẫu, chọn phong cách phù hợp rồi đăng ký gói dịch vụ tương ứng."],
              ["02", "Tạo dấu ấn riêng", "Chúng tôi thiết lập theme đã chọn với tên, logo, màu sắc và thông tin liên hệ của bạn."],
              ["03", "Đăng tin & bán hàng", "Đưa các tin mua bán - cho thuê lên website, chia sẻ đường dẫn và kết nối ngay với khách hàng."],
            ].map(([number, title, description]) => (
              <article key={number} className="glass-dark rounded-3xl p-10 relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:bg-white/5 hover:border-white/20">
                <div className="absolute -right-4 -top-8 text-[140px] font-display font-bold text-white/5 group-hover:text-white/10 transition-colors duration-500">{number}</div>
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-gold font-bold mb-8 backdrop-blur-md border border-white/10 shadow-inner group-hover:bg-gold/20 transition-colors duration-500">{number}</span>
                <h3 className="font-display text-2xl font-medium text-white tracking-wide">{title}</h3>
                <p className="mt-4 leading-relaxed text-white/60 group-hover:text-white/80 transition-colors duration-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-14 sm:py-16 relative">
        <div className="page-shell">
          <div data-reveal="soft">
            <SectionHeading
              eyebrow="Bảng giá minh bạch"
              title="Bắt đầu vừa đủ. Nâng cấp khi bạn cần."
              align="center"
            />
          </div>
          {plans.length === 0 ? (
            <div className="mt-16 glass-card rounded-3xl p-8 text-center text-sm font-medium text-ink/60">
              Bảng giá đang được cập nhật. Vui lòng quay lại sau ít phút.
            </div>
          ) : (
            <div className="mt-16 grid items-stretch gap-8 lg:grid-cols-3" data-reveal-group>
              {plans.map((plan) => {
                const presentation = getPlanPresentation(plan);

                return (
                  <article
                    key={plan.id}
                    className={`motion-card relative flex flex-col h-full rounded-3xl p-8 sm:p-10 ${presentation.popular
                      ? "bg-gradient-to-b from-moss to-ink text-white border-none shadow-[0_20px_50px_rgba(49,92,69,0.3)] transform lg:-translate-y-4 lg:hover:-translate-y-6"
                      : "glass-card bg-white/70"
                      }`}
                  >
                    {presentation.popular && (
                      <div className="absolute inset-0 bg-gold/10 rounded-3xl blur-2xl z-0 pointer-events-none"></div>
                    )}

                    <div className="relative z-10 flex-1">
                      <div className="flex justify-between items-start mb-4 min-h-[4rem] gap-2">
                        <div className="flex flex-col gap-1 items-start">
                          <h3 className="font-display text-3xl font-medium line-clamp-2">{plan.name}</h3>
                          {presentation.popular && (
                            <span className="bg-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-ink shadow-sm">
                              Phổ biến
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={`min-h-[3rem] text-sm leading-relaxed ${presentation.popular ? "text-white/70" : "text-ink/60"}`}>
                        {presentation.description}
                      </p>

                      <div className="mt-8 flex items-baseline gap-1">
                        <strong className="font-display text-5xl font-semibold tracking-tight">
                          {plan.price === 0 ? "Miễn phí" : new Intl.NumberFormat("vi-VN").format(plan.price)}
                        </strong>
                        <span className={`text-sm font-medium ${presentation.popular ? "text-white/60" : "text-ink/50"}`}>
                          {plan.price === 0 ? `${plan.durationDays} ngày` : "đ/tháng"}
                        </span>
                      </div>

                      <div className={`my-8 h-px w-full ${presentation.popular ? "bg-white/20" : "bg-ink/10"}`} />

                      <ul className="space-y-5 text-sm font-medium">
                        {presentation.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check className={`mt-0.5 shrink-0 ${presentation.popular ? "text-gold" : "text-moss"}`} size={18} />
                            <span className={presentation.popular ? "text-white/90" : "text-ink/80"}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href={`/?plan=${encodeURIComponent(plan.name)}#contact`}
                      className={`mt-10 relative z-10 w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-all ${presentation.popular
                        ? "bg-gold text-ink hover:bg-white hover:shadow-lg hover:-translate-y-0.5"
                        : "bg-white border-2 border-ink/5 text-ink hover:bg-moss hover:text-white hover:border-moss shadow-sm hover:-translate-y-0.5"
                        }`}
                    >
                      Chọn gói {plan.name}
                      <ArrowRight size={16} />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="faq" className="py-20 sm:py-24">
        <div className="page-shell grid gap-10 lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.18fr)]" data-reveal-group>
          <SectionHeading eyebrow="Câu hỏi thường gặp" title="Những điều bạn có thể đang băn khoăn." />
          <div className="glass-card rounded-3xl p-6 sm:p-10">
            <Faq />
          </div>
        </div>
      </section>

      <section id="contact" className="dark-surface relative overflow-hidden py-24 text-white sm:py-32">
        <div className="page-shell grid gap-12 lg:grid-cols-2 relative z-10" data-reveal-group>
          <div className="max-w-xl">
            <p className="eyebrow !text-gold mb-5">Bắt đầu hôm nay</p>
            <h2 className="text-balance font-display text-5xl font-medium leading-[1.1] sm:text-6xl tracking-tight">
              Để khách hàng nhớ đến tên bạn, không phải một nền tảng khác.
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-white/60">
              Kể chúng tôi nghe về cách bạn đang làm việc. Chúng tôi sẽ cùng bạn chọn cấu hình website
              vừa đủ cho hiện tại và sẵn sàng cho bước tiếp theo.
            </p>
            {supportZaloPhone ? (
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold/85">Liên hệ nhanh</p>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
                  Cần trao đổi ngay? Bấm vào Zalo để kết nối trực tiếp với đội ngũ Nice Land chỉ trong một bước.
                </p>
                <a
                  href={`https://zalo.me/${supportZaloPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0068ff] px-5 text-sm font-bold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#1a74ff]"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  Nhắn Zalo ngay
                </a>
              </div>
            ) : null}
          </div>
          <div className="glass-dark rounded-3xl p-6 sm:p-10">
            <ContactForm
              initialThemePreference={initialThemePreference}
              selectedPlan={selectedPlan}
            />
          </div>
        </div>
      </section>

      <footer className="bg-[#101713] text-white border-t border-white/5">
        <div className="page-shell mt-10">
          <div className="grid gap-10 border-b border-white/10 pb-10 pt-2 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.35fr)]">
            <div className="max-w-sm">
              <Logo href="/" inverted />
              <p className="mt-5 text-sm leading-7 text-white/50">
                Nice Land giúp môi giới và đội nhóm vận hành website tin đăng riêng, rõ thương hiệu và sẵn sàng chuyển đổi khách hàng.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3 lg:justify-items-end">
              <div>
                <strong className="text-xs uppercase tracking-[0.18em] text-white/35">Sản phẩm</strong>
                <div className="mt-4 grid gap-3 font-medium text-white/55">
                  <a href="#features" className="transition-colors hover:text-white">Tính năng</a>
                  <Link href="/themes" className="transition-colors hover:text-white">Giao diện mẫu</Link>
                  <a href="#pricing" className="transition-colors hover:text-white">Bảng giá</a>
                </div>
              </div>
              <div>
                <strong className="text-xs uppercase tracking-[0.18em] text-white/35">Hỗ trợ</strong>
                <div className="mt-4 grid gap-3 font-medium text-white/55">
                  <a href="#faq" className="transition-colors hover:text-white">Hỏi đáp</a>
                  <a href="#contact" className="transition-colors hover:text-white">Liên hệ</a>
                  <Link href="/demo" className="transition-colors hover:text-white">Website mẫu</Link>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <strong className="text-xs uppercase tracking-[0.18em] text-white/35">Cam kết</strong>
                <div className="mt-4 grid gap-3 font-medium text-white/55">
                  <span>Thiết lập nhanh</span>
                  <span>Giao diện responsive</span>
                  <span>Hỗ trợ vận hành</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 py-7 text-xs text-white/35 sm:flex-row font-medium">
            <p>Powered by Triet Dang</p>
            <p className="hover:text-white/50 cursor-pointer transition-colors">Điều khoản · Quyền riêng tư</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
