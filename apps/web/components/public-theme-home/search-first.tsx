import { Search, ShieldCheck, Sparkles } from "lucide-react";
import { SearchFooter, SearchHeader } from "./chrome";
import { PropertyCollection } from "./shared";
import type { PublicThemeHomeProps } from "./types";

export function SearchFirstHome(model: PublicThemeHomeProps) {
  return (
    <>
      <SearchHeader site={model.site} />
      <section className="tenant-hero bg-[#24405e] py-12 text-white sm:py-16">
        <div className="page-shell text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9ec7df]">
            Dữ liệu cập nhật · Tư vấn địa phương
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-balance text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">
            Tìm bất động sản phù hợp, nhanh và rõ ràng hơn.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Lọc theo loại hình, khu vực và mức giá từ danh sách được xác minh
            bởi {model.site.name}.
          </p>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            {[
              [Search, "Tìm kiếm nhanh", "Theo từ khóa và loại hình"],
              [ShieldCheck, "Tin đã kiểm tra", "Thông tin rõ ràng hơn"],
              [Sparkles, "Cập nhật mới", "Danh sách mới mỗi ngày"],
            ].map(([Icon, title, description]) => {
              const ItemIcon = Icon as typeof Search;
              return (
                <div key={title as string} className="flex gap-3 border border-white/15 bg-white/5 p-4">
                  <ItemIcon size={18} className="mt-0.5 text-[#9ec7df]" />
                  <div>
                    <strong className="block text-sm">{title as string}</strong>
                    <span className="mt-1 block text-xs text-white/50">{description as string}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <PropertyCollection
        model={model}
        eyebrow="Có thể giao dịch"
        title={`${model.total} bất động sản đang chờ bạn khám phá`}
        description="Dùng bộ lọc để thu hẹp danh sách theo nhu cầu thực tế của bạn."
        className="bg-[#eef2f3] py-10 sm:py-14"
      />
      <SearchFooter site={model.site} />
    </>
  );
}
