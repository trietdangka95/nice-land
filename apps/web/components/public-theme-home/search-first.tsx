import { Search, ShieldCheck, Sparkles, Building2, Map, Handshake } from "lucide-react";
import { SearchFooter, SearchHeader } from "./chrome";
import { PropertyBrowser } from "@/components/property-browser";
import type { PublicThemeHomeProps } from "./types";

export function SearchFirstHome(model: PublicThemeHomeProps) {
  const { site, posts, total, page, totalPages, query, type, categoryId, sort, themePreview } = model;
  return (
    <>
      <SearchHeader site={site} />
      


      {/* 2. Custom Property Listing (Dense Data approach) */}
      <section id="properties" className="tenant-listing bg-[#020617] text-[#f1f5f9] pt-32 pb-12">
        <div className="page-shell">
          <PropertyBrowser
            variant="modern"
            posts={posts}
            slug={site.slug}
            total={total}
            page={page}
            totalPages={totalPages}
            initialQuery={query}
            initialType={type ?? "ALL"}
            initialCategoryId={categoryId ?? ""}
            initialSort={sort}
            themePreview={themePreview}
          />
        </div>
      </section>

      {/* 3. Custom Expertise/About Section (Data Banner layout) */}
      <section id="about" className="tenant-about bg-[#0b1120] border-t border-slate-800 py-16">
        <div className="page-shell">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Cơ sở dữ liệu bất động sản thực tế.
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Chúng tôi không chỉ là một cổng thông tin. Đội ngũ tại {site.name} trực tiếp đi khảo sát, thu thập và cập nhật giá cả thị trường hàng ngày để đảm bảo bạn không lãng phí thời gian vào những thông tin ảo.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 w-full md:w-auto shrink-0">
              {[
                [Building2, "500+", "Bất động sản"],
                [Map, "12+", "Khu vực"],
                [Handshake, "100%", "Giao dịch thực"],
              ].map(([Icon, value, label]) => {
                const ItemIcon = Icon as typeof Search;
                return (
                  <div key={label as string} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center">
                    <ItemIcon className="text-[var(--tenant-color)] mb-2" size={24} />
                    <strong className="block text-2xl font-black text-white">{value as string}</strong>
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">{label as string}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <SearchFooter site={site} />
    </>
  );
}
