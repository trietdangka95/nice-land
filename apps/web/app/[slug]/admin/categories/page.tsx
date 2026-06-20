import { AdminCategoriesScreen } from "@/components/admin-categories-screen";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AdminCategoriesScreen slug={slug} />;
}
