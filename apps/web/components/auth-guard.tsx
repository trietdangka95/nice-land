"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, createTenantApi } from "@/lib/api";

export function AuthGuard({
  slug,
  superAdmin = false,
  children,
}: {
  slug?: string;
  superAdmin?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";
  const [ready, setReady] = useState(!requireAuth);

  useEffect(() => {
    if (!requireAuth) return;
    let active = true;
    const client = slug ? createTenantApi(slug) : api;

    async function authenticate() {
      try {
        let token = window.sessionStorage.getItem("nice_land_access_token");
        if (!token) {
          const refreshed = await client.refresh();
          token = refreshed.accessToken;
          window.sessionStorage.setItem("nice_land_access_token", token);
        }

        const user = await client.me();
        const validRole = superAdmin
          ? user.role === "SUPER_ADMIN"
          : user.role === "ADMIN" && user.siteId !== null;
        if (!validRole) throw new Error("Invalid role");
        if (active) setReady(true);
      } catch {
        window.sessionStorage.removeItem("nice_land_access_token");
        router.replace(
          superAdmin ? "/superadmin/login" : `/${slug}/admin/login`,
        );
      }
    }

    void authenticate();
    return () => {
      active = false;
    };
  }, [requireAuth, router, slug, superAdmin]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f5f2]">
        <p className="text-sm font-semibold text-ink/50">
          Đang kiểm tra phiên đăng nhập...
        </p>
      </main>
    );
  }

  return children;
}
