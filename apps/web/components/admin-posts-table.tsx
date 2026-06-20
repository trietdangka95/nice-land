"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { formatPrice, propertyTypeLabels } from "@/lib/format";
import type { PropertyPost } from "@/lib/types";

export function AdminPostsTable({ posts, slug }: { posts: PropertyPost[]; slug: string }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase())),
    [posts, query],
  );

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Nội dung website</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Quản lý tin đăng</h1>
          <p className="mt-2 text-sm text-ink/50">{posts.length} tin trong website này</p>
        </div>
        <Link href={`/${slug}/admin/posts/create`} className="button-primary">
          <Plus size={17} />
          Đăng tin mới
        </Link>
      </div>

      <section className="mt-8 border border-ink/10 bg-white">
        <div className="flex flex-col gap-3 border-b border-ink/10 p-4 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Tìm tin đăng</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full bg-[#f4f5f2] pl-11 pr-4 text-sm"
              placeholder="Tìm theo tiêu đề..."
            />
          </label>
          <select className="h-11 border border-ink/10 bg-white px-4 text-sm font-semibold" aria-label="Lọc trạng thái">
            <option>Tất cả trạng thái</option>
            <option>Đang đăng</option>
            <option>Bản nháp</option>
            <option>Đã bán</option>
          </select>
          <select className="h-11 border border-ink/10 bg-white px-4 text-sm font-semibold" aria-label="Lọc loại hình">
            <option>Tất cả loại hình</option>
            <option>Nhà ở</option>
            <option>Căn hộ</option>
            <option>Đất</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-[#f8f8f5] text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
              <tr>
                <th className="px-5 py-4">Bất động sản</th>
                <th className="px-5 py-4">Loại hình</th>
                <th className="px-5 py-4">Mức giá</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Ngày tạo</th>
                <th className="px-5 py-4"><span className="sr-only">Thao tác</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {visible.map((post) => (
                <tr key={post.id} className="hover:bg-[#fafaf7]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden bg-sand">
                        <Image src={post.images[0]} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="max-w-xs">
                        <p className="truncate text-sm font-bold">{post.title}</p>
                        <p className="mt-1 text-xs text-ink/40">{post.area} m² · {post.district}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink/60">{propertyTypeLabels[post.type]}</td>
                  <td className="px-5 py-4 text-sm font-bold">{formatPrice(post.price, post.type)}</td>
                  <td className="px-5 py-4">
                    <StatusPill tone={post.status === "PUBLISHED" ? "green" : post.status === "SOLD" ? "gold" : "gray"}>
                      {post.status === "PUBLISHED" ? "Đang đăng" : post.status === "SOLD" ? "Đã bán" : post.status}
                    </StatusPill>
                  </td>
                  <td className="px-5 py-4 text-xs text-ink/45">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-5 py-4">
                    <button className="grid size-9 place-items-center hover:bg-cream" aria-label={`Thao tác với ${post.title}`}>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
