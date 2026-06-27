"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, FileText, Plus, RefreshCw, Users } from "lucide-react";
import type { SuperAdminRenewalRequest, SuperAdminSite } from "@nice-land/contracts";
import { api } from "@/lib/api";
import { DashboardStat } from "@/components/shared/dashboard-stat";
import { StatusPill } from "@/components/shared/status-pill";
import { getErrorMessage } from "@/lib/notifications";
import { useToast } from "@/components/shared/toast-provider";

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "nice-land.id.vn";

export function SuperAdminDashboardScreen() {
  const toast = useToast();
  const [sites, setSites] = useState<SuperAdminSite[]>([]);
  const [renewals, setRenewals] = useState<SuperAdminRenewalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listSuperAdminSites({ limit: 50 }),
      api.listSuperAdminRenewals(),
    ])
      .then(([siteResult, renewalItems]) => {
        setSites(siteResult.items);
        setRenewals(renewalItems);
      })
      .catch((requestError) =>
        toast.error(
          getErrorMessage(requestError, "Không thể tải tổng quan."),
          "Không thể tải tổng quan",
        ),
      )
      .finally(() => setLoading(false));
  }, [toast]);

  const activeSites = sites.filter((site) => site.isActive).length;
  const postCount = sites.reduce((total, site) => total + site.usage.posts, 0);
  const pendingRenewals = renewals.filter((item) =>
    ["NEW", "IN_PROGRESS"].includes(item.status),
  ).length;

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Tổng quan hệ thống</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Vận hành nền tảng</h1>
          <p className="mt-2 text-sm text-ink/50">Số liệu được tổng hợp trực tiếp từ API.</p>
        </div>
        <Link href="/superadmin/sites/create" className="button-primary"><Plus size={17} /> Tạo website mới</Link>
      </div>
      {loading ? <div className="mt-8 h-36 animate-pulse bg-white" /> : <>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStat label="Website khách hàng" value={`${sites.length}`} detail={`${activeSites} đang hoạt động`} icon={Building2} />
          <DashboardStat label="Tổng tin đăng" value={postCount.toLocaleString("vi-VN")} detail="Chưa gồm tin đã archive" icon={FileText} tone="blue" />
          <DashboardStat label="Yêu cầu gia hạn" value={`${pendingRenewals}`} detail="Đang chờ xử lý" icon={RefreshCw} tone="gold" />
          <DashboardStat label="Tài khoản tenant" value={`${sites.reduce((total, site) => total + site.usage.users, 0)}`} detail="Tài khoản chưa soft-delete" icon={Users} tone="gray" />
        </div>
        <section className="mt-7 glass-panel rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink/5 p-6">
            <div>
              <h2 className="font-display text-2xl text-ink">Website gần đây</h2>
              <p className="mt-1 text-xs text-ink/50 font-medium tracking-wide uppercase">Trạng thái tenant mới nhất</p>
            </div>
            <Link href="/superadmin/sites" className="button-secondary !py-2 !px-4 !min-h-0 text-xs">Quản lý tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-ink/5 text-[10px] font-bold uppercase tracking-widest text-ink/50">
                <tr>
                  <th className="px-6 py-4">Website</th>
                  <th className="px-6 py-4">Gói</th>
                  <th className="px-6 py-4">Sử dụng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Hết hạn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {sites.slice(0, 8).map((site) => (
                  <tr key={site.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4">
                      <strong className="block text-sm font-semibold">{site.name}</strong>
                      <span className="text-xs text-ink/50">{site.slug}.{rootDomain}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{site.plan?.name ?? "Chưa gán"}</td>
                    <td className="px-6 py-4 text-xs font-medium text-ink/60">{site.usage.posts} tin · {site.usage.images} ảnh</td>
                    <td className="px-6 py-4">
                      <StatusPill tone={site.isActive ? "green" : "red"}>{site.isActive ? site.subscriptionStatus : "Tạm ngưng"}</StatusPill>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-ink/60">{site.subscriptionEnd ? new Date(site.subscriptionEnd).toLocaleDateString("vi-VN") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>}
    </>
  );
}
