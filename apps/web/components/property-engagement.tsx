"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { createTenantApi } from "@/lib/api";

export function PropertyEngagement({
  slug,
  postId,
}: {
  slug: string;
  postId: string;
}) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void client.trackPostView(postId).catch(() => undefined);
  }, [client, postId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await client.createPropertyLead(postId, {
        name: String(data.get("name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? ""),
        source: "PROPERTY_FORM",
      });
      setSent(true);
      event.currentTarget.reset();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể gửi yêu cầu.",
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
      <input name="name" required minLength={2} placeholder="Họ và tên" className="h-11 w-full border border-ink/15 px-3 text-sm" />
      <input name="phone" required minLength={8} placeholder="Số điện thoại" className="h-11 w-full border border-ink/15 px-3 text-sm" />
      <input name="email" type="email" placeholder="Email (không bắt buộc)" className="h-11 w-full border border-ink/15 px-3 text-sm" />
      <textarea name="message" placeholder="Nội dung cần tư vấn" className="min-h-20 w-full border border-ink/15 p-3 text-sm" />
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <button disabled={sending} className="flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--tenant-color)] px-4 text-sm font-bold text-white disabled:opacity-60">
        <Send size={15} /> {sending ? "Đang gửi..." : "Gửi yêu cầu"}
      </button>
    </form>
  );
}
