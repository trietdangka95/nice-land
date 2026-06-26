"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import type {
  PropertyCategory,
  PropertyCategoryInput,
} from "@nice-land/contracts";
import { createTenantApi } from "@/lib/api";
import { revalidateTenant } from "@/app/actions";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminCategoriesScreen({ slug }: { slug: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [editing, setEditing] = useState<PropertyCategory | null>(null);
  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCategories(await client.listAdminCategories());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải danh mục.",
      );
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setEditing(null);
    setName("");
    setCategorySlug("");
    setSlugTouched(false);
  }

  function edit(category: PropertyCategory) {
    setEditing(category);
    setName(category.name);
    setCategorySlug(category.slug);
    setSlugTouched(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const input: PropertyCategoryInput = {
      name,
      slug: categorySlug || slugify(name),
    };
    try {
      if (editing) {
        await client.updateAdminCategory(editing.id, input);
      } else {
        await client.createAdminCategory(input);
      }
      await revalidateTenant(slug);
      resetForm();
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể lưu danh mục.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(category: PropertyCategory) {
    if (
      category.postCount > 0 ||
      !window.confirm(`Xóa danh mục “${category.name}”?`)
    ) {
      return;
    }
    setError("");
    try {
      await client.deleteAdminCategory(category.id);
      await revalidateTenant(slug);
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể xóa danh mục.",
      );
    }
  }

  return (
    <>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">
          Phân loại nội dung
        </p>
        <h1 className="mt-2 text-balance font-display text-4xl font-medium">
          Danh mục bất động sản
        </h1>
        <p className="mt-2 text-pretty text-sm text-ink/50">
          Tạo nhóm nội dung để quản lý tin và giúp khách hàng tìm kiếm dễ hơn.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={submit}
          className="h-fit glass-panel rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl">
              {editing ? "Sửa danh mục" : "Thêm danh mục"}
            </h2>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="grid size-9 place-items-center rounded-lg bg-white/50 border border-ink/5 hover:bg-white transition-colors"
                aria-label="Hủy chỉnh sửa"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          <label className="mt-5 grid gap-2 text-sm font-bold">
            Tên danh mục
            <input
              value={name}
              onChange={(event) => {
                const value = event.target.value;
                setName(value);
                if (!slugTouched) setCategorySlug(slugify(value));
              }}
              className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors"
              placeholder="Ví dụ: Nhà phố"
              required
              minLength={2}
            />
          </label>
          <label className="mt-4 grid gap-2 text-sm font-bold">
            Đường dẫn
            <input
              value={categorySlug}
              onChange={(event) => {
                setSlugTouched(true);
                setCategorySlug(slugify(event.target.value));
              }}
              className="h-12 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 font-normal focus:bg-white transition-colors"
              placeholder="nha-pho"
              required
            />
          </label>
          <button
            disabled={saving}
            className="button-primary mt-5 w-full"
          >
            {editing ? <Pencil size={16} /> : <Plus size={17} />}
            {saving
              ? "Đang lưu..."
              : editing
                ? "Lưu thay đổi"
                : "Thêm danh mục"}
          </button>
        </form>

        <section className="glass-panel rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink/5 p-6">
            <div>
              <h2 className="font-display text-2xl">Danh sách danh mục</h2>
              <p className="mt-1 text-sm text-ink/45">
                {categories.length} danh mục đang hoạt động
              </p>
            </div>
            <Tags className="text-moss" size={24} aria-hidden="true" />
          </div>
          {loading ? (
            <div className="space-y-3 p-6" aria-busy="true">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-ink/5" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Tags className="mx-auto text-ink/20" size={34} />
              <h3 className="mt-4 font-display text-2xl">Chưa có danh mục</h3>
              <p className="mt-2 text-sm text-ink/50">
                Thêm danh mục đầu tiên bằng biểu mẫu bên cạnh.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-ink/5">
              {categories.map((category) => (
                <article
                  key={category.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:p-6 sm:flex-row sm:items-center hover:bg-white/40 transition-colors"
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-sm">
                      {category.name}
                    </strong>
                    <p className="mt-1 text-xs text-ink/45">
                      /{category.slug} ·{" "}
                      <span className="tabular-nums">
                        {category.postCount} tin
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => edit(category)}
                      className="button-secondary min-h-10 px-4"
                    >
                      <Pencil size={15} aria-hidden="true" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(category)}
                      disabled={category.postCount > 0}
                      className="grid size-10 place-items-center rounded-xl bg-white shadow-sm border border-ink/5 text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={
                        category.postCount > 0
                          ? `${category.name} đang được sử dụng`
                          : `Xóa ${category.name}`
                      }
                      title={
                        category.postCount > 0
                          ? "Không thể xóa danh mục đang có tin đăng"
                          : undefined
                      }
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
