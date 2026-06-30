import { Suspense } from "react";
import { SubscriptionScreen } from "@/components/admin/subscription-screen";

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="h-72 animate-pulse border border-ink/10 bg-white" />}>
      <SubscriptionScreen slug={slug} />
    </Suspense>
  );
}
