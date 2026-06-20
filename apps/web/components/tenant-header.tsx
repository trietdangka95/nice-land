import Link from "next/link";
import { Facebook, Phone } from "lucide-react";
import type { Site } from "@/lib/types";
import { MobileNavigation } from "@/components/mobile-navigation";

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
      <header className="tenant-header border-b border-ink/10 bg-white">
        <div className="tenant-header-inner page-shell flex h-20 items-center justify-between">
          <Link href={`/${site.slug}`} className="tenant-brand flex min-w-0 items-center gap-3">
            <span className="tenant-brand-mark relative grid size-11 shrink-0 place-items-center overflow-hidden text-sm font-extrabold text-white" style={{ backgroundColor: site.themeColor }}>
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
                Bất động sản chọn lọc
              </small>
            </span>
          </Link>
          <nav className="tenant-navigation hidden items-center gap-7 text-sm font-semibold lg:flex" aria-label="Điều hướng website">
            <Link href={`/${site.slug}`}>Trang chủ</Link>
            <Link href={`/${site.slug}#properties`}>Bất động sản</Link>
            <Link href={`/${site.slug}#about`}>Về chúng tôi</Link>
            <Link href={`/${site.slug}#contact`}>Liên hệ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="hidden min-h-11 items-center gap-2 px-5 text-sm font-bold text-white sm:inline-flex"
              style={{ backgroundColor: site.themeColor }}
            >
              <Phone size={16} />
              Gọi tư vấn
            </a>
            <MobileNavigation
              label="Mở menu"
              title={site.name}
              triggerClassName="grid size-11 place-items-center border border-ink/15 lg:hidden"
            >
              <nav
                className="flex flex-col p-4 text-base font-semibold"
                aria-label="Điều hướng website trên di động"
              >
                <Link href={`/${site.slug}`} className="border-b border-white/10 px-3 py-4">
                  Trang chủ
                </Link>
                <Link href={`/${site.slug}#properties`} className="border-b border-white/10 px-3 py-4">
                  Bất động sản
                </Link>
                <Link href={`/${site.slug}#about`} className="border-b border-white/10 px-3 py-4">
                  Về chúng tôi
                </Link>
                <Link href={`/${site.slug}#contact`} className="border-b border-white/10 px-3 py-4">
                  Liên hệ
                </Link>
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
