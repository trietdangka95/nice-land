import { EditPostScreen } from "@/components/admin/edit-post-screen";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return <EditPostScreen slug={slug} id={id} />;
}
