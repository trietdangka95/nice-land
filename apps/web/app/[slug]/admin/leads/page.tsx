import { TenantLeadsScreen } from "@/components/tenant-leads-screen";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TenantLeadsScreen slug={slug} />;
}
