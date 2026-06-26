import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { propertyTypeLabels, formatPrice } from "@/lib/format";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { BrowserVariantProps } from "../property-browser";

export function ClassicBrowser({
  query, setQuery, type, setType, categoryId, setCategoryId, sort, setSort, categories, applyFilters,
  posts, slug, total, page, totalPages, initialQuery, initialType, initialCategoryId, initialSort, themePreview
}: BrowserVariantProps) {

  const renderCard = (post: any, index: number) => {
    const previewSuffix = themePreview ? `?themePreview=${encodeURIComponent(themePreview)}` : "";
    const href = `/${slug}/posts/${post.slug ?? post.id}${previewSuffix}`;
    
    return (
      <Link href={href} key={post.id} className="block group relative overflow-hidden rounded-2xl aspect-square md:aspect-[4/5] h-auto md:h-[340px]">
        <div className="absolute inset-0 bg-[#1C1917]">
          <Image
            src={post.images[0]}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/40 to-transparent" />
        </div>
        
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <p className="text-[var(--tenant-color)] font-medium tracking-widest text-xs uppercase mb-2">
              {propertyTypeLabels[post.type as keyof typeof propertyTypeLabels]}
            </p>
            <h3 className="text-[#FAFAF9] font-display text-2xl md:text-3xl leading-tight mb-2 drop-shadow-lg line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              <p className="text-white font-bold text-lg">{formatPrice(post.price, post.type)}</p>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <p className="text-white/80">{post.district}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap');
        .variant-classic .font-display { font-family: 'Cinzel', serif; }
      `}</style>
      <div className="variant-classic relative z-10 w-full max-w-7xl mx-auto">
        <div className="w-full">
          
          {/* Liquid Glass Filter */}
          <form
            onSubmit={applyFilters}
            className="tenant-filter mx-auto max-w-4xl flex flex-col md:flex-row items-stretch md:items-center gap-4 p-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] mb-16"
          >
            <label className="relative flex-1 flex items-center bg-transparent">
              <Search className="absolute left-4 text-[var(--tenant-color)]" size={18} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm dinh thự, penthouse..."
                className="h-12 w-full pl-12 pr-4 text-sm focus:outline-none focus:ring-0 border-none bg-transparent"
              />
            </label>
            <div className="hidden md:block w-px h-8 bg-current opacity-10" />
            <div className="flex flex-1 gap-2 bg-transparent">
              <label className="flex-1 relative flex items-center">
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="h-12 w-full appearance-none px-4 text-sm focus:outline-none focus:ring-0 border-none cursor-pointer bg-transparent"
                >
                  <option value="ALL">Tất cả loại hình</option>
                  {Object.entries(propertyTypeLabels).map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
              </label>
              <div className="hidden sm:block w-px h-8 bg-current opacity-10 self-center" />
              <label className="flex-1 relative flex items-center">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-12 w-full appearance-none px-4 text-sm focus:outline-none focus:ring-0 border-none cursor-pointer bg-transparent"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
              </label>
              <button
                type="submit"
                className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--tenant-color)] text-[#0C0A09] transition-transform hover:scale-105"
              >
                <Filter size={18} />
              </button>
            </div>
          </form>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {posts.map((post, i) => renderCard(post, i))}
            </div>
          ) : (
            <div className="py-40 text-center border border-current opacity-80 rounded-3xl">
              <Search className="text-[var(--tenant-color)] mx-auto opacity-50" size={48} />
              <h3 className="mt-6 font-display text-2xl">Không tìm thấy bất động sản</h3>
              <p className="mt-2 text-sm opacity-50">Vui lòng thay đổi tiêu chí tìm kiếm.</p>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-20 flex justify-center items-center gap-8">
              {page > 1 ? (
                <Link
                  href={buildPublicPostsHref(slug, { page: page - 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                  className="opacity-50 hover:text-[var(--tenant-color)] hover:opacity-100 transition-colors uppercase tracking-widest text-xs font-bold flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Trang trước
                </Link>
              ) : (
                <span className="opacity-20 uppercase tracking-widest text-xs font-bold flex items-center gap-2 cursor-not-allowed">
                  <ChevronLeft size={16} /> Trang trước
                </span>
              )}
              
              <span className="font-display text-xl">
                {page} <span className="opacity-30">/ {totalPages}</span>
              </span>

              {page < totalPages ? (
                <Link
                  href={buildPublicPostsHref(slug, { page: page + 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                  className="opacity-50 hover:text-[var(--tenant-color)] hover:opacity-100 transition-colors uppercase tracking-widest text-xs font-bold flex items-center gap-2"
                >
                  Trang sau <ChevronRight size={16} />
                </Link>
              ) : (
                <span className="opacity-20 uppercase tracking-widest text-xs font-bold flex items-center gap-2 cursor-not-allowed">
                  Trang sau <ChevronRight size={16} />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
