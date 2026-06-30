"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { ApiClientError } from "@nice-land/api-client";
import { api } from "@/lib/api";
import { useToast } from "@/components/shared/toast-provider";
import type { SystemSetting } from "@nice-land/contracts";

function supportsSupportZaloPhone(error: unknown) {
  if (!(error instanceof ApiClientError)) return false;

  const message = error.message.toLowerCase();
  return error.status >= 500 ||
    error.status === 400 ||
    error.status === 422 ||
    message.includes("supportzalophone") ||
    message.includes("unrecognized key") ||
    message.includes("unknown argument");
}

export function SuperAdminSettingsScreen() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [setting, setSetting] = useState<SystemSetting | null>(null);
  
  const [bankId, setBankId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [supportZaloPhone, setSupportZaloPhone] = useState("");

  useEffect(() => {
    let active = true;
    api.getSystemSetting()
      .then((data) => {
        if (active) {
          setSetting(data);
          setBankId(data.bankId || "");
          setBankAccount(data.bankAccount || "");
          setBankAccountName(data.bankAccountName || "");
          setSupportZaloPhone(data.supportZaloPhone || "");
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateSystemSetting({
        bankId: bankId || null,
        bankAccount: bankAccount || null,
        bankAccountName: bankAccountName || null,
        supportZaloPhone: supportZaloPhone || null,
      });
      setSetting(updated);
      toast.success("Đã lưu cấu hình landing page và thanh toán thành công.", "Đã lưu");
    } catch (error) {
      if (supportZaloPhone.trim() && supportsSupportZaloPhone(error)) {
        try {
          const updated = await api.updateSystemSetting({
            bankId: bankId || null,
            bankAccount: bankAccount || null,
            bankAccountName: bankAccountName || null,
          });
          setSetting({
            ...updated,
            supportZaloPhone,
          });
          toast.success("Đã lưu cấu hình thanh toán. API hiện tại chưa hỗ trợ lưu số Zalo.", "Đã lưu một phần");
          return;
        } catch {
          toast.error("Không thể lưu cấu hình, vui lòng thử lại.", "Lỗi");
          return;
        }
      }
      toast.error("Không thể lưu cấu hình, vui lòng thử lại.", "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <p className="text-sm font-semibold text-ink/50">Đang tải cấu hình...</p>
      </main>
    );
  }

  return (
    <main className="p-8 pb-32">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Cấu hình landing page & thanh toán
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Cấu hình tài khoản thanh toán và kênh liên hệ nhanh để hiển thị trên landing page khi khách cần liên hệ ngay.
          </p>
        </div>
      </header>
      <form onSubmit={handleSave} className="grid max-w-2xl gap-6">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Số Zalo hỗ trợ
          <input
            className="h-10 rounded-lg border border-ink/20 px-3 font-normal"
            value={supportZaloPhone}
            onChange={(e) => setSupportZaloPhone(e.target.value)}
            placeholder="Ví dụ: 0903868979"
          />
          <p className="text-xs font-normal text-ink/50">Dùng cho nút Zalo trên landing page. Khách bấm là mở liên hệ ngay.</p>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Mã ngân hàng (Bank BIN/ShortName)
          <input
            className="h-10 rounded-lg border border-ink/20 px-3 font-normal"
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
            placeholder="Ví dụ: MB, VCB, TCB, 970415..."
          />
          <p className="text-xs font-normal text-ink/50">Tên viết tắt hoặc mã BIN của ngân hàng.</p>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Số tài khoản
          <input
            className="h-10 rounded-lg border border-ink/20 px-3 font-normal"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Ví dụ: 0123456789"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Tên chủ tài khoản
          <input
            className="h-10 rounded-lg border border-ink/20 px-3 font-normal uppercase"
            value={bankAccountName}
            onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
            placeholder="Ví dụ: NGUYEN VAN A"
          />
        </label>
        <div>
          <button
            type="submit"
            disabled={saving}
            className="button-primary inline-flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </div>
      </form>
    </main>
  );
}
