import { TenantAnalyticsScreen } from "@/components/tenant-analytics-screen";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TenantAnalyticsScreen slug={slug} />;
}
