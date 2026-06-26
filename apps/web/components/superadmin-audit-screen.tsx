"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import type { AuditLogItem } from "@nice-land/contracts";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/toast-provider";

export function SuperAdminAuditScreen() {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [site, setSite] = useState("");
  const [user, setUser] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => { void api.listAuditLogs().then(setLogs).catch((e) => toast.error(getErrorMessage(e, "Không thể tải nhật ký."), "Không thể tải nhật ký")); }, [toast]);
  const visible = useMemo(() => logs.filter((log) =>
    `${log.action} ${log.site?.name ?? ""} ${log.user?.username ?? ""}`.toLowerCase().includes(query.toLowerCase()) &&
    (!action || log.action.toLowerCase().includes(action.toLowerCase())) &&
    (!site || (log.site?.name ?? "").toLowerCase().includes(site.toLowerCase())) &&
    (!user || (log.user?.username ?? "").toLowerCase().includes(user.toLowerCase())) &&
    (!date || log.createdAt.slice(0, 10) === date)
  ), [action, date, logs, query, site, user]);
  return <>
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Kiểm soát hoạt động</p><h1 className="mt-2 font-display text-4xl font-medium">Nhật ký hệ thống</h1>
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5"><label className="relative block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={17} /><span className="sr-only">Tìm nhật ký</span><input value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 w-full rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm pl-11 pr-4 text-sm focus:bg-white transition-colors" placeholder="Tìm chung..." /></label><input value={action} onChange={(e) => setAction(e.target.value)} className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 text-sm focus:bg-white transition-colors" placeholder="Hành động" /><input value={site} onChange={(e) => setSite(e.target.value)} className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 text-sm focus:bg-white transition-colors" placeholder="Website" /><input value={user} onChange={(e) => setUser(e.target.value)} className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 text-sm focus:bg-white transition-colors" placeholder="Người dùng" /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 text-sm focus:bg-white transition-colors" /></div>
    <section className="mt-6 overflow-hidden glass-panel rounded-3xl"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-ink/5 text-[10px] font-bold uppercase tracking-widest text-ink/50"><tr><th className="px-6 py-4">Hành động</th><th className="px-6 py-4">Website</th><th className="px-6 py-4">Người thực hiện</th><th className="px-6 py-4">Chi tiết</th><th className="px-6 py-4">Thời gian</th></tr></thead><tbody className="divide-y divide-ink/5">{visible.map((log) => <tr key={log.id} className="hover:bg-white/40 transition-colors"><td className="px-6 py-4"><span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-moss"><ShieldCheck size={15} />{log.action}</span></td><td className="px-6 py-4 text-sm font-medium">{log.site?.name ?? "Hệ thống"}</td><td className="px-6 py-4 text-xs font-medium text-ink/60">{log.user?.username ?? "system"}</td><td className="max-w-xs truncate px-6 py-4 font-mono text-xs text-ink/50 font-medium">{log.details ? JSON.stringify(log.details) : "—"}</td><td className="px-6 py-4 text-xs font-medium text-ink/60">{new Date(log.createdAt).toLocaleString("vi-VN")}</td></tr>)}</tbody></table></div></section>
  </>;
}
