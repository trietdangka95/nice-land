import { createApiClient } from "@nice-land/api-client";

export const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  getTenantHost: () =>
    typeof window === "undefined" ? undefined : window.location.hostname,
  getAccessToken: () =>
    typeof window === "undefined"
      ? undefined
      : window.sessionStorage.getItem("nice_land_access_token") ?? undefined,
});

export function createTenantApi(slug: string) {
  return createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
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
