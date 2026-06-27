"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Palette, Save } from "lucide-react";
import type { SiteSettingsInput } from "@nice-land/contracts";
import { createTenantApi } from "@/lib/api";
import { revalidateTenant } from "@/app/actions";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";

const colors = ["#315c45", "#8b5a3c", "#24405e", "#6b4f7d", "#9a6d22"];

const emptySettings: SiteSettingsInput = {
  name: "",
  tagline: "",
  logo: "",
  banner: "",
  themeColor: colors[0],
  phone: "",
  email: "",
  address: "",
  facebookUrl: "",
  zaloPhone: "",
};

export function SiteSettingsScreen({ slug }: { slug: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const toast = useToast();
  const [form, setForm] = useState<SiteSettingsInput>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    client
      .getSiteSettings()
      .then((settings) => {
        if (!active) return;
        setForm({
          name: settings.name,
          tagline: settings.tagline,
          logo: settings.logo,
          banner: settings.banner,
          themeColor: settings.themeColor,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          facebookUrl: settings.facebookUrl,
          zaloPhone: settings.zaloPhone,
        });
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Không thể tải cấu hình website.",
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [client]);

  function setField<K extends keyof SiteSettingsInput>(
    key: K,
    value: SiteSettingsInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await client.updateSiteSettings(form);
      setForm(updated);
      await revalidateTenant(slug);
      toast.success(
        "Trang khách sẽ dùng cấu hình mới.",
        "Đã cập nhật website",
      );
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể lưu cấu hình."),
        "Không thể lưu cấu hình",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-80 animate-pulse border border-ink/10 bg-white" aria-label="Đang tải cấu hình" />;
  }

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Nhận diện thương hiệu</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Cấu hình website</h1>
      <p className="mt-2 text-sm text-ink/50">Cập nhật nội dung hiển thị với khách hàng và xem trước trước khi lưu.</p>

      <form onSubmit={save} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-2xl">Thông tin thương hiệu</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <TextField label="Tên website" value={form.name} onChange={(value) => setField("name", value)} required />
            <TextField label="Slogan" value={form.tagline ?? ""} onChange={(value) => setField("tagline", value)} />
            <TextField label="Số điện thoại" value={form.phone} onChange={(value) => setField("phone", value)} required />
            <TextField label="Email" type="email" value={form.email} onChange={(value) => setField("email", value)} required />
            <TextField label="Địa chỉ" value={form.address} onChange={(value) => setField("address", value)} required wide />
            <TextField label="Số Zalo" value={form.zaloPhone ?? ""} onChange={(value) => setField("zaloPhone", value)} />
            <TextField label="Facebook URL" type="url" value={form.facebookUrl ?? ""} onChange={(value) => setField("facebookUrl", value)} />
            <TextField label="Logo URL" type="url" value={form.logo ?? ""} onChange={(value) => setField("logo", value)} />
            <TextField label="Ảnh banner URL" type="url" value={form.banner ?? ""} onChange={(value) => setField("banner", value)} wide />
          </div>
          {error && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
          <button className="button-primary mt-7 disabled:opacity-60" disabled={saving}>
            <Save size={17} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </section>

        <aside className="space-y-6">
          <section className="glass-panel rounded-3xl p-6 sm:p-8">
            <Palette className="text-moss" />
            <h2 className="mt-4 font-display text-2xl">Màu chủ đạo</h2>
            <div className="mt-6 grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="grid aspect-square place-items-center rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                  onClick={() => setField("themeColor", color)}
                  aria-label={`Chọn màu ${color}`}
                  aria-pressed={form.themeColor === color}
                >
                  {form.themeColor === color && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
            <label className="mt-5 grid gap-2 text-sm font-bold text-ink/80">
              Mã màu tùy chỉnh
              <input type="color" value={form.themeColor} onChange={(event) => setField("themeColor", event.target.value)} className="h-11 w-full rounded-xl bg-white/50 border border-ink/5 p-1 cursor-pointer" />
            </label>
          </section>

          <section className="glass-panel rounded-3xl overflow-hidden">
            <div className="h-28 bg-cover bg-center" style={{ backgroundColor: form.themeColor, backgroundImage: form.banner ? `url("${form.banner}")` : undefined }} />
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: form.themeColor }}>Xem trước website</p>
              <h2 className="mt-2 font-display text-2xl">{form.name || "Tên website"}</h2>
              <p className="mt-2 text-sm text-ink/50">{form.tagline || "Slogan của bạn sẽ hiển thị tại đây."}</p>
              <a href={`/${slug}`} target="_blank" className="mt-4 inline-flex items-center gap-2 text-sm font-bold" style={{ color: form.themeColor }}>
                Mở trang khách <ExternalLink size={14} />
              </a>
            </div>
          </section>
        </aside>
      </form>
    </>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={`grid gap-2 text-sm font-bold text-ink/80 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="h-12 min-w-0 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" />
    </label>
  );
}
