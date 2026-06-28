"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, Eye, EyeOff, Loader2 } from "lucide-react";
import { api, createTenantApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";

export function LoginForm({
  slug,
  superAdmin = false,
}: {
  slug?: string;
  superAdmin?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
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
      toast.error(
        getErrorMessage(requestError, "Không thể đăng nhập. Vui lòng thử lại."),
        "Đăng nhập thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl">
      <span className="grid size-12 place-items-center rounded-2xl bg-moss text-white shadow-lg shadow-moss/20">
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
            className="h-12 w-full rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors"
            name="username"
            autoComplete="username"
            defaultValue={superAdmin ? "superadmin" : "admin"}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Mật khẩu
          <div className="relative">
            <input
              className="h-12 w-full rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm pl-4 pr-12 font-normal focus:bg-white transition-colors"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70 transition-colors"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <button className="button-primary mt-2 w-full disabled:cursor-wait" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" size={16} />}
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <Link
          className="text-center text-sm font-semibold text-moss hover:underline"
          href={
            superAdmin
              ? "/superadmin/forgot-password"
              : `/${slug}/admin/forgot-password`
          }
          prefetch={false}
        >
          Quên mật khẩu?
        </Link>
      </form>
    </div>
  );
}
