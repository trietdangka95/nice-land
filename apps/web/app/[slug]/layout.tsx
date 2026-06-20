import { notFound } from "next/navigation";
import { getTenantSite } from "@/lib/server-api";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getTenantSite(slug);
  if (!site) notFound();

  return (
    <div
      style={{ "--tenant-color": site.themeColor } as React.CSSProperties}
      className="min-h-screen bg-[#f4f1ea]"
    >
      {children}
    </div>
  );
}
