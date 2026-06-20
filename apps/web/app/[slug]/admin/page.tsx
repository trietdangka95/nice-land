import Link from "next/link";
import Image from "next/image";
import { CalendarClock, CircleCheckBig, FilePenLine, FileText, Plus, TrendingUp } from "lucide-react";
import { DashboardStat } from "@/components/dashboard-stat";
import { StatusPill } from "@/components/status-pill";
import { getPublicPosts, getSiteBySlug, properties } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { notFound } from "next/navigation";

export default async function TenantDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = getSiteBySlug(slug);
  if (!site) notFound();
  const allPosts = properties.filter((post) => post.siteId === site.id);
  const publicPosts = getPublicPosts(site.id);

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end" data-reveal="soft">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Thứ Sáu, 19 tháng 6</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Chào buổi tối, Minh Phát</h1>
          <p className="mt-2 text-sm text-ink/50">Đây là tình hình website của bạn hôm nay.</p>
        </div>
        <Link href={`/${slug}/admin/posts/create`} className="button-primary">
          <Plus size={17} />
          Đăng tin mới
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-reveal-group>
        <DashboardStat label="Tổng tin đăng" value={`${allPosts.length}`} detail="Giới hạn gói: 150 tin" icon={FileText} />
        <DashboardStat label="Đang hiển thị" value={`${publicPosts.length}`} detail="Tin công khai trên website" icon={CircleCheckBig} tone="green" />
        <DashboardStat label="Bản nháp" value="3" detail="Cần hoàn thiện nội dung" icon={FilePenLine} tone="gold" />
        <DashboardStat label="Lượt xem tháng này" value="2.418" detail="+18,4% so với tháng trước" icon={TrendingUp} tone="blue" />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]" data-reveal-group>
        <section className="border border-ink/10 bg-white">
          <div className="flex items-center justify-between border-b border-ink/10 p-5">
            <div>
              <h2 className="font-display text-2xl font-medium">Tin đăng gần đây</h2>
              <p className="mt-1 text-xs text-ink/45">Các nội dung được cập nhật mới nhất</p>
            </div>
            <Link href={`/${slug}/admin/posts`} className="text-xs font-bold text-moss">Xem tất cả</Link>
          </div>
          <div className="divide-y divide-ink/10">
            {allPosts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-4 sm:p-5">
                <div className="relative hidden size-14 overflow-hidden bg-sand sm:block">
                  <Image src={post.images[0]} alt="" fill className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold">{post.title}</h3>
                  <p className="mt-1 text-xs text-ink/45">{formatPrice(post.price, post.type)} · {post.area} m²</p>
                </div>
                <StatusPill tone={post.status === "PUBLISHED" ? "green" : post.status === "SOLD" ? "gold" : "gray"}>
                  {post.status === "PUBLISHED" ? "Đang đăng" : post.status === "SOLD" ? "Đã bán" : post.status}
                </StatusPill>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="border border-ink/10 bg-moss p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Gói hiện tại</p>
            <h2 className="mt-3 font-display text-3xl">{site.plan}</h2>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[68%] rounded-full bg-gold" />
            </div>
            <div className="mt-3 flex justify-between text-xs text-white/55">
              <span>102 / 150 tin</span>
              <span>68%</span>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5 text-sm">
              <CalendarClock size={17} className="text-gold" />
              Hết hạn ngày 30/06/2027
            </div>
          </section>
          <section className="border border-ink/10 bg-white p-6">
            <h2 className="font-display text-2xl">Việc nên làm tiếp</h2>
            <ul className="mt-5 space-y-4 text-sm">
              {["Hoàn thiện 3 bản nháp", "Thêm ảnh cho 2 tin đăng", "Kiểm tra thông tin liên hệ"].map((item, index) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-full bg-cream text-xs font-bold text-moss">{index + 1}</span>
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
