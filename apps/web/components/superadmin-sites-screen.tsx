"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, KeyRound, Pencil, Plus, Search } from "lucide-react";
import type { SuperAdminSite } from "@datcuatoi/contracts";
import { api } from "@/lib/api";
import { StatusPill } from "@/components/status-pill";

export function SuperAdminSitesScreen() {
  const [items, setItems] = useState<SuperAdminSite[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.listSuperAdminSites({
        q: query,
        active: active === "" ? undefined : active === "true",
        subscriptionStatus: status === "" ? undefined : status as SuperAdminSite["subscriptionStatus"],
        page,
        limit: 20,
      });
      setItems(result.items);
      setTotalPages(result.totalPages);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể tải website.");
    } finally {
      setLoading(false);
    }
  }, [active, page, query, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function toggle(site: SuperAdminSite) {
    await api.setSuperAdminSiteActive(site.id, { isActive: !site.isActive });
    setItems((current) => current.map((item) => item.id === site.id ? { ...item, isActive: !item.isActive } : item));
  }

  async function resetPassword(site: SuperAdminSite) {
    if (!window.confirm(`Tạo mật khẩu tạm mới cho ${site.name}? Các phiên cũ sẽ bị đăng xuất.`)) return;
    const result = await api.resetSuperAdminSitePassword(site.id);
    setTemporaryPassword(result.temporaryPassword);
  }

  async function toggleAdmin(site: SuperAdminSite) {
    if (!site.admin) return;
    await api.setSuperAdminAdminActive(site.id, { isActive: !site.admin.isActive });
    setItems((current) => current.map((item) => item.id === site.id && item.admin ? { ...item, admin: { ...item.admin, isActive: !item.admin.isActive } } : item));
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Multi-tenant</p><h1 className="mt-2 font-display text-4xl font-medium">Website khách hàng</h1><p className="mt-2 text-sm text-ink/50">Quản lý tenant, quota và tài khoản admin.</p></div>
        <Link href="/superadmin/sites/create" className="button-primary"><Plus size={17} /> Tạo website mới</Link>
      </div>
      {temporaryPassword && <div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm" role="status"><strong>Mật khẩu tạm — chỉ hiển thị lần này:</strong> <code className="ml-2 select-all">{temporaryPassword}</code><button className="ml-4 font-bold text-moss" onClick={() => setTemporaryPassword("")}>Đóng</button></div>}
      <section className="mt-8 border border-ink/10 bg-white">
        <div className="grid gap-3 border-b border-ink/10 p-4 md:grid-cols-[1fr_180px_200px]"><label className="relative block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={17} /><span className="sr-only">Tìm website</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-11 w-full bg-[#f4f5f2] pl-11 pr-4 text-sm" placeholder="Tìm tên hoặc subdomain..." /></label><select value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }} className="h-11 border border-ink/10 px-3 text-sm"><option value="">Mọi hoạt động</option><option value="true">Đang hoạt động</option><option value="false">Tạm ngưng</option></select><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-11 border border-ink/10 px-3 text-sm"><option value="">Mọi subscription</option>{["TRIAL","ACTIVE","GRACE_PERIOD","EXPIRED","SUSPENDED"].map((value) => <option key={value}>{value}</option>)}</select></div>
        {error && <p className="p-4 text-sm text-red-700" role="alert">{error}</p>}
        {loading ? <div className="h-52 animate-pulse bg-ink/5" /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-[#f8f8f5] text-[10px] uppercase tracking-widest text-ink/40"><tr><th className="px-5 py-4">Website</th><th className="px-5 py-4">Admin</th><th className="px-5 py-4">Gói</th><th className="px-5 py-4">Sử dụng</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4">Thao tác</th></tr></thead>
          <tbody className="divide-y divide-ink/10">{items.map((site) => <tr key={site.id}>
            <td className="px-5 py-4"><strong className="block text-sm">{site.name}</strong><a href={`/${site.slug}`} target="_blank" className="mt-1 inline-flex items-center gap-1 text-xs text-moss">{site.slug}.datcuatoi.vn <ExternalLink size={11} /></a></td>
            <td className="px-5 py-4 text-xs"><strong>{site.admin?.username ?? "Chưa có"}</strong><p className="mt-1 text-ink/45">{site.admin ? (site.admin.isActive ? "Tài khoản hoạt động" : "Tài khoản bị khóa") : "Chưa có tài khoản"}</p></td>
            <td className="px-5 py-4 text-sm">{site.plan?.name ?? "Chưa gán"}</td>
            <td className="px-5 py-4 text-xs text-ink/55">{site.usage.posts} tin · {site.usage.images} ảnh</td>
            <td className="px-5 py-4"><StatusPill tone={site.isActive ? "green" : "red"}>{site.isActive ? site.subscriptionStatus : "Tạm ngưng"}</StatusPill></td>
            <td className="px-5 py-4"><div className="flex gap-2"><Link href={`/superadmin/sites/${site.id}`} className="grid size-9 place-items-center border border-ink/10" aria-label={`Sửa ${site.name}`}><Pencil size={15} /></Link><button onClick={() => void resetPassword(site)} className="grid size-9 place-items-center border border-ink/10" aria-label={`Reset mật khẩu ${site.name}`}><KeyRound size={15} /></button><button onClick={() => void toggleAdmin(site)} className="border border-ink/10 px-3 text-xs font-bold">{site.admin?.isActive ? "Khóa admin" : "Mở admin"}</button><button onClick={() => void toggle(site)} className="border border-ink/10 px-3 text-xs font-bold">{site.isActive ? "Tạm ngưng" : "Kích hoạt"}</button></div></td>
          </tr>)}</tbody></table></div>
        )}
        <div className="flex items-center justify-between border-t border-ink/10 p-4 text-sm"><span>Trang {page} / {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="button-secondary disabled:opacity-40">Trước</button><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="button-secondary disabled:opacity-40">Sau</button></div></div>
      </section>
    </>
  );
}
