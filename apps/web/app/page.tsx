import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  Globe2,
  Layers3,
  MousePointerClick,
  Palette,
  ShieldCheck,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { Logo } from "@/components/logo";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";
import { Faq } from "@/components/faq";
import { MobileNavigation } from "@/components/mobile-navigation";
import { plans, properties } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { ThemeShowcase } from "@/components/theme-showcase";
import { publicThemes } from "@/lib/public-themes";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; plan?: string }>;
}) {
  const query = await searchParams;
  const selectedTheme = publicThemes.find(
    (theme) => theme.key === query.theme,
  )?.name;
  const selectedPlan = query.plan?.slice(0, 120);

  return (
    <main className="overflow-hidden">
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="page-shell flex h-24 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex rounded-full bg-white/40 backdrop-blur-md border border-white/40 px-8 py-3 shadow-sm" aria-label="Điều hướng chính">
            <a href="#features" className="hover:text-moss transition-colors">Tính năng</a>
            <Link href="/themes" className="hover:text-moss transition-colors">Giao diện mẫu</Link>
            <a href="#process" className="hover:text-moss transition-colors">Cách hoạt động</a>
            <a href="#pricing" className="hover:text-moss transition-colors">Bảng giá</a>
            <a href="#faq" className="hover:text-moss transition-colors">Hỏi đáp</a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/superadmin" className="px-5 py-2.5 text-sm font-bold text-ink hover:text-moss transition-colors">
              Đăng nhập
            </Link>
            <a href="#contact" className="button-primary !py-2.5 !min-h-0">
              Tạo website
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <MobileNavigation
            label="Mở menu"
            title="Nice Land"
            triggerClassName="grid size-11 place-items-center rounded-xl bg-white/50 backdrop-blur-md border border-white/50 shadow-sm sm:hidden"
          >
            <nav className="flex flex-col p-4 text-base font-semibold" aria-label="Điều hướng chính trên di động">
              <a href="#features" className="border-b border-ink/5 px-3 py-4">Tính năng</a>
              <Link href="/themes" className="border-b border-ink/5 px-3 py-4">Giao diện mẫu</Link>
              <a href="#process" className="border-b border-ink/5 px-3 py-4">Cách hoạt động</a>
              <a href="#pricing" className="border-b border-ink/5 px-3 py-4">Bảng giá</a>
              <a href="#faq" className="border-b border-ink/5 px-3 py-4">Hỏi đáp</a>
            </nav>
            <div className="mt-auto space-y-3 border-t border-ink/5 p-4 bg-cream/30">
              <Link href="/superadmin" className="flex min-h-12 items-center justify-center rounded-xl border-2 border-ink/10 px-5 text-sm font-bold">
                Đăng nhập
              </Link>
              <a href="#contact" className="button-primary w-full">
                Tạo website
              </a>
            </div>
          </MobileNavigation>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-10 lg:pt-40 lg:pb-16 min-h-[90vh] flex flex-col justify-center">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-moss/15 gradient-glow z-0"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gold/20 gradient-glow animation-delay-2000 z-0"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-leaf/10 gradient-glow animation-delay-4000 z-0"></div>

        <div className="page-shell relative z-10 text-center max-w-4xl mx-auto mt-8 lg:mt-0" data-reveal="soft">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/40 backdrop-blur-md px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-moss shadow-sm transition-all hover:bg-white/60">
            <Sparkles size={14} aria-hidden="true" />
            <span>Nền tảng website cho người làm địa ốc</span>
          </div>
          
          <h1 className="mt-8 text-balance font-display text-5xl font-medium leading-[1.05] min-[420px]:text-6xl sm:text-7xl lg:text-[86px] tracking-tight">
            Website bất động sản <br className="hidden sm:block"/>
            <span className="text-gradient font-bold drop-shadow-sm">mang tên bạn.</span>
          </h1>
          
          <p className="mt-8 max-w-2xl mx-auto text-base leading-relaxed text-ink/70 sm:text-lg">
            Xây thương hiệu riêng, quản lý tin đăng thông minh và biến mỗi lượt xem thành một cơ hội kết nối với giao diện hiện đại.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#contact" className="button-primary group w-full sm:w-auto">
              Bắt đầu website của bạn
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <Link href="/themes" className="button-secondary w-full sm:w-auto">
              Xem website mẫu
              <LayoutDashboard size={17} aria-hidden="true" />
            </Link>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-ink/60 font-medium">
            {["Dùng thử 14 ngày", "Không cần thẻ", "Hỗ trợ thiết lập"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-moss/10">
                  <Check className="text-moss" size={12} aria-hidden="true" />
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>



      {/* Stats Section */}
      <section className="relative z-20 pb-16">
        <div className="page-shell">
          <div className="glass-panel rounded-3xl grid gap-8 sm:gap-5 text-center sm:grid-cols-3 sm:text-left p-10 mx-auto max-w-5xl" data-reveal-group>
            {[
              ["1.200+", "website đã khởi tạo"],
              ["48.000+", "tin đăng được quản lý"],
              ["99,9%", "thời gian hoạt động"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col sm:flex-row items-center gap-3 sm:justify-start">
                <strong className="font-display text-4xl font-semibold text-gradient drop-shadow-sm">{value}</strong>
                <span className="text-sm font-medium text-ink/60 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section (Bento Grid) */}
      <section id="features" className="py-24 sm:py-32 relative">
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
                <p className="text-ink/60 max-w-md leading-relaxed text-lg">Tạo, chỉnh sửa, phân loại và theo dõi trạng thái bất động sản với giao diện trực quan chỉ trong vài thao tác cơ bản.</p>
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
      <section id="process" className="relative py-24 sm:py-32 overflow-hidden bg-ink">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-moss/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        
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
              ["03", "Đăng tin & bán hàng", "Đưa các bất động sản lên website, chia sẻ đường dẫn và kết nối ngay với khách hàng."],
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
      <section id="pricing" className="py-24 sm:py-32 relative">
        <div className="page-shell">
          <div data-reveal="soft">
            <SectionHeading
              eyebrow="Bảng giá minh bạch"
              title="Bắt đầu vừa đủ. Nâng cấp khi bạn cần."
              align="center"
            />
          </div>
          <div className="mt-16 grid items-stretch gap-8 lg:grid-cols-3" data-reveal-group>
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`motion-card relative flex flex-col rounded-3xl p-8 sm:p-10 ${
                  plan.popular 
                  ? "bg-gradient-to-b from-moss to-ink text-white border-none shadow-[0_20px_50px_rgba(49,92,69,0.3)] transform lg:-translate-y-4 lg:hover:-translate-y-6" 
                  : "glass-card bg-white/70"
                }`}
              >
                {plan.popular && (
                  <div className="absolute inset-0 bg-gold/10 rounded-3xl blur-2xl z-0 pointer-events-none"></div>
                )}
                
                <div className="relative z-10 flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display text-3xl font-medium">{plan.name}</h3>
                    {plan.popular && (
                      <span className="bg-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-ink shadow-sm">
                        Phổ biến
                      </span>
                    )}
                  </div>
                  <p className={`min-h-[3rem] text-sm leading-relaxed ${plan.popular ? "text-white/70" : "text-ink/60"}`}>
                    {plan.description}
                  </p>
                  
                  <div className="mt-8 flex items-baseline gap-1">
                    <strong className="font-display text-5xl font-semibold tracking-tight">
                      {new Intl.NumberFormat("vi-VN").format(plan.price)}
                    </strong>
                    <span className={`text-sm font-medium ${plan.popular ? "text-white/60" : "text-ink/50"}`}>đ/tháng</span>
                  </div>
                  
                  <div className={`my-8 h-px w-full ${plan.popular ? "bg-white/20" : "bg-ink/10"}`} />
                  
                  <ul className="space-y-5 text-sm font-medium">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className={`mt-0.5 shrink-0 ${plan.popular ? "text-gold" : "text-moss"}`} size={18} />
                        <span className={plan.popular ? "text-white/90" : "text-ink/80"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/themes?plan=${encodeURIComponent(plan.name)}`}
                  className={`mt-10 relative z-10 w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-all ${
                    plan.popular 
                    ? "bg-gold text-ink hover:bg-white hover:shadow-lg hover:-translate-y-0.5" 
                    : "bg-white border-2 border-ink/5 text-ink hover:bg-moss hover:text-white hover:border-moss shadow-sm hover:-translate-y-0.5"
                  }`}
                >
                  Chọn gói {plan.name}
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/5 bg-white/50 backdrop-blur-sm py-24 sm:py-32">
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end mb-12">
            <SectionHeading eyebrow="Bốn giao diện website" title="Cùng công cụ vận hành, khác biệt trong cách thương hiệu xuất hiện." />
            <Link href="/themes" className="inline-flex items-center gap-2 text-sm font-bold text-moss hover:text-leaf transition-colors">
              Xem đủ 4 website mẫu
              <ArrowRight size={16} />
            </Link>
          </div>
          <div data-reveal-group>
            <ThemeShowcase compact />
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 sm:py-32">
        <div className="page-shell grid gap-14 lg:grid-cols-[0.7fr_1.3fr]" data-reveal-group>
          <SectionHeading eyebrow="Câu hỏi thường gặp" title="Những điều bạn có thể đang băn khoăn." />
          <div className="glass-card rounded-3xl p-6 sm:p-10">
            <Faq />
          </div>
        </div>
      </section>

      <section id="contact" className="bg-ink py-24 text-white sm:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-moss/20 blur-[150px] rounded-full pointer-events-none"></div>
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
          </div>
          <div className="glass-dark rounded-3xl p-6 sm:p-10">
            <ContactForm
              selectedTheme={selectedTheme}
              selectedPlan={selectedPlan}
            />
          </div>
        </div>
      </section>

      <footer className="bg-[#101713] py-12 text-white border-t border-white/5">
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 md:flex-row">
            <Logo href="/" inverted />
            <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm text-white/55 sm:grid-cols-4 font-medium">
              <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
              <Link href="/themes" className="hover:text-white transition-colors">Giao diện mẫu</Link>
              <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
              <a href="#faq" className="hover:text-white transition-colors">Hỏi đáp</a>
              <a href="#contact" className="hover:text-white transition-colors">Liên hệ</a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-7 text-xs text-white/35 sm:flex-row font-medium">
            <p>© 2026 Nice Land. Kiến tạo không gian số cho người làm địa ốc.</p>
            <p className="hover:text-white/50 cursor-pointer transition-colors">Điều khoản · Quyền riêng tư</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
