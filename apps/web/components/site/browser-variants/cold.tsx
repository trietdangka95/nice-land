import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { TenantLink } from "@/components/shared/tenant-link";
import { formatPrice, propertyTypeLabels } from "@/lib/format";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { BrowserVariantProps } from "../property-browser";

const PROVINCES = [
  "Hà Nội", "Huế", "Hải Phòng", "Đà Nẵng", "TP. Hồ Chí Minh", "Cần Thơ",
  "Cao Bằng", "Điện Biên", "Hà Tĩnh", "Lai Châu", "Lạng Sơn", "Nghệ An", "Quảng Ninh", "Thanh Hóa", "Sơn La",
  "Tuyên Quang", "Lào Cai", "Thái Nguyên", "Phú Thọ", "Bắc Ninh", "Hưng Yên", "Ninh Bình",
  "Quảng Trị", "Quảng Ngãi", "Gia Lai", "Khánh Hòa", "Lâm Đồng", "Đắk Lắk",
  "Đồng Nai", "Tây Ninh", "Vĩnh Long", "Đồng Tháp", "Cà Mau", "An Giang"
];

export function ColdBrowser({
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
  isPending,
}: BrowserVariantProps) {
  const visiblePages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);

  return (
    <div className="cold-browser relative">
      <form
        onSubmit={applyFilters}
        className="grid gap-px border border-[var(--cold-border)] bg-[var(--cold-border)] lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_auto]"
      >
        <label className="relative bg-white">
          <span className="sr-only">Tìm kiếm tin đăng</span>
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--cold-muted)]" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo dự án, khu vực, pháp lý..."
            className="h-14 w-full bg-transparent pl-12 pr-4 text-sm font-semibold text-[var(--cold-ink)] outline-none"
          />
        </label>
        <label className="bg-white">
          <span className="sr-only">Khu vực</span>
          <select
            value={province}
            onChange={(event) => setProvince(event.target.value)}
            className="h-14 w-full bg-transparent px-4 text-sm font-bold text-[var(--cold-ink)] outline-none"
          >
            <option value="">Khu vực</option>
            {PROVINCES.sort().map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="bg-white">
          <span className="sr-only">Loại hình</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-14 w-full bg-transparent px-4 text-sm font-bold text-[var(--cold-ink)] outline-none"
          >
            <option value="ALL">Loại hình</option>
            {Object.entries(propertyTypeLabels).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="bg-white">
          <span className="sr-only">Sắp xếp</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-14 w-full bg-transparent px-4 text-sm font-bold text-[var(--cold-ink)] outline-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá thấp đến cao</option>
            <option value="price_desc">Giá cao đến thấp</option>
          </select>
        </label>
        <button
          type="submit"
          className="relative inline-flex h-14 items-center justify-center gap-2 bg-[var(--cold-accent)] px-7 text-sm font-black uppercase tracking-[0.08em] text-[#03111f] transition-colors hover:bg-[var(--cold-accent-strong)]"
        >
          {isPending ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            </div>
          ) : (
            <SlidersHorizontal size={16} />
          )}
          <span className={isPending ? "opacity-0" : ""}>Tìm kiếm</span>
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => applyCategoryFilter("")}
          aria-pressed={categoryId === ""}
          className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.1em] transition-colors ${categoryId === "" ? "border-[var(--cold-navy)] bg-[var(--cold-navy)] text-white" : "border-[var(--cold-border)] bg-white text-[var(--cold-muted)] hover:border-[var(--cold-accent)] hover:text-[var(--cold-ink)]"}`}
        >
          Tất cả danh mục
        </button>
        {categories
          .filter((category) => type === "ALL" || category.type === type)
          .map((category) => {
            const active = categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => applyCategoryFilter(category.id)}
                aria-pressed={active}
                className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.1em] transition-colors ${active ? "border-[var(--cold-navy)] bg-[var(--cold-navy)] text-white" : "border-[var(--cold-border)] bg-white text-[var(--cold-muted)] hover:border-[var(--cold-accent)] hover:text-[var(--cold-ink)]"}`}
              >
                {category.name}
              </button>
            );
          })}
      </div>

      <p className="mt-8 border-l-4 border-[var(--cold-accent)] pl-4 text-sm font-bold text-[var(--cold-muted)]">
        Đã tìm thấy <strong className="text-[var(--cold-ink)]">{total}</strong> tin đăng phù hợp
      </p>

      <div className={`transition-all duration-300 relative ${isPending ? "opacity-50 blur-[2px] pointer-events-none" : ""}`}>
        {posts.length > 0 ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <TenantLink
                slug={slug}
                href={`/posts/${post.slug ?? post.id}`}
                key={post.id}
                className="group border border-[var(--cold-border)] bg-white transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--cold-surface-2)]">
                  <Image src={post.images[0]} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 33vw" />
                  <span className="absolute left-0 top-0 bg-[var(--cold-navy)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                    {propertyTypeLabels[post.type]}
                  </span>
                </div>
                <div className="grid gap-5 p-5">
                  <div>
                    <p className="text-lg font-black text-[var(--cold-accent-dark)]">{formatPrice(post.price, post.type)}</p>
                    <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight text-[var(--cold-ink)] group-hover:text-[var(--cold-accent-dark)]">{post.title}</h3>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-[var(--cold-border)] pt-4 text-sm font-bold text-[var(--cold-muted)]">
                    <span className="flex min-w-0 items-center gap-2">
                      <MapPin size={16} className="shrink-0 text-[var(--cold-accent-dark)]" />
                      <span className="truncate">{post.district}, {post.province}</span>
                    </span>
                    <span className="border border-[var(--cold-border)] px-3 py-1 text-[var(--cold-ink)]">{post.area}m²</span>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--cold-accent-dark)]">
                    Chi tiết <ArrowUpRight size={14} />
                  </span>
                </div>
              </TenantLink>
            ))}
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-[var(--cold-border)] bg-white px-6 py-20 text-center">
            <Search className="mx-auto text-[var(--cold-muted)]" size={34} />
            <h3 className="mt-4 text-2xl font-black text-[var(--cold-ink)]">Chưa tìm thấy lựa chọn phù hợp</h3>
            <p className="mt-2 text-sm font-semibold text-[var(--cold-muted)]">Bạn có thể thử đổi khu vực, loại hình hoặc từ khóa.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang tin đăng">
          {page > 1 ? (
            <Link href={buildPublicPostsHref(slug, { page: page - 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, province: initialProvince, sort: initialSort as any })} className="grid size-11 place-items-center border border-[var(--cold-border)] bg-white text-[var(--cold-ink)]">
              <ChevronLeft size={19} />
            </Link>
          ) : null}
          {visiblePages.map((paginationPage) => (
            paginationPage === page ? (
              <span key={paginationPage} className="grid size-11 place-items-center bg-[var(--cold-navy)] text-sm font-black text-white">{paginationPage}</span>
            ) : (
              <Link key={paginationPage} href={buildPublicPostsHref(slug, { page: paginationPage, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, province: initialProvince, sort: initialSort as any })} className="grid size-11 place-items-center border border-[var(--cold-border)] bg-white text-sm font-black text-[var(--cold-muted)]">
                {paginationPage}
              </Link>
            )
          ))}
          {page < totalPages ? (
            <Link href={buildPublicPostsHref(slug, { page: page + 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, province: initialProvince, sort: initialSort as any })} className="grid size-11 place-items-center border border-[var(--cold-border)] bg-white text-[var(--cold-ink)]">
              <ChevronRight size={19} />
            </Link>
          ) : null}
        </nav>
      )}
    </div>
  );
}
