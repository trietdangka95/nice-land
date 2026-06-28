"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiClientError } from "@nice-land/api-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { AuthGuard } from "@/components/shared/auth-guard";
import { createTenantApi } from "@/lib/api";
import {
  siteSettingsToAdminIdentity,
  type AdminSiteIdentity,
} from "@/lib/admin-site";

function TenantAdminShell({
  slug,
  isExpired,
  children,
}: {
  slug: string;
  isExpired?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [site, setSite] = useState<AdminSiteIdentity>();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const loadSite = useCallback(async () => {
    setError("");
    try {
      const settings = await createTenantApi(slug).getSiteSettings();
      setSite(siteSettingsToAdminIdentity(settings));
    } catch (loadError) {
      if (loadError instanceof ApiClientError && loadError.status === 401) {
        window.sessionStorage.removeItem("nice_land_access_token");
        router.replace(`/${slug}/admin/login`);
        return;
      }
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải thông tin website.",
      );
    }
  }, [router, slug]);

  useEffect(() => {
    void loadSite();
  }, [attempt, loadSite]);

  useEffect(() => {
    const pathname = window.location.pathname;
    if (isExpired && !pathname.endsWith("/admin/subscription") && !pathname.endsWith("/admin/login")) {
      router.replace(`/${slug}/admin/subscription`);
    }
  }, [isExpired, router, slug]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f5f2] px-5">
        <div className="max-w-md border border-red-200 bg-white p-7 text-center">
          <h1 className="font-display text-2xl">Chưa tải được trang quản trị</h1>
          <p className="mt-3 text-pretty text-sm text-ink/55">{error}</p>
          <button
            className="button-primary mt-6"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  if (!site) {
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#f4f5f2]"
        aria-busy="true"
      >
        <p className="text-sm font-semibold text-ink/50">
          Đang tải thông tin website...
        </p>
      </main>
    );
  }

  return <AdminShell site={site} isExpired={isExpired}>{children}</AdminShell>;
}

export function ProtectedAdminShell({
  slug,
  superAdmin = false,
  isExpired = false,
  children,
}: {
  slug?: string;
  superAdmin?: boolean;
  isExpired?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (
    pathname.endsWith("/login") ||
    pathname.endsWith("/forgot-password") ||
    pathname.endsWith("/reset-password")
  ) {
    return children;
  }

  if (superAdmin) {
    return (
      <AuthGuard superAdmin>
        <AdminShell superAdmin>{children}</AdminShell>
      </AuthGuard>
    );
  }

  if (!slug) {
    return null;
  }

  return (
    <AuthGuard slug={slug}>
      <TenantAdminShell slug={slug} isExpired={isExpired}>{children}</TenantAdminShell>
    </AuthGuard>
  );
}
