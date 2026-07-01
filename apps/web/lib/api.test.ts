import { describe, expect, it } from "vitest";
import { resolveTenantHost } from "@/lib/api";

describe("resolveTenantHost", () => {
  it("uses the tenant subdomain when the current page is path-based", () => {
    expect(
      resolveTenantHost("minhphat", {
        hostname: "nice-land.id.vn",
        pathname: "/minhphat/admin/reset-password",
      }),
    ).toBe("minhphat.nice-land.id.vn");
  });

  it("keeps the current hostname when already on a tenant subdomain", () => {
    expect(
      resolveTenantHost("minhphat", {
        hostname: "minhphat.nice-land.id.vn",
        pathname: "/admin/reset-password",
      }),
    ).toBe("minhphat.nice-land.id.vn");
  });

  it("maps localhost path-based routes to tenant.localhost", () => {
    expect(
      resolveTenantHost("minhphat", {
        hostname: "localhost",
        pathname: "/minhphat/admin/reset-password",
      }),
    ).toBe("minhphat.localhost");
  });
});
