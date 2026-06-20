import { notFound } from "next/navigation";
import { getSiteBySlug } from "@/lib/data";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = getSiteBySlug(slug);
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
