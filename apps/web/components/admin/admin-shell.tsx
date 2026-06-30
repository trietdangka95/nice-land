"use client";

import { TenantLink } from "@/components/shared/tenant-link";
import { useTenantRouting } from "@/lib/use-tenant-routing";
import { usePathname } from "next/navigation";
import {
  BarChart3,
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
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { useAuth } from "@/components/shared/auth-guard";
import { AdminNotificationsBell } from "@/components/admin/admin-notifications-bell";

export function AdminShell({
  site,
  superAdmin = false,
  isExpired = false,
  children,
}: {
  site?: AdminSiteIdentity;
  superAdmin?: boolean;
  isExpired?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useTenantRouting(site?.slug);
  const user = useAuth();
  
  const displayName = user.fullName || user.username;
  const initials = user.fullName
    ? user.fullName.split(/\s+/).filter(Boolean).slice(-2).map(p => p[0]).join("").toUpperCase()
    : user.username.slice(0, 2).toUpperCase();

  const base = superAdmin ? "/superadmin" : "/admin";
  let nav = superAdmin
    ? [
      [LayoutDashboard, "Tổng quan", base],
      [Building2, "Website khách hàng", `${base}/sites`],
      [WalletCards, "Gói dịch vụ", `${base}/plans`],
      [Users, "Liên hệ & gia hạn", `${base}/contacts`],
      [BarChart3, "Nhật ký hệ thống", `${base}/audit-logs`],
      [Settings, "Cấu hình thanh toán", `${base}/settings`],
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

  if (isExpired && !superAdmin) {
    nav = [
      [WalletCards, "Gói dịch vụ", `${base}/subscription`],
    ];
  }

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
      window.sessionStorage.removeItem("nice_land_access_token");
      if (superAdmin) {
        window.location.href = "/superadmin/login";
      } else {
        router.replace("/admin/login");
        // Force reload to clear state
        setTimeout(() => window.location.reload(), 100);
      }
    }
  }

  return (
    <div className="admin-grid relative overflow-hidden bg-background">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-moss/15 gradient-glow z-0 pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gold/20 gradient-glow animation-delay-2000 z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-leaf/10 gradient-glow animation-delay-4000 z-0 pointer-events-none"></div>

      <aside className="hidden glass-dark text-white min-[901px]:flex min-[901px]:flex-col relative z-10 border-r border-white/10">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/20 border border-gold/30 shadow-inner font-display text-sm font-bold text-gold">
            {superAdmin ? "Đ" : site?.logoMark}
          </span>
          <div className="min-w-0">
            <strong
              className="block truncate font-display text-base font-semibold leading-5 text-white"
              title={superAdmin ? "Nice Land" : site?.name}
            >
              {superAdmin ? "Nice Land" : site?.name}
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
              <TenantLink
                slug={site?.slug || ""}
                key={label as string}
                href={href as string}
                prefetch={false}
                className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold transition-all rounded-xl mx-2 ${active ? "bg-moss/20 text-gold border border-gold/10 shadow-inner" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <NavIcon size={18} strokeWidth={1.7} />
                {label as string}
              </TenantLink>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          {!superAdmin && site && (
            <TenantLink slug={site.slug} href="" prefetch={false} className="flex items-center gap-3 px-3 py-3 text-sm text-white/55 hover:text-white">
              <ExternalLink size={17} />
              Xem website
            </TenantLink>
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

      <div className="min-w-0 relative z-10 flex flex-col h-screen">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-ink/5 glass-panel px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <MobileNavigation
              label="Mở menu quản trị"
              title={superAdmin ? "Nice Land" : site?.name ?? "Trang quản trị"}
              triggerClassName="grid size-10 place-items-center border border-ink/10 min-[901px]:hidden"
              align="left"
            >
              <nav className="flex-1 space-y-1 p-4" aria-label="Điều hướng quản trị trên di động">
                <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Quản lý
                </p>
                {nav.map(([Icon, label, href]) => {
                  const NavIcon = Icon as typeof LayoutDashboard;
                  const active = href === activeHref;
                  return (
                    <TenantLink
                      slug={site?.slug || ""}
                      key={label as string}
                      href={href as string}
                      prefetch={false}
                      className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold transition-all rounded-xl mx-2 ${active
                          ? "bg-moss/20 text-gold border border-gold/10 shadow-inner"
                          : "text-white/65 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <NavIcon size={18} strokeWidth={1.7} aria-hidden="true" />
                      {label as string}
                    </TenantLink>
                  );
                })}
              </nav>
              <div className="border-t border-white/10 p-4">
                {!superAdmin && site && (
                  <TenantLink
                    slug={site.slug}
                    href=""
                    prefetch={false}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-white/60"
                  >
                    <ExternalLink size={17} aria-hidden="true" />
                    Xem website
                  </TenantLink>
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
            <AdminNotificationsBell
              superAdmin={superAdmin}
              siteSlug={site?.slug}
              onNavigate={(href) => router.push(href)}
            />
            <div className="hidden items-center gap-3 sm:flex">
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-moss to-ink shadow-md text-sm font-bold text-white border border-white/20">
                {superAdmin ? "SA" : initials}
              </span>
              <div>
                <strong className="block text-xs font-semibold truncate max-w-[150px]" title={displayName}>{superAdmin ? "Quản trị hệ thống" : displayName}</strong>
                <span className="text-[10px] text-ink/50 font-medium tracking-wide">{superAdmin ? "SUPER_ADMIN" : "ADMIN"}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">{children}</div>
      </div>
    </div>
  );
}
