import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import type { PublicPostRepository } from "../src/modules/posts/public-post-repository.js";
import type { TenantSiteRepository } from "../src/modules/tenancy/tenant-resolver.js";

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

const tenantRepository: TenantSiteRepository = {
  findBySlug: async () => ({
    id: "site-a",
    slug: "minhphat",
    isActive: true,
    subscriptionStatus: "ACTIVE",
    subscriptionEnd: new Date("2027-06-30T00:00:00.000Z"),
  }),
  findByHostname: async () => null,
};

describe("public property APIs", () => {
  it("lists posts using only the resolved tenant siteId", async () => {
    const calls: Parameters<PublicPostRepository["listPublished"]>[0][] = [];
    const publicPostRepository: PublicPostRepository = {
      listPublished: async (input) => {
        calls.push(input);
        return {
          items: [
            {
              id: "post-a",
              slug: "biet-thu-son-tra",
              title: "Biệt thự Sơn Trà",
              type: "HOUSE",
              price: "18500000000",
              area: 285,
              address: "Hoàng Sa",
              province: "Đà Nẵng",
              district: "Sơn Trà",
              status: "PUBLISHED",
              publishedAt: new Date("2026-06-20T00:00:00.000Z"),
              mainImage: null,
            },
          ],
          total: 1,
        };
      },
      findPublishedByIdOrSlug: async () => null,
    };

    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "datcuatoi.vn",
      }),
      { tenantRepository, publicPostRepository },
    );
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/v1/public/posts?siteId=site-b&type=HOUSE&page=2&limit=12",
      headers: { "x-tenant-host": "minhphat.datcuatoi.vn" },
    });

    expect(response.statusCode).toBe(200);
    expect(calls).toEqual([
      expect.objectContaining({
        siteId: "site-a",
        type: "HOUSE",
        page: 2,
        limit: 12,
      }),
    ]);
    expect(response.json()).toMatchObject({ total: 1, page: 2, limit: 12 });
  });

  it("returns 404 when a post does not belong to the resolved tenant", async () => {
    const requested: Array<{ siteId: string; idOrSlug: string }> = [];
    const publicPostRepository: PublicPostRepository = {
      listPublished: async () => ({ items: [], total: 0 }),
      findPublishedByIdOrSlug: async (siteId, idOrSlug) => {
        requested.push({ siteId, idOrSlug });
        return null;
      },
    };

    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "datcuatoi.vn",
      }),
      { tenantRepository, publicPostRepository },
    );
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/v1/public/posts/post-from-site-b",
      headers: { "x-tenant-host": "minhphat.datcuatoi.vn" },
    });

    expect(response.statusCode).toBe(404);
    expect(requested).toEqual([
      { siteId: "site-a", idOrSlug: "post-from-site-b" },
    ]);
  });

  it("rejects invalid listing filters", async () => {
    const publicPostRepository: PublicPostRepository = {
      listPublished: async () => ({ items: [], total: 0 }),
      findPublishedByIdOrSlug: async () => null,
    };

    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "datcuatoi.vn",
      }),
      { tenantRepository, publicPostRepository },
    );
    apps.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/v1/public/posts?limit=500",
      headers: { "x-tenant-host": "minhphat.datcuatoi.vn" },
    });

    expect(response.statusCode).toBe(400);
  });
});
