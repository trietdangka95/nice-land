import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import type { AccessTokenService } from "../src/modules/auth/token-service.js";
import type { AdminDashboardRepository } from "../src/modules/dashboard/admin-dashboard-repository.js";
import type { TenantSiteRepository } from "../src/modules/tenancy/tenant-resolver.js";

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

const dashboard = {
  postCounts: { total: 12, published: 7, draft: 3, sold: 2 },
  engagement: { views: 240, leads: 9, newLeads: 2 },
  subscription: {
    status: "ACTIVE" as const,
    startsAt: null,
    endsAt: "2027-01-01T00:00:00.000Z",
    plan: {
      id: "plan-a",
      code: "PRO",
      name: "Chuyên nghiệp",
      price: 599000,
      durationDays: 30,
      maxPosts: 150,
      maxImagesPerPost: 20,
    },
    usage: { posts: 12, images: 38 },
    latestRenewalRequest: null,
  },
  recentPosts: [],
};

function app(repository: AdminDashboardRepository) {
  return buildApp(config, {
    tenantRepository,
    accessTokens,
    adminDashboardRepository: repository,
  });
}

describe("tenant admin dashboard", () => {
  it("returns one tenant-scoped dashboard payload including sold posts", async () => {
    const requestedSiteIds: string[] = [];
    const response = await app({
      getDashboard: async (siteId) => {
        requestedSiteIds.push(siteId);
        return dashboard;
      },
    }).inject({
      method: "GET",
      url: "/v1/admin/dashboard",
      headers: {
        authorization: "Bearer tenant-a",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(requestedSiteIds).toEqual(["site-a"]);
    expect(response.json()).toMatchObject({
      postCounts: { total: 12, published: 7, draft: 3, sold: 2 },
      engagement: { views: 240, leads: 9, newLeads: 2 },
    });
  });

  it("rejects an admin token from another tenant", async () => {
    const response = await app({
      getDashboard: async () => dashboard,
    }).inject({
      method: "GET",
      url: "/v1/admin/dashboard",
      headers: {
        authorization: "Bearer other",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(403);
  });
});
