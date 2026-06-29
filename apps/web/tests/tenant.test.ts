import { describe, expect, it } from "vitest";
import { assertTenantAccess, parseTenantSlug, tenantWhere } from "@/lib/tenant";
import { findActiveNavigationHref } from "@/lib/navigation";
import { siteSettingsToAdminIdentity } from "@/lib/admin-site";
import { buildPublicPostsHref } from "@/lib/pagination";
import { getTenantPosts } from "@/lib/server-api";

describe("parseTenantSlug", () => {
  it("extracts a production tenant subdomain", () => {
    expect(parseTenantSlug("minhphat.nice-land.vn", "nice-land.vn")).toBe("minhphat");
  });

  it("supports local development subdomains", () => {
    expect(parseTenantSlug("minhphat.localhost:3000", "localhost:3000")).toBe("minhphat");
  });

  it("does not treat the root domain as a tenant", () => {
    expect(parseTenantSlug("nice-land.vn", "nice-land.vn")).toBeNull();
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

describe("admin navigation", () => {
  const base = "/minhphat/admin";
  const hrefs = [base, `${base}/posts`, `${base}/posts/create`];

  it("activates only the most specific create-post route", () => {
    expect(
      findActiveNavigationHref(`${base}/posts/create`, hrefs, base),
    ).toBe(`${base}/posts/create`);
  });

  it("keeps post management active on edit routes", () => {
    expect(
      findActiveNavigationHref(
        `${base}/posts/post-id/edit`,
        hrefs,
        base,
      ),
    ).toBe(`${base}/posts`);
  });

  it("does not keep the dashboard active on child routes", () => {
    expect(findActiveNavigationHref(`${base}/posts`, hrefs, base)).toBe(
      `${base}/posts`,
    );
  });
});

describe("tenant admin identity", () => {
  it("maps live site settings to the branding used by the admin shell", () => {
    expect(
      siteSettingsToAdminIdentity({
        id: "site-new",
        name: "Nhà Đất An Phú",
        slug: "an-phu",
        tagline: null,
        logo: null,
        banner: null,
        brokerAvatar: null,
        brokerName: null,
        brokerBio: null,
        themeKey: "CLASSIC_ESTATE",
        themeColor: "#315c45",
        phone: "0909000000",
        email: "admin@example.com",
        address: "Hồ Chí Minh",
        facebookUrl: null,
        zaloPhone: null,
        updatedAt: "2026-06-20T00:00:00.000Z",
      }),
    ).toEqual({
      id: "site-new",
      name: "Nhà Đất An Phú",
      slug: "an-phu",
      logoMark: "AP",
    });
  });
});

describe("public post pagination", () => {
  it("keeps active filters when moving to another page", () => {
    expect(
      buildPublicPostsHref("minhphat", {
        page: 3,
        q: "Sơn Trà",
        type: "HOUSE",
        sort: "price_desc",
      }),
    ).toBe(
      "/minhphat?page=3&q=S%C6%A1n+Tr%C3%A0&type=HOUSE&sort=price_desc#properties",
    );
  });

  it("omits default values from a clean first-page URL", () => {
    expect(
      buildPublicPostsHref("minhphat", {
        page: 1,
        q: "",
        type: "ALL",
        sort: "newest",
      }),
    ).toBe("/minhphat#properties");
  });

});

describe("demo public posts", () => {
  it("filters demo listings by property type", async () => {
    const listing = await getTenantPosts("demo", "site-demo", {
      type: "LAND",
      page: 1,
      limit: 12,
    });

    expect(listing.total).toBe(1);
    expect(listing.items).toHaveLength(1);
    expect(listing.items.every((post) => post.type === "LAND")).toBe(true);
  });

  it("serves the cold demo slug with the cold theme and shared listings", async () => {
    const { getTenantSite } = await import("@/lib/server-api");
    const site = await getTenantSite("demo-cold");
    const listing = await getTenantPosts("demo-cold", "site-demo-cold", {
      page: 1,
      limit: 3,
    });

    expect(site?.themeKey).toBe("COLD_MODERN");
    expect(listing.items.length).toBeGreaterThan(0);
    expect(listing.items.every((item) => item.siteId === "site-demo")).toBe(true);
  });
});
