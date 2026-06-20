"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, MoreHorizontal, Plus, Search } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import type { Site } from "@/lib/types";

export function SitesTable({ sites }: { sites: Site[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => sites.filter((site) => `${site.name} ${site.slug}`.toLowerCase().includes(query.toLowerCase())),
    [query, sites],
  );

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Multi-tenant</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Website khách hàng</h1>
          <p className="mt-2 text-sm text-ink/50">Quản lý tenant, gói dịch vụ và trạng thái hoạt động.</p>
        </div>
        <Link href="/superadmin/sites/create" className="button-primary"><Plus size={17} /> Tạo website mới</Link>
      </div>
      <section className="mt-8 border border-ink/10 bg-white">
        <div className="flex flex-col gap-3 border-b border-ink/10 p-4 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={17} />
            <span className="sr-only">Tìm website</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full bg-[#f4f5f2] pl-11 pr-4 text-sm" placeholder="Tìm tên hoặc subdomain..." />
          </label>
          <select className="h-11 border border-ink/10 px-4 text-sm font-semibold"><option>Tất cả trạng thái</option><option>Hoạt động</option><option>Tạm ngưng</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#f8f8f5] text-[10px] uppercase tracking-widest text-ink/40">
              <tr><th className="px-5 py-4">Website</th><th className="px-5 py-4">Liên hệ</th><th className="px-5 py-4">Gói</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4">Ngày tạo</th><th className="px-5 py-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {visible.map((site) => (
                <tr key={site.id} className="hover:bg-[#fafaf7]">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center text-xs font-bold text-white" style={{ backgroundColor: site.themeColor }}>{site.logoMark}</span><div><strong className="block text-sm">{site.name}</strong><a href={`/${site.slug}`} className="mt-1 flex items-center gap-1 text-xs text-moss">{site.slug}.nice-land.vn <ExternalLink size={11} /></a></div></div></td>
                  <td className="px-5 py-4"><p className="text-sm">{site.phone}</p><p className="mt-1 text-xs text-ink/40">{site.email}</p></td>
                  <td className="px-5 py-4 text-sm font-semibold">{site.plan}</td>
                  <td className="px-5 py-4"><StatusPill tone={site.isActive ? "green" : "red"}>{site.isActive ? "Hoạt động" : "Tạm ngưng"}</StatusPill></td>
                  <td className="px-5 py-4 text-xs text-ink/45">{new Date(site.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-5 py-4"><button className="grid size-9 place-items-center" aria-label={`Thao tác ${site.name}`}><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
