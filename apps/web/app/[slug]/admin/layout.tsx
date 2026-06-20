import { notFound } from "next/navigation";
import { ProtectedAdminShell } from "@/components/protected-admin-shell";
import { getSiteBySlug } from "@/lib/data";

export default async function TenantAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = getSiteBySlug(slug);
  if (!site) notFound();
  return (
    <ProtectedAdminShell site={site}>{children}</ProtectedAdminShell>
  );
}
