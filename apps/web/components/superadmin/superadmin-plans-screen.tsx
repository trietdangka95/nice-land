"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import type { SubscriptionPlan, SubscriptionPlanInput } from "@nice-land/contracts";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";

const empty: SubscriptionPlanInput = { name: "", code: "", maxPosts: 30, maxImagesPerPost: 10, price: 0, durationDays: 30, isActive: true, isPopular: false };

export function SuperAdminPlansScreen() {
  const toast = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [form, setForm] = useState<SubscriptionPlanInput>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const load = () => api.listSubscriptionPlans().then(setPlans).catch((e) => toast.error(getErrorMessage(e, "Không thể tải gói dịch vụ."), "Không thể tải gói"));
  useEffect(() => { void load(); }, []);

  function edit(plan: SubscriptionPlan) {
    setEditingId(plan.id); setForm({ name: plan.name, code: plan.code, maxPosts: plan.maxPosts, maxImagesPerPost: plan.maxImagesPerPost, price: plan.price, durationDays: plan.durationDays, isActive: plan.isActive, isPopular: plan.isPopular }); setOpen(true);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) await api.updateSubscriptionPlan(editingId, form);
      else await api.createSubscriptionPlan(form);
      setOpen(false); setEditingId(null); setForm(empty); await load();
      toast.success("Gói dịch vụ đã được lưu.", "Lưu thành công");
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể lưu gói."), "Không thể lưu gói");
    } finally {
      setSaving(false);
    }
  }
  async function remove(plan: SubscriptionPlan) {
    if (!window.confirm(`Xóa gói ${plan.name}?`)) return;
    setDeletingId(plan.id);
    try {
      await api.deleteSubscriptionPlan(plan.id);
      await load();
      toast.success("Gói dịch vụ đã được xóa.", "Đã xóa gói");
    } catch (e) {
      toast.error(getErrorMessage(e, "Không thể xóa gói."), "Không thể xóa gói");
    } finally {
      setDeletingId(null);
    }
  }
  const number = (key: keyof SubscriptionPlanInput, value: string) => setForm((current) => ({ ...current, [key]: Number(value) }));
  return <>
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Thương mại</p><h1 className="mt-2 font-display text-4xl font-medium">Gói dịch vụ</h1><p className="mt-2 text-sm text-ink/50">Thay đổi gói chỉ áp dụng khi tenant được gán hoặc gia hạn.</p></div><button onClick={() => { setOpen(true); setEditingId(null); setForm(empty); }} className="button-primary"><Plus size={17} /> Thêm gói mới</button></div>
    {open && <form onSubmit={save} className="mt-8 grid gap-4 glass-panel rounded-3xl p-8 sm:grid-cols-2 lg:grid-cols-4">
      <Input label="Tên gói" value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><Input label="Mã gói" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} />
      <Input label="Giá" type="number" value={String(form.price)} onChange={(v) => number("price", v)} /><Input label="Chu kỳ (ngày)" type="number" value={String(form.durationDays)} onChange={(v) => number("durationDays", v)} />
      <Input label="Số tin tối đa" type="number" value={String(form.maxPosts)} onChange={(v) => number("maxPosts", v)} /><Input label="Ảnh mỗi tin" type="number" value={String(form.maxImagesPerPost)} onChange={(v) => number("maxImagesPerPost", v)} />
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-bold text-ink/80"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-moss" /> Đang bán</label>
        <label className="flex items-center gap-2 text-sm font-bold text-ink/80"><input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} className="accent-gold" /> Gói phổ biến</label>
      </div>
      <div className="flex items-end gap-2">
        <button disabled={saving} className="button-primary flex-1 !min-h-10 !py-2 !text-xs disabled:opacity-60 disabled:cursor-wait">
          {saving && <Loader2 className="mr-2 animate-spin" size={15}/>}
          {saving ? "Đang lưu..." : "Lưu gói"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="button-secondary flex-1 !min-h-10 !py-2 !text-xs">
          Hủy bỏ
        </button>
      </div>
    </form>}
    <div className="mt-8 grid gap-6 lg:grid-cols-3 items-stretch">{plans.map((plan) => <article key={plan.id} className="motion-card glass-card rounded-3xl p-8 relative overflow-hidden group flex flex-col h-full"><div className="absolute -right-12 -top-12 w-40 h-40 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all duration-700 pointer-events-none"></div><div className="relative z-10 min-h-[4rem] flex flex-col justify-start"><h2 className="font-display text-3xl font-medium line-clamp-2 w-full">{plan.name}</h2><div className="mt-2 flex items-center justify-between gap-2"><div className="flex items-center gap-2 flex-wrap">{plan.isPopular && <span className="bg-gold px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-ink shadow-sm">Phổ biến</span>}<p className="text-xs text-ink/50 font-medium">{plan.code} · {plan.siteCount} website</p></div><span className={`inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[10px] font-bold uppercase tracking-[0.18em] ${plan.isActive ? "bg-moss/10 text-moss" : "bg-red-50 text-red-700"}`}>{plan.isActive ? "Đang bán" : "Đã ẩn"}</span></div></div><p className="mt-6 text-4xl font-semibold tracking-tight text-gradient drop-shadow-sm relative z-10">{plan.price.toLocaleString("vi-VN")} <span className="text-xl text-ink/50 font-medium">đ</span></p><ul className="mt-6 space-y-3 border-t border-ink/5 pt-6 text-sm font-medium text-ink/70 relative z-10 flex-1"><li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-moss/50"></span> {plan.maxPosts.toLocaleString("vi-VN")} tin đăng</li><li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-moss/50"></span> {plan.maxImagesPerPost} ảnh mỗi tin</li><li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-moss/50"></span> Chu kỳ {plan.durationDays} ngày</li></ul><div className="mt-8 flex gap-2 relative z-10"><button onClick={() => edit(plan)} className="button-secondary flex-1 !py-2 !min-h-10 text-xs"><Pencil size={15} /> Sửa</button><button onClick={() => void remove(plan)} disabled={plan.siteCount > 0 || deletingId === plan.id} title={plan.siteCount > 0 ? "Không thể xóa gói đang được sử dụng" : `Xóa ${plan.name}`} className="grid size-10 place-items-center rounded-xl border border-ink/5 bg-white/50 text-red-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-100 transition-colors" aria-label={`Xóa ${plan.name}`}>{deletingId === plan.id ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}</button></div></article>)}</div>
  </>;
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="grid gap-2 text-sm font-bold text-ink/80">{label}<input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" /></label>;
}
