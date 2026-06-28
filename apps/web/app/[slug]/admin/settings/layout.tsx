"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isProfile = pathname.endsWith("/profile");

  return (
    <>
      <div className="mb-6 flex gap-6 border-b border-ink/10 pb-4">
        <Link 
          href={pathname.replace("/profile", "") || pathname}
          className={`flex items-center gap-2 text-sm font-bold transition-colors ${!isProfile ? "text-moss border-b-2 border-moss pb-4 -mb-[17px]" : "text-ink/60 hover:text-ink"}`}
        >
          <LayoutDashboard size={16} /> Cấu hình Website
        </Link>
        <Link 
          href={`${pathname.replace("/profile", "")}/profile`}
          className={`flex items-center gap-2 text-sm font-bold transition-colors ${isProfile ? "text-moss border-b-2 border-moss pb-4 -mb-[17px]" : "text-ink/60 hover:text-ink"}`}
        >
          <User size={16} /> Hồ sơ cá nhân
        </Link>
      </div>
      {children}
    </>
  );
}
