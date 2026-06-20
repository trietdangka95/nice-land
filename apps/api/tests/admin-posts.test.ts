import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type {
  AdminPostMutationContext,
  AdminPostRepository,
} from "../src/modules/posts/admin-post-repository.js";
import type { AccessTokenService } from "../src/modules/auth/token-service.js";
import type { TenantSiteRepository } from "../src/modules/tenancy/tenant-resolver.js";
import type { AppConfig } from "../src/config.js";

const config: AppConfig = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: 4000,
  ROOT_DOMAIN: "nice-land.vn",
  CORS_ORIGINS: "http://localhost:3002",
  LOG_LEVEL: "silent",
  JWT_ACCESS_SECRET: "test-secret-with-at-least-thirty-two-characters",
  ACCESS_TOKEN_TTL_SECONDS: 900,
  REFRESH_TOKEN_TTL_DAYS: 30,
  REFRESH_COOKIE_NAME: "nice_land_refresh",
  APP_URL: "http://localhost:3002",
  PASSWORD_RESET_TTL_MINUTES: 30,
};

const tenantRepository: TenantSiteRepository = {
  findBySlug: async (slug) =>
    slug === "minhphat"
      ? {
          id: "site-a",
          slug,
          isActive: true,
          subscriptionStatus: "ACTIVE",
          subscriptionEnd: null,
        }
      : null,
  findByHostname: async () => null,
};

const accessTokens = {
  verify: async (token: string) => ({
    sub: "user-a",
    username: "admin",
    role: "ADMIN" as const,
    siteId: token === "tenant-b" ? "site-b" : "site-a",
  }),
} as AccessTokenService;

const post = {
  id: "post-a",
  slug: "nha-pho-song-han",
  title: "Nhà phố gần sông Hàn",
  description: "Nhà phố ba tầng có không gian thoáng và pháp lý rõ ràng.",
  type: "HOUSE" as const,
  price: 8_500_000_000,
  area: 120,
  address: null,
  province: "Đà Nẵng",
  district: "Hải Châu",
  ward: null,
  legalStatus: null,
  bedrooms: 3,
  bathrooms: 3,
  categoryId: null,
  status: "DRAFT" as const,
  version: 1,
  viewCount: 0,
  publishedAt: null,
  createdAt: new Date("2026-06-20T00:00:00Z"),
  updatedAt: new Date("2026-06-20T00:00:00Z"),
  images: [],
};

function createRepository(): AdminPostRepository {
  return {
    list: async ({ siteId }) => ({
      items: siteId === "site-a" ? [post] : [],
      total: siteId === "site-a" ? 1 : 0,
    }),
    findById: async (siteId, id) =>
      siteId === "site-a" && id === post.id ? post : null,
    create: async (_input, context) => ({
      ...post,
      id: "created-post",
      title: _input.title,
      status: _input.status,
      slug: "created-post",
      createdById: context.userId,
    }),
    update: async (siteId, id, input) =>
      siteId === "site-a" && id === post.id && input.version === 1
        ? { ...post, ...input, version: 2 }
        : null,
    archive: async (siteId, id, version, _context: AdminPostMutationContext) =>
      siteId === "site-a" && id === post.id && version === 1,
  };
}

function createApp(repository = createRepository()) {
  return buildApp(config, {
    tenantRepository,
    accessTokens,
    adminPostRepository: repository,
  });
}

describe("tenant admin post routes", () => {
  it("lists posts for the authenticated tenant", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/admin/posts",
      headers: {
        authorization: "Bearer tenant-a",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().items).toHaveLength(1);
  });

  it("rejects a token belonging to another tenant", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/admin/posts",
      headers: {
        authorization: "Bearer tenant-b",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("creates a draft post without accepting siteId from the body", async () => {
    let context: AdminPostMutationContext | undefined;
    const repository = createRepository();
    repository.create = async (input, mutationContext) => {
      context = mutationContext;
      return { ...post, title: input.title };
    };

    const response = await createApp(repository).inject({
      method: "POST",
      url: "/v1/admin/posts",
      headers: {
        authorization: "Bearer tenant-a",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
      payload: {
        siteId: "site-b",
        title: "Nhà phố mới gần sông Hàn",
        description:
          "Nhà phố ba tầng có không gian thoáng, vị trí đẹp và pháp lý rõ ràng.",
        type: "HOUSE",
        status: "DRAFT",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(context).toEqual({ siteId: "site-a", userId: "user-a" });
  });

  it("returns conflict when updating with a stale version", async () => {
    const response = await createApp().inject({
      method: "PATCH",
      url: "/v1/admin/posts/post-a",
      headers: {
        authorization: "Bearer tenant-a",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
      payload: {
        title: "Tiêu đề đã thay đổi",
        version: 99,
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it("archives instead of hard deleting", async () => {
    const response = await createApp().inject({
      method: "DELETE",
      url: "/v1/admin/posts/post-a?version=1",
      headers: {
        authorization: "Bearer tenant-a",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(204);
  });
});
