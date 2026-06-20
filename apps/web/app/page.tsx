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
} from "lucide-react";
import { Logo } from "@/components/logo";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";
import { Faq } from "@/components/faq";
import { MobileNavigation } from "@/components/mobile-navigation";
import { plans, properties } from "@/lib/data";
import { formatPrice } from "@/lib/format";

const heroProperty = properties[0];

export default function LandingPage() {
  return (
    <main>
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="page-shell flex h-24 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex" aria-label="Điều hướng chính">
            <a href="#features" className="hover:text-leaf">Tính năng</a>
            <a href="#process" className="hover:text-leaf">Cách hoạt động</a>
            <a href="#pricing" className="hover:text-leaf">Bảng giá</a>
            <a href="#faq" className="hover:text-leaf">Hỏi đáp</a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/superadmin" className="px-4 py-3 text-sm font-bold hover:text-leaf">
              Đăng nhập
            </Link>
            <a href="#contact" className="button-primary">
              Tạo website
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <MobileNavigation
            label="Mở menu"
            title="Nice Land"
            triggerClassName="grid size-11 place-items-center border border-ink/20 sm:hidden"
          >
            <nav className="flex flex-col p-4 text-base font-semibold" aria-label="Điều hướng chính trên di động">
              <a href="#features" className="border-b border-white/10 px-3 py-4">Tính năng</a>
              <a href="#process" className="border-b border-white/10 px-3 py-4">Cách hoạt động</a>
              <a href="#pricing" className="border-b border-white/10 px-3 py-4">Bảng giá</a>
              <a href="#faq" className="border-b border-white/10 px-3 py-4">Hỏi đáp</a>
            </nav>
            <div className="mt-auto space-y-3 border-t border-white/10 p-4">
              <Link href="/superadmin" className="flex min-h-12 items-center justify-center border border-white/20 px-5 text-sm font-bold">
                Đăng nhập
              </Link>
              <a href="#contact" className="flex min-h-12 items-center justify-center bg-white px-5 text-sm font-bold text-ink">
                Tạo website
              </a>
            </div>
          </MobileNavigation>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-ink/10 pt-24">
        <div className="absolute -right-28 top-8 size-[520px] rounded-full border border-moss/10" />
        <div className="absolute -right-10 top-28 size-[360px] rounded-full border border-moss/10" />
        <div className="page-shell grid min-h-[790px] items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div className="relative z-10 max-w-2xl" data-reveal="left">
            <div className="inline-flex max-w-full items-center gap-2 border border-moss/20 bg-white/50 px-3 py-2 text-[10px] font-bold uppercase leading-5 tracking-[0.12em] text-moss sm:text-xs sm:tracking-[0.16em]">
              <Sparkles size={14} aria-hidden="true" />
              <span>Nền tảng website cho người làm địa ốc</span>
            </div>
            <h1 className="mt-7 text-balance font-display text-5xl font-medium leading-[0.97] min-[420px]:text-6xl sm:text-7xl lg:text-[86px]">
              Website bất động sản
              <span className="block italic text-moss">mang tên bạn.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-ink/65 sm:text-lg sm:leading-8">
              Xây thương hiệu riêng, quản lý tin đăng gọn gàng và biến mỗi lượt xem thành một cơ hội
              kết nối.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#contact" className="button-primary">
                Bắt đầu website của bạn
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <Link href="/minhphat" className="button-secondary">
                Xem website mẫu
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink/60">
              {["Dùng thử 14 ngày", "Không cần thẻ", "Hỗ trợ thiết lập"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="text-leaf" size={16} aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:ml-auto" data-reveal="right">
            <div className="absolute -left-6 top-12 hidden h-36 w-28 bg-gold/20 lg:block" />
            <div className="relative ml-auto aspect-[4/5] w-[88%] overflow-hidden bg-sand">
              <Image
                src={heroProperty.images[0]}
                alt="Biệt thự hiện đại trên website bất động sản mẫu"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 42vw"
              />
            </div>
            <div className="absolute bottom-8 left-0 w-[78%] bg-white p-5 shadow-soft sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-leaf">Nổi bật</p>
                  <h2 className="mt-2 font-display text-xl font-medium sm:text-2xl">
                    {heroProperty.title}
                  </h2>
                </div>
                <span className="shrink-0 bg-cream px-3 py-2 text-xs font-bold text-moss">
                  {formatPrice(heroProperty.price)}
                </span>
              </div>
              <p className="mt-4 text-xs text-ink/55">
                {heroProperty.area} m² · {heroProperty.district}, {heroProperty.province}
              </p>
            </div>
            <div className="absolute right-0 top-10 grid size-20 place-items-center bg-moss text-center text-white">
              <span>
                <strong className="block font-display text-2xl">24h</strong>
                <small className="text-[9px] uppercase tracking-wider text-white/65">lên sóng</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white py-8">
        <div className="page-shell grid gap-5 text-center sm:grid-cols-3 sm:text-left" data-reveal-group>
          {[
            ["1.200+", "website đã khởi tạo"],
            ["48.000+", "tin đăng được quản lý"],
            ["99,9%", "thời gian hoạt động"],
          ].map(([value, label]) => (
            <div key={label} className="flex items-baseline justify-center gap-3 sm:justify-start">
              <strong className="font-display text-3xl font-medium text-moss">{value}</strong>
              <span className="text-sm text-ink/50">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 sm:py-32">
        <div className="page-shell">
          <div className="grid items-end gap-8 lg:grid-cols-2">
            <SectionHeading
              eyebrow="Một nơi để vận hành"
              title="Tập trung vào khách hàng. Phần còn lại để chúng tôi lo."
            />
            <p className="max-w-xl text-base leading-7 text-ink/60 lg:ml-auto">
              Từ một tin đăng mới đến hình ảnh thương hiệu nhất quán, mọi công cụ đều được thiết kế
              cho nhịp làm việc thực tế của môi giới và đội ngũ địa ốc.
            </p>
          </div>
          <div className="mt-16 grid border-l border-t border-ink/15 md:grid-cols-2 lg:grid-cols-3" data-reveal-group>
            {[
              [Building2, "Quản lý tin đăng", "Tạo, chỉnh sửa, phân loại và theo dõi trạng thái bất động sản trong vài thao tác."],
              [Palette, "Thương hiệu của riêng bạn", "Logo, màu sắc, banner và thông tin liên hệ đồng bộ trên toàn website."],
              [Globe2, "Địa chỉ dễ nhớ", "Mỗi khách hàng có một subdomain riêng, sẵn sàng chia sẻ ngay khi khởi tạo."],
              [MousePointerClick, "Tối ưu chuyển đổi", "CTA gọi điện, Zalo và biểu mẫu liên hệ luôn ở đúng nơi khách hàng cần."],
              [BarChart3, "Bức tranh rõ ràng", "Theo dõi số lượng tin, trạng thái xuất bản và giới hạn gói dịch vụ."],
              [ShieldCheck, "Dữ liệu tách biệt", "Kiến trúc multi-tenant bảo vệ dữ liệu từng website bằng siteId ở máy chủ."],
            ].map(([Icon, title, description], index) => {
              const FeatureIcon = Icon as typeof Building2;
              return (
                <article key={title as string} className="motion-card min-h-64 border-b border-r border-ink/15 p-7 sm:p-9">
                  <div className="flex items-start justify-between">
                    <FeatureIcon className="text-moss" size={27} strokeWidth={1.6} aria-hidden="true" />
                    <span className="font-display text-sm italic text-ink/30">0{index + 1}</span>
                  </div>
                  <h3 className="mt-10 font-display text-2xl font-medium">{title as string}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink/60">{description as string}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="process" className="bg-ink py-24 text-white sm:py-32">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Đơn giản từ ngày đầu"
            title="Ba bước để có một không gian số của riêng bạn."
            description="Không dự án kéo dài hàng tháng. Bạn cung cấp thông tin, chúng tôi chuẩn bị nền móng, và website sẵn sàng đón khách."
          />
          <div className="mt-16 grid gap-px bg-white/15 lg:grid-cols-3" data-reveal-group>
            {[
              ["01", "Chọn tên của bạn", "Đăng ký địa chỉ dễ nhớ như tenban.nice-land.vn và chọn gói phù hợp."],
              ["02", "Tạo dấu ấn riêng", "Cập nhật logo, màu sắc, câu chuyện thương hiệu và thông tin liên hệ."],
              ["03", "Đăng tin, bắt đầu bán", "Đưa bất động sản lên website, chia sẻ đường dẫn và kết nối khách hàng."],
            ].map(([number, title, description]) => (
              <article key={number} className="bg-ink p-8 sm:p-10">
                <span className="font-display text-6xl font-light italic text-gold">{number}</span>
                <h3 className="mt-10 font-display text-3xl font-medium">{title}</h3>
                <p className="mt-4 leading-7 text-white/55">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="page-shell grid items-center gap-14 lg:grid-cols-2">
          <div className="relative" data-reveal="left">
            <div className="aspect-[4/3] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85"
                alt="Đội ngũ bất động sản trao đổi kế hoạch"
                fill={false}
                width={1400}
                height={1050}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-7 right-0 bg-moss p-6 text-white sm:right-8 sm:w-64">
              <Layers3 size={25} strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-4 font-display text-xl">Một hệ thống, nhiều thương hiệu độc lập.</p>
            </div>
          </div>
          <div className="lg:pl-10" data-reveal="right">
            <SectionHeading
              eyebrow="Lớn lên theo cách của bạn"
              title="Từ môi giới độc lập đến một đội ngũ có hệ thống."
              description="Mỗi website giữ bản sắc và dữ liệu riêng. Khi quy mô tăng, bạn vẫn có một nơi rõ ràng để quản lý tenant, gói dịch vụ và hoạt động toàn hệ thống."
            />
            <Link href="/superadmin" className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-bold">
              Khám phá trang quản trị hệ thống
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 sm:py-32">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Bảng giá minh bạch"
            title="Bắt đầu vừa đủ. Nâng cấp khi bạn cần."
            align="center"
          />
          <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3" data-reveal-group>
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`motion-card relative flex flex-col border p-7 sm:p-9 ${plan.popular ? "border-moss bg-moss text-white" : "border-ink/15 bg-white"
                  }`}
              >
                {plan.popular && (
                  <span className="absolute right-0 top-0 bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink">
                    Phổ biến
                  </span>
                )}
                <h3 className="font-display text-3xl font-medium">{plan.name}</h3>
                <p className={`mt-3 min-h-12 text-sm leading-6 ${plan.popular ? "text-white/60" : "text-ink/55"}`}>
                  {plan.description}
                </p>
                <p className="mt-8">
                  <strong className="font-display text-5xl font-medium">
                    {new Intl.NumberFormat("vi-VN").format(plan.price)}
                  </strong>
                  <span className={plan.popular ? "text-white/55" : "text-ink/45"}> đ/tháng</span>
                </p>
                <div className={`my-8 h-px ${plan.popular ? "bg-white/15" : "bg-ink/10"}`} />
                <ul className="space-y-4 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className={plan.popular ? "text-gold" : "text-leaf"} size={17} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`mt-9 inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-bold ${plan.popular ? "bg-white text-ink hover:bg-gold" : "border border-ink/20 hover:bg-cream"
                    }`}
                >
                  Chọn gói {plan.name}
                  <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white py-24 sm:py-32">
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <SectionHeading eyebrow="Website đang hoạt động" title="Mỗi thương hiệu, một câu chuyện riêng." />
            <Link href="/minhphat" className="inline-flex items-center gap-2 text-sm font-bold">
              Xem website mẫu
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3" data-reveal-group>
            {[
              ["minhphat", "Nhà Đất Minh Phát", properties[0].images[0], "Đà Nẵng"],
              ["anland", "An Land", properties[5].images[0], "TP. Hồ Chí Minh"],
              ["minhphat", "Mộc Gia Property", properties[2].images[0], "Hội An"],
            ].map(([slug, name, image, location]) => (
              <Link key={name} href={`/${slug}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                  <Image
                    src={image}
                    alt={`Website mẫu ${name}`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="mt-5 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-medium">{name}</h3>
                    <p className="mt-1 text-sm text-ink/50">{location}</p>
                  </div>
                  <ArrowRight className="mt-1 transition group-hover:translate-x-1" size={19} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 sm:py-32">
        <div className="page-shell grid gap-14 lg:grid-cols-[0.7fr_1.3fr]" data-reveal-group>
          <SectionHeading eyebrow="Câu hỏi thường gặp" title="Những điều bạn có thể đang băn khoăn." />
          <Faq />
        </div>
      </section>

      <section id="contact" className="bg-ink py-24 text-white sm:py-32">
        <div className="page-shell grid gap-12 lg:grid-cols-2" data-reveal-group>
          <div className="max-w-xl">
            <p className="eyebrow !text-gold">Bắt đầu hôm nay</p>
            <h2 className="mt-5 text-balance font-display text-5xl font-medium leading-[1.02] sm:text-6xl">
              Để khách hàng nhớ đến tên bạn, không phải tên một nền tảng khác.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/60">
              Kể chúng tôi nghe về cách bạn đang làm việc. Chúng tôi sẽ cùng bạn chọn cấu hình website
              vừa đủ cho hiện tại và sẵn sàng cho bước tiếp theo.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="bg-[#101713] py-12 text-white">
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 md:flex-row">
            <Logo href="/" inverted />
            <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm text-white/55 sm:grid-cols-4">
              <a href="#features" className="hover:text-white">Tính năng</a>
              <a href="#pricing" className="hover:text-white">Bảng giá</a>
              <a href="#faq" className="hover:text-white">Hỏi đáp</a>
              <a href="#contact" className="hover:text-white">Liên hệ</a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-7 text-xs text-white/35 sm:flex-row">
            <p>© 2026 Nice Land. Kiến tạo không gian số cho người làm địa ốc.</p>
            <p>Điều khoản · Quyền riêng tư</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
