import Image from "next/image";
import { TenantLink } from "@/components/shared/tenant-link";
import { Search, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, propertyTypeLabels } from "@/lib/format";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { PropertyPost } from "@/lib/types";
import type { BrowserVariantProps } from "../property-browser";

const PROVINCES = [
  "Hà Nội", "Huế", "Hải Phòng", "Đà Nẵng", "TP. Hồ Chí Minh", "Cần Thơ",
  "Cao Bằng", "Điện Biên", "Hà Tĩnh", "Lai Châu", "Lạng Sơn", "Nghệ An", "Quảng Ninh", "Thanh Hóa", "Sơn La",
  "Tuyên Quang", "Lào Cai", "Thái Nguyên", "Phú Thọ", "Bắc Ninh", "Hưng Yên", "Ninh Bình",
  "Quảng Trị", "Quảng Ngãi", "Gia Lai", "Khánh Hòa", "Lâm Đồng", "Đắk Lắk",
  "Đồng Nai", "Tây Ninh", "Vĩnh Long", "Đồng Tháp", "Cà Mau", "An Giang"
];

export function WarmBrowser({
  query,
  setQuery,
  type,
  setType,
  categoryId,
  province,
  setProvince,
  sort,
  setSort,
  categories,
  applyFilters,
  applyCategoryFilter,
  posts,
  slug,
  total,
  page,
  totalPages,
  initialQuery,
  initialType,
  initialCategoryId,
  initialProvince,
  initialSort,
}: BrowserVariantProps) {
  const visiblePages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);

  return (
    <div className="variant-warm mx-auto max-w-[1360px]">
      <form onSubmit={applyFilters} className="mx-auto flex flex-col md:flex-row items-center gap-3 rounded-3xl md:rounded-full border border-black/5 bg-white p-2 shadow-sm w-full max-w-4xl">
        <label className="relative flex-1 w-full min-w-[200px]">
          <span className="sr-only">Từ khóa</span>
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a78a7a]" size={19} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Bạn muốn tìm gì hôm nay?"
            className="h-12 w-full rounded-full bg-transparent pl-12 pr-4 text-sm font-bold text-[#2d1f18] outline-none"
          />
        </label>

        <div className="h-8 w-px bg-black/5 hidden md:block"></div>

        <select value={province} onChange={(event) => setProvince(event.target.value)} className="h-12 w-full md:w-auto min-w-[140px] bg-transparent px-4 text-sm font-bold text-[#4a3c31] outline-none cursor-pointer">
          <option value="">Khu vực</option>
          {PROVINCES.sort().map((p) => (
            <option value={p} key={p}>{p}</option>
          ))}
        </select>

        <div className="h-8 w-px bg-black/5 hidden md:block"></div>

        <select value={type} onChange={(event) => setType(event.target.value)} className="h-12 w-full md:w-auto min-w-[140px] bg-transparent px-4 text-sm font-bold text-[#4a3c31] outline-none cursor-pointer">
          <option value="ALL">Loại hình</option>
          {Object.entries(propertyTypeLabels).map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </select>

        <div className="h-8 w-px bg-black/5 hidden md:block"></div>

        <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 w-full md:w-auto min-w-[140px] bg-transparent px-4 text-sm font-bold text-[#4a3c31] outline-none cursor-pointer">
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá thấp đến cao</option>
          <option value="price_desc">Giá cao đến thấp</option>
        </select>

        <button type="submit" className="h-12 w-full md:w-auto whitespace-nowrap rounded-full bg-[var(--tenant-color)] px-8 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(124,58,36,0.16)] transition-transform active:scale-[0.98]">
          Tìm Kiếm
        </button>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => applyCategoryFilter("")}
          aria-pressed={categoryId === ""}
          className={`rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${categoryId === "" ? "bg-[var(--tenant-color)] text-white" : "bg-white text-[#7a5a4e]"}`}
        >
          Tất cả danh mục
        </button>
        {categories
          .filter((c) => type === "ALL" || c.type === type)
          .map((category) => {
            const active = categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => applyCategoryFilter(category.id)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${active ? "bg-[var(--tenant-color)] text-white" : "bg-white text-[#7a5a4e]"}`}
              >
                {category.name}
              </button>
            );
          })}
      </div>

      <p className="mt-8 text-center text-sm font-bold text-[#a78a7a]">
        Đã tìm thấy <strong className="text-[#2d1f18]">{total}</strong> tin đăng phù hợp
      </p>

      {posts.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <TenantLink slug={slug} href={`/posts/${post.slug ?? post.id}`} key={post.id} className="group rounded-[2rem] border border-black/5 bg-white p-3 shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-[#ead5c4]">
                <Image src={post.images[0]} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 33vw" />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-[#2d1f18] shadow-sm">
                  {propertyTypeLabels[post.type]}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xl font-extrabold text-[var(--tenant-color)]">{formatPrice(post.price, post.type)}</p>
                <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug text-[#2d1f18] group-hover:text-[var(--tenant-color)]">{post.title}</h3>
                <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3 text-sm font-bold text-[#7a5a4e]">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f1ebd9] text-[#a78a7a]">
                      <MapPin size={15} />
                    </span>
                    <span className="truncate">{post.district}, {post.province}</span>
                  </span>
                  <span className="rounded-full bg-[#f1ebd9] px-3 py-2">{post.area}m²</span>
                </div>
              </div>
            </TenantLink>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-xl rounded-[2rem] bg-white px-6 py-20 text-center shadow-[0_12px_35px_rgba(124,58,36,0.06)]">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#f1ebd9] text-[#a78a7a]">
            <Search size={34} />
          </div>
          <h3 className="mt-5 text-2xl font-extrabold text-[#2d1f18]">Chưa tìm thấy lựa chọn phù hợp</h3>
          <p className="mt-2 text-sm font-semibold text-[#7a5a4e]">Bạn có thể thử đổi khu vực, loại hình hoặc từ khóa.</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2 pb-8" aria-label="Phân trang tin đăng">
          {page > 1 ? (
            <TenantLink slug={slug} href={buildPublicPostsHref("", { page: page - 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, province: initialProvince, sort: initialSort as any })} className="grid size-12 place-items-center rounded-full bg-white text-[#2d1f18] shadow-[0_8px_22px_rgba(124,58,36,0.08)]">
              <ChevronLeft size={20} />
            </TenantLink>
          ) : (
            <span className="grid size-12 place-items-center rounded-full bg-transparent text-[#d4c2b6]">
              <ChevronLeft size={21} />
            </span>
          )}
          {visiblePages.map((paginationPage) => (
            paginationPage === page ? (
              <span key={paginationPage} className="grid size-11 place-items-center rounded-full bg-[var(--tenant-color)] text-sm font-extrabold text-white">{paginationPage}</span>
            ) : (
              <TenantLink key={paginationPage} slug={slug} href={buildPublicPostsHref("", { page: paginationPage, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, province: initialProvince, sort: initialSort as any })} className="grid size-11 place-items-center rounded-full bg-white text-sm font-extrabold text-[#7a5a4e]">
                {paginationPage}
              </TenantLink>
            )
          ))}
          {page < totalPages ? (
            <TenantLink slug={slug} href={buildPublicPostsHref("", { page: page + 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, province: initialProvince, sort: initialSort as any })} className="grid size-12 place-items-center rounded-full bg-white text-[#2d1f18] shadow-[0_8px_22px_rgba(124,58,36,0.08)]">
              <ChevronRight size={20} />
            </TenantLink>
          ) : (
            <span className="grid size-12 place-items-center rounded-full bg-transparent text-[#d4c2b6]">
              <ChevronRight size={21} />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
