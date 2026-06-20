"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Gauge, ImageIcon, Send } from "lucide-react";
import type { AdminSubscription } from "@datcuatoi/contracts";
import { createTenantApi } from "@/lib/api";

const statusLabels: Record<AdminSubscription["status"], string> = {
  TRIAL: "Dùng thử",
  ACTIVE: "Đang hoạt động",
  GRACE_PERIOD: "Gia hạn tạm thời",
  EXPIRED: "Đã hết hạn",
  SUSPENDED: "Đã tạm ngưng",
};

export function SubscriptionScreen({ slug }: { slug: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [subscription, setSubscription] = useState<AdminSubscription | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    client
      .getSubscription()
      .then((data) => active && setSubscription(data))
      .catch((requestError) => active && setError(requestError instanceof Error ? requestError.message : "Không thể tải gói dịch vụ."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [client]);

  async function requestRenewal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subscription) return;
    setSending(true);
    setError("");
    try {
      const request = await client.createRenewalRequest({
        planId: subscription.plan?.id ?? null,
        note: note || null,
      });
      setSubscription({ ...subscription, latestRenewalRequest: request });
      setNote("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể gửi yêu cầu gia hạn.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="h-72 animate-pulse border border-ink/10 bg-white" aria-label="Đang tải gói dịch vụ" />;
  }
  if (!subscription) {
    return <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error || "Không tìm thấy thông tin gói dịch vụ."}</p>;
  }

  const plan = subscription.plan;
  const remainingPosts = Math.max(0, (plan?.maxPosts ?? 0) - subscription.usage.posts);
  const pending = subscription.latestRenewalRequest && ["NEW", "IN_PROGRESS"].includes(subscription.latestRenewalRequest.status);

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Tài khoản & dịch vụ</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Gói dịch vụ</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="border border-ink/10 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-moss">Gói hiện tại</span>
              <h2 className="mt-3 font-display text-4xl">{plan?.name ?? "Chưa có gói"}</h2>
            </div>
            <span className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">{statusLabels[subscription.status]}</span>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Feature text={`${plan?.maxPosts ?? 0} tin đăng`} />
            <Feature text={`${plan?.maxImagesPerPost ?? 0} ảnh mỗi tin`} />
            <Feature text={`Chu kỳ ${plan?.durationDays ?? 0} ngày`} />
            <Feature text={plan ? `${plan.price.toLocaleString("vi-VN")}đ / chu kỳ` : "Liên hệ quản trị viên"} />
          </div>

          <div className="mt-8 grid gap-4 border-t border-ink/10 pt-7 sm:grid-cols-2">
            <Usage icon={Gauge} label="Tin đang dùng" value={`${subscription.usage.posts} / ${plan?.maxPosts ?? 0}`} />
            <Usage icon={ImageIcon} label="Tổng ảnh đã lưu" value={subscription.usage.images.toLocaleString("vi-VN")} />
          </div>
        </section>

        <aside className="border border-ink/10 bg-ink p-6 text-white sm:p-7">
          <CalendarDays className="text-gold" />
          <p className="mt-5 text-xs uppercase tracking-widest text-white/45">Ngày hết hạn</p>
          <strong className="mt-2 block font-display text-3xl">
            {subscription.endsAt ? new Date(subscription.endsAt).toLocaleDateString("vi-VN") : "Không giới hạn"}
          </strong>
          <p className="mt-3 text-sm text-white/60">Còn khả dụng {remainingPosts.toLocaleString("vi-VN")} tin đăng.</p>

          {pending ? (
            <div className="mt-7 border border-white/15 bg-white/5 p-4">
              <p className="text-sm font-bold text-gold">Yêu cầu đang được xử lý</p>
              <p className="mt-2 text-xs leading-5 text-white/55">
                Đã gửi ngày {new Date(subscription.latestRenewalRequest!.requestedAt).toLocaleDateString("vi-VN")}.
              </p>
            </div>
          ) : (
            <form onSubmit={requestRenewal} className="mt-7">
              <label className="grid gap-2 text-sm font-bold">
                Ghi chú gia hạn
                <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder="Ví dụ: Tôi muốn gia hạn thêm 12 tháng" className="min-h-24 border border-white/20 bg-white/10 p-3 font-normal text-white placeholder:text-white/35" />
              </label>
              <button disabled={sending} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-gold px-5 text-sm font-bold text-ink disabled:opacity-60">
                <Send size={16} /> {sending ? "Đang gửi..." : "Gửi yêu cầu gia hạn"}
              </button>
            </form>
          )}
          {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
        </aside>
      </div>
    </>
  );
}

function Feature({ text }: { text: string }) {
  return <div className="flex items-center gap-3 text-sm"><span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={14} /></span>{text}</div>;
}

function Usage({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return <div className="flex items-center gap-3"><span className="grid size-10 place-items-center bg-moss/10 text-moss"><Icon size={18} /></span><div><p className="text-xs text-ink/45">{label}</p><strong className="mt-1 block">{value}</strong></div></div>;
}
