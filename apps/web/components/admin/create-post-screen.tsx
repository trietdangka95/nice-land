"use client";

import { PropertyForm } from "@/components/admin/property-form";

export function CreatePostScreen({ slug }: { slug: string }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Đăng tin mới</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Tạo tin đăng bất động sản</h1>
      <p className="mt-2 text-sm text-ink/50">Điền đầy đủ thông tin để thu hút khách hàng tốt nhất.</p>
      <PropertyForm slug={slug} />
    </>
  );
}
