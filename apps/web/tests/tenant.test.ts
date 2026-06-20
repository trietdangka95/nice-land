import { describe, expect, it } from "vitest";
import { assertTenantAccess, parseTenantSlug, tenantWhere } from "@/lib/tenant";

describe("parseTenantSlug", () => {
  it("extracts a production tenant subdomain", () => {
    expect(parseTenantSlug("minhphat.datcuatoi.vn", "datcuatoi.vn")).toBe("minhphat");
  });

  it("supports local development subdomains", () => {
    expect(parseTenantSlug("minhphat.localhost:3000", "localhost:3000")).toBe("minhphat");
  });

  it("does not treat the root domain as a tenant", () => {
    expect(parseTenantSlug("datcuatoi.vn", "datcuatoi.vn")).toBeNull();
  });
});

describe("tenant isolation", () => {
  it("requires a siteId for tenant queries", () => {
    expect(() => tenantWhere("")).toThrow("siteId is required");
    expect(tenantWhere("site-a")).toEqual({ siteId: "site-a" });
  });

  it("blocks an admin token from another tenant", () => {
    expect(() => assertTenantAccess("site-a", "site-b")).toThrow("Cross-tenant");
    expect(assertTenantAccess("site-a", "site-a")).toBe(true);
  });
});
