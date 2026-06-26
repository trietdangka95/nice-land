"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import type { SubscriptionPlan, SubscriptionStatus } from "@nice-land/contracts";
import type { PublicTheme } from "@nice-land/contracts";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { revalidateTenant } from "@/app/actions";
import { PublicThemePicker } from "@/components/public-theme-picker";

export function SuperAdminSiteForm({ siteId }: { siteId?: string }) {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [form, setForm] = useState({
    name: "", slug: "", phone: "", email: "", address: "", planId: "",
    subscriptionEnd: "", subscriptionStatus: "ACTIVE" as SubscriptionStatus,
    themeKey: "CLASSIC_ESTATE" as PublicTheme,
    adminName: "", adminUsername: "", adminPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void api.listSubscriptionPlans().then(setPlans);
    if (siteId) {
      void api.getSuperAdminSite(siteId).then((site) => setForm((current) => ({
        ...current, name: site.name, slug: site.slug, phone: site.phone ?? "",
        email: site.email ?? "", address: site.address ?? "", planId: site.plan?.id ?? "",
        themeKey: site.themeKey,
        subscriptionEnd: site.subscriptionEnd?.slice(0, 10) ?? "",
        subscriptionStatus: site.subscriptionStatus,
      }))).catch((requestError) => setError(requestError.message));
    }
  }, [siteId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      if (siteId) {
        await api.updateSuperAdminSite(siteId, {
          name: form.name, slug: form.slug, phone: form.phone, email: form.email,
          address: form.address || null, planId: form.planId || null,
          themeKey: form.themeKey,
          subscriptionEnd: form.subscriptionEnd ? new Date(form.subscriptionEnd) : null,
          subscriptionStatus: form.subscriptionStatus,
        });
      } else {
        await api.createSuperAdminSite({
          name: form.name, slug: form.slug, phone: form.phone, email: form.email,
          address: form.address || null, planId: form.planId,
          themeKey: form.themeKey,
          subscriptionEnd: new Date(form.subscriptionEnd), adminName: form.adminName,
          adminUsername: form.adminUsername, adminPassword: form.adminPassword,
        });
      }
      await revalidateTenant(form.slug);
      router.push("/superadmin/sites"); router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể lưu website.");
    } finally { setSaving(false); }
  }

  const field = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">{siteId ? "Chỉnh sửa tenant" : "Tenant mới"}</p>
      <h1 className="mt-2 font-display text-4xl font-medium">{siteId ? "Cập nhật website" : "Tạo website khách hàng"}</h1>
      <form onSubmit={submit} className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="glass-panel rounded-3xl p-8"><h2 className="font-display text-2xl">Thông tin website</h2><div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Tên website" value={form.name} onChange={(v) => field("name", v)} required />
          <Field label="Subdomain" value={form.slug} onChange={(v) => field("slug", v)} required />
          <Field label="Số điện thoại" value={form.phone} onChange={(v) => field("phone", v)} required />
          <Field label="Email" type="email" value={form.email} onChange={(v) => field("email", v)} required />
          <Field label="Địa chỉ" value={form.address} onChange={(v) => field("address", v)} />
          {!siteId && <><Field label="Tên quản trị viên" value={form.adminName} onChange={(v) => field("adminName", v)} required /><Field label="Tên đăng nhập" value={form.adminUsername} onChange={(v) => field("adminUsername", v)} required /><Field label="Mật khẩu ban đầu" type="password" value={form.adminPassword} onChange={(v) => field("adminPassword", v)} required /></>}
        </div>
          <div className="mt-8 border-t border-ink/10 pt-7">
            <PublicThemePicker
              value={form.themeKey}
              onChange={(value) => field("themeKey", value)}
            />
          </div>
        </section>
        <aside className="space-y-6">
          <section className="glass-panel rounded-3xl p-8"><h2 className="font-display text-2xl">Gói dịch vụ</h2>
          <label className="mt-6 grid gap-2 text-sm font-bold">Gói<select value={form.planId} onChange={(e) => field("planId", e.target.value)} required={!siteId} className="h-12 rounded-xl bg-white/50 border border-ink/5 px-4 font-normal focus:bg-white"><option value="">Chọn gói</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} — {plan.price.toLocaleString("vi-VN")}đ</option>)}</select></label>
          {siteId && <label className="mt-5 grid gap-2 text-sm font-bold">Trạng thái<select value={form.subscriptionStatus} onChange={(e) => field("subscriptionStatus", e.target.value as SubscriptionStatus)} className="h-12 rounded-xl bg-white/50 border border-ink/5 px-4 font-normal focus:bg-white">{["TRIAL","ACTIVE","GRACE_PERIOD","EXPIRED","SUSPENDED"].map((status) => <option key={status}>{status}</option>)}</select></label>}
          <label className="mt-5 grid gap-2 text-sm font-bold">Ngày hết hạn<input type="date" value={form.subscriptionEnd} onChange={(e) => field("subscriptionEnd", e.target.value)} required={!siteId} className="h-12 rounded-xl bg-white/50 border border-ink/5 px-4 font-normal focus:bg-white" /></label>
        </section>{error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<button disabled={saving} className="button-primary w-full disabled:opacity-60"><Save size={17} /> {saving ? "Đang lưu..." : "Lưu website"}</button></aside>
      </form>
    </>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-bold text-ink/80">{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="h-12 min-w-0 rounded-xl bg-white/50 border border-ink/5 px-4 font-normal focus:bg-white transition-colors" /></label>;
}
