import { describe, expect, it } from "vitest";
import { tenantWhere } from "../src/modules/tenancy/tenant-scope.js";

const tenant = {
  siteId: "site-a",
  slug: "minhphat",
  hostname: "minhphat.nice-land.vn",
  subscriptionStatus: "ACTIVE" as const,
};

describe("tenantWhere", () => {
  it("always adds the resolved tenant siteId", () => {
    expect(tenantWhere(tenant, { status: "PUBLISHED" })).toEqual({
      AND: [{ siteId: "site-a" }, { status: "PUBLISHED" }],
    });
  });

  it("cannot be overridden by a client-provided siteId", () => {
    const unsafeInput = {
      siteId: "site-b",
      id: "post-b",
    };

    expect(tenantWhere(tenant, unsafeInput)).toEqual({
      AND: [{ siteId: "site-a" }, unsafeInput],
    });
  });
});
