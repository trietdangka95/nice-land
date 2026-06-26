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
        <article className="flex flex-col h-full bg-[#1E293B] rounded-xl overflow-hidden border border-[#334155] hover:border-[var(--tenant-color)] transition-all hover:shadow-[0_0_30px_rgba(15,118,110,0.15)]">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0F172A]">
            <Image
              src={post.images[0]}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2.5 py-1 bg-[#0F172A]/80 backdrop-blur-md text-[#38BDF8] text-[10px] font-bold uppercase tracking-wider rounded-md border border-[#334155]">
                {propertyTypeLabels[post.type as keyof typeof propertyTypeLabels]}
              </span>
              {post.status === "SOLD" && (
                <span className="px-2.5 py-1 bg-[#EF4444]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                  Đã bán
                </span>
              )}
            </div>
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#1E293B] to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <p className="text-[#F8FAFC] font-bold text-lg">{formatPrice(post.price, post.type)}</p>
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-[#F1F5F9] font-medium text-sm line-clamp-2 leading-relaxed mb-3 group-hover:text-[var(--tenant-color)] transition-colors">
              {post.title}
            </h3>
            
            <div className="mt-auto pt-3 border-t border-[#334155] flex items-center justify-between text-[#94A3B8] text-xs">
              <span className="flex items-center gap-1.5 truncate max-w-[60%]">
                <MapPin size={12} className="text-[#64748B] shrink-0" />
                <span className="truncate">{post.district}</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Square size={12} className="text-[#64748B]" />
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
        .variant-modern { font-family: 'Inter', sans-serif; background-color: #0F172A; }
      `}</style>
      <div className="variant-modern flex flex-col xl:flex-row gap-8 p-1 rounded-2xl">
        
        {/* Sidebar Filter (Data-dense Dashboard style) */}
        <aside className="w-full xl:w-[320px] shrink-0">
          <form onSubmit={applyFilters} className="sticky top-24 rounded-xl border border-[#334155] bg-[#1E293B] p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-[#334155] pb-4">
              <ListFilter className="text-[var(--tenant-color)]" size={18} />
              <h3 className="font-semibold text-[#F8FAFC] tracking-wide text-sm">BỘ LỌC TÌM KIẾM</h3>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Từ khóa</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Mã căn, khu vực..."
                  className="h-10 w-full rounded-md border border-[#475569] bg-[#0F172A] pl-9 pr-3 text-[13px] text-[#F8FAFC] placeholder-[#64748B] focus:border-[var(--tenant-color)] focus:ring-1 focus:ring-[var(--tenant-color)] outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Danh mục</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="h-10 w-full appearance-none rounded-md border border-[#475569] bg-[#0F172A] pl-9 pr-8 text-[13px] text-[#F8FAFC] focus:border-[var(--tenant-color)] outline-none"
                >
                  <option value="">Tất cả khu vực</option>
                  {categories.map((category) => (
                    <option value={category.id} key={category.id}>{category.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#64748B]">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Loại hình</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="h-10 w-full appearance-none rounded-md border border-[#475569] bg-[#0F172A] pl-3 pr-8 text-[13px] text-[#F8FAFC] focus:border-[var(--tenant-color)] outline-none"
                >
                  <option value="ALL">Tất cả</option>
                  {Object.entries(propertyTypeLabels).map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#64748B]">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Sắp xếp</label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-10 w-full appearance-none rounded-md border border-[#475569] bg-[#0F172A] pl-3 pr-8 text-[13px] text-[#F8FAFC] focus:border-[var(--tenant-color)] outline-none"
                >
                  <option value="newest">Cập nhật mới nhất</option>
                  <option value="price_asc">Giá từ thấp đến cao</option>
                  <option value="price_desc">Giá từ cao đến thấp</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#64748B]">
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
          <div className="mb-6 flex items-center justify-between rounded-xl bg-[#1E293B] border border-[#334155] px-4 py-3">
            <p className="text-[13px] font-medium text-[#94A3B8]">
              Tìm thấy <strong className="text-[#F8FAFC]">{total}</strong> kết quả
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {posts.map(renderCard)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#334155] bg-[#1E293B]/50 py-32 text-center">
              <Search className="text-[#475569]" size={40} />
              <h3 className="mt-4 text-base font-semibold text-[#F8FAFC]">Không có dữ liệu</h3>
              <p className="mt-1 text-[13px] text-[#94A3B8]">Thay đổi bộ lọc bên trái để xem kết quả khác.</p>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-10 flex justify-center gap-2">
              {page > 1 ? (
                <Link
                  href={buildPublicPostsHref(slug, { page: page - 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                  className="flex h-9 px-4 items-center gap-2 rounded-md bg-[#1E293B] border border-[#334155] text-[13px] font-medium text-[#F8FAFC] hover:border-[#475569] transition-colors"
                >
                  <ChevronLeft size={14} /> Trước
                </Link>
              ) : (
                <span className="flex h-9 px-4 items-center gap-2 rounded-md bg-[#0F172A] border border-[#1E293B] text-[13px] font-medium text-[#475569] cursor-not-allowed">
                  <ChevronLeft size={14} /> Trước
                </span>
              )}
              
              <div className="flex h-9 items-center rounded-md bg-[#1E293B] border border-[#334155] px-4 text-[13px] font-medium text-[#94A3B8]">
                {page} / {totalPages}
              </div>

              {page < totalPages ? (
                <Link
                  href={buildPublicPostsHref(slug, { page: page + 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                  className="flex h-9 px-4 items-center gap-2 rounded-md bg-[#1E293B] border border-[#334155] text-[13px] font-medium text-[#F8FAFC] hover:border-[#475569] transition-colors"
                >
                  Sau <ChevronRight size={14} />
                </Link>
              ) : (
                <span className="flex h-9 px-4 items-center gap-2 rounded-md bg-[#0F172A] border border-[#1E293B] text-[13px] font-medium text-[#475569] cursor-not-allowed">
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
