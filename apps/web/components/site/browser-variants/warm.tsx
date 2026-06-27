import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Search } from "lucide-react";
import { formatPrice, propertyTypeLabels } from "@/lib/format";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { PropertyPost } from "@/lib/types";
import type { BrowserVariantProps } from "../property-browser";

function propertyHref(slug: string, post: PropertyPost) {
  return `/${slug}/posts/${post.slug ?? post.id}`;
}

export function WarmBrowser({
  query,
  setQuery,
  type,
  setType,
  categoryId,
  setCategoryId,
  sort,
  setSort,
  categories,
  applyFilters,
  posts,
  slug,
  total,
  page,
  totalPages,
  initialQuery,
  initialType,
  initialCategoryId,
  initialSort,
}: BrowserVariantProps) {
  const visiblePages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);

  return (
    <div className="variant-warm mx-auto max-w-[1180px]">
      <form onSubmit={applyFilters} className="mx-auto max-w-[620px] rounded-[2rem] border border-[#b25e43]/10 bg-white p-4 shadow-[0_18px_45px_rgba(124,58,36,0.08)]">
        <label className="relative block">
          <span className="sr-only">Từ khóa</span>
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a78a7a]" size={19} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Bạn muốn tìm gì hôm nay?"
            className="h-14 w-full rounded-full bg-[#fcfbf9] pl-14 pr-5 text-base font-bold text-[#2d1f18] outline-none ring-1 ring-[#b25e43]/10 transition focus:ring-[var(--tenant-color)]"
          />
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <span className="px-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#a78a7a]">Khu vực</span>
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-12 rounded-2xl bg-[#fcfbf9] px-4 text-sm font-bold text-[#4a3c31] outline-none ring-1 ring-[#b25e43]/10 focus:ring-[var(--tenant-color)]">
              <option value="">Mọi khu vực</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="px-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#a78a7a]">Loại hình</span>
            <select value={type} onChange={(event) => setType(event.target.value)} className="h-12 rounded-2xl bg-[#fcfbf9] px-4 text-sm font-bold text-[#4a3c31] outline-none ring-1 ring-[#b25e43]/10 focus:ring-[var(--tenant-color)]">
              <option value="ALL">Mọi loại hình</option>
              {Object.entries(propertyTypeLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="px-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#a78a7a]">Sắp xếp</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 rounded-2xl bg-[#fcfbf9] px-4 text-sm font-bold text-[#4a3c31] outline-none ring-1 ring-[#b25e43]/10 focus:ring-[var(--tenant-color)]">
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
            </select>
          </label>
        </div>
        <button type="submit" className="mt-4 h-[3.25rem] w-full rounded-full bg-[var(--tenant-color)] px-6 text-base font-extrabold text-white shadow-[0_12px_30px_rgba(124,58,36,0.16)] transition-transform active:scale-[0.98]">
          Tìm Kiếm
        </button>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {[
          ["Tất cả", "ALL"],
          ...Object.entries(propertyTypeLabels),
        ].map(([label, value]) => {
          const active = type === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${active ? "bg-[var(--tenant-color)] text-white" : "bg-white text-[#7a5a4e]"}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm font-bold text-[#a78a7a]">
        Đã tìm thấy <strong className="text-[#2d1f18]">{total}</strong> tổ ấm phù hợp
      </p>

      {posts.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Link href={propertyHref(slug, post)} key={post.id} className="group rounded-[2rem] border border-[#b25e43]/10 bg-white p-3 shadow-[0_12px_35px_rgba(124,58,36,0.06)] transition-transform hover:-translate-y-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#ead5c4]">
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
            </Link>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-xl rounded-[2rem] bg-white px-6 py-20 text-center shadow-[0_12px_35px_rgba(124,58,36,0.06)]">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#f1ebd9] text-[#a78a7a]">
            <Search size={34} />
          </div>
          <h3 className="mt-5 text-2xl font-extrabold text-[#2d1f18]">Chưa tìm thấy nhà phù hợp</h3>
          <p className="mt-2 text-sm font-semibold text-[#7a5a4e]">Bạn có thể thử đổi khu vực, loại hình hoặc từ khóa.</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {page > 1 ? (
            <Link href={buildPublicPostsHref(slug, { page: page - 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any })} className="grid size-12 place-items-center rounded-full bg-white text-[#2d1f18] shadow-[0_8px_22px_rgba(124,58,36,0.08)]">
              <ChevronLeft size={21} />
            </Link>
          ) : (
            <span className="grid size-12 place-items-center rounded-full bg-transparent text-[#d4c2b6]">
              <ChevronLeft size={21} />
            </span>
          )}
          {visiblePages.map((paginationPage) => (
            paginationPage === page ? (
              <span key={paginationPage} className="grid size-11 place-items-center rounded-full bg-[var(--tenant-color)] text-sm font-extrabold text-white">{paginationPage}</span>
            ) : (
              <Link key={paginationPage} href={buildPublicPostsHref(slug, { page: paginationPage, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any })} className="grid size-11 place-items-center rounded-full bg-white text-sm font-extrabold text-[#7a5a4e]">
                {paginationPage}
              </Link>
            )
          ))}
          {page < totalPages ? (
            <Link href={buildPublicPostsHref(slug, { page: page + 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any })} className="grid size-12 place-items-center rounded-full bg-white text-[#2d1f18] shadow-[0_8px_22px_rgba(124,58,36,0.08)]">
              <ChevronRight size={21} />
            </Link>
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
