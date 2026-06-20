import { notFound } from "next/navigation";
import { getTenantSite } from "@/lib/server-api";
import { resolvePublicTheme } from "@/lib/public-themes";

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
      data-public-theme={resolvePublicTheme(site.themeKey)}
      className="tenant-public min-h-screen"
    >
      {children}
    </div>
  );
}
