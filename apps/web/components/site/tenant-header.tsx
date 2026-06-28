import { Facebook, Phone } from "lucide-react";
import type { Site } from "@/lib/types";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { TenantLink } from "@/components/shared/tenant-link";

export function TenantHeader({ site }: { site: Site }) {
  return (
    <>
      <div className="tenant-topbar bg-[var(--tenant-color)] text-white">
        <div className="page-shell flex min-h-9 items-center justify-between gap-4 py-2 text-[11px] font-semibold">
          <p className="hidden sm:block">{site.tagline}</p>
          <div className="ml-auto flex items-center gap-4">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5">
              <Phone size={12} aria-hidden="true" />
              {site.phone}
            </a>
            <a href={site.facebookUrl ?? "#"} aria-label="Facebook">
              <Facebook size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <header className="tenant-header sticky top-0 z-40 border-b border-ink/10 bg-white/90 shadow-[0_10px_30px_rgba(23,33,27,0.04)] backdrop-blur-xl">
        <div className="tenant-header-inner page-shell flex min-h-20 items-center justify-between gap-4">
          <TenantLink href="" slug={site.slug} className="tenant-brand group flex min-w-0 items-center gap-3">
            <span className="tenant-brand-mark relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-extrabold text-white transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0" style={{ backgroundColor: site.themeColor }}>
              {site.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={site.logo}
                  alt={`Logo ${site.name}`}
                  className="size-full object-cover"
                />
              ) : site.logoMark}
            </span>
            <span className="min-w-0">
              <strong className="tenant-brand-name block truncate font-display text-lg font-semibold sm:text-xl">
                {site.name}
              </strong>
              <small className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-ink/45 min-[400px]:block">
                Tin đăng chọn lọc
              </small>
            </span>
          </TenantLink>
          <nav className="tenant-navigation hidden items-center gap-1 rounded-full border border-ink/10 bg-cream/70 p-1 text-sm font-bold lg:flex" aria-label="Điều hướng website">
            <TenantLink href="" slug={site.slug} className="rounded-full px-4 py-2.5 text-ink/65 transition-colors hover:bg-white hover:text-[var(--tenant-color)]">Trang chủ</TenantLink>
            <TenantLink href="#properties" slug={site.slug} className="rounded-full px-4 py-2.5 text-ink/65 transition-colors hover:bg-white hover:text-[var(--tenant-color)]">Tin đăng</TenantLink>
            <TenantLink href="#about" slug={site.slug} className="rounded-full px-4 py-2.5 text-ink/65 transition-colors hover:bg-white hover:text-[var(--tenant-color)]">Về chúng tôi</TenantLink>
            <TenantLink href="#contact" slug={site.slug} className="rounded-full px-4 py-2.5 text-ink/65 transition-colors hover:bg-white hover:text-[var(--tenant-color)]">Liên hệ</TenantLink>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="hidden min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(23,33,27,0.12)] transition-transform duration-200 hover:-translate-y-0.5 sm:inline-flex motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              style={{ backgroundColor: site.themeColor }}
            >
              <Phone size={16} />
              Gọi tư vấn
            </a>
            <MobileNavigation
              label="Mở menu"
              title={site.name}
              triggerClassName="grid size-11 place-items-center rounded-full border border-ink/15 bg-white text-[var(--tenant-color)] lg:hidden"
            >
              <nav
                className="flex flex-col p-4 text-base font-semibold"
                aria-label="Điều hướng website trên di động"
              >
                <TenantLink href="" slug={site.slug} className="border-b border-white/10 px-3 py-4">
                  Trang chủ
                </TenantLink>
                <TenantLink href="#properties" slug={site.slug} className="border-b border-white/10 px-3 py-4">
                  Tin đăng
                </TenantLink>
                <TenantLink href="#about" slug={site.slug} className="border-b border-white/10 px-3 py-4">
                  Về chúng tôi
                </TenantLink>
                <TenantLink href="#contact" slug={site.slug} className="border-b border-white/10 px-3 py-4">
                  Liên hệ
                </TenantLink>
              </nav>
              <div className="mt-auto border-t border-white/10 p-4">
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="flex min-h-12 items-center justify-center gap-2 bg-white px-5 text-sm font-bold text-ink"
                >
                  <Phone size={17} aria-hidden="true" />
                  Gọi {site.phone}
                </a>
              </div>
            </MobileNavigation>
          </div>
        </div>
      </header>
    </>
  );
}
