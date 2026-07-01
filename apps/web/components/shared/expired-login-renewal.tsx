"use client";

import { useEffect, useRef, useState } from "react";
import { ApiClientError } from "@nice-land/api-client";
import { Send, ShieldAlert, X } from "lucide-react";
import { createTenantApi } from "@/lib/api";
import { useToast } from "@/components/shared/toast-provider";
import { getErrorMessage } from "@/lib/notifications";

export function ExpiredLoginRenewal({
  slug,
  siteName,
}: {
  slug: string;
  siteName: string;
}) {
  const toast = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function close() {
    dialogRef.current?.close();
  }

  async function requestRenewal() {
    setSending(true);
    try {
      await createTenantApi(slug).createPublicRenewalRequest();
      setPending(true);
      toast.success(
        "Yêu cầu đang trong quá trình xử lý. Chúng tôi sẽ sớm liên hệ và hỗ trợ bạn.",
        "Đã ghi nhận yêu cầu",
      );
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        setPending(true);
        toast.success(
          "Yêu cầu gia hạn của website này đang được xử lý. Chúng tôi sẽ sớm liên hệ và hỗ trợ bạn.",
          "Đang xử lý",
        );
        return;
      }

      toast.error(
        getErrorMessage(error, "Không thể gửi yêu cầu gia hạn."),
        "Không thể gửi yêu cầu",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-left shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">Website hết hạn</p>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          {pending
            ? "Yêu cầu gia hạn đang được xử lý. Bạn có thể mở lại popup để xem trạng thái."
            : "Website này đang hết hạn gói dịch vụ. Bạn có thể gửi yêu cầu gia hạn ngay từ trang đăng nhập."}
        </p>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-600 px-4 text-sm font-bold text-white transition-colors hover:bg-amber-700"
        >
          {pending ? "Xem tình trạng yêu cầu" : "Yêu cầu gia hạn"}
        </button>
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby="expired-login-renewal-title"
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-black/50 p-0 backdrop:bg-transparent"
        onCancel={close}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <section className="mx-auto flex min-h-dvh w-full max-w-xl items-center px-5 py-8">
          <div className="w-full overflow-hidden rounded-[2rem] border border-ink/10 bg-[#fbf7ee] shadow-[0_28px_80px_rgba(23,33,27,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 py-5 sm:px-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-moss">Gia hạn dịch vụ</p>
                <h2 id="expired-login-renewal-title" className="mt-2 font-display text-3xl text-ink">
                  {pending ? "Yêu cầu gia hạn đang được xử lý" : `${siteName} đã hết hạn`}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-ink/10 bg-white/80 text-ink/70 transition-colors hover:bg-white hover:text-ink"
                aria-label="Đóng popup yêu cầu gia hạn"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                <ShieldAlert size={18} className="shrink-0" />
                <p className="text-sm font-semibold">
                  {pending
                    ? "Yêu cầu đã được ghi nhận và đang chờ đội ngũ xử lý."
                    : "Bạn đang ở trang đăng nhập vì website đã hết hạn gói dịch vụ."}
                </p>
              </div>
              <p className="mt-5 text-base leading-7 text-ink/70">
                {pending
                  ? "Chúng tôi sẽ sớm liên hệ và hỗ trợ bạn khôi phục hoạt động cho website này."
                  : "Bạn không cần vào bên trong admin để gửi yêu cầu. Hệ thống sẽ ghi nhận website hiện tại và chuyển tới superadmin xử lý."}
              </p>
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={close}
                  className="button-secondary"
                >
                  {pending ? "Đóng" : "Để sau"}
                </button>
                {!pending ? (
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => void requestRenewal()}
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
    </>
  );
}
