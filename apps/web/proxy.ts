import { NextRequest, NextResponse } from "next/server";
import { parseTenantSlug } from "@/lib/tenant";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "nice-land.id.vn";
  const host = request.headers.get("host") ?? "";
  const hostname = host.toLowerCase().split(":")[0];
  const cleanRootDomain = rootDomain.toLowerCase().split(":")[0];

  if (hostname === `www.${cleanRootDomain}`) {
    const url = request.nextUrl.clone();
    url.hostname = cleanRootDomain;
    return NextResponse.redirect(url, 308);
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/superadmin") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const slug = parseTenantSlug(host);
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
