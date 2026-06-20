import Link from "next/link";
import { Facebook, Menu, Phone } from "lucide-react";
import type { Site } from "@/lib/types";

export function TenantHeader({ site }: { site: Site }) {
  return (
    <>
      <div className="bg-[var(--tenant-color)] text-white">
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
      <header className="border-b border-ink/10 bg-white">
        <div className="page-shell flex h-20 items-center justify-between">
          <Link href={`/${site.slug}`} className="flex min-w-0 items-center gap-3">
            <span
              className="grid size-11 shrink-0 place-items-center text-sm font-extrabold text-white"
              style={{ backgroundColor: site.themeColor }}
            >
              {site.logoMark}
            </span>
            <span className="min-w-0">
              <strong className="block truncate font-display text-lg font-semibold sm:text-xl">
                {site.name}
              </strong>
              <small className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-ink/45 min-[400px]:block">
                Bất động sản chọn lọc
              </small>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex" aria-label="Điều hướng website">
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
            <button className="grid size-11 place-items-center border border-ink/15 lg:hidden" aria-label="Mở menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
