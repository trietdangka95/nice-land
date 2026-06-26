"use client";

import { useEffect, useMemo, useState } from "react";
import type { TenantAnalytics } from "@nice-land/contracts";
import { Eye, Users } from "lucide-react";
import { createTenantApi } from "@/lib/api";
import { DashboardStat } from "@/components/dashboard-stat";

export function TenantAnalyticsScreen({ slug }: { slug: string }) {
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [data, setData] = useState<TenantAnalytics | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void client.getTenantAnalytics().then(setData).catch((e) => setError(e.message)); }, [client]);
  return <>
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Hiệu quả 30 ngày</p><h1 className="mt-2 font-display text-4xl font-medium">Lượt xem & chuyển đổi</h1>
    {error && <p className="mt-5 text-sm text-red-700">{error}</p>}
    {!data ? <div className="mt-8 h-40 animate-pulse bg-white rounded-3xl" /> : <><div className="mt-8 grid gap-4 sm:grid-cols-2"><DashboardStat label="Lượt xem" value={data.totals.views.toLocaleString("vi-VN")} detail="Đã chống trùng theo visitor/24h" icon={Eye} tone="blue" /><DashboardStat label="Lead" value={data.totals.leads.toLocaleString("vi-VN")} detail="Yêu cầu theo tin đăng" icon={Users} tone="gold" /></div><section className="mt-8 glass-panel rounded-3xl overflow-hidden"><div className="border-b border-ink/5 p-6"><h2 className="font-display text-2xl">Tin hiệu quả nhất</h2></div><div className="divide-y divide-ink/5">{data.topPosts.map((post, index) => <div key={post.id} className="grid grid-cols-[40px_1fr_auto_auto] items-center gap-4 p-6 hover:bg-white/40 transition-colors"><span className="font-display text-xl text-ink/35">{index + 1}</span><strong className="text-sm">{post.title}</strong><span className="text-xs font-medium text-ink/60">{post.views} lượt xem</span><span className="text-xs font-bold text-moss">{post.leads} lead</span></div>)}</div></section></>}
  </>;
}
