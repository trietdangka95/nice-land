"use client";

import { useEffect, useMemo, useState } from "react";
import type { TenantLead } from "@nice-land/contracts";
import { createTenantApi } from "@/lib/api";
import { StatusPill } from "@/components/shared/status-pill";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";

export function TenantLeadsScreen({ slug }: { slug: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const toast = useToast();
  const [leads, setLeads] = useState<TenantLead[]>([]);
  const load = () => client.listTenantLeads().then(setLeads).catch((e) => toast.error(getErrorMessage(e, "Không thể tải lead."), "Không thể tải lead"));
  useEffect(() => { void load(); }, [client]);
  async function update(lead: TenantLead, status: "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED") {
    const notes = status === lead.status ? lead.notes : window.prompt("Ghi chú xử lý:", lead.notes ?? "") ?? lead.notes;
    try {
      await client.updateTenantLead(lead.id, { status, notes });
      await load();
      toast.success("Lead đã được cập nhật.", "Đã cập nhật");
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể cập nhật lead."), "Không thể cập nhật");
    }
  }
  return <>
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Khách hàng tiềm năng</p>
    <h1 className="mt-2 font-display text-4xl font-medium">Lead từ website</h1>
    <p className="mt-2 text-sm text-ink/50">Yêu cầu tư vấn, cuộc gọi và tương tác theo từng tin đăng.</p>
    <div className="mt-8 space-y-4">{leads.length === 0 ? <p className="glass-panel rounded-3xl p-8 text-center text-sm font-medium text-ink/50">Chưa có lead nào.</p> : leads.map((lead) => <article key={lead.id} className="grid gap-6 glass-panel rounded-3xl p-6 lg:p-8 lg:grid-cols-[1fr_1.2fr_180px] lg:items-center hover:bg-white/40 transition-colors"><div><strong className="font-display text-xl">{lead.name}</strong><p className="mt-2 text-sm font-medium">{lead.phone} {lead.email ? `· ${lead.email}` : ""}</p><p className="mt-2 text-xs font-medium text-ink/50">{new Date(lead.createdAt).toLocaleString("vi-VN")} · {lead.source}</p></div><div><p className="text-sm font-bold">{lead.postTitle ?? "Liên hệ chung"}</p><p className="mt-2 text-sm font-medium text-ink/60">{lead.message || "Không có lời nhắn"}</p>{lead.notes && <p className="mt-2 text-xs font-bold text-moss bg-moss/5 rounded-lg px-3 py-2 inline-block">Ghi chú: {lead.notes}</p>}</div><div><StatusPill tone={lead.status === "DONE" ? "green" : lead.status === "REJECTED" ? "red" : "gold"}>{lead.status}</StatusPill><select value={lead.status} onChange={(e) => void update(lead, e.target.value as "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED")} className="mt-4 h-10 w-full rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 text-xs font-bold focus:bg-white transition-colors"><option value="NEW">Mới</option><option value="IN_PROGRESS">Đang xử lý</option><option value="DONE">Hoàn tất</option><option value="REJECTED">Từ chối</option></select></div></article>)}</div>
  </>;
}
