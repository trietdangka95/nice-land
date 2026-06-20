import { ProtectedAdminShell } from "@/components/protected-admin-shell";

export default async function TenantAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <ProtectedAdminShell slug={slug}>{children}</ProtectedAdminShell>
  );
}
