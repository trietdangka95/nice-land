"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { createTenantApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";

export function PropertyEngagement({
  slug,
  postId,
}: {
  slug: string;
  postId: string;
}) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void client.trackPostView(postId).catch(() => undefined);
  }, [client, postId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    setSending(true);
    const data = new FormData(formEl);
    try {
      await client.createPropertyLead(postId, {
        name: String(data.get("name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? ""),
        source: "PROPERTY_FORM",
      });
      setSent(true);
      toast.success(
        "Chuyên viên sẽ liên hệ với bạn sớm.",
        "Đã gửi yêu cầu",
      );
      formEl.reset();
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể gửi yêu cầu."),
        "Không thể gửi yêu cầu",
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <p className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
        Đã gửi yêu cầu. Chuyên viên sẽ liên hệ với bạn sớm.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3 border-t border-ink/10 pt-5">
      <h3 className="font-display text-xl">Nhận tư vấn về tin này</h3>
      <input name="name" required minLength={2} placeholder="Họ và tên" className="h-11 w-full rounded-2xl border border-black/5 bg-[#f8f6f0] px-4 text-sm outline-none transition-colors focus:border-[var(--tenant-color)]" />
      <input name="phone" required minLength={8} placeholder="Số điện thoại" className="h-11 w-full rounded-2xl border border-black/5 bg-[#f8f6f0] px-4 text-sm outline-none transition-colors focus:border-[var(--tenant-color)]" />
      <input name="email" type="email" placeholder="Email (không bắt buộc)" className="h-11 w-full rounded-2xl border border-black/5 bg-[#f8f6f0] px-4 text-sm outline-none transition-colors focus:border-[var(--tenant-color)]" />
      <textarea name="message" placeholder="Nội dung cần tư vấn" className="min-h-24 w-full rounded-2xl border border-black/5 bg-[#f8f6f0] p-4 text-sm outline-none transition-colors focus:border-[var(--tenant-color)]" />
      <button disabled={sending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--tenant-color)] px-4 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60">
        <Send size={15} /> {sending ? "Đang gửi..." : "Gửi yêu cầu"}
      </button>
    </form>
  );
}
