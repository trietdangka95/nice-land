import { createApiClient } from "@nice-land/api-client";
import { getApiBaseUrl } from "@/lib/api-url";

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
      return window.location.hostname === "localhost"
        ? `${slug}.localhost`
        : window.location.hostname;
    },
    getAccessToken: () =>
      typeof window === "undefined"
        ? undefined
        : window.sessionStorage.getItem("nice_land_access_token") ?? undefined,
  });
}
