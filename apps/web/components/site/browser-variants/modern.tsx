import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search, ListFilter, MapPin, Bed, Bath, Square } from "lucide-react";
import { propertyTypeLabels, formatPrice } from "@/lib/format";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { BrowserVariantProps } from "../property-browser";

export function ModernBrowser({
  query, setQuery, type, setType, categoryId, setCategoryId, sort, setSort, categories, applyFilters,
  posts, slug, total, page, totalPages, initialQuery, initialType, initialCategoryId, initialSort, themePreview
}: BrowserVariantProps) {
  
  const renderCard = (post: any) => {
    const previewSuffix = themePreview ? `?themePreview=${encodeURIComponent(themePreview)}` : "";
    const href = `/${slug}/posts/${post.slug ?? post.id}${previewSuffix}`;
    
    return (
      <Link href={href} key={post.id} className="block group">
        <article className="tenant-property-card flex flex-col h-full bg-white rounded-lg overflow-hidden border border-slate-200 transition-all">
          <div className="tenant-card-media relative aspect-[16/10] w-full overflow-hidden bg-slate-200">
            <Image
              src={post.images[0]}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="tenant-card-type px-2.5 py-1 bg-slate-950/85 backdrop-blur-md text-blue-100 text-[10px] font-bold uppercase tracking-wider rounded border border-white/10">
                {propertyTypeLabels[post.type as keyof typeof propertyTypeLabels]}
              </span>
              {post.status === "SOLD" && (
                <span className="px-2.5 py-1 bg-[#EF4444]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded">
                  Đã bán
                </span>
              )}
            </div>
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <p className="tenant-card-price text-white font-extrabold text-lg drop-shadow">{formatPrice(post.price, post.type)}</p>
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            <h3 className="tenant-card-title text-slate-950 font-bold text-sm line-clamp-2 leading-relaxed mb-3 group-hover:text-[var(--tenant-color)] transition-colors">
              {post.title}
            </h3>
            
            <div className="tenant-card-meta mt-auto pt-3 border-t border-slate-200 flex items-center justify-between text-slate-500 text-xs">
              <span className="tenant-card-location flex items-center gap-1.5 truncate max-w-[60%]">
                <MapPin size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{post.district}</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Square size={12} className="text-slate-400" />
                {post.area}m²
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .variant-modern { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="tenant-modern-shell variant-modern flex flex-col xl:flex-row gap-8">
        
        {/* Sidebar Filter (Data-dense Dashboard style) */}
        <aside className="w-full xl:w-[320px] shrink-0">
          <form onSubmit={applyFilters} className="tenant-filter sticky top-24 rounded-lg border border-slate-200 bg-white p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
              <ListFilter className="text-[var(--tenant-color)]" size={18} />
              <h3 className="tenant-filter-title font-bold text-slate-950 tracking-wide text-sm">BỘ LỌC TÌM KIẾM</h3>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="tenant-filter-label text-[11px] font-bold uppercase tracking-wider text-slate-500">Từ khóa</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Mã căn, khu vực..."
                  className="tenant-filter-field h-10 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 text-[13px] text-slate-950 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tenant-filter-label text-[11px] font-bold uppercase tracking-wider text-slate-500">Danh mục</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="tenant-filter-field h-10 w-full appearance-none rounded-md border border-slate-300 bg-slate-50 pl-9 pr-8 text-[13px] text-slate-950"
                >
                  <option value="">Tất cả khu vực</option>
                  {categories.map((category) => (
                    <option value={category.id} key={category.id}>{category.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tenant-filter-label text-[11px] font-bold uppercase tracking-wider text-slate-500">Loại hình</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="tenant-filter-field h-10 w-full appearance-none rounded-md border border-slate-300 bg-slate-50 pl-3 pr-8 text-[13px] text-slate-950"
                >
                  <option value="ALL">Tất cả</option>
                  {Object.entries(propertyTypeLabels).map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tenant-filter-label text-[11px] font-bold uppercase tracking-wider text-slate-500">Sắp xếp</label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="tenant-filter-field h-10 w-full appearance-none rounded-md border border-slate-300 bg-slate-50 pl-3 pr-8 text-[13px] text-slate-950"
                >
                  <option value="newest">Cập nhật mới nhất</option>
                  <option value="price_asc">Giá từ thấp đến cao</option>
                  <option value="price_desc">Giá từ cao đến thấp</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-[var(--tenant-color)] text-[13px] font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Áp dụng bộ lọc
            </button>
          </form>
        </aside>

        {/* Grid Content */}
        <div className="flex-1">
          <div className="tenant-modern-toolbar mb-6 flex items-center justify-between rounded-lg bg-white border border-slate-200 px-4 py-3">
            <p className="text-[13px] font-medium text-slate-500">
              Tìm thấy <strong className="text-slate-950">{total}</strong> kết quả
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="tenant-property-grid grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {posts.map(renderCard)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-32 text-center">
              <Search className="text-slate-400" size={40} />
              <h3 className="mt-4 text-base font-semibold text-slate-950">Không có dữ liệu</h3>
              <p className="mt-1 text-[13px] text-slate-500">Thay đổi bộ lọc bên trái để xem kết quả khác.</p>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-10 flex justify-center gap-2">
              {page > 1 ? (
                <Link
                  href={buildPublicPostsHref(slug, { page: page - 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                  className="flex h-9 px-4 items-center gap-2 rounded-md bg-white border border-slate-300 text-[13px] font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  <ChevronLeft size={14} /> Trước
                </Link>
              ) : (
                <span className="flex h-9 px-4 items-center gap-2 rounded-md bg-slate-100 border border-slate-200 text-[13px] font-medium text-slate-400 cursor-not-allowed">
                  <ChevronLeft size={14} /> Trước
                </span>
              )}
              
              <div className="flex h-9 items-center rounded-md bg-white border border-slate-300 px-4 text-[13px] font-medium text-slate-500">
                {page} / {totalPages}
              </div>

              {page < totalPages ? (
                <Link
                  href={buildPublicPostsHref(slug, { page: page + 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                  className="flex h-9 px-4 items-center gap-2 rounded-md bg-white border border-slate-300 text-[13px] font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  Sau <ChevronRight size={14} />
                </Link>
              ) : (
                <span className="flex h-9 px-4 items-center gap-2 rounded-md bg-slate-100 border border-slate-200 text-[13px] font-medium text-slate-400 cursor-not-allowed">
                  Sau <ChevronRight size={14} />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
