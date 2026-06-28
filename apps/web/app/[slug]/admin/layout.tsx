import { ProtectedAdminShell } from "@/components/admin/protected-admin-shell";
import { getTenantSite } from "@/lib/server-api";

export default async function TenantAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getTenantSite(slug);
  const isExpired = site?.subscriptionStatus === "EXPIRED" || site?.subscriptionStatus === "SUSPENDED";

  return (
    <ProtectedAdminShell slug={slug} isExpired={isExpired}>{children}</ProtectedAdminShell>
  );
}
