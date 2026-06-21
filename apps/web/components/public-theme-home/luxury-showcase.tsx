import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { LuxuryFooter, LuxuryHeader } from "./chrome";
import { ExpertiseSection, PropertyCollection } from "./shared";
import type { PublicThemeHomeProps } from "./types";

export function LuxuryShowcaseHome(model: PublicThemeHomeProps) {
  const { site, featured, themePreview } = model;
  return (
    <>
      <LuxuryHeader site={site} />
      <section className="tenant-hero tenant-luxury-hero relative min-h-[720px] overflow-hidden bg-ink text-white">
        <Image
          src={site.banner ?? featured.images[0]}
          alt={featured.title}
          fill
          loading="eager"
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/5" />
        <div className="page-shell relative flex min-h-[720px] items-end py-16 sm:py-20 lg:items-center">
          <div className="max-w-3xl" data-reveal="left">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e8c990]">
              Private collection · Đà Nẵng
            </p>
            <h1 className="mt-6 text-balance font-display text-5xl font-normal leading-[0.94] sm:text-7xl lg:text-[6.5rem]">
              Những nơi chốn
              <span className="block italic text-[#e8c990]">xứng đáng để thuộc về.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/65">
              {site.name} giới thiệu những bất động sản có vị trí, kiến trúc và
              giá trị sống khác biệt.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#properties" className="inline-flex min-h-13 items-center justify-center gap-2 bg-white px-7 text-sm font-bold text-ink">
                Khám phá bộ sưu tập <ArrowRight size={17} />
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-13 items-center justify-center gap-2 border border-white/45 px-7 text-sm font-bold text-white">
                <Phone size={16} /> Tư vấn riêng
              </a>
            </div>
          </div>
          <Link
            href={`/${site.slug}/posts/${featured.slug ?? featured.id}${
              themePreview ? `?themePreview=${themePreview}` : ""
            }`}
            className="absolute bottom-8 right-5 hidden w-80 border-t border-white/50 pt-4 lg:block"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#e8c990]">Featured residence</span>
            <strong className="mt-2 block font-display text-2xl font-normal">{featured.title}</strong>
            <span className="mt-2 flex items-center gap-2 text-xs text-white/60"><MapPin size={13} />{featured.district}, {featured.province}</span>
          </Link>
        </div>
      </section>
      <PropertyCollection
        model={model}
        eyebrow="Private collection"
        title="Bất động sản dành cho một đời sống khác biệt"
        description="Một tuyển tập cô đọng, ưu tiên chất lượng vị trí, kiến trúc và giá trị sở hữu lâu dài."
        className="py-20 sm:py-28"
      />
      <ExpertiseSection site={site} />
      <LuxuryFooter site={site} />
    </>
  );
}
