import Image from "next/image";
import { ArrowRight, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { TenantLink } from "@/components/shared/tenant-link";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { PropertyBrowser } from "@/components/site/property-browser";
import { BrokerIntroSection } from "@/components/site/broker-intro-section";
import { formatPrice } from "@/lib/format";
import type { PublicThemeHomeProps } from "./types";
import type { Site } from "@/lib/types";

export function ColdHeader({ site }: { site: Site }) {
  return (
    <header className="tenant-header cold-header sticky top-0 z-40 border-b border-white/10 bg-[var(--cold-navy)] text-white">
      <div className="page-shell flex min-h-20 items-center justify-between gap-5">
        <TenantLink slug={site.slug} href="" className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center border border-[var(--cold-accent)] bg-white/5 text-sm font-black text-[var(--cold-accent)]">
            {site.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.logo} alt={`Logo ${site.name}`} className="size-full object-cover" />
            ) : site.logoMark}
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-xl font-black tracking-tight">{site.name}</strong>
            <small className="hidden text-[10px] font-black uppercase tracking-[0.22em] text-slate-300 sm:block">
              Cold Modern Realty
            </small>
          </span>
        </TenantLink>
        <nav className="hidden items-center gap-8 text-xs font-black uppercase tracking-[0.16em] text-slate-300 lg:flex" aria-label="Điều hướng Cold Modern">
          <TenantLink slug={site.slug} href="#properties" className="transition-colors hover:text-[var(--cold-accent)]">Tin đăng</TenantLink>
          <TenantLink slug={site.slug} href="#about" className="transition-colors hover:text-[var(--cold-accent)]">Phân tích</TenantLink>
          <TenantLink slug={site.slug} href="#contact" className="transition-colors hover:text-[var(--cold-accent)]">Liên hệ</TenantLink>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a href={site.facebookUrl ?? "#"} aria-label="Facebook" className="grid size-11 place-items-center border border-white/15 text-[var(--cold-accent)] transition-colors hover:border-[var(--cold-accent)]"><Facebook size={17} /></a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-2 bg-[var(--cold-accent)] px-5 text-sm font-black text-[#03111f] transition-colors hover:bg-[var(--cold-accent-strong)]"><Phone size={17} />Gọi trực tiếp</a>
        </div>
        <MobileNavigation
          label="Mở menu"
          title={site.name}
          triggerClassName="grid size-11 place-items-center border border-white/15 text-[var(--cold-accent)] lg:hidden"
        >
          <nav className="flex flex-col p-4 text-base font-semibold" aria-label="Điều hướng website trên di động">
            {[
              ["Tin đăng", "#properties"],
              ["Phân tích", "#about"],
              ["Liên hệ", "#contact"],
            ].map(([label, href]) => (
              <TenantLink key={label} slug={site.slug} href={href} className="border-b border-white/10 px-3 py-4">
                {label}
              </TenantLink>
            ))}
          </nav>
        </MobileNavigation>
      </div>
    </header>
  );
}

export function ColdFooter({ site }: { site: Site }) {
  return (
    <footer id="contact" className="tenant-footer cold-footer bg-[var(--cold-navy)] py-12 text-white">
      <div className="page-shell border-t border-white/10 pt-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.9fr)] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--cold-accent)]">
              Cold Modern Advisory
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
              Ra quyết định bất động sản bằng dữ liệu rõ ràng và tư vấn sắc nét.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Tư vấn tập trung vào sản phẩm rõ thông tin, cấu trúc giá hợp lý và nhịp ra quyết định nhanh, gọn.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 border border-white/10 bg-[var(--cold-midnight)]/60 p-5">
              <span className="flex items-start gap-3 text-sm text-slate-200">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[var(--cold-accent)]" />
                <span>{site.address}</span>
              </span>
              <span className="flex items-start gap-3 text-sm text-slate-200">
                <Mail size={17} className="mt-0.5 shrink-0 text-[var(--cold-accent)]" />
                <span>{site.email}</span>
              </span>
            </div>

            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="inline-flex min-h-14 items-center justify-between gap-4 border border-[var(--cold-accent)] bg-[var(--cold-accent)] px-5 text-sm font-black text-[var(--cold-midnight)] transition-colors hover:bg-[var(--cold-accent-strong)]"
            >
              <span className="inline-flex items-center gap-3">
                <Phone size={18} />
                Gọi trực tiếp
              </span>
              <span>{site.phone}</span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>{site.name}</span>
          <span>Powered by Triet Dang</span>
        </div>
      </div>
    </footer>
  );
}

export function ColdModernHome(model: PublicThemeHomeProps) {
  const { site, featured, posts, total, page, totalPages, query, type, categoryId, province, sort } = model;

  return (
    <>
      <ColdHeader site={site} />
      <section className="tenant-hero cold-hero bg-[var(--cold-surface)] text-[var(--cold-ink)]">
        <div className="page-shell grid gap-10 py-14 lg:min-h-[620px] lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="inline-flex border border-[var(--cold-border)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--cold-accent-dark)]">
              Trust-led property intelligence
            </p>
            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight text-[var(--cold-ink)] sm:text-7xl">
              {site.name}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--cold-muted)]">
              {site.tagline || "Danh sách bất động sản được trình bày rõ ràng, sắc nét và tập trung vào quyết định mua bán có cơ sở."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <TenantLink slug={site.slug} href="#properties" className="inline-flex min-h-12 items-center gap-2 bg-[var(--cold-navy)] px-6 text-sm font-black uppercase tracking-[0.08em] text-white">
                Xem tin đăng
                <ArrowRight size={17} />
              </TenantLink>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-12 items-center gap-2 border border-[var(--cold-border)] bg-white px-6 text-sm font-black uppercase tracking-[0.08em] text-[var(--cold-ink)]">
                <Phone size={16} />
                Tư vấn nhanh
              </a>
            </div>
          </div>
          <div className="grid gap-4 border border-[var(--cold-border)] bg-white p-4 shadow-[0_28px_80px_rgba(3,17,31,0.08)]">
            <div className="relative aspect-[16/10] overflow-hidden bg-[var(--cold-surface-2)]">
              <Image src={featured.images[0]} alt={featured.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 680px" />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--cold-accent-dark)]">Featured asset</p>
                <h2 className="mt-2 text-2xl font-black leading-tight text-[var(--cold-ink)]">{featured.title}</h2>
              </div>
              <p className="text-2xl font-black text-[var(--cold-accent-dark)]">{formatPrice(featured.price, featured.type)}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="properties" className="tenant-listing cold-listing bg-[var(--cold-surface-2)] py-16 text-[var(--cold-ink)] sm:py-20">
        <div className="page-shell">
          <div className="mb-10 grid gap-5 border-l-4 border-[var(--cold-accent)] pl-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--cold-accent-dark)]">Danh mục tài sản</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Tin đăng nổi bật</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--cold-muted)]">
              Grid sắc nét, thông tin cô đọng và bộ lọc rõ ràng cho quyết định nhanh hơn.
            </p>
          </div>
          <PropertyBrowser
            variant="cold"
            posts={posts}
            slug={site.slug}
            total={total}
            page={page}
            totalPages={totalPages}
            initialQuery={query}
            initialType={type ?? "ALL"}
            initialCategoryId={categoryId ?? ""}
            initialProvince={province ?? ""}
            initialSort={sort}
          />
        </div>
      </section>
      <section id="about" className="tenant-about cold-about bg-white py-16 text-[var(--cold-ink)] sm:py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-3">
          {[
            ["01", "Navy trust", "Midnight blue creates a professional real-estate surface for high-value decisions."],
            ["02", "Cyan action", "Ice blue and electric cyan reserve attention for CTAs, active filters and proof points."],
            ["03", "Sharp geometry", "0-4px corners, grid rhythm and crisp borders give the site an architectural feel."],
          ].map(([index, title, copy]) => (
            <article key={index} className="border border-[var(--cold-border)] p-6">
              <span className="text-xs font-black text-[var(--cold-accent-dark)]">{index}</span>
              <h3 className="mt-5 text-2xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--cold-muted)]">{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <BrokerIntroSection site={site} theme={model.theme} />
      <ColdFooter site={site} />
    </>
  );
}
