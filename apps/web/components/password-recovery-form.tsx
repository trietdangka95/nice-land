"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { KeyRound, MailCheck } from "lucide-react";
import { ApiClientError } from "@nice-land/api-client";
import { api, createTenantApi } from "@/lib/api";

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const client = slug ? createTenantApi(slug) : api;
      const result = await client.forgotPassword({
        identifier: String(form.get("identifier") ?? ""),
      });
      setMessage(result.message);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Không thể gửi yêu cầu. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8">
      <span className="grid size-12 place-items-center bg-moss text-white">
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
            className="h-12 border border-ink/15 px-4 font-normal"
            name="identifier"
            autoComplete="username"
            required
            minLength={3}
          />
        </label>
        <button className="button-primary mt-2" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
        </button>
        {message && (
          <p role="status" className="text-sm font-semibold text-moss">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        <Link
          className="text-center text-sm font-semibold text-moss hover:underline"
          href={loginHref(slug, superAdmin)}
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
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      setError("Mật khẩu xác nhận chưa trùng khớp.");
      setLoading(false);
      return;
    }

    try {
      const client = slug ? createTenantApi(slug) : api;
      await client.resetPassword({ token, password });
      window.sessionStorage.removeItem("nice_land_access_token");
      setCompleted(true);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8">
      <span className="grid size-12 place-items-center bg-moss text-white">
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
            className="button-primary mt-6 inline-flex"
            href={loginHref(slug, superAdmin)}
          >
            Đăng nhập
          </Link>
        </div>
      ) : token ? (
        <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Mật khẩu mới
            <input
              className="h-12 border border-ink/15 px-4 font-normal"
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
              className="h-12 border border-ink/15 px-4 font-normal"
              name="confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <button className="button-primary mt-2" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
          {error && (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
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
        >
          Quay lại đăng nhập
        </Link>
      )}
    </div>
  );
}
