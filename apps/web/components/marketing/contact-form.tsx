"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/shared/toast-provider";
import { VietQR } from "@/components/shared/viet-qr";
import { plans } from "@/lib/data";
import type { SystemSetting } from "@nice-land/contracts";

export function ContactForm({
  selectedPlan,
}: {
  selectedPlan?: string;
}) {
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bankInfo, setBankInfo] = useState<SystemSetting | null>(null);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let active = true;
    api.getPublicBankInfo().then((data) => {
      if (active) setBankInfo(data);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    setLoading(true);
    const form = new FormData(formEl);
    const selection = [
      selectedPlan ? `Gói quan tâm: ${selectedPlan}` : "",
      String(form.get("message") ?? ""),
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await api.createContactRequest({
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        message: selection,
      });
      setSubmitted(true);
      toast.success(
        "Đội ngũ Nice Land sẽ liên hệ trong giờ làm việc.",
        "Đã nhận thông tin",
      );
      formEl.reset();
    } catch {
      toast.error(
        "Chưa thể gửi yêu cầu. Vui lòng thử lại sau.",
        "Không thể gửi yêu cầu",
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center border border-white/15 bg-white/5 p-8 text-center">
        <CheckCircle2 className="text-gold" size={44} aria-hidden="true" />
        <h3 className="mt-5 font-display text-3xl">Chúng tôi đã nhận thông tin</h3>
        <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
          Đội ngũ Nice Land sẽ liên hệ và tư vấn mô hình website phù hợp trong giờ làm việc.
        </p>
        <button className="mt-6 text-sm font-bold text-gold" onClick={() => setSubmitted(false)}>
          Gửi một yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border border-white/15 bg-white/5 p-6 sm:p-8">
      {selectedPlan && (
        <div className="border border-gold/30 bg-gold/10 p-4 text-sm text-white/80">
          <p>Gói quan tâm: <strong>{selectedPlan}</strong></p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Họ và tên
          <input
            className="h-12 border border-white/15 bg-white/10 px-4 font-normal text-white placeholder:text-white/35"
            name="name"
            placeholder="Nguyễn Văn A"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Số điện thoại
          <input
            className="h-12 border border-white/15 bg-white/10 px-4 font-normal text-white placeholder:text-white/35"
            name="phone"
            type="tel"
            placeholder="09xx xxx xxx"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input
          className="h-12 border border-white/15 bg-white/10 px-4 font-normal text-white placeholder:text-white/35"
          name="email"
          type="email"
          placeholder="ten-email@gmail.com"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Bạn đang cần gì?
        <textarea
          className="min-h-28 resize-y border border-white/15 bg-white/10 p-4 font-normal text-white placeholder:text-white/35"
          name="message"
          placeholder="Ví dụ: Tôi muốn tạo website bán bất động sản..."
        />
      </label>

      {(() => {
        const sp = plans.find((p) => p.name === selectedPlan);
        if (sp && sp.price > 0 && bankInfo?.bankId) {
          return (
            <div className="mt-4 rounded-xl bg-white/10 p-4">
              <p className="mb-4 text-center text-sm font-bold text-gold">Quét mã QR để thanh toán</p>
              <VietQR amount={Number(sp.price)} content={`DANG KY ${phone || "09..."}`} bankInfo={bankInfo} />
            </div>
          );
        }
        return null;
      })()}

      <button className="button-primary mt-2 bg-gold text-ink hover:bg-white" disabled={loading}>
        {loading ? "Đang gửi..." : "Nhận tư vấn miễn phí"}
        {!loading && <ArrowRight size={17} aria-hidden="true" />}
      </button>
    </form>
  );
}
