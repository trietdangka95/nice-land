import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search, MapPin } from "lucide-react";
import { propertyTypeLabels, formatPrice } from "@/lib/format";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { BrowserVariantProps } from "../property-browser";

export function WarmBrowser({
  query, setQuery, type, setType, categoryId, setCategoryId, sort, setSort, categories, applyFilters,
  posts, slug, total, page, totalPages, initialQuery, initialType, initialCategoryId, initialSort, themePreview
}: BrowserVariantProps) {

  const renderCard = (post: any) => {
    const previewSuffix = themePreview ? `?themePreview=${encodeURIComponent(themePreview)}` : "";
    const href = `/${slug}/posts/${post.slug ?? post.id}${previewSuffix}`;
    
    return (
      <Link href={href} key={post.id} className="block group">
        <article className="flex flex-col h-full bg-[#FFFFFF] rounded-[2rem] overflow-hidden p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
          <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-[#F3F4F6]">
            <Image
              src={post.images[0]}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[#09090B] font-bold text-[13px] shadow-sm">
              {propertyTypeLabels[post.type as keyof typeof propertyTypeLabels]}
            </div>
          </div>
          
          <div className="px-3 pt-5 pb-4 flex flex-col flex-1">
            <p className="text-[var(--tenant-color)] font-extrabold text-xl mb-2">
              {formatPrice(post.price, post.type)}
            </p>
            <h3 className="font-bold text-[#18181B] text-[17px] line-clamp-2 leading-snug mb-4 group-hover:text-[var(--tenant-color)] transition-colors">
              {post.title}
            </h3>
            
            <div className="mt-auto flex items-center gap-2 text-[#3F3F46] text-[15px] font-medium">
              <div className="bg-[#FAFAFA] p-2 rounded-full text-[#A1A1AA]">
                <MapPin size={16} />
              </div>
              <span className="truncate">{post.district}, {post.province}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&family=Varela+Round&display=swap');
        .variant-warm { font-family: 'Nunito Sans', sans-serif; background-color: #FAFAFA; }
        .variant-warm h1, .variant-warm h2, .variant-warm h3, .variant-warm h4 { font-family: 'Varela Round', sans-serif; }
      `}</style>
      <div className="variant-warm p-4 sm:p-8 rounded-[3rem]">
        
        <form
          onSubmit={applyFilters}
          className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 mb-16 max-w-5xl mx-auto"
        >
          <div className="relative w-full md:w-auto md:min-w-[320px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Bạn muốn tìm gì hôm nay?"
              className="h-16 w-full rounded-full bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none pl-14 pr-6 text-[16px] font-semibold text-[#18181B] placeholder-[#A1A1AA] focus:ring-4 focus:ring-[var(--tenant-color)]/20 outline-none transition-all"
            />
          </div>
          
          <div className="relative w-full md:w-auto">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="h-16 w-full md:w-auto appearance-none rounded-full bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none px-8 pr-12 text-[16px] font-semibold text-[#3F3F46] focus:ring-4 focus:ring-[var(--tenant-color)]/20 outline-none transition-all cursor-pointer"
            >
              <option value="">Mọi khu vực</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>{category.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-[#A1A1AA]">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
          
          <div className="relative w-full md:w-auto">
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-16 w-full md:w-auto appearance-none rounded-full bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none px-8 pr-12 text-[16px] font-semibold text-[#3F3F46] focus:ring-4 focus:ring-[var(--tenant-color)]/20 outline-none transition-all cursor-pointer"
            >
              <option value="ALL">Mọi loại hình</option>
              {Object.entries(propertyTypeLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-[#A1A1AA]">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
          
          <button
            type="submit"
            className="flex h-16 w-full md:w-auto items-center justify-center rounded-full bg-[var(--tenant-color)] px-10 text-[16px] font-extrabold text-white shadow-[0_8px_25px_var(--tenant-color)]/40 hover:-translate-y-1 hover:shadow-[0_12px_30px_var(--tenant-color)]/50 transition-all"
          >
            Tìm Kiếm
          </button>
        </form>

        {posts.length > 0 ? (
          <>
            <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-[1600px] mx-auto">
              {posts.map(renderCard)}
            </div>
            <div className="mt-12 text-center text-[16px] font-bold text-[#A1A1AA]">
              Đã tìm thấy {total} tổ ấm tuyệt vời
            </div>
          </>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-[3rem] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] py-32 text-center max-w-4xl mx-auto">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F4F4F5] text-[#A1A1AA] mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-bold text-[#18181B] mb-2">Chưa tìm thấy nhà phù hợp</h3>
            <p className="text-[16px] text-[#71717A] font-medium">Bạn có muốn thử tìm ở khu vực khác không?</p>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-20 flex items-center justify-center gap-4">
            {page > 1 ? (
              <Link
                href={buildPublicPostsHref(slug, { page: page - 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#18181B] shadow-[0_4px_15px_rgb(0,0,0,0.05)] hover:text-[var(--tenant-color)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1"
              >
                <ChevronLeft size={24} />
              </Link>
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-transparent text-[#D4D4D8] cursor-not-allowed">
                <ChevronLeft size={24} />
              </span>
            )}
            
            <div className="flex items-center gap-2 mx-4">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const isActive = p === page;
                return isActive ? (
                  <span key={p} className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tenant-color)] text-[16px] font-extrabold text-white shadow-md">
                    {p}
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={buildPublicPostsHref(slug, { page: p, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[16px] font-bold text-[#71717A] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-[#F4F4F5] hover:text-[#18181B] transition-colors"
                  >
                    {p}
                  </Link>
                );
              })}
            </div>

            {page < totalPages ? (
              <Link
                href={buildPublicPostsHref(slug, { page: page + 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#18181B] shadow-[0_4px_15px_rgb(0,0,0,0.05)] hover:text-[var(--tenant-color)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1"
              >
                <ChevronRight size={24} />
              </Link>
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-transparent text-[#D4D4D8] cursor-not-allowed">
                <ChevronRight size={24} />
              </span>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
