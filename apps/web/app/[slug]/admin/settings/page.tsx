import { SiteSettingsScreen } from "@/components/site-settings-screen";

export default async function SiteSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SiteSettingsScreen slug={slug} />;
}
