"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useTenantRouting(slug?: string) {
  const pathname = usePathname();
  const router = useRouter();

  const isPathBased = useMemo(() => {
    if (!slug) return false;
    return pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  }, [pathname, slug]);

  const getPath = useCallback(
    (path: string) => {
      if (!slug) return path;
      if (isPathBased) {
        if (path.startsWith("/")) {
          return `/${slug}${path === "/" ? "" : path}`;
        }
        if (path.startsWith("#")) {
          return `/${slug}${path}`;
        }
        if (path === "") {
          return `/${slug}`;
        }
        return `/${slug}/${path}`;
      } else {
        if (path === "") {
          return "/";
        }
        if (path.startsWith("#") && pathname !== "/") {
          return `/${path}`;
        }
      }
      return path;
    },
    [isPathBased, pathname, slug]
  );

  return useMemo(
    () => ({
      isPathBased,
      getPath,
      push: (path: string) => router.push(getPath(path)),
      replace: (path: string) => router.replace(getPath(path)),
      prefetch: (path: string) => router.prefetch(getPath(path)),
      refresh: () => router.refresh(),
    }),
    [isPathBased, getPath, router]
  );
}
