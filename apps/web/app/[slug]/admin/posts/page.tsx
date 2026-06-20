import { notFound } from "next/navigation";
import { AdminPostsTable } from "@/components/admin-posts-table";
import { getSiteBySlug, properties } from "@/lib/data";

export default async function AdminPostsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = getSiteBySlug(slug);
  if (!site) notFound();
  return <AdminPostsTable posts={properties.filter((post) => post.siteId === site.id)} slug={slug} />;
}
