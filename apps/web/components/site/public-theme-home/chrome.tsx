import { TenantLink } from "@/components/shared/tenant-link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
} from "lucide-react";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
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
          ["Trang chủ", ""],
          ["Tin đăng", "#properties"],
          ["Về chúng tôi", "#about"],
          ["Liên hệ", "#contact"],
        ].map(([label, href]) => (
          <TenantLink key={label} slug={site.slug} href={href} className="border-b border-white/10 px-3 py-4">
            {label}
          </TenantLink>
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
    <header className="tenant-header absolute inset-x-0 top-0 z-30">
      <div className="page-shell">
        <div className="flex h-24 items-center justify-between border-b border-current opacity-90 pb-[1px] md:pb-0" style={{ borderColor: 'var(--tenant-border, rgba(0,0,0,0.1))' }}>
          <TenantLink slug={site.slug} href="" className="flex items-center gap-4">
            <BrandMark site={site} className="size-12 border border-current opacity-80 bg-black/5 text-xs font-bold" />
            <span>
              <strong className="block font-display text-xl font-normal tracking-wide">{site.name}</strong>
              <small className="mt-1 block text-[8px] uppercase tracking-[0.32em] opacity-60">Private property advisory</small>
            </span>
          </TenantLink>
          <nav className="hidden items-center gap-9 text-[11px] font-bold uppercase tracking-[0.18em] lg:flex" aria-label="Điều hướng Luxury Showcase">
            <TenantLink slug={site.slug} href="#properties">Collection</TenantLink>
            <TenantLink slug={site.slug} href="#about">Advisory</TenantLink>
            <TenantLink slug={site.slug} href="#contact">Private contact</TenantLink>
          </nav>
          <div className="hidden items-center gap-5 lg:flex">
            <span className="text-xs opacity-70">{site.phone}</span>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="border border-current opacity-80 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em]">
              Book a viewing
            </a>
          </div>
          <MobileMenu site={site} triggerClassName="grid size-11 place-items-center border border-current opacity-80 lg:hidden" />
        </div>
      </div>
    </header>
  );
}

export function SearchHeader({ site }: { site: Site }) {
  return (
    <header className="tenant-header bg-[#0f172a] text-white">
      <div className="page-shell flex h-16 items-center justify-between">
        <TenantLink slug={site.slug} href="" className="flex items-center gap-3">
          <BrandMark site={site} className="tenant-brand-mark size-10 rounded-md bg-[#1d4ed8] text-xs font-extrabold text-white" />
          <strong className="text-base font-extrabold tracking-[-0.03em]">{site.name}</strong>
        </TenantLink>
        <nav className="tenant-navigation hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.09em] text-slate-300 lg:flex" aria-label="Điều hướng Search First">
          <TenantLink slug={site.slug} href="#properties">Tin mua bán</TenantLink>
          <TenantLink slug={site.slug} href="#properties">Tin cho thuê</TenantLink>
          <TenantLink slug={site.slug} href="#about">Khu vực</TenantLink>
          <TenantLink slug={site.slug} href="#contact">Tư vấn</TenantLink>
        </nav>
        <div className="hidden items-center gap-4 text-xs lg:flex">
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-bold text-slate-100">{site.phone}</a>
          <a href="#contact" className="rounded bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500">Liên hệ môi giới</a>
        </div>
        <MobileMenu site={site} triggerClassName="grid size-10 place-items-center rounded border border-white/20 lg:hidden" />
      </div>
      <div className="tenant-quick-nav bg-[#172033] text-white">
        <div className="page-shell flex min-h-10 items-center gap-7 overflow-x-auto text-[11px] font-semibold">
          <span className="shrink-0 text-white/50">Tìm nhanh:</span>
          <a href="#properties" className="shrink-0">Căn hộ</a>
          <a href="#properties" className="shrink-0">Căn liền thổ</a>
          <a href="#properties" className="shrink-0">Đất nền</a>
          <a href="#properties" className="shrink-0">Cho thuê</a>
        </div>
      </div>
    </header>
  );
}

export function EditorialHeader({ site }: { site: Site }) {
  return (
    <header className="tenant-header bg-[#111111] text-white">
      <div className="page-shell">
        <div className="flex min-h-9 items-center justify-between border-b border-white/15 text-[8px] uppercase tracking-[0.25em] text-white/45">
          <span>Issue 06 · Đà Nẵng</span>
          <span className="hidden sm:block">{new Date().getFullYear()} Property Journal</span>
        </div>
        <div className="grid h-24 grid-cols-[1fr_auto] items-center border-b border-white/20 lg:grid-cols-[1fr_auto_1fr]">
          <nav className="hidden gap-6 text-[10px] font-bold uppercase tracking-[0.2em] lg:flex" aria-label="Điều hướng Property Editorial">
            <TenantLink slug={site.slug} href="#properties">Properties</TenantLink>
            <TenantLink slug={site.slug} href="#about">Stories</TenantLink>
          </nav>
          <TenantLink slug={site.slug} href="" className="lg:text-center">
            <strong className="font-display text-2xl font-normal sm:text-3xl">The Property Edit</strong>
            <small className="mt-1 block text-[8px] uppercase tracking-[0.3em] text-[#d6a85f]">{site.name}</small>
          </TenantLink>
          <div className="hidden justify-end gap-6 text-[10px] font-bold uppercase tracking-[0.2em] lg:flex">
            <TenantLink slug={site.slug} href="#contact">Contact</TenantLink>
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
    <header className="tenant-header sticky top-0 z-40 border-b border-[#7A5A4E]/10 bg-[#fffaf3]/95 text-[#2d1f18] shadow-[0_14px_34px_rgba(45,31,24,0.07)] backdrop-blur-xl">
      <div className="page-shell flex min-h-24 items-center justify-between gap-6 py-3">
        <TenantLink slug={site.slug} href="" className="group flex min-w-0 items-center gap-4">
          {site.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.logo} alt={`Logo ${site.name}`} className="h-14 w-auto object-contain drop-shadow-sm" />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-[#7A5A4E]/20 bg-[#7A5A4E]/10 font-display text-base font-bold text-[#7A5A4E] shadow-inner transition-colors duration-200 group-hover:bg-[var(--tenant-color)] group-hover:text-white">{site.logoMark}</span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-display text-xl font-extrabold tracking-tight text-[#2D1F18] sm:text-2xl">{site.name}</span>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-[#7A5A4E]/60 sm:block">Tin đăng tuyển chọn</span>
          </span>
        </TenantLink>
        <nav className="hidden items-center gap-1 rounded-full border border-[#7A5A4E]/10 bg-white/85 p-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#7A5A4E]/80 shadow-[0_10px_24px_rgba(45,31,24,0.08)] lg:flex" aria-label="Điều hướng website">
          <TenantLink slug={site.slug} href="#properties" className="rounded-full px-6 py-3 transition-colors hover:bg-[#f1ebd9] hover:text-[var(--tenant-color)]">Tin đăng</TenantLink>
          <TenantLink slug={site.slug} href="#about" className="rounded-full px-6 py-3 transition-colors hover:bg-[#f1ebd9] hover:text-[var(--tenant-color)]">Tư vấn</TenantLink>
          <TenantLink slug={site.slug} href="#contact" className="rounded-full px-6 py-3 transition-colors hover:bg-[#f1ebd9] hover:text-[var(--tenant-color)]">Liên hệ</TenantLink>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a href={site.facebookUrl ?? "#"} aria-label="Facebook" className="grid size-14 place-items-center rounded-full border border-[#7A5A4E]/10 bg-white/75 text-[var(--tenant-color)] shadow-sm transition-colors duration-200 hover:bg-white"><Facebook size={18} /></a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-14 items-center gap-2.5 rounded-full bg-[var(--tenant-color)] px-7 text-sm font-extrabold text-white shadow-[0_16px_30px_rgba(49,92,69,0.22)] transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"><Phone size={18} />Gọi trực tiếp</a>
        </div>
        <MobileMenu site={site} triggerClassName="grid size-12 place-items-center rounded-full border border-[#7A5A4E]/10 bg-white/75 text-[var(--tenant-color)] shadow-sm lg:hidden" />
      </div>
    </header>
  );
}

export function LuxuryFooter({ site }: { site: Site }) {
  return (
    <footer id="contact" className="tenant-footer py-16">
      <div className="page-shell">
        <div className="grid gap-12 border-b border-current opacity-90 pb-14 lg:grid-cols-[1.4fr_0.6fr_0.6fr]" style={{ borderColor: 'var(--tenant-border, rgba(0,0,0,0.1))' }}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#e8c990]">Private advisory</p>
            <h2 className="mt-5 max-w-2xl font-display text-5xl font-normal leading-tight">Một địa chỉ đẹp luôn bắt đầu từ một cuộc trò chuyện kín đáo.</h2>
          </div>
          <div className="text-sm leading-7 opacity-70">
            <strong className="mb-3 block text-xs uppercase tracking-widest opacity-100">Studio</strong>
            <p>{site.address}</p><p>{site.email}</p>
          </div>
          <div>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-3 border-b border-[#e8c990] pb-2 text-lg text-[#e8c990]">{site.phone}<ArrowUpRight size={18} /></a>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-[10px] uppercase tracking-[0.2em] opacity-50 sm:flex-row">
          <span>{site.name}</span><span>Powered by Triet Dang</span>
        </div>
      </div>
    </footer>
  );
}

export function SearchFooter({ site }: { site: Site }) {
  return (
    <footer id="contact" className="tenant-footer border-t-4 border-[#3b82f6] bg-[#0f172a] py-12 text-white">
      <div className="page-shell grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div><strong className="text-lg font-extrabold text-white">{site.name}</strong><p className="mt-3 text-sm leading-6 text-white/50">{site.tagline}</p></div>
        <div className="text-sm leading-7"><strong className="block text-white">Khám phá</strong><a href="#properties" className="block text-white/50 hover:text-white">Tin mua bán</a><a href="#properties" className="block text-white/50 hover:text-white">Tin cho thuê</a></div>
        <div className="text-sm leading-7"><strong className="block text-white">Hỗ trợ</strong><a href="#about" className="block text-white/50 hover:text-white">Về chúng tôi</a><a href="#contact" className="block text-white/50 hover:text-white">Liên hệ môi giới</a></div>
        <div className="rounded-lg bg-[#1e293b] p-5 text-sm border border-white/10"><strong className="block text-white font-bold">Cần tư vấn nhanh?</strong><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="mt-3 flex items-center gap-2 font-bold text-[#60a5fa]"><Phone size={15} />{site.phone}</a></div>
      </div>
      <div className="page-shell mt-10 border-t border-white/10 pt-5 text-xs text-white/30">© {new Date().getFullYear()} {site.name} · Nền tảng Nice Land</div>
    </footer>
  );
}

export function EditorialFooter({ site }: { site: Site }) {
  return (
    <footer id="contact" className="tenant-footer bg-[#111111] py-14 text-white">
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
    <footer id="contact" className="tenant-footer relative overflow-hidden bg-[#f4ebe1] py-10 text-[#2d1f18]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b25e43]/30 to-transparent" />
      <div className="page-shell grid gap-8 lg:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#7a5a4e]">Liên hệ trực tiếp</p>
          <h2 className="mt-3 max-w-xl font-display text-2xl font-semibold leading-tight text-[#2d1f18] sm:text-3xl">Chọn đúng nơi bắt đầu từ một cuộc trò chuyện rõ ràng.</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#5c463d]">Hãy để lại thông tin hoặc liên hệ trực tiếp. Tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn trên hành trình tìm kiếm lựa chọn phù hợp.</p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -translate-y-3 translate-x-3 rounded-[1.75rem] bg-[#ead5c4] opacity-50 sm:-translate-y-4 sm:translate-x-4"></div>
          <div className="relative flex flex-col justify-between rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(124,58,36,0.06)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <strong className="font-display text-xl font-medium text-[#2d1f18]">{site.name}</strong>
                <p className="text-xs text-[#7a5a4e] font-medium mt-1">Đối tác tin đăng của bạn</p>
              </div>
              <div className="flex gap-2">
                <a href={site.facebookUrl ?? "#"} aria-label="Facebook" className="grid size-8 place-items-center rounded-full border border-black/5 text-[#7a5a4e] hover:bg-[var(--tenant-color)] hover:text-white transition-colors"><Facebook size={14} /></a>
                <a href="#" aria-label="Instagram" className="grid size-8 place-items-center rounded-full border border-black/5 text-[#7a5a4e] hover:bg-[var(--tenant-color)] hover:text-white transition-colors"><Instagram size={14} /></a>
              </div>
            </div>

            <div className="mt-5 grid gap-y-3 gap-x-4 text-xs sm:grid-cols-2 text-[#4a3c31]">
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 font-bold hover:text-[var(--tenant-color)] transition-colors"><div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f8f6f0] text-[var(--tenant-color)]"><Phone size={13} /></div>{site.phone}</a>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 font-bold hover:text-[var(--tenant-color)] transition-colors"><div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f8f6f0] text-[var(--tenant-color)]"><Mail size={13} /></div><span className="truncate">{site.email}</span></a>
              <div className="flex items-center gap-2.5 sm:col-span-2 font-medium"><div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f8f6f0] text-[var(--tenant-color)]"><MapPin size={13} /></div><span className="truncate">{site.address}</span></div>
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row">
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--tenant-color)] px-5 text-sm font-extrabold text-white transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"><Phone size={15} />Gọi ngay</a>
              <a href={`mailto:${site.email}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-black/5 bg-[#f8f6f0] px-5 text-sm font-extrabold text-[#4a3c31] transition-colors hover:bg-white"><Mail size={15} />Gửi email</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
