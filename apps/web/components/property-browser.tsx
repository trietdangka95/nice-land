"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { propertyTypeLabels } from "@/lib/format";
import type { PropertyPost, PropertyType } from "@/lib/types";

export function PropertyBrowser({ posts, slug }: { posts: PropertyPost[]; slug: string }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"ALL" | PropertyType>("ALL");
  const [sort, setSort] = useState("newest");

  const visiblePosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts
      .filter((post) => {
        const matchesQuery =
          !normalized ||
          `${post.title} ${post.address} ${post.district} ${post.province}`
            .toLowerCase()
            .includes(normalized);
        return matchesQuery && (type === "ALL" || post.type === type);
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [posts, query, sort, type]);

  return (
    <div>
      <div className="grid gap-3 border border-ink/10 bg-white p-3 md:grid-cols-[1fr_190px_180px_auto]">
        <label className="relative">
          <span className="sr-only">Tìm kiếm bất động sản</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, khu vực..."
            className="h-12 w-full bg-cream/70 pl-11 pr-4 text-sm"
          />
        </label>
        <label>
          <span className="sr-only">Loại bất động sản</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as "ALL" | PropertyType)}
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
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
          </select>
        </label>
        <button className="flex h-12 items-center justify-center gap-2 bg-[var(--tenant-color)] px-5 text-sm font-bold text-white">
          <SlidersHorizontal size={16} />
          Bộ lọc
        </button>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-sm text-ink/55">
          Tìm thấy <strong className="text-ink">{visiblePosts.length}</strong> bất động sản
        </p>
      </div>

      {visiblePosts.length > 0 ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3" data-reveal-group>
          {visiblePosts.map((post) => <PropertyCard key={post.id} post={post} slug={slug} />)}
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-ink/20 bg-white py-20 text-center">
          <Search className="mx-auto text-ink/25" size={34} />
          <h3 className="mt-4 font-display text-2xl">Chưa tìm thấy bất động sản phù hợp</h3>
          <p className="mt-2 text-sm text-ink/50">Thử thay đổi từ khóa hoặc loại hình đang chọn.</p>
        </div>
      )}
    </div>
  );
}
