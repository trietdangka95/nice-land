import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { propertyTypeLabels } from "@/lib/format";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { BrowserVariantProps } from "../property-browser";

export function DefaultBrowser({
  query, setQuery, type, setType, categoryId, setCategoryId, sort, setSort, categories, applyFilters,
  posts, slug, total, page, totalPages, initialQuery, initialType, initialCategoryId, initialSort, themePreview
}: BrowserVariantProps) {
  return (
    <div className="tenant-property-browser">
      <form
        onSubmit={applyFilters}
        className="tenant-filter grid gap-3 border border-ink/10 bg-white p-3 md:grid-cols-2 xl:grid-cols-[1fr_180px_180px_180px_auto]"
      >
        <label className="relative">
          <span className="sr-only">Tìm kiếm bất động sản</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, khu vực..."
            className="h-12 w-full bg-cream/70 pl-12 pr-4 text-sm"
          />
        </label>
        <label>
          <span className="sr-only">Danh mục bất động sản</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-12 w-full bg-cream/70 px-4 text-sm font-semibold"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Loại bất động sản</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-12 w-full bg-cream/70 px-4 text-sm font-semibold"
          >
            <option value="ALL">Tất cả loại hình</option>
            {Object.entries(propertyTypeLabels).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sắp xếp</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-12 w-full bg-cream/70 px-4 text-sm font-semibold"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá thấp đến cao</option>
            <option value="price_desc">Giá cao đến thấp</option>
          </select>
        </label>
        <button
          type="submit"
          className="flex h-12 items-center justify-center gap-2 bg-[var(--tenant-color)] px-5 text-sm font-bold text-white"
        >
          <SlidersHorizontal size={16} />
          Áp dụng
        </button>
      </form>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-sm text-ink/55">
          Tìm thấy <strong className="tabular-nums text-ink">{total}</strong> bất động sản
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="tenant-property-grid mt-6 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" data-reveal-group>
          {posts.map((post) => (
            <PropertyCard
              key={post.id}
              post={post}
              slug={slug}
              themePreview={themePreview}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-ink/20 bg-white py-20 text-center">
          <Search className="mx-auto text-ink/25" size={34} />
          <h3 className="mt-4 font-display text-2xl">Chưa tìm thấy bất động sản phù hợp</h3>
          <p className="mt-2 text-sm text-ink/50">Thử thay đổi từ khóa hoặc loại hình đang chọn.</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row"
          aria-label="Phân trang bất động sản"
        >
          <p className="text-sm text-ink/50">
            Trang <strong className="tabular-nums text-ink">{page}</strong> /{" "}
            <strong className="tabular-nums text-ink">{totalPages}</strong>
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={buildPublicPostsHref(slug, { page: page - 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                className="button-secondary min-h-11 px-4"
              >
                <ChevronLeft size={17} aria-hidden="true" />
                Trang trước
              </Link>
            ) : (
              <span className="button-secondary min-h-11 px-4 opacity-40" aria-disabled="true">
                <ChevronLeft size={17} aria-hidden="true" />
                Trang trước
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={buildPublicPostsHref(slug, { page: page + 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                className="button-secondary min-h-11 px-4"
              >
                Trang sau
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            ) : (
              <span className="button-secondary min-h-11 px-4 opacity-40" aria-disabled="true">
                Trang sau
                <ChevronRight size={17} aria-hidden="true" />
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
