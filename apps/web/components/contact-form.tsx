"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await api.createContactRequest({
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        message: String(form.get("message") ?? ""),
      });
      setSubmitted(true);
      event.currentTarget.reset();
    } catch {
      setError("Chưa thể gửi yêu cầu. Vui lòng thử lại sau.");
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
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Họ và tên
          <input
            className="h-12 border border-white/15 bg-white/10 px-4 font-normal text-white placeholder:text-white/35"
            name="name"
            placeholder="Nguyễn Minh Anh"
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
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input
          className="h-12 border border-white/15 bg-white/10 px-4 font-normal text-white placeholder:text-white/35"
          name="email"
          type="email"
          placeholder="ban@congty.vn"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Bạn đang cần gì?
        <textarea
          className="min-h-28 resize-y border border-white/15 bg-white/10 p-4 font-normal text-white placeholder:text-white/35"
          name="message"
          placeholder="Ví dụ: Tôi muốn tạo website cho đội ngũ 5 môi giới..."
        />
      </label>
      <button className="button-primary mt-2 bg-gold text-ink hover:bg-white" disabled={loading}>
        {loading ? "Đang gửi..." : "Nhận tư vấn miễn phí"}
        {!loading && <ArrowRight size={17} aria-hidden="true" />}
      </button>
      {error && <p role="alert" className="text-sm font-semibold text-red-200">{error}</p>}
    </form>
  );
}
