import Link from "next/link";
import { Activity, Building2, CircleDollarSign, FileText, Plus, TrendingUp, Users } from "lucide-react";
import { DashboardStat } from "@/components/dashboard-stat";
import { StatusPill } from "@/components/status-pill";
import { properties, sites } from "@/lib/data";

export default function SuperAdminDashboard() {
  const activeSites = sites.filter((site) => site.isActive).length;

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end" data-reveal="soft">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Tổng quan hệ thống</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Nền tảng đang vận hành tốt</h1>
          <p className="mt-2 text-sm text-ink/50">Cập nhật lúc 20:42, ngày 19/06/2026.</p>
        </div>
        <Link href="/superadmin/sites/create" className="button-primary">
          <Plus size={17} />
          Tạo website mới
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-reveal-group>
        <DashboardStat label="Website khách hàng" value={`${sites.length}`} detail={`${activeSites} website đang hoạt động`} icon={Building2} />
        <DashboardStat label="Tổng tin đăng" value={`${properties.length + 48}`} detail="+12 tin trong 30 ngày" icon={FileText} tone="blue" />
        <DashboardStat label="Doanh thu tháng" value="42,8 tr" detail="+8,6% so với tháng trước" icon={CircleDollarSign} tone="gold" />
        <DashboardStat label="Yêu cầu mới" value="7" detail="3 yêu cầu chưa xử lý" icon={Users} tone="gray" />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_0.7fr]" data-reveal-group>
        <section className="border border-ink/10 bg-white">
          <div className="flex items-center justify-between border-b border-ink/10 p-5">
            <div>
              <h2 className="font-display text-2xl">Website gần đây</h2>
              <p className="mt-1 text-xs text-ink/45">Trạng thái các tenant trong hệ thống</p>
            </div>
            <Link href="/superadmin/sites" className="text-xs font-bold text-moss">Quản lý tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-[#f8f8f5] text-[10px] uppercase tracking-widest text-ink/40">
                <tr>
                  <th className="px-5 py-4">Website</th>
                  <th className="px-5 py-4">Gói</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Hết hạn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center text-xs font-bold text-white" style={{ backgroundColor: site.themeColor }}>{site.logoMark}</span>
                        <div><strong className="block text-sm">{site.name}</strong><span className="text-xs text-ink/40">{site.slug}.datcuatoi.vn</span></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm">{site.plan}</td>
                    <td className="px-5 py-4">
                      <StatusPill tone={site.isActive ? site.subscriptionStatus === "TRIAL" ? "gold" : "green" : "red"}>
                        {site.isActive ? site.subscriptionStatus === "TRIAL" ? "Dùng thử" : "Hoạt động" : "Tạm ngưng"}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-4 text-xs text-ink/45">{new Date(site.subscriptionEnd).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="border border-ink/10 bg-ink p-6 text-white">
            <div className="flex items-center justify-between">
              <Activity className="text-gold" />
              <StatusPill tone="green">Ổn định</StatusPill>
            </div>
            <h2 className="mt-5 font-display text-2xl">Sức khỏe hệ thống</h2>
            <div className="mt-6 space-y-4 text-sm">
              {[
                ["API uptime", "99,99%"],
                ["Database", "24 ms"],
                ["Storage", "18,4 GB"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-t border-white/10 pt-4">
                  <span className="text-white/45">{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="border border-ink/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-moss" size={21} />
              <h2 className="font-display text-2xl">Tăng trưởng</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-ink/50">5 website mới và 486 tin đăng được tạo trong 30 ngày qua.</p>
          </section>
        </div>
      </div>
    </>
  );
}
