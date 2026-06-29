import type { Metadata } from "next";
import { CreatePostScreen } from "@/components/admin/create-post-screen";

export const metadata: Metadata = {
  title: "Đăng tin mới",
};

export default async function CreatePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CreatePostScreen slug={slug} />;
}
