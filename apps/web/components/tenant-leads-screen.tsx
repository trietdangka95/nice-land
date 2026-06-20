"use client";

import { useEffect, useMemo, useState } from "react";
import type { TenantLead } from "@datcuatoi/contracts";
import { createTenantApi } from "@/lib/api";
import { StatusPill } from "@/components/status-pill";

export function TenantLeadsScreen({ slug }: { slug: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [leads, setLeads] = useState<TenantLead[]>([]);
  const [error, setError] = useState("");
  const load = () => client.listTenantLeads().then(setLeads).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, [client]);
  async function update(lead: TenantLead, status: "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED") {
    const notes = status === lead.status ? lead.notes : window.prompt("Ghi chú xử lý:", lead.notes ?? "") ?? lead.notes;
    await client.updateTenantLead(lead.id, { status, notes });
    await load();
  }
  return <>
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Khách hàng tiềm năng</p>
    <h1 className="mt-2 font-display text-4xl font-medium">Lead từ website</h1>
    <p className="mt-2 text-sm text-ink/50">Yêu cầu tư vấn, cuộc gọi và tương tác theo từng tin đăng.</p>
    {error && <p className="mt-5 text-sm text-red-700" role="alert">{error}</p>}
    <div className="mt-8 space-y-4">{leads.length === 0 ? <p className="border border-ink/10 bg-white p-8 text-center text-sm text-ink/45">Chưa có lead nào.</p> : leads.map((lead) => <article key={lead.id} className="grid gap-4 border border-ink/10 bg-white p-5 lg:grid-cols-[1fr_1.2fr_180px] lg:items-center"><div><strong className="font-display text-xl">{lead.name}</strong><p className="mt-1 text-sm">{lead.phone} {lead.email ? `· ${lead.email}` : ""}</p><p className="mt-2 text-xs text-ink/45">{new Date(lead.createdAt).toLocaleString("vi-VN")} · {lead.source}</p></div><div><p className="text-sm font-bold">{lead.postTitle ?? "Liên hệ chung"}</p><p className="mt-2 text-sm text-ink/55">{lead.message || "Không có lời nhắn"}</p>{lead.notes && <p className="mt-2 text-xs text-moss">Ghi chú: {lead.notes}</p>}</div><div><StatusPill tone={lead.status === "DONE" ? "green" : lead.status === "REJECTED" ? "red" : "gold"}>{lead.status}</StatusPill><select value={lead.status} onChange={(e) => void update(lead, e.target.value as "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED")} className="mt-3 h-10 w-full border border-ink/15 px-3 text-xs font-bold"><option value="NEW">Mới</option><option value="IN_PROGRESS">Đang xử lý</option><option value="DONE">Hoàn tất</option><option value="REJECTED">Từ chối</option></select></div></article>)}</div>
  </>;
}
