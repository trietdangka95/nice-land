"use client";

import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import type { SuperAdminContact, SuperAdminRenewalRequest } from "@nice-land/contracts";
import { api } from "@/lib/api";
import { StatusPill } from "@/components/status-pill";

export function SuperAdminRequestsScreen() {
  const [contacts, setContacts] = useState<SuperAdminContact[]>([]);
  const [renewals, setRenewals] = useState<SuperAdminRenewalRequest[]>([]);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const [contactItems, renewalItems] = await Promise.all([api.listSuperAdminContacts(), api.listSuperAdminRenewals()]);
      setContacts(contactItems); setRenewals(renewalItems);
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể tải yêu cầu."); }
  };
  useEffect(() => { void load(); }, []);
  async function resolve(item: SuperAdminRenewalRequest, status: "APPROVED" | "REJECTED" | "IN_PROGRESS") {
    const note = window.prompt("Ghi chú xử lý (không bắt buộc):") ?? "";
    await api.resolveSuperAdminRenewal(item.id, { status, adminNote: note || null });
    await load();
  }
  async function updateContact(item: SuperAdminContact, status: "IN_PROGRESS" | "DONE" | "REJECTED") {
    await api.updateSuperAdminContactStatus(item.id, { status });
    await load();
  }
  return <>
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Vận hành yêu cầu</p><h1 className="mt-2 font-display text-4xl font-medium">Liên hệ & gia hạn</h1>
    {error && <p className="mt-5 text-sm text-red-700" role="alert">{error}</p>}
    <section className="mt-8"><h2 className="font-display text-2xl">Yêu cầu gia hạn</h2><div className="mt-4 space-y-4">{renewals.length === 0 ? <p className="border border-ink/10 bg-white p-6 text-sm text-ink/45">Chưa có yêu cầu gia hạn.</p> : renewals.map((item) => <article key={item.id} className="grid gap-4 border border-ink/10 bg-white p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-center"><div><strong className="font-display text-xl">{item.site.name}</strong><p className="mt-1 text-xs text-ink/45">{item.requestedBy.fullName ?? item.requestedBy.username} · {new Date(item.requestedAt).toLocaleDateString("vi-VN")}</p></div><div><StatusPill tone={item.status === "APPROVED" ? "green" : item.status === "REJECTED" ? "red" : "gold"}>{item.status}</StatusPill><p className="mt-2 text-sm text-ink/55">{item.plan?.name ?? "Gói hiện tại"} — {item.note || "Không có ghi chú"}</p></div><div className="flex flex-wrap gap-2">{["NEW","IN_PROGRESS"].includes(item.status) && <><button onClick={() => void resolve(item, "IN_PROGRESS")} className="button-secondary">Đang xử lý</button><button onClick={() => void resolve(item, "APPROVED")} className="button-primary">Duyệt</button><button onClick={() => void resolve(item, "REJECTED")} className="border border-red-200 px-4 text-sm font-bold text-red-700">Từ chối</button></>}</div></article>)}</div></section>
    <section className="mt-10"><h2 className="font-display text-2xl">Liên hệ từ landing page</h2><div className="mt-4 space-y-4">{contacts.map((item) => <article key={item.id} className="grid gap-5 border border-ink/10 bg-white p-5 md:grid-cols-[1fr_1fr_1.5fr_auto] md:items-center"><div><strong className="font-display text-xl">{item.name}</strong><div className="mt-2"><StatusPill tone={item.status === "NEW" ? "gold" : "gray"}>{item.status}</StatusPill></div></div><div className="space-y-2 text-xs text-ink/55"><p className="flex gap-2"><Phone size={14} />{item.phone}</p>{item.email && <p className="flex gap-2"><Mail size={14} />{item.email}</p>}</div><p className="text-sm leading-6 text-ink/60">{item.message || "Không có nội dung"}</p><select value={item.status} onChange={(e) => void updateContact(item, e.target.value as "IN_PROGRESS" | "DONE" | "REJECTED")} className="h-10 border border-ink/10 px-3 text-xs font-bold"><option value="NEW" disabled>Mới</option><option value="IN_PROGRESS">Đang xử lý</option><option value="DONE">Hoàn tất</option><option value="REJECTED">Từ chối</option></select></article>)}</div></section>
  </>;
}
