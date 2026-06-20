"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminPost } from "@nice-land/contracts";
import { PropertyForm } from "@/components/property-form";
import { createTenantApi } from "@/lib/api";

export function EditPostScreen({ slug, id }: { slug: string; id: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [post, setPost] = useState<AdminPost | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void client
      .getAdminPost(id)
      .then((result) => {
        if (active) setPost(result);
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [client, id]);

  if (error) {
    return <p role="alert" className="border border-red-200 bg-red-50 p-5 text-red-700">{error}</p>;
  }
  if (!post) {
    return <div className="h-64 animate-pulse bg-white" aria-label="Đang tải tin đăng" />;
  }

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Chỉnh sửa tin</p>
      <h1 className="mt-2 font-display text-4xl font-medium">{post.title}</h1>
      <p className="mt-2 text-sm text-ink/50">Phiên bản {post.version} · cập nhật {new Date(post.updatedAt).toLocaleString("vi-VN")}</p>
      <PropertyForm slug={slug} post={post} />
    </>
  );
}
