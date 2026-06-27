"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { KeyRound, MailCheck } from "lucide-react";
import { api, createTenantApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";

function loginHref(slug?: string, superAdmin?: boolean) {
  return superAdmin ? "/superadmin/login" : `/${slug}/admin/login`;
}

export function ForgotPasswordForm({
  slug,
  superAdmin = false,
}: {
  slug?: string;
  superAdmin?: boolean;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const client = slug ? createTenantApi(slug) : api;
      const result = await client.forgotPassword({
        identifier: String(form.get("identifier") ?? ""),
      });
      toast.success(result.message, "Đã gửi yêu cầu");
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể gửi yêu cầu. Vui lòng thử lại."),
        "Không thể gửi yêu cầu",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl">
      <span className="grid size-12 place-items-center rounded-2xl bg-moss text-white shadow-lg shadow-moss/20">
        <MailCheck size={22} />
      </span>
      <h1 className="mt-6 font-display text-4xl">Quên mật khẩu</h1>
      <p className="mt-2 text-sm text-ink/50">
        Nhập tên đăng nhập hoặc email. Nếu tài khoản tồn tại, bạn sẽ nhận được
        liên kết đặt lại mật khẩu.
      </p>
      <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm font-bold">
          Tên đăng nhập hoặc email
          <input
            className="h-12 w-full rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors"
            name="identifier"
            autoComplete="username"
            required
            minLength={3}
          />
        </label>
        <button className="button-primary mt-2 w-full" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
        </button>
        <Link
          className="text-center text-sm font-semibold text-moss hover:underline"
          href={loginHref(slug, superAdmin)}
          prefetch={false}
        >
          Quay lại đăng nhập
        </Link>
      </form>
    </div>
  );
}

export function ResetPasswordForm({
  token,
  slug,
  superAdmin = false,
}: {
  token: string;
  slug?: string;
  superAdmin?: boolean;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      toast.warning("Mật khẩu xác nhận chưa trùng khớp.", "Kiểm tra mật khẩu");
      setLoading(false);
      return;
    }

    try {
      const client = slug ? createTenantApi(slug) : api;
      await client.resetPassword({ token, password });
      window.sessionStorage.removeItem("nice_land_access_token");
      setCompleted(true);
      toast.success("Mật khẩu đã được cập nhật.", "Đặt lại mật khẩu");
    } catch (requestError) {
      toast.error(
        getErrorMessage(
          requestError,
          "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
        ),
        "Không thể đặt lại mật khẩu",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl">
      <span className="grid size-12 place-items-center rounded-2xl bg-moss text-white shadow-lg shadow-moss/20">
        <KeyRound size={22} />
      </span>
      <h1 className="mt-6 font-display text-4xl">Tạo mật khẩu mới</h1>
      {completed ? (
        <div className="mt-6">
          <p className="text-sm text-ink/60">
            Mật khẩu đã được cập nhật. Các phiên đăng nhập cũ cũng đã bị thu
            hồi.
          </p>
          <Link
            className="button-primary mt-6 inline-flex w-full"
            href={loginHref(slug, superAdmin)}
            prefetch={false}
          >
            Đăng nhập
          </Link>
        </div>
      ) : token ? (
        <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Mật khẩu mới
            <input
              className="h-12 w-full rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Xác nhận mật khẩu
            <input
              className="h-12 w-full rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors"
              name="confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <button className="button-primary mt-2 w-full" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      ) : (
        <p role="alert" className="mt-6 text-sm font-semibold text-red-700">
          Liên kết đặt lại mật khẩu không hợp lệ.
        </p>
      )}
      {!completed && (
        <Link
          className="mt-6 block text-center text-sm font-semibold text-moss hover:underline"
          href={loginHref(slug, superAdmin)}
          prefetch={false}
        >
          Quay lại đăng nhập
        </Link>
      )}
    </div>
  );
}
