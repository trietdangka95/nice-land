"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { optimizeImageForUpload } from "@/lib/image-optimization";
import { useTenantRouting } from "@/lib/use-tenant-routing";
import {
  ArrowLeft,
  ArrowRight,
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
import { revalidateTenant } from "@/app/actions";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";

const PROVINCES = [
  "Hà Nội", "Huế", "Hải Phòng", "Đà Nẵng", "TP. Hồ Chí Minh", "Cần Thơ",
  "Cao Bằng", "Điện Biên", "Hà Tĩnh", "Lai Châu", "Lạng Sơn", "Nghệ An", "Quảng Ninh", "Thanh Hóa", "Sơn La",
  "Tuyên Quang", "Lào Cai", "Thái Nguyên", "Phú Thọ", "Bắc Ninh", "Hưng Yên", "Ninh Bình",
  "Quảng Trị", "Quảng Ngãi", "Gia Lai", "Khánh Hòa", "Lâm Đồng", "Đắk Lắk",
  "Đồng Nai", "Tây Ninh", "Vĩnh Long", "Đồng Tháp", "Cà Mau", "An Giang"
];

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
  const router = useTenantRouting(slug);
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => initialState(post));
  const [saving, setSaving] = useState(false);
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
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
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
      toast.success("Đã lưu tin đăng.", "Lưu thành công");
      await revalidateTenant(slug);
      router.push("/admin/posts");
      router.refresh();
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể lưu tin đăng."),
        "Không thể lưu tin",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    if (!post || !event.target.files?.length) return;
    setUploading(true);
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
        await revalidateTenant(slug);
      }
      toast.success("Ảnh đã được tải lên và tối ưu.", "Upload thành công");
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể upload ảnh."),
        "Không thể upload ảnh",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function persistImageOrder(nextImages: typeof images) {
    if (!post) return;
    setManagingImage("reorder");
    try {
      await client.reorderPostImages(post.id, {
        imageIds: nextImages.map((image) => image.id),
      });
      setImages(
        nextImages.map((image, sortOrder) => ({ ...image, sortOrder })),
      );
      await revalidateTenant(slug);
      toast.success("Thứ tự ảnh đã được cập nhật.", "Đã sắp xếp ảnh");
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể sắp xếp ảnh."),
        "Không thể sắp xếp ảnh",
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
    try {
      await client.deletePostImage(post.id, imageId);
      setImages((current) =>
        current
          .filter((image) => image.id !== imageId)
          .map((image, sortOrder) => ({ ...image, sortOrder })),
      );
      await revalidateTenant(slug);
      toast.success("Ảnh đã được xóa khỏi tin đăng.", "Đã xóa ảnh");
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể xóa ảnh."),
        "Không thể xóa ảnh",
      );
    } finally {
      setManagingImage(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-2xl">Thông tin cơ bản</h2>
          <div className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-bold text-ink/80">
              Tiêu đề tin đăng
              <input value={form.title} onChange={(e) => field("title", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" required minLength={5} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink/80">
              Mô tả
              <textarea value={form.description} onChange={(e) => field("description", e.target.value)} className="min-h-40 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm p-4 font-normal focus:bg-white transition-colors" required minLength={20} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-ink/80">
                Loại hình
                <select value={form.type} onChange={(e) => field("type", e.target.value as PropertyType)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors">
                  <option value="HOUSE">Căn liền thổ</option>
                  <option value="APARTMENT">Căn hộ</option>
                  <option value="LAND">Đất</option>
                  <option value="RENTAL">Cho thuê</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink/80">
                Danh mục
                <select
                  value={form.categoryId}
                  onChange={(e) => field("categoryId", e.target.value)}
                  className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors"
                >
                  <option value="">Chưa phân loại</option>
                  {categories.filter(c => c.type === form.type).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2 text-sm font-bold text-ink/80">
                Mức giá (đ)
                <input value={form.price} onChange={(e) => field("price", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" type="number" min="0" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => field("price", form.price ? String(Number(form.price) * 1000000) : "1000000")}
                      className="rounded-lg bg-moss/10 px-2 py-1 text-xs font-semibold text-moss hover:bg-moss/20 transition-colors"
                    >
                      + Triệu
                    </button>
                    <button
                      type="button"
                      onClick={() => field("price", form.price ? String(Number(form.price) * 1000000000) : "1000000000")}
                      className="rounded-lg bg-moss/10 px-2 py-1 text-xs font-semibold text-moss hover:bg-moss/20 transition-colors"
                    >
                      + Tỷ
                    </button>
                  </div>
                  {form.price && (
                    <span className="text-xs font-medium text-moss">
                      {new Intl.NumberFormat("vi-VN").format(Number(form.price))} đ
                    </span>
                  )}
                </div>
              </div>
              <label className="grid gap-2 text-sm font-bold text-ink/80">
                Diện tích (m²)
                <input value={form.area} onChange={(e) => field("area", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" type="number" min="0" step="0.1" />
              </label>
            </div>
            <div className={`grid gap-5 ${form.type === "LAND" ? "sm:grid-cols-1" : "sm:grid-cols-3"}`}>
              {form.type !== "LAND" && (
                <>
                  <label className="grid gap-2 text-sm font-bold text-ink/80">Phòng ngủ<input value={form.bedrooms} onChange={(e) => field("bedrooms", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" type="number" min="0" /></label>
                  <label className="grid gap-2 text-sm font-bold text-ink/80">Phòng tắm<input value={form.bathrooms} onChange={(e) => field("bathrooms", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" type="number" min="0" /></label>
                </>
              )}
              <label className="grid gap-2 text-sm font-bold text-ink/80">Pháp lý<input value={form.legalStatus} onChange={(e) => field("legalStatus", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" /></label>
            </div>
          </div>
        </section>
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-2xl">Vị trí</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-ink/80">
              Tỉnh / thành phố
              <input list="provinces-list" placeholder="Chọn hoặc nhập tên tỉnh..." value={form.province} onChange={(e) => field("province", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" />
              <datalist id="provinces-list">
                {PROVINCES.map(p => <option key={p} value={p} />)}
              </datalist>
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink/80">Quận / huyện<input value={form.district} onChange={(e) => field("district", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" /></label>
            <label className="grid gap-2 text-sm font-bold text-ink/80">Phường / xã<input value={form.ward} onChange={(e) => field("ward", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" /></label>
            <label className="grid gap-2 text-sm font-bold text-ink/80">Địa chỉ chi tiết<input value={form.address} onChange={(e) => field("address", e.target.value)} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors" /></label>
          </div>
        </section>
      </div>
      <aside className="space-y-6">
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-xl">Hình ảnh</h2>
          {images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {images.map((image, index) => (
                <div key={image.id} className="rounded-xl overflow-hidden border border-ink/10 bg-white/50 backdrop-blur-sm">
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                    <Image
                      src={image.url}
                      alt={image.altText ?? form.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded bg-moss/90 backdrop-blur px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        Ảnh bìa
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 border-t border-ink/5">
                    <button
                      type="button"
                      onClick={() => makeCover(index)}
                      disabled={index === 0 || managingImage !== null}
                      className="grid h-9 place-items-center hover:bg-white/80 hover:text-moss disabled:opacity-30 transition-colors"
                      aria-label="Đặt làm ảnh bìa"
                    >
                      <Star size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0 || managingImage !== null}
                      className="grid h-9 place-items-center hover:bg-white/80 hover:text-moss disabled:opacity-30 transition-colors"
                      aria-label="Di chuyển ảnh sang trái"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1 || managingImage !== null}
                      className="grid h-9 place-items-center hover:bg-white/80 hover:text-moss disabled:opacity-30 transition-colors"
                      aria-label="Di chuyển ảnh sang phải"
                    >
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteImage(image.id)}
                      disabled={managingImage !== null}
                      className="grid h-9 place-items-center hover:bg-red-50 hover:text-red-700 disabled:opacity-30 transition-colors"
                      aria-label="Xóa ảnh"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <label className="mt-6 grid min-h-44 w-full cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-ink/20 bg-white/30 backdrop-blur hover:bg-white/50 transition-colors text-center">
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
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-xl">Xuất bản</h2>
          <label className="mt-6 grid gap-2 text-sm font-bold text-ink/80">
            Trạng thái
            <select value={form.status} onChange={(e) => field("status", e.target.value as FormState["status"])} className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors">
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLISHED">Đăng công khai</option>
              <option value="HIDDEN">Ẩn tin</option>
              <option value="SOLD">Đã bán</option>
            </select>
          </label>
          <button disabled={saving} className="button-primary mt-5 w-full disabled:cursor-wait disabled:opacity-60">
            <Save size={17} />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </section>
      </aside>
    </form>
  );
}
