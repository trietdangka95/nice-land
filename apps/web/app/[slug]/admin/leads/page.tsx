import { Suspense } from "react";
import { TenantLeadsScreen } from "@/components/admin/tenant-leads-screen";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="h-72 animate-pulse border border-ink/10 bg-white" />}>
      <TenantLeadsScreen slug={slug} />
    </Suspense>
  );
}
