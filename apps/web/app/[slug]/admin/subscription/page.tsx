import { SubscriptionScreen } from "@/components/subscription-screen";

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SubscriptionScreen slug={slug} />;
}
