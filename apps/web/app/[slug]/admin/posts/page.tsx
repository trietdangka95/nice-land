import { AdminPostsTable } from "@/components/admin-posts-table";

export default async function AdminPostsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AdminPostsTable slug={slug} />;
}
