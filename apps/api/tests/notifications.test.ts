// @ts-nocheck
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import type { NotificationRepository } from "../src/modules/notifications/notification-repository.js";
import type { AccessTokenService } from "../src/modules/auth/token-service.js";
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
  REFRESH_COOKIE_NAME: "refresh",
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
  verify: async (token: string) =>
    token === "super"
      ? { sub: "super-user", username: "superadmin", role: "SUPER_ADMIN" as const, siteId: null }
      : { sub: "user-a", username: "admin", role: "ADMIN" as const, siteId: token === "other" ? "site-b" : "site-a" },
} as AccessTokenService;

function repository(): NotificationRepository {
  return {
    create: async () => ({
      id: "notification-1",
      createdAt: "2026-06-30T00:00:00.000Z",
    }),
    listTenantAdmin: async (siteId, limit) => ({
      unreadCount: 1,
      items: [
        {
          id: `tenant-${siteId}-${limit}`,
          type: "LEAD_CREATED",
          title: "Lead moi",
          body: "Co lead moi tu website",
          link: "/admin/leads",
          isRead: false,
          readAt: null,
          createdAt: "2026-06-30T00:00:00.000Z",
          payload: { leadId: "lead-a" },
          site: { id: siteId, name: "Minh Phat", slug: "minhphat" },
        },
      ],
    }),
    markTenantAdminRead: async (siteId, id) => siteId === "site-a" && id === "tenant-1",
    markAllTenantAdminRead: async () => 3,
    listSuperAdmin: async (limit) => ({
      unreadCount: 2,
      items: [
        {
          id: `super-${limit}`,
          type: "CONTACT_REQUEST_CREATED",
          title: "Yeu cau moi",
          body: "Co lien he moi",
          link: "/superadmin/contacts",
          isRead: false,
          readAt: null,
          createdAt: "2026-06-30T00:00:00.000Z",
          payload: { contactId: "contact-a" },
          site: null,
        },
      ],
    }),
    markSuperAdminRead: async (id) => id === "super-1",
    markAllSuperAdminRead: async () => 5,
  };
}

function createApp(repo = repository()) {
  return buildApp(config, {
    tenantRepository,
    accessTokens,
    notificationRepository: repo,
  });
}

describe("notification routes", () => {
  it("lists tenant notifications for the resolved tenant", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/admin/notifications?limit=6",
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      unreadCount: 1,
      items: [{ id: "tenant-site-a-6", link: "/admin/leads" }],
    });
  });

  it("marks one tenant notification as read", async () => {
    const response = await createApp().inject({
      method: "PATCH",
      url: "/v1/admin/notifications/tenant-1/read",
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(204);
  });

  it("returns 404 for a tenant notification outside scope", async () => {
    const response = await createApp().inject({
      method: "PATCH",
      url: "/v1/admin/notifications/tenant-2/read",
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(404);
  });

  it("lists superadmin notifications", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/superadmin/notifications?limit=4",
      headers: {
        authorization: "Bearer super",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      unreadCount: 2,
      items: [{ id: "super-4", link: "/superadmin/contacts" }],
    });
  });

  it("rejects tenant tokens on superadmin notifications", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/superadmin/notifications",
      headers: {
        authorization: "Bearer token",
      },
    });

    expect(response.statusCode).toBe(403);
  });
});
