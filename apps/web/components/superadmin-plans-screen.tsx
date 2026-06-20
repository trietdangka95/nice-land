"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { SubscriptionPlan, SubscriptionPlanInput } from "@nice-land/contracts";
import { api } from "@/lib/api";

const empty: SubscriptionPlanInput = { name: "", code: "", maxPosts: 30, maxImagesPerPost: 10, price: 0, durationDays: 30, isActive: true };

export function SuperAdminPlansScreen() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [form, setForm] = useState<SubscriptionPlanInput>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const load = () => api.listSubscriptionPlans().then(setPlans).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);

  function edit(plan: SubscriptionPlan) {
    setEditingId(plan.id); setForm({ name: plan.name, code: plan.code, maxPosts: plan.maxPosts, maxImagesPerPost: plan.maxImagesPerPost, price: plan.price, durationDays: plan.durationDays, isActive: plan.isActive }); setOpen(true);
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setError("");
    try {
      if (editingId) await api.updateSubscriptionPlan(editingId, form);
      else await api.createSubscriptionPlan(form);
      setOpen(false); setEditingId(null); setForm(empty); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Không thể lưu gói."); }
  }
  async function remove(plan: SubscriptionPlan) {
    if (!window.confirm(`Xóa gói ${plan.name}?`)) return;
    try { await api.deleteSubscriptionPlan(plan.id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể xóa gói."); }
  }
  const number = (key: keyof SubscriptionPlanInput, value: string) => setForm((current) => ({ ...current, [key]: Number(value) }));
  return <>
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Thương mại</p><h1 className="mt-2 font-display text-4xl font-medium">Gói dịch vụ</h1><p className="mt-2 text-sm text-ink/50">Thay đổi gói chỉ áp dụng khi tenant được gán hoặc gia hạn.</p></div><button onClick={() => { setOpen(true); setEditingId(null); setForm(empty); }} className="button-primary"><Plus size={17} /> Thêm gói mới</button></div>
    {error && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
    {open && <form onSubmit={save} className="mt-6 grid gap-4 border border-ink/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
      <Input label="Tên gói" value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><Input label="Mã gói" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} />
      <Input label="Giá" type="number" value={String(form.price)} onChange={(v) => number("price", v)} /><Input label="Chu kỳ (ngày)" type="number" value={String(form.durationDays)} onChange={(v) => number("durationDays", v)} />
      <Input label="Số tin tối đa" type="number" value={String(form.maxPosts)} onChange={(v) => number("maxPosts", v)} /><Input label="Ảnh mỗi tin" type="number" value={String(form.maxImagesPerPost)} onChange={(v) => number("maxImagesPerPost", v)} />
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Đang bán</label>
      <div className="flex gap-2"><button className="button-primary flex-1">Lưu</button><button type="button" onClick={() => setOpen(false)} className="button-secondary">Hủy</button></div>
    </form>}
    <div className="mt-8 grid gap-5 lg:grid-cols-3">{plans.map((plan) => <article key={plan.id} className="border border-ink/10 bg-white p-6"><div className="flex justify-between gap-4"><div><h2 className="font-display text-3xl">{plan.name}</h2><p className="mt-1 text-xs text-ink/40">{plan.code} · {plan.siteCount} website</p></div><span className={`text-xs font-bold ${plan.isActive ? "text-emerald-700" : "text-red-700"}`}>{plan.isActive ? "Đang bán" : "Đã ẩn"}</span></div><p className="mt-4 text-3xl font-extrabold text-moss">{plan.price.toLocaleString("vi-VN")} đ</p><ul className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm"><li>{plan.maxPosts.toLocaleString("vi-VN")} tin đăng</li><li>{plan.maxImagesPerPost} ảnh mỗi tin</li><li>Chu kỳ {plan.durationDays} ngày</li></ul><div className="mt-6 flex gap-2"><button onClick={() => edit(plan)} className="button-secondary flex-1"><Pencil size={15} /> Sửa</button><button onClick={() => void remove(plan)} disabled={plan.siteCount > 0} className="grid size-11 place-items-center border border-ink/10 text-red-700 disabled:opacity-30" aria-label={`Xóa ${plan.name}`}><Trash2 size={16} /></button></div></article>)}</div>
  </>;
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="grid gap-2 text-sm font-bold">{label}<input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 border border-ink/15 px-3 font-normal" /></label>;
}
