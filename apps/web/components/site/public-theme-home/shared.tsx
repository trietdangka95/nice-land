import Image from "next/image";
import { Award, CheckCircle2, ShieldCheck } from "lucide-react";
import { PropertyBrowser } from "@/components/site/property-browser";
import type { PublicThemeHomeProps } from "./types";

export function PropertyCollection({
  model,
  eyebrow,
  title,
  description,
  className = "",
}: {
  model: PublicThemeHomeProps;
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <section id="properties" className={`tenant-listing ${className}`}>
      <div className="page-shell">
        <div className="tenant-listing-heading flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="tenant-section-eyebrow text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--tenant-color)]">
              {eyebrow}
            </p>
            <h2 className="tenant-section-title mt-3 font-display text-4xl font-medium sm:text-5xl">
              {title}
            </h2>
          </div>
          <p className="tenant-section-description max-w-md text-sm leading-6 text-ink/55">
            {description}
          </p>
        </div>
        <div className="tenant-browser-wrap mt-10">
          <PropertyBrowser
            posts={model.posts}
            slug={model.site.slug}
            total={model.total}
            page={model.page}
            totalPages={model.totalPages}
            initialQuery={model.query}
            initialType={model.type ?? "ALL"}
            initialCategoryId={model.categoryId ?? ""}
            initialProvince={model.province ?? ""}
            initialSort={model.sort}
          />
        </div>
      </div>
    </section>
  );
}

export function ExpertiseSection({
  site,
  personal = false,
}: {
  site: PublicThemeHomeProps["site"];
  personal?: boolean;
}) {
  return (
    <section id="about" className="tenant-about bg-white py-20 sm:py-28">
      <div className="page-shell grid items-center gap-12 lg:grid-cols-2">
        <div className="tenant-about-media relative aspect-[5/4] overflow-hidden" data-reveal="left">
          <Image
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=85"
            alt={`Chuyên viên tư vấn của ${site.name}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="tenant-about-copy lg:pl-10" data-reveal="right">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--tenant-color)]">
            {personal ? "Người đồng hành địa phương" : "Hiểu đất, hiểu người"}
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl font-medium leading-tight sm:text-5xl">
            {personal
              ? "Tôi giúp bạn nhìn rõ giá trị trước khi đưa ra quyết định."
              : "Tư vấn bằng hiểu biết. Đồng hành bằng sự tử tế."}
          </h2>
          <p className="mt-6 leading-7 text-ink/60">
            Mỗi bất động sản được chọn lọc dựa trên pháp lý, tiềm năng và mức
            độ phù hợp với nhu cầu thực tế. Bạn luôn nhận được thông tin rõ
            ràng trước khi đi xem hoặc thương lượng.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              [Award, "8+ năm", "kinh nghiệm địa phương"],
              [CheckCircle2, "500+", "giao dịch đồng hành"],
              [ShieldCheck, "Rõ ràng", "thông tin và pháp lý"],
            ].map(([Icon, value, label]) => {
              const ItemIcon = Icon as typeof Award;
              return (
                <div key={value as string} className="border-t border-ink/15 pt-5">
                  <ItemIcon className="text-[var(--tenant-color)]" size={21} />
                  <strong className="mt-3 block font-display text-2xl">
                    {value as string}
                  </strong>
                  <span className="mt-1 block text-xs leading-5 text-ink/50">
                    {label as string}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
