import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, MapPin } from "lucide-react";
import { EditorialFooter, EditorialHeader } from "./chrome";
import { PropertyBrowser } from "@/components/site/property-browser";
import type { PublicThemeHomeProps } from "./types";

export function PropertyEditorialHome(model: PublicThemeHomeProps) {
  const { site, featured, themePreview, posts, total, page, totalPages, query, type, categoryId, sort } = model;
  return (
    <>
      <EditorialHeader site={site} />
      


      {/* 2. Custom Property Listing (Asymmetric Magazine approach) */}
      <section id="properties" className="tenant-listing bg-[#fafafa] text-[#09090b] pt-32 pb-24">
        <div className="page-shell">

          
          {/* We rely on PropertyBrowser, but CSS handles the asymmetric grid */}
          <PropertyBrowser
            variant="editorial"
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

      {/* 3. Custom Expertise/About Section (Editorial Quote layout) */}
      <section id="about" className="tenant-about bg-white border-t-2 border-zinc-900 py-32">
        <div className="page-shell max-w-5xl">
          <div className="relative">
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-zinc-900 leading-[1.05] indent-16 md:indent-32">
              “Kiến trúc không chỉ là việc xây dựng các bức tường. Đó là nghệ thuật thiết kế bối cảnh cho những câu chuyện đời người.”
            </h2>
            <div className="mt-16 flex flex-col md:flex-row items-center gap-8 md:gap-16 border-t-2 border-zinc-200 pt-16">
              <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 overflow-hidden rounded-full border-2 border-zinc-900">
                <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=85" alt={site.name} fill className="object-cover grayscale" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-3">Tác giả ấn bản</span>
                <strong className="block text-2xl font-bold font-display uppercase tracking-tight">{site.name}</strong>
                <p className="mt-4 text-zinc-600 leading-relaxed font-medium">
                  Hơn 8 năm quan sát thị trường bất động sản Đà Nẵng, chúng tôi nhận ra giá trị thực sự không nằm ở những con số diện tích, mà nằm ở cảm giác tĩnh lặng khi mở cửa bước vào nhà. Mỗi bất động sản ở đây đều được chọn lọc bằng góc nhìn đó.
                </p>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="mt-8 inline-block border-b-2 border-[var(--tenant-color)] pb-1 text-sm font-bold uppercase tracking-[0.1em] text-zinc-900 hover:text-[var(--tenant-color)] transition-colors">
                  Trò chuyện trực tiếp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EditorialFooter site={site} />
    </>
  );
}
