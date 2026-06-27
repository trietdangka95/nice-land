import { NextRequest, NextResponse } from "next/server";
import { parseTenantSlug } from "@/lib/tenant";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/superadmin") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const slug = parseTenantSlug(request.headers.get("host") ?? "");
  if (!slug || pathname.startsWith(`/${slug}`)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${slug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
