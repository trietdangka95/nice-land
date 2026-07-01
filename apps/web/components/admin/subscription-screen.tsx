"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, Gauge, ImageIcon, Send, X } from "lucide-react";
import type { AdminSubscription, SubscriptionPlan, SystemSetting } from "@nice-land/contracts";
import { createTenantApi, api } from "@/lib/api";
import { formatVietnamDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";
import { VietQR } from "@/components/shared/viet-qr";

const statusLabels: Record<AdminSubscription["status"], string> = {
  TRIAL: "Dùng thử",
  ACTIVE: "Đang hoạt động",
  GRACE_PERIOD: "Gia hạn tạm thời",
  EXPIRED: "Đã hết hạn",
  SUSPENDED: "Đã tạm ngưng",
};

export function SubscriptionScreen({ slug }: { slug: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const toast = useToast();
  const expiredDialogRef = useRef<HTMLDialogElement>(null);
  const [subscription, setSubscription] = useState<AdminSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [note, setNote] = useState("");
  const [bankInfo, setBankInfo] = useState<SystemSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [dismissedExpiredDialog, setDismissedExpiredDialog] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([client.getSubscription(), client.getAvailablePlans(), api.getPublicBankInfo()])
      .then(([subData, plansData, bankData]) => {
        if (!active) return;
        setSubscription(subData);
        setPlans(plansData);
        setBankInfo(bankData);
        setSelectedPlanId(subData.plan?.id ?? (plansData[0]?.id || ""));
      })
      .catch((requestError) => active && setError(requestError instanceof Error ? requestError.message : "Không thể tải gói dịch vụ."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [client]);

  const pending =
    subscription?.latestRenewalRequest &&
    ["NEW", "IN_PROGRESS"].includes(subscription.latestRenewalRequest.status);
  const isExpired = subscription?.status === "EXPIRED";

  useEffect(() => {
    const dialog = expiredDialogRef.current;
    if (!dialog) return;

    if (isExpired && !pending && !dismissedExpiredDialog) {
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
  }, [dismissedExpiredDialog, isExpired, pending]);

  async function submitRenewalRequest({
    planId,
    note: requestNote,
    successTitle,
    successMessage,
  }: {
    planId: string | null;
    note: string | null;
    successTitle: string;
    successMessage: string;
  }) {
    if (!subscription) return;
    setSending(true);
    try {
      const request = await client.createRenewalRequest({
        planId,
        note: requestNote,
      });
      setSubscription({ ...subscription, latestRenewalRequest: request });
      setNote("");
      toast.success(successMessage, successTitle);
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể gửi yêu cầu gia hạn."),
        "Không thể gửi yêu cầu",
      );
    } finally {
      setSending(false);
    }
  }

  async function requestRenewal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitRenewalRequest({
      planId: selectedPlanId || null,
      note: note || null,
      successTitle: "Đã gửi yêu cầu",
      successMessage: "Yêu cầu gia hạn đã được gửi tới quản trị hệ thống.",
    });
  }

  async function requestExpiredRenewal() {
    await submitRenewalRequest({
      planId: subscription?.plan?.id ?? null,
      note: null,
      successTitle: "Đã ghi nhận yêu cầu",
      successMessage:
        "Yêu cầu đang trong quá trình xử lý. Chúng tôi sẽ sớm liên hệ và hỗ trợ bạn.",
    });
  }

  function closeExpiredDialog() {
    if (!pending) {
      setDismissedExpiredDialog(true);
    }
    expiredDialogRef.current?.close();
  }

  if (loading) {
    return <div className="h-72 animate-pulse border border-ink/10 bg-white" aria-label="Đang tải gói dịch vụ" />;
  }
  if (!subscription) {
    return <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error || "Không tìm thấy thông tin gói dịch vụ."}</p>;
  }

  const plan = subscription.plan;
  const remainingPosts = Math.max(0, (plan?.maxPosts ?? 0) - subscription.usage.posts);

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Tài khoản & dịch vụ</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Gói dịch vụ</h1>
      <div className="mt-8 flex flex-col gap-6">
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
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

          <div className="mt-8 grid gap-4 border-t border-ink/5 pt-7 sm:grid-cols-2">
            <Usage icon={Gauge} label="Tin đang dùng" value={`${subscription.usage.posts} / ${plan?.maxPosts ?? 0}`} />
            <Usage icon={ImageIcon} label="Tổng ảnh đã lưu" value={subscription.usage.images.toLocaleString("vi-VN")} />
          </div>
        </section>

        <aside className="glass-dark rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-gold/20 rounded-full blur-3xl group-hover:bg-gold/30 transition-all duration-700 pointer-events-none"></div>
          <div className="relative z-10">
          <CalendarDays className="text-gold" />
          <p className="mt-5 text-xs uppercase tracking-widest text-white/45">Ngày hết hạn</p>
          <strong className="mt-2 block font-display text-3xl">
            {subscription.endsAt ? formatVietnamDate(subscription.endsAt) : "Không giới hạn"}
          </strong>
          <p className="mt-3 text-sm text-white/60">Còn khả dụng {remainingPosts.toLocaleString("vi-VN")} tin đăng.</p>

          {pending ? (
            <div id="subscription-renewal-highlight" className="mt-7 rounded-2xl border p-5 backdrop-blur-sm border-white/15 bg-white/5">
              <p className="text-sm font-bold text-gold">Yêu cầu đang được xử lý</p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Chúng tôi đã ghi nhận yêu cầu của bạn và sẽ sớm liên hệ để hỗ trợ gia hạn.
              </p>
              <p className="mt-3 text-xs leading-5 text-white/60">
                Đã gửi ngày {formatVietnamDate(subscription.latestRenewalRequest!.requestedAt)}.
              </p>
              <button
                type="button"
                onClick={() => expiredDialogRef.current?.showModal()}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Xem lại yêu cầu
              </button>
            </div>
          ) : isExpired ? (
            <div className="mt-7 rounded-2xl border border-gold/25 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-bold text-gold">Website đang chờ yêu cầu gia hạn</p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Gửi yêu cầu ngay để đội ngũ quản trị hệ thống tiếp nhận và hỗ trợ bạn sớm nhất.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDismissedExpiredDialog(false);
                  expiredDialogRef.current?.showModal();
                }}
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-5 text-sm font-bold text-ink transition-colors hover:bg-gold/90"
              >
                Yêu cầu gia hạn
              </button>
            </div>
          ) : (
            <form onSubmit={requestRenewal} className="mt-7 grid gap-5">
              <label className="grid gap-2 text-sm font-bold text-white/90">
                Đổi / Gia hạn gói
                <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} required className="h-12 rounded-xl border border-white/20 bg-white/10 px-4 font-normal text-white focus:bg-white/20 transition-colors [&>option]:text-black">
                  <option value="">Chọn gói dịch vụ</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.price.toLocaleString("vi-VN")}đ
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-white/90">
                Ghi chú gia hạn
                <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder="Ví dụ: Tôi muốn gia hạn thêm 12 tháng" className="min-h-24 rounded-xl border border-white/20 bg-white/10 p-4 font-normal text-white placeholder:text-white/35 focus:bg-white/20 transition-colors" />
              </label>

              {(() => {
                const sp = plans.find((p) => p.id === selectedPlanId);
                if (sp && sp.price > 0 && bankInfo?.bankId) {
                  return (
                    <div className="mt-4 rounded-xl bg-white/10 p-4">
                      <p className="mb-4 text-center text-sm font-bold text-gold">Quét mã QR để thanh toán</p>
                      <VietQR amount={Number(sp.price)} content={`GIA HAN ${slug}`} bankInfo={bankInfo} />
                    </div>
                  );
                }
                return null;
              })()}

              <button disabled={sending} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-bold text-ink hover:bg-gold/90 transition-colors disabled:opacity-60">
                <Send size={16} /> {sending ? "Đang gửi..." : "Gửi yêu cầu gia hạn"}
              </button>
            </form>
          )}
          </div>
        </aside>
      </div>
      {isExpired ? (
        <dialog
          ref={expiredDialogRef}
          aria-labelledby="expired-renewal-title"
          className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-black/50 p-0 backdrop:bg-transparent"
          onCancel={closeExpiredDialog}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeExpiredDialog();
          }}
        >
          <section className="mx-auto flex min-h-dvh w-full max-w-xl items-center px-5 py-8">
            <div className="w-full overflow-hidden rounded-[2rem] border border-ink/10 bg-[#fbf7ee] shadow-[0_28px_80px_rgba(23,33,27,0.22)]">
              <div className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 py-5 sm:px-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-moss">Gia hạn dịch vụ</p>
                  <h2 id="expired-renewal-title" className="mt-2 font-display text-3xl text-ink">
                    {pending ? "Yêu cầu gia hạn đang được xử lý" : "Gói dịch vụ đã hết hạn"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeExpiredDialog}
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-ink/10 bg-white/80 text-ink/70 transition-colors hover:bg-white hover:text-ink"
                  aria-label="Đóng popup yêu cầu gia hạn"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="px-6 py-6 sm:px-8 sm:py-7">
                <p className="text-base leading-7 text-ink/70">
                  {pending
                    ? "Yêu cầu gia hạn của bạn đã được ghi nhận. Đội ngũ quản trị hệ thống sẽ sớm liên hệ để hỗ trợ website này."
                    : "Gửi yêu cầu để đội ngũ quản trị hệ thống kiểm tra và hỗ trợ gia hạn website của bạn."}
                </p>
                <div className="mt-5 rounded-2xl border border-moss/10 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-ink">
                    {pending ? "Yêu cầu đã được ghi nhận." : "Thông tin sẽ được ghi nhận theo website hiện tại."}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink/60">
                    {pending
                      ? `Trạng thái hiện tại: đang xử lý. Đã gửi ngày ${new Date(subscription.latestRenewalRequest!.requestedAt).toLocaleDateString("vi-VN")}.`
                      : "Sau khi gửi, yêu cầu sẽ chuyển sang trạng thái đang xử lý và chúng tôi sẽ sớm liên hệ hỗ trợ bạn."}
                  </p>
                </div>
                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeExpiredDialog}
                    className="button-secondary"
                  >
                    {pending ? "Đóng" : "Để sau"}
                  </button>
                  {!pending ? (
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => void requestExpiredRenewal()}
                      className="button-primary min-w-[180px] disabled:opacity-60"
                    >
                      <Send size={16} aria-hidden="true" />
                      {sending ? "Đang gửi..." : "Yêu cầu gia hạn"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </dialog>
      ) : null}
    </>
  );
}

function Feature({ text }: { text: string }) {
  return <div className="flex items-center gap-3 text-sm"><span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={14} /></span>{text}</div>;
}

function Usage({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-moss/10 text-moss"><Icon size={18} /></span><div><p className="text-xs font-medium text-ink/60">{label}</p><strong className="mt-1 block">{value}</strong></div></div>;
}
