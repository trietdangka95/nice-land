import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { LuxuryFooter, LuxuryHeader } from "./chrome";
import { PropertyBrowser } from "@/components/site/property-browser";
import type { PublicThemeHomeProps } from "./types";

export function LuxuryShowcaseHome(model: PublicThemeHomeProps) {
  const { site, featured, themePreview, posts, total, page, totalPages, query, type, categoryId, sort } = model;
  return (
    <>
      <LuxuryHeader site={site} />



      {/* 2. Custom Property Listing (Classic Sidebar approach) */}
      <section id="properties" className="tenant-listing relative min-h-screen overflow-hidden pt-32 pb-18">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--tenant-color)]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="page-shell relative z-10">
          <PropertyBrowser
            variant="classic"
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

      {/* 3. Custom Expertise/About Section (Royal layout) */}
      <section id="about" className="tenant-about py-24 sm:py-32">
        <div className="page-shell">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="relative aspect-[3/4] max-w-md mx-auto w-full">
              <div className="absolute -inset-4 border border-[var(--tenant-color)]/30 rounded-t-[100px]"></div>
              <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=85" alt={site.name} fill className="object-cover rounded-t-[100px] grayscale contrast-125" />
            </div>
            <div className="flex flex-col justify-center text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--tenant-color)]">Đẳng cấp khác biệt</span>
              <h2 className="mt-6 font-display text-4xl sm:text-6xl leading-[1.1]">
                Chuẩn mực khắt khe<br />trong từng lựa chọn.
              </h2>
              <p className="mt-8 text-lg opacity-70 leading-relaxed font-light">
                {site.name} không bán mọi thứ. Chúng tôi đại diện cho những chủ nhân trân trọng kiến trúc, sự riêng tư và đặc quyền thụ hưởng. Mọi thông tin đều được xử lý với mức độ bảo mật cao nhất.
              </p>
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-current/10 pt-10">
                {[
                  [Award, "Chuyên viên", "Hạng thương gia"],
                  [ShieldCheck, "Bảo mật", "Tuyệt đối"],
                  [CheckCircle2, "Pháp lý", "Rõ ràng"],
                ].map(([Icon, title, desc]) => {
                  const ItemIcon = Icon as typeof Award;
                  return (
                    <div key={title as string} className="flex flex-col items-center lg:items-start">
                      <ItemIcon className="text-[var(--tenant-color)]" size={24} />
                      <strong className="mt-4 block font-display text-xl">{title as string}</strong>
                      <span className="mt-2 text-sm opacity-60 font-light">{desc as string}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <LuxuryFooter site={site} />
    </>
  );
}
