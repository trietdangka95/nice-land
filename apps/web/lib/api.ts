import { createApiClient } from "@nice-land/api-client";
import { getApiBaseUrl } from "@/lib/api-url";

function getRootDomain() {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "nice-land.id.vn";
}

export function resolveTenantHost(
  slug: string,
  locationLike: Pick<Location, "hostname" | "pathname">,
) {
  const { hostname, pathname } = locationLike;
  const isPathBased =
    pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);

  if (isPathBased) {
    const rootDomain = getRootDomain();
    if (hostname === "localhost" || rootDomain === "localhost") {
      return `${slug}.localhost`;
    }
    return `${slug}.${rootDomain}`;
  }

  return hostname === "localhost" ? `${slug}.localhost` : hostname;
}

export const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getTenantHost: () =>
    typeof window === "undefined" ? undefined : window.location.hostname,
  getAccessToken: () =>
    typeof window === "undefined"
      ? undefined
      : window.sessionStorage.getItem("nice_land_access_token") ?? undefined,
});

export function createTenantApi(slug: string) {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    getTenantHost: () => {
      if (typeof window === "undefined") return undefined;
      return resolveTenantHost(slug, window.location);
    },
    getAccessToken: () =>
      typeof window === "undefined"
        ? undefined
        : window.sessionStorage.getItem("nice_land_access_token") ?? undefined,
  });
}
