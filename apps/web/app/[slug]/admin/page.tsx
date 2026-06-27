import { TenantDashboardScreen } from "@/components/admin/tenant-dashboard-screen";

export default async function TenantDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TenantDashboardScreen slug={slug} />;
}
