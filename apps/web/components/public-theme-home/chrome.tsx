import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { MobileNavigation } from "@/components/mobile-navigation";
import type { Site } from "@/lib/types";

function BrandMark({
  site,
  className,
}: {
  site: Site;
  className: string;
}) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden ${className}`}>
      {site.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={site.logo} alt={`Logo ${site.name}`} className="size-full object-cover" />
      ) : (
        site.logoMark
      )}
    </span>
  );
}

function MobileMenu({
  site,
  triggerClassName,
}: {
  site: Site;
  triggerClassName: string;
}) {
  return (
    <MobileNavigation
      label="Mở menu"
      title={site.name}
      triggerClassName={triggerClassName}
    >
      <nav className="flex flex-col p-4 text-base font-semibold" aria-label="Điều hướng website trên di động">
        {[
          ["Trang chủ", `/${site.slug}`],
          ["Bất động sản", `/${site.slug}#properties`],
          ["Về chúng tôi", `/${site.slug}#about`],
          ["Liên hệ", `/${site.slug}#contact`],
        ].map(([label, href]) => (
          <Link key={label} href={href} className="border-b border-white/10 px-3 py-4">
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 p-4">
        <a
          href={`tel:${site.phone.replace(/\s/g, "")}`}
          className="flex min-h-12 items-center justify-center gap-2 bg-white px-5 text-sm font-bold text-ink"
        >
          <Phone size={17} />
          Gọi {site.phone}
        </a>
      </div>
    </MobileNavigation>
  );
}

export function LuxuryHeader({ site }: { site: Site }) {
  return (
    <header className="tenant-header absolute inset-x-0 top-0 z-30 text-white">
      <div className="page-shell">
        <div className="flex h-24 items-center justify-between border-b border-white/30">
          <Link href={`/${site.slug}`} className="flex items-center gap-4">
            <BrandMark site={site} className="size-12 border border-white/45 bg-black/20 text-xs font-bold" />
            <span>
              <strong className="block font-display text-xl font-normal tracking-wide">{site.name}</strong>
              <small className="mt-1 block text-[8px] uppercase tracking-[0.32em] text-white/55">Private property advisory</small>
            </span>
          </Link>
          <nav className="hidden items-center gap-9 text-[11px] font-bold uppercase tracking-[0.18em] lg:flex" aria-label="Điều hướng Luxury Showcase">
            <Link href={`/${site.slug}#properties`}>Collection</Link>
            <Link href={`/${site.slug}#about`}>Advisory</Link>
            <Link href={`/${site.slug}#contact`}>Private contact</Link>
          </nav>
          <div className="hidden items-center gap-5 lg:flex">
            <span className="text-xs text-white/65">{site.phone}</span>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="border border-white/45 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em]">
              Book a viewing
            </a>
          </div>
          <MobileMenu site={site} triggerClassName="grid size-11 place-items-center border border-white/40 lg:hidden" />
        </div>
      </div>
    </header>
  );
}

export function SearchHeader({ site }: { site: Site }) {
  return (
    <header className="tenant-header bg-white text-[#162b3a] shadow-sm">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link href={`/${site.slug}`} className="flex items-center gap-3">
          <BrandMark site={site} className="size-10 rounded-md bg-[#e2574c] text-xs font-extrabold text-white" />
          <strong className="text-base font-extrabold tracking-[-0.02em]">{site.name}</strong>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex" aria-label="Điều hướng Search First">
          <Link href={`/${site.slug}#properties`}>Nhà đất bán</Link>
          <Link href={`/${site.slug}#properties`}>Nhà đất thuê</Link>
          <Link href={`/${site.slug}#about`}>Khu vực</Link>
          <Link href={`/${site.slug}#contact`}>Tư vấn</Link>
        </nav>
        <div className="hidden items-center gap-4 text-xs lg:flex">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-bold text-[#24405e]">{site.phone}</a>
          <a href="#contact" className="rounded-md bg-[#e2574c] px-5 py-3 font-bold text-white">Liên hệ môi giới</a>
        </div>
        <MobileMenu site={site} triggerClassName="grid size-10 place-items-center rounded-md border border-ink/15 lg:hidden" />
      </div>
      <div className="bg-[#24405e] text-white">
        <div className="page-shell flex min-h-10 items-center gap-7 overflow-x-auto text-[11px] font-semibold">
          <span className="shrink-0 text-white/50">Tìm nhanh:</span>
          <a href="#properties" className="shrink-0">Căn hộ</a>
          <a href="#properties" className="shrink-0">Nhà phố</a>
          <a href="#properties" className="shrink-0">Đất nền</a>
          <a href="#properties" className="shrink-0">Cho thuê</a>
        </div>
      </div>
    </header>
  );
}

export function EditorialHeader({ site }: { site: Site }) {
  return (
    <header className="tenant-header bg-[#1c1b19] text-white">
      <div className="page-shell">
        <div className="flex min-h-9 items-center justify-between border-b border-white/15 text-[8px] uppercase tracking-[0.25em] text-white/45">
          <span>Issue 06 · Đà Nẵng</span>
          <span className="hidden sm:block">{new Date().getFullYear()} Property Journal</span>
        </div>
        <div className="grid h-24 grid-cols-[1fr_auto] items-center border-b border-white/20 lg:grid-cols-[1fr_auto_1fr]">
          <nav className="hidden gap-6 text-[10px] font-bold uppercase tracking-[0.2em] lg:flex" aria-label="Điều hướng Property Editorial">
            <Link href={`/${site.slug}#properties`}>Properties</Link>
            <Link href={`/${site.slug}#about`}>Stories</Link>
          </nav>
          <Link href={`/${site.slug}`} className="lg:text-center">
            <strong className="font-display text-2xl font-normal sm:text-3xl">The Property Edit</strong>
            <small className="mt-1 block text-[8px] uppercase tracking-[0.3em] text-[#d6a85f]">{site.name}</small>
          </Link>
          <div className="hidden justify-end gap-6 text-[10px] font-bold uppercase tracking-[0.2em] lg:flex">
            <Link href={`/${site.slug}#contact`}>Contact</Link>
            <a href={site.facebookUrl ?? "#"}>Social</a>
          </div>
          <MobileMenu site={site} triggerClassName="ml-auto grid size-11 place-items-center border border-white/25 lg:hidden" />
        </div>
      </div>
    </header>
  );
}

export function PersonalHeader({ site }: { site: Site }) {
  return (
    <header className="tenant-header bg-[#fffaf4] text-[#3d3028]">
      <div className="page-shell flex min-h-24 items-center justify-between gap-5">
        <Link href={`/${site.slug}`} className="flex items-center gap-4">
          <BrandMark site={site} className="size-14 rounded-full bg-[#725746] font-serif text-sm italic text-white" />
          <span>
            <strong className="block font-display text-2xl font-normal italic">{site.name}</strong>
            <small className="mt-1 block text-[8px] uppercase tracking-[0.24em] text-[#725746]/60">Your local property partner</small>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm lg:flex" aria-label="Điều hướng Personal Broker">
          <Link href={`/${site.slug}#properties`}>Nhà tôi chọn</Link>
          <Link href={`/${site.slug}#about`}>Câu chuyện của tôi</Link>
          <Link href={`/${site.slug}#contact`}>Trò chuyện</Link>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a href={site.facebookUrl ?? "#"} aria-label="Facebook" className="grid size-10 place-items-center rounded-full border border-[#725746]/20"><Facebook size={15} /></a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="rounded-full bg-[#725746] px-6 py-3 text-xs font-bold text-white">Gọi trực tiếp</a>
        </div>
        <MobileMenu site={site} triggerClassName="grid size-11 place-items-center rounded-full border border-[#725746]/25 lg:hidden" />
      </div>
    </header>
  );
}

export function LuxuryFooter({ site }: { site: Site }) {
  return (
    <footer id="contact" className="tenant-footer bg-[#111713] py-16 text-white">
      <div className="page-shell">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[1.4fr_0.6fr_0.6fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#e8c990]">Private advisory</p>
            <h2 className="mt-5 max-w-2xl font-display text-5xl font-normal leading-tight">Một địa chỉ đẹp luôn bắt đầu từ một cuộc trò chuyện kín đáo.</h2>
          </div>
          <div className="text-sm leading-7 text-white/55">
            <strong className="mb-3 block text-xs uppercase tracking-widest text-white">Studio</strong>
            <p>{site.address}</p><p>{site.email}</p>
          </div>
          <div>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-3 border-b border-[#e8c990] pb-2 text-lg text-[#e8c990]">{site.phone}<ArrowUpRight size={18} /></a>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-[10px] uppercase tracking-[0.2em] text-white/35 sm:flex-row">
          <span>{site.name}</span><span>Powered by Nice Land</span>
        </div>
      </div>
    </footer>
  );
}

export function SearchFooter({ site }: { site: Site }) {
  return (
    <footer id="contact" className="tenant-footer border-t-4 border-[#e2574c] bg-white py-12 text-[#162b3a]">
      <div className="page-shell grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div><strong className="text-lg font-extrabold">{site.name}</strong><p className="mt-3 text-sm leading-6 text-ink/50">{site.tagline}</p></div>
        <div className="text-sm leading-7"><strong className="block">Khám phá</strong><a href="#properties" className="block text-ink/50">Nhà đất bán</a><a href="#properties" className="block text-ink/50">Nhà đất thuê</a></div>
        <div className="text-sm leading-7"><strong className="block">Hỗ trợ</strong><a href="#about" className="block text-ink/50">Về chúng tôi</a><a href="#contact" className="block text-ink/50">Liên hệ môi giới</a></div>
        <div className="rounded-lg bg-[#eef2f3] p-5 text-sm"><strong className="block">Cần tìm nhà nhanh?</strong><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="mt-3 flex items-center gap-2 font-bold text-[#e2574c]"><Phone size={15} />{site.phone}</a></div>
      </div>
      <div className="page-shell mt-10 border-t border-ink/10 pt-5 text-xs text-ink/40">© {new Date().getFullYear()} {site.name} · Nền tảng Nice Land</div>
    </footer>
  );
}

export function EditorialFooter({ site }: { site: Site }) {
  return (
    <footer id="contact" className="tenant-footer bg-[#1c1b19] py-14 text-white">
      <div className="page-shell">
        <div className="flex flex-col justify-between gap-8 border-y border-white/20 py-10 lg:flex-row lg:items-end">
          <div><span className="text-[9px] uppercase tracking-[0.3em] text-[#d6a85f]">End notes · Issue 06</span><p className="mt-4 font-display text-5xl font-normal">The Property Edit</p></div>
          <div className="grid gap-6 text-xs text-white/50 sm:grid-cols-3">
            <p><MapPin size={14} className="mb-2 text-[#d6a85f]" />{site.address}</p>
            <p><Mail size={14} className="mb-2 text-[#d6a85f]" />{site.email}</p>
            <p><Phone size={14} className="mb-2 text-[#d6a85f]" />{site.phone}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-between text-[9px] uppercase tracking-[0.22em] text-white/30"><span>Curated by {site.name}</span><span>Nice Land Editions</span></div>
      </div>
    </footer>
  );
}

export function PersonalFooter({ site }: { site: Site }) {
  return (
    <footer id="contact" className="tenant-footer bg-[#725746] py-16 text-white">
      <div className="page-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#ead6c3]">Nói chuyện trực tiếp với tôi</p>
          <h2 className="mt-4 font-display text-5xl font-normal italic">Bạn đang tìm một nơi để bắt đầu chương mới?</h2>
        </div>
        <div className="bg-[#fffaf4] p-7 text-[#3d3028] sm:p-9">
          <strong className="font-display text-3xl font-normal italic">{site.name}</strong>
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-3"><Phone size={17} />{site.phone}</a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-3"><Mail size={17} />{site.email}</a>
            <p className="flex items-start gap-3 sm:col-span-2"><MapPin size={17} className="mt-0.5 shrink-0" />{site.address}</p>
          </div>
          <div className="mt-7 flex gap-3 border-t border-[#725746]/15 pt-5">
            <a href={site.facebookUrl ?? "#"} aria-label="Facebook"><Facebook size={17} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={17} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
