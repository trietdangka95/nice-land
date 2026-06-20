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
  Menu,
  Plus,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";
import type { Site } from "@/lib/types";
import { api, createTenantApi } from "@/lib/api";

export function AdminShell({
  site,
  superAdmin = false,
  children,
}: {
  site?: Site;
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
        [Users, "Yêu cầu liên hệ", `${base}/contacts`],
        [BarChart3, "Nhật ký hệ thống", `${base}/audit-logs`],
      ]
    : [
        [LayoutDashboard, "Tổng quan", base],
        [FileText, "Quản lý tin", `${base}/posts`],
        [Plus, "Đăng tin mới", `${base}/posts/create`],
        [Settings, "Cấu hình website", `${base}/settings`],
        [WalletCards, "Gói dịch vụ", `${base}/subscription`],
      ];

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
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <span className="grid size-10 place-items-center bg-gold font-display font-bold text-ink">
            {superAdmin ? "Đ" : site?.logoMark}
          </span>
          <div>
            <strong className="block font-display text-lg">{superAdmin ? "Đất Của Tôi" : site?.name}</strong>
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
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
            const active = pathname === href || (href !== base && pathname.startsWith(href as string));
            return (
              <Link
                key={label as string}
                href={href as string}
                className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold transition ${
                  active ? "bg-white text-ink" : "text-white/60 hover:bg-white/5 hover:text-white"
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
            <button className="grid size-10 place-items-center border border-ink/10 min-[901px]:hidden" aria-label="Mở menu quản trị">
              <Menu size={19} />
            </button>
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
