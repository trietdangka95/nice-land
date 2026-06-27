"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, createTenantApi } from "@/lib/api";
import type { AuthUser } from "@nice-land/contracts";

export const AuthContext = createContext<AuthUser | null>(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthGuard");
  return context;
}

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
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
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

        const fetchedUser = await client.me();
        const validRole = superAdmin
          ? fetchedUser.role === "SUPER_ADMIN"
          : fetchedUser.role === "ADMIN" && fetchedUser.siteId !== null;
        if (!validRole) throw new Error("Invalid role");
        if (active) {
          setUser(fetchedUser);
          setReady(true);
        }
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
  }, [router, slug, superAdmin]);

  if (!ready || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f5f2]">
        <p className="text-sm font-semibold text-ink/50">
          Đang kiểm tra phiên đăng nhập...
        </p>
      </main>
    );
  }

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
