"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { optimizeImageForUpload } from "@/lib/image-optimization";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import type {
  AdminPost,
  AdminPostInput,
  PostStatus,
  PropertyCategory,
  PropertyType,
} from "@nice-land/contracts";
import { createTenantApi } from "@/lib/api";

type FormState = {
  title: string;
  description: string;
  type: PropertyType;
  categoryId: string;
  price: string;
  area: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  legalStatus: string;
  bedrooms: string;
  bathrooms: string;
  status: Exclude<PostStatus, "ARCHIVED">;
};

function initialState(post?: AdminPost): FormState {
  return {
    title: post?.title ?? "",
    description: post?.description ?? "",
    type: post?.type ?? "HOUSE",
    categoryId: post?.categoryId ?? "",
    price: post?.price?.toString() ?? "",
    area: post?.area?.toString() ?? "",
    province: post?.province ?? "",
    district: post?.district ?? "",
    ward: post?.ward ?? "",
    address: post?.address ?? "",
    legalStatus: post?.legalStatus ?? "",
    bedrooms: post?.bedrooms?.toString() ?? "",
    bathrooms: post?.bathrooms?.toString() ?? "",
    status: post?.status === "ARCHIVED" ? "DRAFT" : post?.status ?? "DRAFT",
  };
}

export function PropertyForm({ slug, post }: { slug: string; post?: AdminPost }) {
  const router = useRouter();
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [form, setForm] = useState<FormState>(() => initialState(post));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [managingImage, setManagingImage] = useState<string | null>(null);
  const [images, setImages] = useState(post?.images ?? []);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);

  useEffect(() => {
    let active = true;
    void client
      .listAdminCategories()
      .then((result) => {
        if (active) setCategories(result);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, [client]);

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const input: AdminPostInput = {
      title: form.title,
      description: form.description,
      type: form.type,
      categoryId: form.categoryId || null,
      price: form.price ? Number(form.price) : null,
      area: form.area ? Number(form.area) : null,
      province: form.province || null,
      district: form.district || null,
      ward: form.ward || null,
      address: form.address || null,
      legalStatus: form.legalStatus || null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      status: form.status,
    };

    try {
      if (post) {
        await client.updateAdminPost(post.id, { ...input, version: post.version });
      } else {
        await client.createAdminPost(input);
      }
      setSaved(true);
      router.push(`/${slug}/admin/posts`);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể lưu tin đăng.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    if (!post || !event.target.files?.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(event.target.files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          throw new Error(`${file.name} không phải định dạng ảnh được hỗ trợ.`);
        }
        const optimizedFile = await optimizeImageForUpload(file);
        const mimeType = optimizedFile.type as
          | "image/jpeg"
          | "image/png"
          | "image/webp";
        const presigned = await client.presignPostImage(post.id, {
          fileName: optimizedFile.name,
          mimeType,
          size: optimizedFile.size,
        });
        const upload = await fetch(presigned.uploadUrl, {
          method: "PUT",
          headers: presigned.headers,
          body: optimizedFile,
        });
        if (!upload.ok) {
          throw new Error(`Upload ${file.name} lên S3 thất bại.`);
        }
        const completed = await client.completePostImage(post.id, {
          objectKey: presigned.objectKey,
          fileName: optimizedFile.name,
          mimeType,
          size: optimizedFile.size,
          altText: form.title,
        });
        setImages((current) => [
          ...current,
          { ...completed, altText: form.title },
        ]);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể upload ảnh.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function persistImageOrder(nextImages: typeof images) {
    if (!post) return;
    setError("");
    setManagingImage("reorder");
    try {
      await client.reorderPostImages(post.id, {
        imageIds: nextImages.map((image) => image.id),
      });
      setImages(
        nextImages.map((image, sortOrder) => ({ ...image, sortOrder })),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể sắp xếp ảnh.",
      );
    } finally {
      setManagingImage(null);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target]!, next[index]!];
    void persistImageOrder(next);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    if (!selected) return;
    next.unshift(selected);
    void persistImageOrder(next);
  }

  async function deleteImage(imageId: string) {
    if (!post || !window.confirm("Xóa ảnh này khỏi tin đăng?")) return;
    setManagingImage(imageId);
    setError("");
    try {
      await client.deletePostImage(post.id, imageId);
      setImages((current) =>
        current
          .filter((image) => image.id !== imageId)
          .map((image, sortOrder) => ({ ...image, sortOrder })),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể xóa ảnh.",
      );
    } finally {
      setManagingImage(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="border border-ink/10 bg-white p-5 sm:p-7">
          <h2 className="font-display text-2xl">Thông tin cơ bản</h2>
          <div className="mt-6 grid gap-5">
            <label className="grid gap-2 text-sm font-bold">
              Tiêu đề tin đăng
              <input value={form.title} onChange={(e) => field("title", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" required minLength={5} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Mô tả
              <textarea value={form.description} onChange={(e) => field("description", e.target.value)} className="min-h-40 border border-ink/15 p-4 font-normal" required minLength={20} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">
                Loại hình
                <select value={form.type} onChange={(e) => field("type", e.target.value as PropertyType)} className="h-12 border border-ink/15 px-4 font-normal">
                  <option value="HOUSE">Nhà ở</option>
                  <option value="APARTMENT">Căn hộ</option>
                  <option value="LAND">Đất</option>
                  <option value="RENTAL">Cho thuê</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Danh mục
                <select
                  value={form.categoryId}
                  onChange={(e) => field("categoryId", e.target.value)}
                  className="h-12 border border-ink/15 px-4 font-normal"
                >
                  <option value="">Chưa phân loại</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">
                Mức giá (đ)
                <input value={form.price} onChange={(e) => field("price", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" type="number" min="0" />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Diện tích (m²)
                <input value={form.area} onChange={(e) => field("area", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" type="number" min="0" step="0.1" />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold">Phòng ngủ<input value={form.bedrooms} onChange={(e) => field("bedrooms", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" type="number" min="0" /></label>
              <label className="grid gap-2 text-sm font-bold">Phòng tắm<input value={form.bathrooms} onChange={(e) => field("bathrooms", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" type="number" min="0" /></label>
              <label className="grid gap-2 text-sm font-bold">Pháp lý<input value={form.legalStatus} onChange={(e) => field("legalStatus", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" /></label>
            </div>
          </div>
        </section>
        <section className="border border-ink/10 bg-white p-5 sm:p-7">
          <h2 className="font-display text-2xl">Vị trí</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">Tỉnh / thành phố<input value={form.province} onChange={(e) => field("province", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold">Quận / huyện<input value={form.district} onChange={(e) => field("district", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold">Phường / xã<input value={form.ward} onChange={(e) => field("ward", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold">Địa chỉ chi tiết<input value={form.address} onChange={(e) => field("address", e.target.value)} className="h-12 border border-ink/15 px-4 font-normal" /></label>
          </div>
        </section>
      </div>
      <aside className="space-y-6">
        <section className="border border-ink/10 bg-white p-5">
          <h2 className="font-display text-xl">Hình ảnh</h2>
          {images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {images.map((image, index) => (
                <div key={image.id} className="border border-ink/10 bg-white">
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                    <Image
                      src={image.url}
                      alt={image.altText ?? form.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 bg-moss px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        Ảnh bìa
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 border-t border-ink/10">
                    <button
                      type="button"
                      onClick={() => makeCover(index)}
                      disabled={index === 0 || managingImage !== null}
                      className="grid h-9 place-items-center hover:bg-cream disabled:opacity-30"
                      aria-label="Đặt làm ảnh bìa"
                    >
                      <Star size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0 || managingImage !== null}
                      className="grid h-9 place-items-center hover:bg-cream disabled:opacity-30"
                      aria-label="Di chuyển ảnh sang trái"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1 || managingImage !== null}
                      className="grid h-9 place-items-center hover:bg-cream disabled:opacity-30"
                      aria-label="Di chuyển ảnh sang phải"
                    >
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteImage(image.id)}
                      disabled={managingImage !== null}
                      className="grid h-9 place-items-center hover:bg-red-50 hover:text-red-700 disabled:opacity-30"
                      aria-label="Xóa ảnh"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <label className="mt-5 grid min-h-44 w-full cursor-pointer place-items-center border border-dashed border-ink/25 bg-[#fafaf7] text-center">
            <span>
              <ImagePlus className="mx-auto text-moss" size={28} />
              <strong className="mt-3 block text-sm">
                {!post
                  ? "Lưu tin trước khi thêm ảnh"
                  : uploading
                    ? "Đang upload lên S3..."
                    : "Chọn ảnh tải lên"}
              </strong>
              <small className="mt-1 block text-ink/40">
                JPG, PNG, WebP · tự động tối ưu WebP tối đa 1920px
              </small>
            </span>
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={!post || uploading}
              onChange={(event) => void handleImages(event)}
            />
          </label>
        </section>
        <section className="border border-ink/10 bg-white p-5">
          <h2 className="font-display text-xl">Xuất bản</h2>
          <label className="mt-5 grid gap-2 text-sm font-bold">
            Trạng thái
            <select value={form.status} onChange={(e) => field("status", e.target.value as FormState["status"])} className="h-12 border border-ink/15 px-4 font-normal">
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Đăng công khai</option>
              <option value="HIDDEN">Ẩn tin</option>
              <option value="SOLD">Đã bán</option>
            </select>
          </label>
          <button disabled={saving} className="button-primary mt-5 w-full disabled:cursor-wait disabled:opacity-60">
            <Save size={17} />
            {saving ? "Đang lưu..." : post ? "Lưu thay đổi" : "Lưu tin đăng"}
          </button>
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          {saved && (
            <p role="status" className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={15} />
              Đã lưu thành công.
            </p>
          )}
        </section>
      </aside>
    </form>
  );
}
