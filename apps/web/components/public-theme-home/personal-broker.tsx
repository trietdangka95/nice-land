import Image from "next/image";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { PersonalFooter, PersonalHeader } from "./chrome";
import { ExpertiseSection, PropertyCollection } from "./shared";
import type { PublicThemeHomeProps } from "./types";

export function PersonalBrokerHome(model: PublicThemeHomeProps) {
  const { site } = model;
  return (
    <>
      <PersonalHeader site={site} />
      <section className="tenant-hero bg-[#ead5c4]">
        <div className="page-shell grid min-h-[650px] items-stretch px-0 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div className="relative min-h-[430px] lg:order-1 lg:min-h-full" data-reveal="left">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=85"
              alt={`Chuyên viên tư vấn ${site.name}`}
              fill
              loading="eager"
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <span className="absolute bottom-5 left-5 bg-white px-4 py-3 text-xs font-bold text-ink shadow-soft">
              8+ năm am hiểu thị trường địa phương
            </span>
          </div>
          <div className="flex flex-col justify-center bg-[#b25e43] px-6 py-14 text-white sm:px-12 lg:order-2 lg:px-16" data-reveal="right">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#ead6c3]">
              Môi giới bất động sản địa phương
            </p>
            <h1 className="mt-6 text-balance font-display text-5xl font-normal leading-[0.98] sm:text-6xl">
              Tìm đúng ngôi nhà,
              <span className="block italic text-[#ead6c3]">bằng sự thấu hiểu.</span>
            </h1>
            <p className="mt-6 max-w-lg leading-7 text-white/65">
              Tôi là người trực tiếp lắng nghe nhu cầu, chọn lọc sản phẩm và
              đồng hành cùng bạn từ lần xem nhà đầu tiên đến khi hoàn tất giao dịch.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#properties" className="inline-flex min-h-13 items-center justify-center gap-2 bg-white px-6 text-sm font-bold text-[#725746]">
                Xem nhà phù hợp <ArrowRight size={17} />
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-13 items-center justify-center gap-2 border border-white/35 px-6 text-sm font-bold">
                <Phone size={16} /> {site.phone}
              </a>
            </div>
            <div className="mt-10 flex items-center gap-3 border-t border-white/20 pt-6 text-sm text-white/60">
              <MessageCircle size={18} /> Phản hồi trực tiếp, không qua tổng đài
            </div>
          </div>
        </div>
      </section>
      <PropertyCollection
        model={model}
        eyebrow="Tôi đã chọn lọc"
        title="Những căn nhà phù hợp để bắt đầu hành trình"
        description="Danh sách được chọn dựa trên nhu cầu ở thật, khả năng tài chính và tiềm năng lâu dài."
        className="py-20 sm:py-28"
      />
      <ExpertiseSection site={site} personal />
      <PersonalFooter site={site} />
    </>
  );
}
