import { SuperAdminSiteForm } from "@/components/superadmin/superadmin-site-form";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SuperAdminSiteForm siteId={id} />;
}
