"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, KeyRound, Pencil, Plus, Search, Loader2 } from "lucide-react";
import type { SuperAdminSite } from "@nice-land/contracts";
import { api } from "@/lib/api";
import { revalidateTenant } from "@/app/actions";
import { StatusPill } from "@/components/shared/status-pill";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "nice-land.id.vn";

function getStatusDisplay(site: SuperAdminSite) {
  if (!site.isActive) return { label: "Tạm ngưng", tone: "gray" as const };
  switch (site.subscriptionStatus) {
    case "ACTIVE": return { label: "Hoạt động", tone: "green" as const };
    case "EXPIRED": return { label: "Hết hạn", tone: "red" as const };
    case "TRIAL": return { label: "Dùng thử", tone: "gold" as const };
    case "GRACE_PERIOD": return { label: "Ân hạn", tone: "gold" as const };
    case "SUSPENDED": return { label: "Khóa", tone: "red" as const };
    default: return { label: site.subscriptionStatus, tone: "gray" as const };
  }
}

export function SuperAdminSitesScreen() {
  const toast = useToast();
  const [items, setItems] = useState<SuperAdminSite[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
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
      toast.error(
        getErrorMessage(requestError, "Không thể tải website."),
        "Không thể tải website",
      );
    } finally {
      setLoading(false);
    }
  }, [active, page, query, status, toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function toggle(site: SuperAdminSite) {
    setActionId(`toggle-${site.id}`);
    try {
      await api.setSuperAdminSiteActive(site.id, { isActive: !site.isActive });
      await revalidateTenant(site.slug);
      setItems((current) => current.map((item) => item.id === site.id ? { ...item, isActive: !item.isActive } : item));
      toast.success(
        site.isActive ? "Website đã được tạm ngưng." : "Website đã được kích hoạt.",
        "Đã cập nhật website",
      );
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể cập nhật website."),
        "Không thể cập nhật website",
      );
    } finally {
      setActionId(null);
    }
  }

  async function resetPassword(site: SuperAdminSite) {
    if (!window.confirm(`Tạo mật khẩu tạm mới cho ${site.name}? Các phiên cũ sẽ bị đăng xuất.`)) return;
    setActionId(`reset-${site.id}`);
    try {
      const result = await api.resetSuperAdminSitePassword(site.id);
      setTemporaryPassword(result.temporaryPassword);
      toast.warning(
        "Mật khẩu tạm chỉ hiển thị một lần. Hãy lưu lại ngay.",
        "Đã tạo mật khẩu tạm",
      );
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể reset mật khẩu."),
        "Không thể reset mật khẩu",
      );
    } finally {
      setActionId(null);
    }
  }

  async function toggleAdmin(site: SuperAdminSite) {
    if (!site.admin) return;
    setActionId(`admin-${site.id}`);
    try {
      await api.setSuperAdminAdminActive(site.id, { isActive: !site.admin.isActive });
      setItems((current) => current.map((item) => item.id === site.id && item.admin ? { ...item, admin: { ...item.admin, isActive: !item.admin.isActive } } : item));
      toast.success(
        site.admin.isActive ? "Tài khoản admin đã bị khóa." : "Tài khoản admin đã được mở.",
        "Đã cập nhật admin",
      );
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể cập nhật admin."),
        "Không thể cập nhật admin",
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Multi-tenant</p><h1 className="mt-2 font-display text-4xl font-medium">Website khách hàng</h1><p className="mt-2 text-sm text-ink/50">Quản lý tenant, quota và tài khoản admin.</p></div>
        <Link href="/superadmin/sites/create" className="button-primary"><Plus size={17} /> Tạo website mới</Link>
      </div>
      {temporaryPassword && <div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm" role="status"><strong>Mật khẩu tạm — chỉ hiển thị lần này:</strong> <code className="ml-2 select-all">{temporaryPassword}</code><button className="ml-4 font-bold text-moss" onClick={() => setTemporaryPassword("")}>Đóng</button></div>}
      <section className="mt-8 glass-panel rounded-3xl overflow-hidden">
        <div className="grid gap-3 border-b border-ink/5 p-6 md:grid-cols-[1fr_180px_200px]">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={17} />
            <span className="sr-only">Tìm website</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-11 w-full rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm pl-11 pr-4 text-sm focus:bg-white" placeholder="Tìm tên hoặc subdomain..." />
          </label>
          <select value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }} className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-3 text-sm focus:bg-white">
            <option value="">Mọi hoạt động</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Tạm ngưng</option>
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-3 text-sm focus:bg-white">
            <option value="">Mọi subscription</option>
            {["TRIAL","ACTIVE","GRACE_PERIOD","EXPIRED","SUSPENDED"].map((value) => <option key={value}>{value}</option>)}
          </select>
        </div>
        {loading ? <div className="h-52 animate-pulse bg-white/20" /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-ink/5 text-[10px] font-bold uppercase tracking-widest text-ink/50"><tr><th className="px-6 py-4">Website</th><th className="px-6 py-4">Admin</th><th className="px-6 py-4">Gói</th><th className="px-6 py-4">Sử dụng</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4">Thao tác</th></tr></thead>
          <tbody className="divide-y divide-ink/5">{items.map((site) => <tr key={site.id} className="hover:bg-white/40 transition-colors">
            <td className="px-6 py-4"><strong className="block text-sm font-semibold">{site.name}</strong><a href={`https://${site.slug}.${rootDomain}`} target="_blank" className="mt-1 inline-flex items-center gap-1 text-xs text-moss">{site.slug}.{rootDomain} <ExternalLink size={11} /></a></td>
            <td className="px-6 py-4 text-xs"><strong>{site.admin?.username ?? "Chưa có"}</strong><p className="mt-1 text-ink/50 font-medium">{site.admin ? (site.admin.isActive ? "Tài khoản hoạt động" : "Tài khoản bị khóa") : "Chưa có tài khoản"}</p></td>
            <td className="px-6 py-4 text-sm font-medium">{site.plan?.name ?? "Chưa gán"}</td>
            <td className="px-6 py-4 text-xs font-medium text-ink/60">{site.usage.posts} tin · {site.usage.images} ảnh</td>
            <td className="px-6 py-4">
              {(() => {
                const display = getStatusDisplay(site);
                return <StatusPill tone={display.tone}>{display.label}</StatusPill>;
              })()}
            </td>
            <td className="px-6 py-4"><div className="flex gap-2"><Link href={`/superadmin/sites/${site.id}`} className="grid size-9 place-items-center rounded-lg bg-white shadow-sm border border-ink/5 hover:border-moss/30 hover:text-moss transition-colors" aria-label={`Sửa ${site.name}`}><Pencil size={15} /></Link><button onClick={() => void resetPassword(site)} disabled={actionId === `reset-${site.id}`} className="grid size-9 place-items-center rounded-lg bg-white shadow-sm border border-ink/5 hover:border-moss/30 hover:text-moss transition-colors disabled:opacity-50 disabled:cursor-wait" aria-label={`Reset mật khẩu ${site.name}`}>{actionId === `reset-${site.id}` ? <Loader2 className="animate-spin" size={15} /> : <KeyRound size={15} />}</button><button onClick={() => void toggleAdmin(site)} disabled={actionId === `admin-${site.id}`} className="flex items-center justify-center gap-1 rounded-lg bg-white shadow-sm border border-ink/5 hover:bg-ink/5 transition-colors px-3 text-xs font-bold disabled:opacity-50 disabled:cursor-wait">{actionId === `admin-${site.id}` && <Loader2 className="animate-spin" size={12} />} {site.admin?.isActive ? "Khóa admin" : "Mở admin"}</button><button onClick={() => void toggle(site)} disabled={actionId === `toggle-${site.id}`} className="flex items-center justify-center gap-1 rounded-lg bg-white shadow-sm border border-ink/5 hover:bg-ink/5 transition-colors px-3 text-xs font-bold disabled:opacity-50 disabled:cursor-wait">{actionId === `toggle-${site.id}` && <Loader2 className="animate-spin" size={12} />} {site.isActive ? "Tạm ngưng" : "Kích hoạt"}</button></div></td>
          </tr>)}</tbody></table></div>
        )}
        <div className="flex items-center justify-between border-t border-ink/5 p-6 text-sm font-medium text-ink/60"><span>Trang {page} / {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="button-secondary !py-2 !px-4 !min-h-0 disabled:opacity-40">Trước</button><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="button-secondary !py-2 !px-4 !min-h-0 disabled:opacity-40">Sau</button></div></div>
      </section>
    </>
  );
}
