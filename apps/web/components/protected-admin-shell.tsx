"use client";

import { usePathname } from "next/navigation";
import type { Site } from "@/lib/types";
import { AdminShell } from "@/components/admin-shell";
import { AuthGuard } from "@/components/auth-guard";

export function ProtectedAdminShell({
  site,
  superAdmin = false,
  children,
}: {
  site?: Site;
  superAdmin?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.endsWith("/login")) {
    return children;
  }

  return (
    <AuthGuard slug={site?.slug} superAdmin={superAdmin}>
      <AdminShell site={site} superAdmin={superAdmin}>
        {children}
      </AdminShell>
    </AuthGuard>
  );
}
