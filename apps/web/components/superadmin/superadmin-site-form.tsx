"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import type { PublicTheme, SubscriptionPlan, SubscriptionStatus } from "@nice-land/contracts";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { revalidateTenant } from "@/app/actions";
import { getValidationFieldMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";
import { ThemeOptionCard } from "@/components/shared/theme-option-card";
import {
  DEFAULT_PUBLIC_THEME,
  publicThemes,
  resolvePublicTheme,
} from "@/lib/public-themes";

type AssignablePublicTheme = (typeof publicThemes)[number]["key"];

interface SuperAdminSiteFormState {
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  planId: string;
  brokerAvatar: string;
  brokerName: string;
  brokerBio: string;
  subscriptionEnd: string;
  subscriptionStatus: SubscriptionStatus;
  themeKey: AssignablePublicTheme;
  adminName: string;
  adminUsername: string;
  adminPassword: string;
}

export function SuperAdminSiteForm({ siteId }: { siteId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [form, setForm] = useState<SuperAdminSiteFormState>({
    name: "", slug: "", phone: "", email: "", address: "", planId: "",
    brokerAvatar: "", brokerName: "", brokerBio: "",
    subscriptionEnd: "", subscriptionStatus: "ACTIVE" as SubscriptionStatus,
    themeKey: DEFAULT_PUBLIC_THEME as AssignablePublicTheme,
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
        brokerAvatar: site.brokerAvatar ?? "", brokerName: site.brokerName ?? "", brokerBio: site.brokerBio ?? "",
        themeKey: resolvePublicTheme(site.themeKey) as AssignablePublicTheme,
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
          brokerAvatar: form.brokerAvatar || null,
          brokerName: form.brokerName || null,
          brokerBio: form.brokerBio || null,
          themeKey: form.themeKey,
          subscriptionEnd: form.subscriptionEnd ? new Date(form.subscriptionEnd) : null,
          subscriptionStatus: form.subscriptionStatus,
        });
      } else {
        await api.createSuperAdminSite({
          name: form.name, slug: form.slug, phone: form.phone, email: form.email,
          address: form.address || null, planId: form.planId,
          brokerAvatar: form.brokerAvatar || null,
          brokerName: form.brokerName || null,
          brokerBio: form.brokerBio || null,
          themeKey: form.themeKey,
          subscriptionEnd: new Date(form.subscriptionEnd), adminName: form.adminName,
          adminUsername: form.adminUsername, adminPassword: form.adminPassword,
        });
      }
      await revalidateTenant(form.slug);
      toast.success("Website khách hàng đã được lưu.", "Lưu thành công");
      router.push("/superadmin/sites"); router.refresh();
    } catch (requestError) {
      toast.error(formatSiteFormError(requestError), "Không thể lưu website");
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
          <Field label="Avatar môi giới URL" value={form.brokerAvatar} onChange={(v) => field("brokerAvatar", v)} />
          <Field label="Tên môi giới" value={form.brokerName} onChange={(v) => field("brokerName", v)} />
          <TextAreaField label="Mô tả môi giới" value={form.brokerBio} onChange={(v) => field("brokerBio", v)} wide />
          {!siteId && <><Field label="Tên quản trị viên" value={form.adminName} onChange={(v) => field("adminName", v)} required /><Field label="Tên đăng nhập" value={form.adminUsername} onChange={(v) => field("adminUsername", v)} required /><Field label="Mật khẩu ban đầu" type="password" value={form.adminPassword} onChange={(v) => field("adminPassword", v)} required /></>}
        </div>
        <fieldset className="mt-8 grid gap-3">
          <legend className="text-sm font-bold text-ink/80">Theme website</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {publicThemes.map((theme) => (
              <ThemeOptionCard
                key={theme.key}
                value={theme.key}
                label={theme.preferenceLabel}
                description={theme.description}
                previewSwatches={theme.previewSwatches}
                selected={form.themeKey === theme.key}
                onSelect={(value) => field("themeKey", value)}
              />
            ))}
          </div>
        </fieldset>
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

const fieldLabels: Record<string, string> = {
  name: "Tên website",
  slug: "Subdomain",
  phone: "Số điện thoại",
  email: "Email",
  address: "Địa chỉ",
  brokerAvatar: "Avatar môi giới URL",
  brokerName: "Tên môi giới",
  brokerBio: "Mô tả môi giới",
  planId: "Gói dịch vụ",
  subscriptionEnd: "Ngày hết hạn",
  subscriptionStatus: "Trạng thái",
  themeKey: "Theme website",
  adminName: "Tên quản trị viên",
  adminUsername: "Tên đăng nhập",
  adminPassword: "Mật khẩu ban đầu",
};

function formatSiteFormError(error: unknown) {
  return getValidationFieldMessage(
    error,
    fieldLabels,
    "Không thể lưu website.",
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-bold text-ink/80">{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="h-12 min-w-0 rounded-xl bg-white/50 border border-ink/5 px-4 font-normal focus:bg-white transition-colors" /></label>;
}

function TextAreaField({ label, value, onChange, wide = false }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) {
  return <label className={`grid gap-2 text-sm font-bold text-ink/80 ${wide ? "sm:col-span-2" : ""}`}>{label}<textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className="min-h-32 min-w-0 rounded-xl bg-white/50 border border-ink/5 px-4 py-3 font-normal focus:bg-white transition-colors" /></label>;
}
