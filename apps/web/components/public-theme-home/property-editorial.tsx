import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, MapPin } from "lucide-react";
import { EditorialFooter, EditorialHeader } from "./chrome";
import { ExpertiseSection, PropertyCollection } from "./shared";
import type { PublicThemeHomeProps } from "./types";

export function PropertyEditorialHome(model: PublicThemeHomeProps) {
  const { site, featured, themePreview } = model;
  return (
    <>
      <EditorialHeader site={site} />
      <section className="tenant-hero bg-[#1c1b19] text-white">
        <div className="page-shell grid min-h-[720px] gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
          <div className="flex flex-col justify-between border-t border-white/35 pt-6" data-reveal="left">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#d6a85f]">The property edit · Issue 06</span>
              <h1 className="mt-8 font-display text-6xl font-normal leading-[0.88] sm:text-7xl lg:text-[6rem]">
                Living<br />above<br /><em className="text-[#d6a85f]">the sea.</em>
              </h1>
            </div>
            <div className="mt-12 max-w-sm border-b border-white/25 pb-6">
              <p className="text-sm leading-7 text-white/55">
                Một ấn bản tuyển chọn những không gian đặc biệt, nơi kiến trúc
                và nhịp sống địa phương gặp nhau.
              </p>
              <a href="#properties" className="mt-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]">
                Xem ấn bản <ArrowDownRight size={17} />
              </a>
            </div>
          </div>
          <Link
            href={`/${site.slug}/posts/${featured.slug ?? featured.id}${
              themePreview ? `?themePreview=${themePreview}` : ""
            }`}
            className="group relative min-h-[480px] overflow-hidden lg:min-h-0"
            data-reveal="right"
          >
            <Image src={site.banner ?? featured.images[0]} alt={featured.title} fill loading="eager" className="object-cover transition duration-700 group-hover:scale-[1.02]" sizes="(max-width: 1024px) 100vw, 65vw" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-7 pt-24">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#d6a85f]">Cover story</span>
              <strong className="mt-2 block max-w-2xl font-display text-3xl font-normal sm:text-4xl">{featured.title}</strong>
              <span className="mt-3 flex items-center gap-2 text-xs text-white/65"><MapPin size={13} /> {featured.district}, {featured.province}</span>
            </span>
          </Link>
        </div>
      </section>
      <PropertyCollection
        model={model}
        eyebrow="Selected properties"
        title="Những không gian đáng được kể thành câu chuyện"
        description="Mỗi bất động sản là một lát cắt về kiến trúc, vị trí và cách sống."
        className="py-20 sm:py-28"
      />
      <ExpertiseSection site={site} />
      <EditorialFooter site={site} />
    </>
  );
}
