"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Loader2 } from "lucide-react";
import type { SuperAdminContact, SuperAdminRenewalRequest } from "@nice-land/contracts";
import { api } from "@/lib/api";
import { StatusPill } from "@/components/shared/status-pill";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";
import { getPublicThemePreferenceLabel } from "@/lib/public-themes";
import { useSearchParams } from "next/navigation";

export function SuperAdminRequestsScreen() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState<SuperAdminContact[]>([]);
  const [renewals, setRenewals] = useState<SuperAdminRenewalRequest[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [updatingContactId, setUpdatingContactId] = useState<string | null>(null);
  const highlightContactId = searchParams.get("highlightContact");
  const highlightRenewalId = searchParams.get("highlightRenewal");
  const load = async () => {
    try {
      const [contactItems, renewalItems] = await Promise.all([api.listSuperAdminContacts(), api.listSuperAdminRenewals()]);
      setContacts(contactItems); setRenewals(renewalItems);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể tải yêu cầu."), "Không thể tải yêu cầu");
    }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    const targetId = highlightRenewalId
      ? `renewal-${highlightRenewalId}`
      : highlightContactId
        ? `contact-${highlightContactId}`
        : null;
    if (!targetId) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [highlightContactId, highlightRenewalId, contacts, renewals]);
  async function resolve(item: SuperAdminRenewalRequest, status: "APPROVED" | "REJECTED" | "IN_PROGRESS") {
    const note = window.prompt("Ghi chú xử lý (không bắt buộc):") ?? "";
    setResolvingId(item.id);
    try {
      await api.resolveSuperAdminRenewal(item.id, { status, adminNote: note || null });
      await load();
      toast.success("Yêu cầu gia hạn đã được cập nhật.", "Đã cập nhật");
    } catch (e) {
      toast.error(
        getErrorMessage(e, "Không thể cập nhật yêu cầu gia hạn."),
        "Không thể cập nhật",
      );
    } finally {
      setResolvingId(null);
    }
  }
  async function updateContact(item: SuperAdminContact, status: "IN_PROGRESS" | "DONE" | "REJECTED") {
    setUpdatingContactId(item.id);
    try {
      await api.updateSuperAdminContactStatus(item.id, { status });
      await load();
      toast.success("Trạng thái liên hệ đã được cập nhật.", "Đã cập nhật");
    } catch (e) {
      toast.error(
        getErrorMessage(e, "Không thể cập nhật liên hệ."),
        "Không thể cập nhật",
      );
    } finally {
      setUpdatingContactId(null);
    }
  }
  return <>
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Vận hành yêu cầu</p><h1 className="mt-2 font-display text-4xl font-medium">Liên hệ & gia hạn</h1>
    <section className="mt-8"><h2 className="font-display text-2xl">Yêu cầu gia hạn</h2><div className="mt-6 space-y-4">{renewals.length === 0 ? <p className="glass-panel rounded-3xl p-8 text-sm font-medium text-ink/50 text-center">Chưa có yêu cầu gia hạn.</p> : renewals.map((item) => {
      const highlighted = highlightRenewalId === item.id;
      return <article id={`renewal-${item.id}`} key={item.id} className={`grid gap-4 rounded-3xl p-6 lg:grid-cols-[1fr_1fr_auto] lg:items-center ${highlighted ? "glass-panel ring-2 ring-moss/30 bg-moss/5 scroll-mt-28" : "glass-panel"}`}><div><strong className="font-display text-xl">{item.site.name}</strong><p className="mt-1 text-xs text-ink/50 font-medium">{item.requestedBy.fullName ?? item.requestedBy.username} · {new Date(item.requestedAt).toLocaleDateString("vi-VN")}</p></div><div><StatusPill tone={item.status === "APPROVED" ? "green" : item.status === "REJECTED" ? "red" : "gold"}>{item.status}</StatusPill><p className="mt-2 text-sm text-ink/60 font-medium">{item.plan?.name ?? "Gói hiện tại"} — {item.note || "Không có ghi chú"}</p></div><div className="flex flex-wrap gap-2">{["NEW","IN_PROGRESS"].includes(item.status) && <><button onClick={() => void resolve(item, "IN_PROGRESS")} disabled={resolvingId === item.id} className="button-secondary flex items-center justify-center gap-1 !py-2 !px-4 !min-h-0 text-xs disabled:opacity-60 disabled:cursor-wait">{resolvingId === item.id && <Loader2 className="animate-spin" size={12} />} Đang xử lý</button><button onClick={() => void resolve(item, "APPROVED")} disabled={resolvingId === item.id} className="button-primary flex items-center justify-center gap-1 !py-2 !px-4 !min-h-0 text-xs disabled:opacity-60 disabled:cursor-wait">Duyệt</button><button onClick={() => void resolve(item, "REJECTED")} disabled={resolvingId === item.id} className="flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-white/50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-wait">Từ chối</button></>}</div></article>;
    })}</div></section>
    <section className="mt-12"><h2 className="font-display text-2xl">Liên hệ từ landing page</h2><div className="mt-6 space-y-4">{contacts.map((item) => {
      const highlighted = highlightContactId === item.id;
      return <article id={`contact-${item.id}`} key={item.id} className={`grid gap-5 rounded-3xl p-6 md:grid-cols-[1fr_1fr_1.5fr_auto] md:items-center ${highlighted ? "glass-panel ring-2 ring-moss/30 bg-moss/5 scroll-mt-28" : "glass-panel"}`}><div><strong className="font-display text-xl">{item.name}</strong><div className="mt-3 flex flex-wrap gap-2"><StatusPill tone={item.status === "NEW" ? "gold" : "gray"}>{item.status}</StatusPill><span className="rounded-full border border-moss/10 bg-white/60 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-moss">{getPublicThemePreferenceLabel(item.themePreference)} theme</span></div></div><div className="space-y-3 text-xs text-ink/60 font-medium"><p className="flex items-center gap-2"><Phone size={14} className="text-moss/60" />{item.phone}</p>{item.email && <p className="flex items-center gap-2"><Mail size={14} className="text-moss/60" />{item.email}</p>}</div><p className="text-sm leading-6 text-ink/70 font-medium">{item.message || "Không có nội dung"}</p><select disabled={updatingContactId === item.id} value={item.status} onChange={(e) => void updateContact(item, e.target.value as "IN_PROGRESS" | "DONE" | "REJECTED")} className="h-10 rounded-xl bg-white/50 border border-ink/5 px-4 text-xs font-bold focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-wait"><option value="NEW" disabled>Mới</option><option value="IN_PROGRESS">Đang xử lý</option><option value="DONE">Hoàn tất</option><option value="REJECTED">Từ chối</option></select></article>;
    })}</div></section>
  </>;
}
