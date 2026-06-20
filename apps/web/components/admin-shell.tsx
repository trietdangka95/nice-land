"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Tags,
  Users,
  WalletCards,
} from "lucide-react";
import { api, createTenantApi } from "@/lib/api";
import type { AdminSiteIdentity } from "@/lib/admin-site";
import { findActiveNavigationHref } from "@/lib/navigation";
import { MobileNavigation } from "@/components/mobile-navigation";

export function AdminShell({
  site,
  superAdmin = false,
  children,
}: {
  site?: AdminSiteIdentity;
  superAdmin?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const base = superAdmin ? "/superadmin" : `/${site?.slug}/admin`;
  const nav = superAdmin
    ? [
      [LayoutDashboard, "Tổng quan", base],
      [Building2, "Website khách hàng", `${base}/sites`],
      [WalletCards, "Gói dịch vụ", `${base}/plans`],
      [Users, "Liên hệ & gia hạn", `${base}/contacts`],
      [BarChart3, "Nhật ký hệ thống", `${base}/audit-logs`],
    ]
    : [
      [LayoutDashboard, "Tổng quan", base],
      [FileText, "Quản lý tin", `${base}/posts`],
      [Plus, "Đăng tin mới", `${base}/posts/create`],
      [Tags, "Danh mục", `${base}/categories`],
      [Users, "Lead khách hàng", `${base}/leads`],
      [BarChart3, "Lượt xem & hiệu quả", `${base}/analytics`],
      [Settings, "Cấu hình website", `${base}/settings`],
      [WalletCards, "Gói dịch vụ", `${base}/subscription`],
    ];
  const activeHref = findActiveNavigationHref(
    pathname,
    nav.map(([, , href]) => href as string),
    base,
  );

  async function handleLogout() {
    const client = site ? createTenantApi(site.slug) : api;
    try {
      await client.logout();
    } finally {
      window.sessionStorage.removeItem("datcuatoi_access_token");
      router.replace(
        superAdmin ? "/superadmin/login" : `/${site?.slug}/admin/login`,
      );
      router.refresh();
    }
  }

  return (
    <div className="admin-grid bg-[#f4f5f2]">
      <aside className="hidden bg-ink text-white min-[901px]:flex min-[901px]:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <span className="grid size-10 shrink-0 place-items-center border border-white/10 bg-gold font-display text-sm font-bold text-ink">
            {superAdmin ? "Đ" : site?.logoMark}
          </span>
          <div className="min-w-0">
            <strong
              className="block truncate font-display text-base font-semibold leading-5"
              title={superAdmin ? "Đất Của Tôi" : site?.name}
            >
              {superAdmin ? "Đất Của Tôi" : site?.name}
            </strong>
            <span className="mt-1 block whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.14em] text-white/45">
              {superAdmin ? "Quản trị hệ thống" : "Trang quản trị"}
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4" aria-label="Điều hướng quản trị">
          <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            Quản lý
          </p>
          {nav.map(([Icon, label, href]) => {
            const NavIcon = Icon as typeof LayoutDashboard;
            const active = href === activeHref;
            return (
              <Link
                key={label as string}
                href={href as string}
                className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold transition ${active ? "bg-white text-ink" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <NavIcon size={18} strokeWidth={1.7} />
                {label as string}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          {!superAdmin && site && (
            <Link href={`/${site.slug}`} className="flex items-center gap-3 px-3 py-3 text-sm text-white/55 hover:text-white">
              <ExternalLink size={17} />
              Xem website
            </Link>
          )}
          <button
            className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/55 hover:text-white"
            onClick={() => void handleLogout()}
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex h-20 items-center justify-between border-b border-ink/10 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <MobileNavigation
              label="Mở menu quản trị"
              title={superAdmin ? "Đất Của Tôi" : site?.name ?? "Trang quản trị"}
              triggerClassName="grid size-10 place-items-center border border-ink/10 min-[901px]:hidden"
            >
              <nav className="flex-1 space-y-1 p-4" aria-label="Điều hướng quản trị trên di động">
                <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Quản lý
                </p>
                {nav.map(([Icon, label, href]) => {
                  const NavIcon = Icon as typeof LayoutDashboard;
                  const active = href === activeHref;
                  return (
                    <Link
                      key={label as string}
                      href={href as string}
                      className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold ${active
                          ? "bg-white text-ink"
                          : "text-white/65 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <NavIcon size={18} strokeWidth={1.7} aria-hidden="true" />
                      {label as string}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-white/10 p-4">
                {!superAdmin && site && (
                  <Link
                    href={`/${site.slug}`}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-white/60"
                  >
                    <ExternalLink size={17} aria-hidden="true" />
                    Xem website
                  </Link>
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-3 text-sm text-white/60"
                  onClick={() => void handleLogout()}
                >
                  <LogOut size={17} aria-hidden="true" />
                  Đăng xuất
                </button>
              </div>
            </MobileNavigation>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
                {superAdmin ? "Hệ thống" : "Website hiện tại"}
              </p>
              <button className="mt-1 flex items-center gap-2 text-sm font-bold">
                {superAdmin ? "Tất cả website" : site?.name}
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative grid size-10 place-items-center border border-ink/10" aria-label="Thông báo">
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="hidden items-center gap-3 sm:flex">
              <span className="grid size-10 place-items-center rounded-full bg-moss text-sm font-bold text-white">
                {superAdmin ? "SA" : "MP"}
              </span>
              <div>
                <strong className="block text-xs">{superAdmin ? "Quản trị hệ thống" : "Nguyễn Minh Phát"}</strong>
                <span className="text-[10px] text-ink/40">{superAdmin ? "SUPER_ADMIN" : "ADMIN"}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-5 sm:p-8 lg:p-10">{children}</div>
      </div>
    </div>
  );
}
