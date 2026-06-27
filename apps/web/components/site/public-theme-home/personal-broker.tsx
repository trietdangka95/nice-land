import Image from "next/image";
import { ArrowRight, MessageCircle, Phone, Award, HeartHandshake, ShieldCheck } from "lucide-react";
import { PersonalFooter, PersonalHeader } from "./chrome";
import { PropertyBrowser } from "@/components/site/property-browser";
import type { PublicThemeHomeProps } from "./types";

export function PersonalBrokerHome(model: PublicThemeHomeProps) {
  const { site, posts, total, page, totalPages, query, type, categoryId, sort, themePreview } = model;
  return (
    <>
      <PersonalHeader site={site} />
      


      {/* 2. Custom Property Listing (Spacious, breathing room) */}
      <section id="properties" className="tenant-listing bg-[#fcfbf9] text-[#4a3c31] pt-32 pb-20">
        <div className="page-shell max-w-[1200px]">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-[#2d241e]">Danh mục nhà tôi chọn</h2>
            <p className="mt-4 text-[#8c7d70] max-w-2xl mx-auto">
              Không phải mọi ngôi nhà đều phù hợp với tất cả mọi người. Dưới đây là những bất động sản tôi đã tự tay đi xem, kiểm tra pháp lý và đánh giá tiềm năng.
            </p>
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
            themePreview={themePreview}
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
