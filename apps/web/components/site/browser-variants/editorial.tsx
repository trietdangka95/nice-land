import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { propertyTypeLabels, formatPrice } from "@/lib/format";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { BrowserVariantProps } from "../property-browser";

export function EditorialBrowser({
  query, setQuery, type, setType, categoryId, setCategoryId, sort, setSort, categories, applyFilters,
  posts, slug, total, page, totalPages, initialQuery, initialType, initialCategoryId, initialSort, themePreview
}: BrowserVariantProps) {

  const renderCard = (post: any) => {
    const previewSuffix = themePreview ? `?themePreview=${encodeURIComponent(themePreview)}` : "";
    const href = `/${slug}/posts/${post.slug ?? post.id}${previewSuffix}`;
    
    return (
      <Link href={href} key={post.id} className="block group">
        <article className="flex flex-col h-full bg-[#FAFAFA]">
          <div className="relative aspect-[3/4] w-full overflow-hidden border border-[#18181B]">
            <Image
              src={post.images[0]}
              alt={post.title}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute top-0 left-0 bg-[#18181B] text-[#FAFAFA] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em]">
              {propertyTypeLabels[post.type as keyof typeof propertyTypeLabels]}
            </div>
          </div>
          
          <div className="pt-6 pb-2 flex flex-col flex-1 border-b-2 border-[#18181B] group-hover:border-[var(--tenant-color)] transition-colors">
            <p className="text-[#3F3F46] text-xs font-bold uppercase tracking-widest mb-3">
              {post.district}, {post.province}
            </p>
            <h3 className="font-editorial text-[#09090B] text-2xl leading-tight mb-4 group-hover:text-[var(--tenant-color)] transition-colors">
              {post.title}
            </h3>
            <div className="mt-auto flex justify-between items-end">
              <p className="text-[#18181B] font-bold text-lg">{formatPrice(post.price, post.type)}</p>
              <span className="text-[#3F3F46] text-sm">{post.area} m²</span>
            </div>
          </div>
        </article>
      </Link>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Bodoni:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Public+Sans:wght@300;400;500;600;700&display=swap');
        .variant-editorial { font-family: 'Public Sans', sans-serif; background-color: #FAFAFA; color: #09090B; }
        .variant-editorial .font-editorial { font-family: 'Libre Bodoni', serif; }
      `}</style>
      <div className="variant-editorial p-4 sm:p-8 max-w-[1440px] mx-auto">
        
        {/* Editorial Text-based Filter */}
        <form onSubmit={applyFilters} className="mb-24 max-w-5xl border-b-4 border-[#18181B] pb-16 pt-8">
          <p className="text-[#EC4899] font-bold tracking-[0.2em] uppercase text-sm mb-6">Mục lục bất động sản</p>
          <h3 className="font-editorial text-xl md:text-2xl lg:text-3xl font-medium leading-[1.5] text-[#09090B]">
            Tôi đang tìm kiếm{" "}
            <select
              value={type}
              onChange={(event) => { setType(event.target.value); applyFilters(event as any); }}
              className="inline-block cursor-pointer appearance-none border-b-[3px] border-[#18181B] bg-transparent font-bold text-[#18181B] outline-none hover:text-[var(--tenant-color)] hover:border-[var(--tenant-color)] transition-colors pb-1"
            >
              <option value="ALL">bất động sản</option>
              {Object.entries(propertyTypeLabels).map(([value, label]) => (
                <option value={value} key={value}>{label.toLowerCase()}</option>
              ))}
            </select>
            {" "}tại khu vực{" "}
            <select
              value={categoryId}
              onChange={(event) => { setCategoryId(event.target.value); applyFilters(event as any); }}
              className="inline-block cursor-pointer appearance-none border-b-[3px] border-[#18181B] bg-transparent font-bold text-[#18181B] outline-none hover:text-[var(--tenant-color)] hover:border-[var(--tenant-color)] transition-colors pb-1"
            >
              <option value="">(chọn tất cả)</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>{category.name}</option>
              ))}
            </select>
            , được sắp xếp ưu tiên hiển thị theo{" "}
            <select
              value={sort}
              onChange={(event) => { setSort(event.target.value); applyFilters(event as any); }}
              className="inline-block cursor-pointer appearance-none border-b-[3px] border-[#18181B] bg-transparent font-bold text-[#18181B] outline-none hover:text-[var(--tenant-color)] hover:border-[var(--tenant-color)] transition-colors pb-1"
            >
              <option value="newest">tin mới nhất.</option>
              <option value="price_asc">giá tăng dần.</option>
              <option value="price_desc">giá giảm dần.</option>
            </select>
          </h3>
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:max-w-xl">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hoặc nhập từ khóa tự do..."
              className="w-full rounded-none border border-[#18181B] bg-transparent px-5 py-4 text-sm focus:border-[var(--tenant-color)] focus:ring-1 focus:ring-[var(--tenant-color)] outline-none font-medium placeholder-[#3F3F46]"
            />
            <button type="submit" className="w-full sm:w-auto bg-[#18181B] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#FAFAFA] hover:bg-[var(--tenant-color)] transition-colors shrink-0">
              Khám phá
            </button>
          </div>
        </form>

        {posts.length > 0 ? (
          <div className="grid items-start gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map(renderCard)}
          </div>
        ) : (
          <div className="py-32 text-center border-y border-[#3F3F46]">
            <X className="mx-auto text-[#3F3F46] mb-6" size={64} />
            <h3 className="font-editorial text-4xl text-[#09090B]">Không có ấn bản phù hợp</h3>
            <p className="mt-4 text-[#3F3F46] font-medium tracking-wide">Hãy thử thay đổi tiêu chí tìm kiếm ở câu văn phía trên.</p>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-32 border-t border-[#18181B] pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {page > 1 ? (
              <Link
                href={buildPublicPostsHref(slug, { page: page - 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                className="flex items-center gap-4 font-editorial text-2xl italic hover:text-[var(--tenant-color)]"
              >
                <ArrowLeft size={32} /> Trang trước
              </Link>
            ) : (
              <span className="flex items-center gap-4 font-editorial text-2xl italic text-[#3F3F46] opacity-30">
                <ArrowLeft size={32} /> Trang trước
              </span>
            )}
            
            <div className="flex items-center justify-center font-bold tracking-[0.2em] text-[#09090B]">
              {page} / {totalPages}
            </div>

            {page < totalPages ? (
              <Link
                href={buildPublicPostsHref(slug, { page: page + 1, q: initialQuery, type: initialType as any, categoryId: initialCategoryId, sort: initialSort as any, themePreview })}
                className="flex items-center gap-4 font-editorial text-2xl italic hover:text-[var(--tenant-color)]"
              >
                Trang kế <ArrowRight size={32} />
              </Link>
            ) : (
              <span className="flex items-center gap-4 font-editorial text-2xl italic text-[#3F3F46] opacity-30">
                Trang kế <ArrowRight size={32} />
              </span>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
