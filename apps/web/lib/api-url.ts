const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "nice-land.id.vn";

export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      return "http://localhost:4000";
    }
  }

  if (process.env.NODE_ENV === "production") {
    return `https://api.${rootDomain}`;
  }

  return "http://localhost:4000";
}
