"use client";

import Link from "next/link";
import { ComponentProps } from "react";
import { usePathname } from "next/navigation";

interface TenantLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string;
  slug: string;
}

export function TenantLink({ href, slug, ...props }: TenantLinkProps) {
  const pathname = usePathname();
  // Check if the current URL starts with /slug. If it does, we are using path-based routing.
  // Otherwise, we are using a subdomain (or custom domain).
  const isPathBased = pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  
  let targetHref = href;
  if (isPathBased) {
    if (href.startsWith("/")) {
      targetHref = `/${slug}${href === "/" ? "" : href}`;
    } else if (href.startsWith("#")) {
      targetHref = `/${slug}${href}`;
    } else if (href === "") {
      targetHref = `/${slug}`;
    } else {
      targetHref = `/${slug}/${href}`;
    }
  } else {
    // If we are on subdomain, empty string or "/" means the root of the subdomain
    if (href === "") {
      targetHref = "/";
    } else if (href.startsWith("#") && pathname !== "/") {
      targetHref = `/${href}`;
    }
  }

  return <Link href={targetHref} {...props} />;
}
