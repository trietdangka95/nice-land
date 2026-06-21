"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CircleCheckBig,
  FilePenLine,
  FileText,
  Handshake,
  Plus,
  TrendingUp,
} from "lucide-react";
import type { TenantDashboard } from "@nice-land/contracts";
import { createTenantApi } from "@/lib/api";
import { DashboardStat } from "@/components/dashboard-stat";
import { StatusPill } from "@/components/status-pill";
import { formatPrice } from "@/lib/format";

const statusLabels = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đang đăng",
  HIDDEN: "Đang ẩn",
  SOLD: "Đã bán",
  ARCHIVED: "Đã lưu trữ",
} as const;

export function TenantDashboardScreen({ slug }: { slug: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [dashboard, setDashboard] = useState<TenantDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    client
      .getTenantDashboard()
      .then((result) => {
        if (!active) return;
        setDashboard(result);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Không thể tải dữ liệu tổng quan.",
          );
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [client]);

  const recentPosts = dashboard?.recentPosts ?? [];
  const totalPosts = dashboard?.postCounts.total ?? 0;
  const publishedPosts = dashboard?.postCounts.published ?? 0;
  const draftPosts = dashboard?.postCounts.draft ?? 0;
  const soldPosts = dashboard?.postCounts.sold ?? 0;
  const subscription = dashboard?.subscription ?? null;
  const engagement = dashboard?.engagement;

  if (loading) {
    return (
      <div
        className="h-96 animate-pulse border border-ink/10 bg-white"
        aria-label="Đang tải tổng quan"
      />
    );
  }

  const maxPosts = subscription?.plan?.maxPosts ?? 0;
  const usagePercent =
    maxPosts > 0 ? Math.min(100, Math.round((totalPosts / maxPosts) * 100)) : 0;

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">
            Tổng quan website
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium">
            Tình hình website của bạn
          </h1>
          <p className="mt-2 text-sm text-ink/50">
            Dữ liệu được cập nhật trực tiếp từ hệ thống.
          </p>
        </div>
        <Link href={`/${slug}/admin/posts/create`} className="button-primary">
          <Plus size={17} />
          Đăng tin mới
        </Link>
      </div>

      {error && (
        <p
          className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardStat
          label="Tổng tin đăng"
          value={`${totalPosts}`}
          detail={`Giới hạn gói: ${maxPosts || "—"} tin`}
          icon={FileText}
        />
        <DashboardStat
          label="Đang hiển thị"
          value={`${publishedPosts}`}
          detail="Tin công khai trên website"
          icon={CircleCheckBig}
          tone="green"
        />
        <DashboardStat
          label="Bản nháp"
          value={`${draftPosts}`}
          detail="Tin cần hoàn thiện"
          icon={FilePenLine}
          tone="gold"
        />
        <DashboardStat
          label="Đã bán"
          value={`${soldPosts}`}
          detail="Giao dịch đã hoàn tất"
          icon={Handshake}
          tone="green"
        />
        <DashboardStat
          label="Lượt xem 30 ngày"
          value={(engagement?.views ?? 0).toLocaleString("vi-VN")}
          detail={`${engagement?.leads ?? 0} lead trong cùng kỳ`}
          icon={TrendingUp}
          tone="blue"
        />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <section className="border border-ink/10 bg-white">
          <div className="flex items-center justify-between border-b border-ink/10 p-5">
            <div>
              <h2 className="font-display text-2xl font-medium">
                Tin đăng gần đây
              </h2>
              <p className="mt-1 text-xs text-ink/45">
                Tối đa 4 tin được cập nhật gần nhất
              </p>
            </div>
            <Link
              href={`/${slug}/admin/posts`}
              className="text-xs font-bold text-moss"
            >
              Xem tất cả
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-ink/45">Chưa có tin đăng nào.</p>
              <Link
                href={`/${slug}/admin/posts/create`}
                className="mt-4 inline-flex text-sm font-bold text-moss"
              >
                Tạo tin đầu tiên
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-ink/10">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 sm:p-5"
                >
                  <div className="relative hidden size-14 overflow-hidden bg-sand sm:block">
                    {post.images[0] ? (
                      <Image
                        src={post.images[0].url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <span className="grid size-full place-items-center text-xs text-ink/30">
                        Chưa có ảnh
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/${slug}/admin/posts/${post.id}/edit`}
                      className="block truncate text-sm font-bold hover:text-moss"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 text-xs text-ink/45">
                      {post.price === null
                        ? "Liên hệ"
                        : formatPrice(post.price, post.type)}
                      {" · "}
                      {post.area ? `${post.area} m²` : "Chưa nhập diện tích"}
                    </p>
                  </div>
                  <StatusPill
                    tone={
                      post.status === "PUBLISHED"
                        ? "green"
                        : post.status === "SOLD"
                          ? "gold"
                          : "gray"
                    }
                  >
                    {statusLabels[post.status]}
                  </StatusPill>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="border border-ink/10 bg-moss p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
              Gói hiện tại
            </p>
            <h2 className="mt-3 font-display text-3xl">
              {subscription?.plan?.name ?? "Chưa có gói"}
            </h2>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-white/55">
              <span>
                {totalPosts} / {maxPosts || "—"} tin
              </span>
              <span>{usagePercent}%</span>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5 text-sm">
              <CalendarClock size={17} className="text-gold" />
              {subscription?.endsAt
                ? `Hết hạn ngày ${new Date(subscription.endsAt).toLocaleDateString("vi-VN")}`
                : "Không có ngày hết hạn"}
            </div>
          </section>

          <section className="border border-ink/10 bg-white p-6">
            <h2 className="font-display text-2xl">Việc nên làm tiếp</h2>
            <ul className="mt-5 space-y-4 text-sm">
              {[
                draftPosts > 0
                  ? `Hoàn thiện ${draftPosts} bản nháp`
                  : "Nội dung bản nháp đã hoàn thiện",
                recentPosts.some((post) => post.images.length === 0)
                  ? "Bổ sung ảnh cho các tin chưa có ảnh"
                  : "Ảnh tin đăng đã đầy đủ",
                (engagement?.leads ?? 0) > 0
                  ? `Xử lý ${engagement?.leads} lead mới`
                  : "Theo dõi lead mới từ website",
              ].map((item, index) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-full bg-cream text-xs font-bold text-moss">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
