// @ts-nocheck
import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import type { PublicSiteRepository } from "../src/modules/sites/public-site-repository.js";
import type { TenantSiteRepository } from "../src/modules/tenancy/tenant-resolver.js";

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

const tenantRepository: TenantSiteRepository = {
  findBySlug: async (slug) =>
    slug === "minhphat"
      ? {
          id: "site-a",
          slug: "minhphat",
          isActive: true,
          subscriptionStatus: "ACTIVE",
          subscriptionEnd: new Date("2027-06-30T00:00:00.000Z"),
        }
      : slug === "anland"
        ? {
            id: "site-b",
            slug: "anland",
            isActive: true,
            subscriptionStatus: "ACTIVE",
            subscriptionEnd: new Date("2027-06-30T00:00:00.000Z"),
          }
        : null,
  findByHostname: async () => null,
};

describe("GET /v1/public/site", () => {
  it("returns tenant branding from the resolved tenant siteId", async () => {
    const publicSiteRepository: PublicSiteRepository = {
      findPublicConfig: async (siteId) =>
        siteId === "site-a"
          ? {
              id: "site-a",
              name: "Nhà Đất Minh Phát",
              slug: "minhphat",
              tagline: "Chọn đúng nơi, dựng đúng tổ ấm",
              logo: null,
              banner: null,
              themeKey: "EDITORIAL",
              themeColor: "#315c45",
              phone: "0903868979",
              email: "hello@minhphat.vn",
              address: "Đà Nẵng",
              facebookUrl: null,
              zaloPhone: "0903868979",
            }
          : null,
    };

    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "nice-land.vn",
      }),
      { tenantRepository, publicSiteRepository },
    );
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/v1/public/site",
      headers: { "x-tenant-host": "minhphat.nice-land.vn" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "site-a",
      name: "Nhà Đất Minh Phát",
      slug: "minhphat",
      themeColor: "#315c45",
      themeKey: "EDITORIAL",
    });
  });

  it("does not accept a client-provided siteId override", async () => {
    const requestedSiteIds: string[] = [];
    const publicSiteRepository: PublicSiteRepository = {
      findPublicConfig: async (siteId) => {
        requestedSiteIds.push(siteId);
        return {
          id: siteId,
          name: "Resolved Site",
          slug: "minhphat",
          tagline: null,
          logo: null,
          banner: null,
          themeKey: "CLASSIC_ESTATE",
          themeColor: null,
          phone: null,
          email: null,
          address: null,
          facebookUrl: null,
          zaloPhone: null,
        };
      },
    };

    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "nice-land.vn",
      }),
      { tenantRepository, publicSiteRepository },
    );
    apps.push(app);

    await app.inject({
      method: "GET",
      url: "/v1/public/site?siteId=site-b",
      headers: { "x-tenant-host": "minhphat.nice-land.vn" },
    });

    expect(requestedSiteIds).toEqual(["site-a"]);
  });

  it("keeps branding isolated when two tenants use the same public theme", async () => {
    const branding = {
      "site-a": {
        id: "site-a",
        name: "Nhà Đất Minh Phát",
        slug: "minhphat",
        tagline: "Chọn đúng nơi",
        logo: "https://cdn.example.com/minhphat-logo.png",
        banner: "https://cdn.example.com/minhphat-banner.jpg",
        themeKey: "EDITORIAL" as const,
        themeColor: "#315c45",
        phone: "0903868979",
        email: "hello@minhphat.vn",
        address: "Đà Nẵng",
        facebookUrl: null,
        zaloPhone: "0903868979",
      },
      "site-b": {
        id: "site-b",
        name: "An Land",
        slug: "anland",
        tagline: "Không gian sống bình yên",
        logo: "https://cdn.example.com/anland-logo.png",
        banner: "https://cdn.example.com/anland-banner.jpg",
        themeKey: "EDITORIAL" as const,
        themeColor: "#8b5a3c",
        phone: "0912333558",
        email: "hello@anland.vn",
        address: "TP. Hồ Chí Minh",
        facebookUrl: null,
        zaloPhone: "0912333558",
      },
    };
    const publicSiteRepository: PublicSiteRepository = {
      findPublicConfig: async (siteId) =>
        branding[siteId as keyof typeof branding] ?? null,
    };
    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "nice-land.vn",
      }),
      { tenantRepository, publicSiteRepository },
    );
    apps.push(app);

    const [minhPhat, anLand] = await Promise.all([
      app.inject({
        method: "GET",
        url: "/v1/public/site",
        headers: { "x-tenant-host": "minhphat.nice-land.vn" },
      }),
      app.inject({
        method: "GET",
        url: "/v1/public/site",
        headers: { "x-tenant-host": "anland.nice-land.vn" },
      }),
    ]);

    expect(minhPhat.json()).toMatchObject({
      id: "site-a",
      themeKey: "EDITORIAL",
      name: "Nhà Đất Minh Phát",
      logo: "https://cdn.example.com/minhphat-logo.png",
      themeColor: "#315c45",
    });
    expect(anLand.json()).toMatchObject({
      id: "site-b",
      themeKey: "EDITORIAL",
      name: "An Land",
      logo: "https://cdn.example.com/anland-logo.png",
      themeColor: "#8b5a3c",
    });
  });
});
