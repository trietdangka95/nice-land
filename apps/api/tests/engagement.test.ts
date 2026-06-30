import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import type { AccessTokenService } from "../src/modules/auth/token-service.js";
import type { EngagementRepository } from "../src/modules/engagement/engagement-repository.js";
import type { NotificationRepository } from "../src/modules/notifications/notification-repository.js";

const config: AppConfig = {
  NODE_ENV: "test", HOST: "127.0.0.1", PORT: 4000, ROOT_DOMAIN: "nice-land.vn",
  CORS_ORIGINS: "http://localhost:3002", LOG_LEVEL: "silent",
  JWT_ACCESS_SECRET: "test-secret-with-at-least-thirty-two-characters",
  ACCESS_TOKEN_TTL_SECONDS: 900, REFRESH_TOKEN_TTL_DAYS: 30, REFRESH_COOKIE_NAME: "refresh",
  APP_URL: "http://localhost:3002", PASSWORD_RESET_TTL_MINUTES: 30,
};
const tenantRepository = {
  findBySlug: async () => ({ id: "site-a", slug: "minhphat", isActive: true, subscriptionStatus: "ACTIVE" as const, subscriptionEnd: null }),
  findByHostname: async () => null,
};
const accessTokens = {
  verify: async (token: string) => ({ sub: "user-a", username: "admin", role: "ADMIN" as const, siteId: token === "other" ? "site-b" : "site-a" }),
} as AccessTokenService;
function repository(): EngagementRepository {
  return {
    recordView: async () => true,
    createLead: async () => ({
      id: "lead-a",
      createdAt: new Date("2026-06-20T00:00:00Z"),
      notification: {
        recipient: "admin@example.com",
        siteName: "Minh Phát",
        postTitle: "Nhà phố",
      },
    }),
    recordInteraction: async () => true,
    listLeads: async () => [],
    updateLead: async () => true,
    getAnalytics: async () => ({ totals: { views: 1, leads: 1 }, dailyViews: [], topPosts: [] }),
  };
}
function createNotificationRepository(
  created: Parameters<NotificationRepository["create"]>[0][] = [],
): NotificationRepository {
  return {
    create: async (input) => {
      created.push(input);
      return { id: "notification-1", createdAt: "2026-06-20T00:00:00.000Z" };
    },
    listTenantAdmin: async () => ({ items: [], unreadCount: 0 }),
    markTenantAdminRead: async () => false,
    markAllTenantAdminRead: async () => 0,
    listSuperAdmin: async () => ({ items: [], unreadCount: 0 }),
    markSuperAdminRead: async () => false,
    markAllSuperAdminRead: async () => 0,
  };
}
function app(
  repo = repository(),
  notificationRepository = createNotificationRepository(),
) {
  return buildApp(config, {
    tenantRepository,
    accessTokens,
    engagementRepository: repo,
    notificationRepository,
  });
}
const tenantHeaders = { "x-tenant-host": "minhphat.nice-land.vn" };

describe("engagement routes", () => {
  it("records a human view", async () => {
    const response = await app().inject({ method: "POST", url: "/v1/public/posts/post-a/view", headers: { ...tenantHeaders, "user-agent": "Mozilla/5.0" } });
    expect(response.statusCode).toBe(204);
  });
  it("ignores bot views before repository", async () => {
    let called = false;
    const repo = repository();
    repo.recordView = async () => { called = true; return true; };
    await app(repo).inject({ method: "POST", url: "/v1/public/posts/post-a/view", headers: { ...tenantHeaders, "user-agent": "Googlebot" } });
    expect(called).toBe(false);
  });
  it("creates a property lead scoped by tenant", async () => {
    const notificationInputs: Parameters<NotificationRepository["create"]>[0][] = [];
    const response = await app(
      repository(),
      createNotificationRepository(notificationInputs),
    ).inject({ method: "POST", url: "/v1/public/posts/post-a/leads", headers: tenantHeaders, payload: { name: "Minh Anh", phone: "0905123456", source: "PROPERTY_FORM" } });
    expect(response.statusCode).toBe(201);
    expect(notificationInputs).toMatchObject([
      expect.objectContaining({
        siteId: "site-a",
        scope: "TENANT_ADMIN",
        type: "LEAD_CREATED",
        link: "/admin/leads?highlight=lead-a",
      }),
    ]);
  });
  it("records phone and Zalo interactions", async () => {
    const response = await app().inject({
      method: "POST",
      url: "/v1/public/posts/post-a/interactions",
      headers: tenantHeaders,
      payload: { source: "PHONE_CLICK" },
    });
    expect(response.statusCode).toBe(204);
  });
  it("rejects another tenant token from analytics", async () => {
    const response = await app().inject({ method: "GET", url: "/v1/admin/analytics", headers: { ...tenantHeaders, authorization: "Bearer other" } });
    expect(response.statusCode).toBe(403);
  });
});
