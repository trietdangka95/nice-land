"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ChevronLeft, ChevronRight, Edit3, Loader2, Plus, Search } from "lucide-react";
import type { AdminPost, PostStatus, PropertyType } from "@nice-land/contracts";
import { StatusPill } from "@/components/shared/status-pill";
import { createTenantApi } from "@/lib/api";
import { formatPrice, propertyTypeLabels } from "@/lib/format";
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

const statusLabels: Record<PostStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đang đăng",
  HIDDEN: "Đang ẩn",
  SOLD: "Đã bán",
  ARCHIVED: "Đã lưu trữ",
};

export function AdminPostsTable({ slug }: { slug: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const toast = useToast();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PostStatus | "">("");
  const [type, setType] = useState<PropertyType | "">("");
  const [province, setProvince] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      void client
        .listAdminPosts({
          q: query || undefined,
          status: status || undefined,
          type: type || undefined,
          province: province || undefined,
          page,
          limit: 10,
        })
        .then((result) => {
          if (active) {
            setPosts(result.items);
            setTotal(result.total);
            setTotalPages(result.totalPages);
          }
        })
        .catch((requestError: Error) => {
          if (active) {
            toast.error(
              getErrorMessage(requestError, "Không thể tải tin đăng."),
              "Không thể tải tin đăng",
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [client, page, query, refreshKey, status, type, province]);

  async function archive(post: AdminPost) {
    if (!window.confirm(`Lưu trữ tin “${post.title}”?`)) return;
    setArchivingId(post.id);
    try {
      await client.archiveAdminPost(post.id, post.version);
      await revalidateTenant(slug);
      if (posts.length === 1 && page > 1) {
        setPage((value) => value - 1);
      } else {
        setRefreshKey((value) => value + 1);
      }
      toast.success("Tin đã được lưu trữ.", "Đã lưu trữ tin");
    } catch (requestError) {
      toast.error(
        getErrorMessage(requestError, "Không thể lưu trữ tin."),
        "Không thể lưu trữ tin",
      );
    } finally {
      setArchivingId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Nội dung website</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Quản lý tin đăng</h1>
          <p className="mt-2 text-sm text-ink/50">
            <span className="tabular-nums">{total}</span> tin phù hợp bộ lọc
          </p>
        </div>
        <button
          onClick={async () => {
            setIsCreating(true);
            try {
              const post = await client.createAdminPost({
                title: "Tin đăng mới",
                description: "",
                type: "HOUSE",
                categoryId: null,
                price: null,
                area: null,
                province: null,
                district: null,
                ward: null,
                address: null,
                legalStatus: null,
                bedrooms: null,
                bathrooms: null,
                status: "DRAFT",
              });
              window.location.href = `/${slug}/admin/posts/${post.id}/edit`;
            } catch (error) {
              toast.error("Không thể tạo bản nháp.", "Lỗi hệ thống");
              setIsCreating(false);
            }
          }}
          disabled={isCreating}
          className="button-primary disabled:cursor-wait"
        >
          {isCreating ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
          {isCreating ? "Đang tạo..." : "Đăng tin mới"}
        </button>
      </div>

      <section className="mt-8 glass-panel rounded-3xl overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink/5 p-6 md:flex-row">
          <label className="relative flex-1 block">
            <span className="sr-only">Tìm tin đăng</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={17} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm pl-11 pr-4 text-sm focus:bg-white transition-colors"
              placeholder="Tìm theo tiêu đề..."
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as PostStatus | "");
              setPage(1);
            }}
            className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 text-sm font-semibold focus:bg-white transition-colors"
            aria-label="Lọc trạng thái"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đang đăng</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="HIDDEN">Đang ẩn</option>
            <option value="SOLD">Đã bán</option>
          </select>
          <select
            value={province}
            onChange={(event) => {
              setProvince(event.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 text-sm font-semibold focus:bg-white transition-colors max-w-40"
            aria-label="Lọc khu vực"
          >
            <option value="">Tất cả khu vực</option>
            {PROVINCES.sort().map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as PropertyType | "");
              setPage(1);
            }}
            className="h-11 rounded-xl bg-white/50 border border-ink/5 backdrop-blur-sm px-4 text-sm font-semibold focus:bg-white transition-colors"
            aria-label="Lọc loại hình"
          >
            <option value="">Tất cả loại hình</option>
            {Object.entries(propertyTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3 p-6" aria-busy="true" aria-label="Đang tải tin đăng">
            {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-ink/5" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="font-display text-2xl">Chưa có tin phù hợp</h2>
            <p className="mt-2 text-sm text-ink/50 font-medium">Thử đổi bộ lọc hoặc tạo tin đăng đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-ink/5 text-[10px] font-bold uppercase tracking-widest text-ink/50">
                <tr>
                  <th className="px-5 py-4">Bất động sản</th>
                  <th className="px-5 py-4">Loại hình</th>
                  <th className="px-5 py-4">Mức giá</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Cập nhật</th>
                  <th className="px-5 py-4"><span className="sr-only">Thao tác</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="truncate text-sm font-bold">{post.title}</p>
                        <p className="mt-1 text-xs text-ink/50 font-medium">{post.area ? `${post.area} m²` : "Chưa nhập diện tích"} · {post.district ?? "Chưa nhập khu vực"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-ink/60">{propertyTypeLabels[post.type]}</td>
                    <td className="px-6 py-4 text-sm font-bold">{post.price === null ? "Liên hệ" : formatPrice(post.price, post.type)}</td>
                    <td className="px-6 py-4">
                      <StatusPill tone={post.status === "PUBLISHED" ? "green" : post.status === "SOLD" ? "gold" : "gray"}>
                        {statusLabels[post.status]}
                      </StatusPill>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-ink/60">{new Date(post.updatedAt).toLocaleDateString("vi-VN")}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/${slug}/admin/posts/${post.id}/edit`}
                          className="grid size-9 place-items-center rounded-lg bg-white shadow-sm border border-ink/5 hover:border-moss/30 hover:text-moss transition-colors"
                          aria-label={`Sửa ${post.title}`}
                        >
                          <Edit3 size={15} />
                        </Link>
                        <button
                          onClick={() => void archive(post)}
                          disabled={archivingId === post.id}
                          className="grid size-9 place-items-center rounded-lg bg-white shadow-sm border border-ink/5 text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-wait"
                          aria-label={`Lưu trữ ${post.title}`}
                        >
                          {archivingId === post.id ? <Loader2 className="animate-spin" size={15} /> : <Archive size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <nav
            className="flex flex-col items-center justify-between gap-4 border-t border-ink/5 p-6 sm:flex-row"
            aria-label="Phân trang tin đăng quản trị"
          >
            <p className="text-sm font-medium text-ink/60">
              Trang <strong className="tabular-nums text-ink">{page}</strong> /{" "}
              <strong className="tabular-nums text-ink">{totalPages}</strong>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="button-secondary min-h-11 px-4 disabled:opacity-40"
              >
                <ChevronLeft size={17} aria-hidden="true" />
                Trang trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
                className="button-secondary min-h-11 px-4 disabled:opacity-40"
              >
                Trang sau
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
          </nav>
        )}
      </section>
    </>
  );
}
