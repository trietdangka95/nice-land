import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import type { AccessTokenService } from "../src/modules/auth/token-service.js";
import {
  CategoryInUseError,
  type AdminCategoryRepository,
} from "../src/modules/categories/admin-category-repository.js";
import type { TenantSiteRepository } from "../src/modules/tenancy/tenant-resolver.js";

const config: AppConfig = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: 4000,
  ROOT_DOMAIN: "datcuatoi.vn",
  CORS_ORIGINS: "http://localhost:3002",
  LOG_LEVEL: "silent",
  JWT_ACCESS_SECRET: "test-secret-with-at-least-thirty-two-characters",
  ACCESS_TOKEN_TTL_SECONDS: 900,
  REFRESH_TOKEN_TTL_DAYS: 30,
  REFRESH_COOKIE_NAME: "datcuatoi_refresh",
};

const tenantRepository: TenantSiteRepository = {
  findBySlug: async () => ({
    id: "site-a",
    slug: "minhphat",
    isActive: true,
    subscriptionStatus: "ACTIVE",
    subscriptionEnd: null,
  }),
  findByHostname: async () => null,
};

const accessTokens = {
  verify: async (token: string) => ({
    sub: "user-a",
    username: "admin",
    role: "ADMIN" as const,
    siteId: token === "other" ? "site-b" : "site-a",
  }),
} as AccessTokenService;

const category = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Nhà phố",
  slug: "nha-pho",
  postCount: 2,
  createdAt: "2026-06-20T00:00:00.000Z",
  updatedAt: "2026-06-20T00:00:00.000Z",
};

function repository(): AdminCategoryRepository {
  return {
    list: async (siteId) => (siteId === "site-a" ? [category] : []),
    create: async (siteId, input) => ({
      ...category,
      id: "22222222-2222-4222-8222-222222222222",
      name: input.name,
      slug: input.slug,
      postCount: 0,
    }),
    update: async (siteId, id, input) =>
      siteId === "site-a" && id === category.id
        ? { ...category, ...input }
        : null,
    remove: async (siteId, id) =>
      siteId === "site-a" && id === category.id,
  };
}

function createApp(adminCategoryRepository = repository()) {
  return buildApp(config, {
    tenantRepository,
    accessTokens,
    adminCategoryRepository,
  });
}

const headers = {
  authorization: "Bearer token",
  "x-tenant-host": "minhphat.datcuatoi.vn",
};

describe("tenant admin category routes", () => {
  it("allows browser preflight for category mutations", async () => {
    const response = await createApp().inject({
      method: "OPTIONS",
      url: `/v1/admin/categories/${category.id}`,
      headers: {
        origin: "http://localhost:3002",
        "access-control-request-method": "PATCH",
        "access-control-request-headers":
          "authorization,content-type,x-tenant-host",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-methods"]).toContain(
      "PATCH",
    );
  });

  it("lists only categories from the resolved tenant", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/admin/categories",
      headers,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([category]);
  });

  it("exposes active categories publicly without authentication", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/public/categories",
      headers: { "x-tenant-host": "minhphat.datcuatoi.vn" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([category]);
  });

  it("rejects a token from another tenant", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/admin/categories",
      headers: { ...headers, authorization: "Bearer other" },
    });

    expect(response.statusCode).toBe(403);
  });

  it("creates a tenant-scoped category", async () => {
    let receivedSiteId = "";
    const custom = repository();
    custom.create = async (siteId, input) => {
      receivedSiteId = siteId;
      return { ...category, ...input, postCount: 0 };
    };

    const response = await createApp(custom).inject({
      method: "POST",
      url: "/v1/admin/categories",
      headers,
      payload: { name: "Căn hộ", slug: "can-ho" },
    });

    expect(response.statusCode).toBe(201);
    expect(receivedSiteId).toBe("site-a");
  });

  it("does not delete a category that is being used", async () => {
    const custom = repository();
    custom.remove = async () => {
      throw new CategoryInUseError();
    };

    const response = await createApp(custom).inject({
      method: "DELETE",
      url: `/v1/admin/categories/${category.id}`,
      headers,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "CATEGORY_IN_USE" });
  });
});
