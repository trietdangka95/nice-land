import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, HeartHandshake, Phone, ShieldCheck, Map, Mail, MapPin } from "lucide-react";
import { PersonalFooter, PersonalHeader } from "./chrome";
import { PropertyBrowser } from "@/components/site/property-browser";
import { formatPrice } from "@/lib/format";
import type { PublicThemeHomeProps } from "./types";

export function PersonalBrokerHome(model: PublicThemeHomeProps) {
  const { site, featured, posts, total, page, totalPages, query, type, categoryId, sort } = model;
  return (
    <>
      <PersonalHeader site={site} />

      <section className="tenant-hero bg-[#fdf6ee] text-[#2d1f18]">
        <div className="page-shell grid min-h-[78dvh] gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="max-w-xl">
            <p className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[var(--tenant-color)] shadow-[0_8px_24px_rgba(124,58,36,0.08)]">
              Người bạn đồng hành
            </p>
            <h1 className="mt-7 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              {site.name}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-[#7a5a4e]">
              {site.tagline || "Không cần đọc quá nhiều. Mỗi tin được gom thành các thông tin dễ hiểu để bạn biết căn nào đáng đi xem trước."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${site.slug}#properties`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--tenant-color)] px-6 text-sm font-extrabold text-white transition-transform active:scale-[0.98]">
                Xem nhà tôi chọn
                <ArrowRight size={17} />
              </Link>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-extrabold text-[#2d1f18] shadow-[0_8px_24px_rgba(124,58,36,0.08)]">
                <Phone size={16} />
                Gọi trực tiếp
              </a>
            </div>
          </div>
          <div className="w-full rounded-[2.5rem] bg-white p-4 shadow-[0_28px_70px_rgba(124,58,36,0.08)]">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-[45%] shrink-0 flex flex-col">
                <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden rounded-[2rem] bg-[#ead5c4]">
                  <Image src={featured.images[0]} alt={featured.title} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 420px" />
                </div>
                <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-[#4a3c31] font-medium"><div className="grid size-10 place-items-center rounded-full bg-[#f1ebd9] text-[var(--tenant-color)]"><Phone size={16} /></div>{site.phone}</div>
                  <div className="flex items-center gap-3 text-[#4a3c31] font-medium"><div className="grid size-10 place-items-center rounded-full bg-[#f1ebd9] text-[var(--tenant-color)]"><Mail size={16} /></div>{site.email}</div>
                  <div className="flex items-center gap-3 sm:col-span-2 text-[#4a3c31] font-medium"><div className="grid size-10 place-items-center rounded-full bg-[#f1ebd9] text-[var(--tenant-color)]"><MapPin size={16} /></div>{site.address}</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col py-2 sm:py-4 pr-2 sm:pr-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#7a5a4e]">Gợi ý hôm nay</span>
                  <span className="rounded-full bg-[#f1ebd9] px-4 py-1.5 text-xs font-bold text-[var(--tenant-color)]">{total} tin</span>
                </div>

                <div className="mt-8 mb-8 sm:mt-auto sm:mb-auto">
                  <h2 className="text-3xl sm:text-4xl lg:text-[2.2rem] font-extrabold leading-[1.15] text-[#2d1f18] tracking-tight">{featured.title}</h2>
                  <p className="mt-4 text-3xl font-extrabold text-[var(--tenant-color)]">{formatPrice(featured.price, featured.type)}</p>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#f8f6f0] p-3 lg:p-4 flex flex-col justify-center">
                    <strong className="block text-lg lg:text-xl font-extrabold text-[#2d1f18]">{featured.area}m²</strong>
                    <small className="text-[#7a5a4e] font-medium mt-1">Diện tích</small>
                  </div>
                  <div className="rounded-2xl bg-[#f8f6f0] p-3 lg:p-4 flex flex-col justify-center">
                    <strong className="block truncate text-lg lg:text-xl font-extrabold text-[#2d1f18]">{featured.district}</strong>
                    <small className="text-[#7a5a4e] font-medium mt-1">Khu vực</small>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1.5 px-1">
                    <Map className="text-[#7a5a4e]" strokeWidth={1.5} size={28} />
                    <small className="text-[#7a5a4e] font-medium">Vị trí</small>
                    <button className="mt-1 w-full rounded-full bg-[#f1ebd9] text-[var(--tenant-color)] px-2 py-2 text-[11px] font-bold">Lưu tin</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 2. Custom Property Listing (Spacious, breathing room) */}
      <section id="properties" className="tenant-listing bg-[#fcfbf9] text-[#4a3c31] py-16 sm:py-20">
        <div className="page-shell">
          <div className="mb-10 text-center">
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-[#2d1f18]">Bất động sản</h2>
            <p className="my-2 text-[#7a5a4e]">Những lựa chọn phù hợp nhất, được chắt lọc dành riêng cho bạn.</p>
          </div>

          <PropertyBrowser
            variant="warm"
            posts={posts}
            slug={site.slug}
            total={total}
            page={page}
            totalPages={totalPages}
            initialQuery={query}
            initialType={type ?? "ALL"}
            initialCategoryId={categoryId ?? ""}
            initialSort={sort}
          />
        </div>
      </section>

      {/* 3. Custom Expertise/About Section (Friendly Profile layout) */}
      <section id="about" className="tenant-about bg-[#f1ebd9] py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="page-shell relative z-10">
          <div className="bg-white rounded-[2rem] p-8 md:p-16 shadow-xl border border-[var(--tenant-color)]/10 max-w-5xl mx-auto relative">
            <div className="absolute top-12 right-12 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg hidden md:block">
              <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=85" alt={site.name} fill className="object-cover" />
            </div>

            <p className="inline-block bg-[#f8f6f3] text-[var(--tenant-color)] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              Người bạn đồng hành
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[#2d241e] font-medium leading-tight max-w-2xl">
              Tôi giúp bạn nhìn rõ giá trị, <br />trước khi đưa ra quyết định.
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3 border-t border-[#f1ebd9] pt-12">
              {[
                [HeartHandshake, "Trực tiếp", "Không qua trợ lý hay tổng đài, tôi trực tiếp lắng nghe bạn."],
                [ShieldCheck, "Bảo vệ", "Kiểm tra kỹ lưỡng pháp lý và tình trạng thực tế của ngôi nhà."],
                [Award, "Đồng hành", "Từ lúc tìm kiếm đến khi nhận sổ đỏ và chuyển vào ở."],
              ].map(([Icon, title, desc]) => {
                const ItemIcon = Icon as typeof Award;
                return (
                  <div key={title as string} className="bg-[#fcfbf9] p-6 rounded-2xl border border-[var(--tenant-color)]/5 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-[#f1ebd9] rounded-full flex items-center justify-center text-[var(--tenant-color)] mb-4">
                      <ItemIcon size={24} />
                    </div>
                    <strong className="block text-lg font-display text-[#4a3c31]">{title as string}</strong>
                    <p className="mt-2 text-sm text-[#8c7d70] leading-relaxed">{desc as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <PersonalFooter site={site} />
    </>
  );
}
