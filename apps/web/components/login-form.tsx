"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { ApiClientError } from "@nice-land/api-client";
import { api, createTenantApi } from "@/lib/api";

export function LoginForm({
  slug,
  superAdmin = false,
}: {
  slug?: string;
  superAdmin?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const client = slug ? createTenantApi(slug) : api;
      const result = await client.login({
        username: String(form.get("username") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      window.sessionStorage.setItem(
        "nice_land_access_token",
        result.accessToken,
      );
      router.replace(superAdmin ? "/superadmin" : `/${slug}/admin`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Không thể đăng nhập. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8">
      <span className="grid size-12 place-items-center bg-moss text-white">
        <LockKeyhole size={22} />
      </span>
      <h1 className="mt-6 font-display text-4xl">
        {superAdmin ? "Quản trị hệ thống" : "Đăng nhập quản trị"}
      </h1>
      <p className="mt-2 text-sm text-ink/50">
        {superAdmin
          ? "Đăng nhập bằng tài khoản SUPER_ADMIN."
          : "Quản lý website và tin đăng của bạn."}
      </p>
      <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm font-bold">
          Tên đăng nhập
          <input
            className="h-12 border border-ink/15 px-4 font-normal"
            name="username"
            autoComplete="username"
            defaultValue={superAdmin ? "superadmin" : "admin"}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Mật khẩu
          <input
            className="h-12 border border-ink/15 px-4 font-normal"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
          />
        </label>
        <button className="button-primary mt-2" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        {error && (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
