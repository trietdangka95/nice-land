// @ts-nocheck
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import type { AccessTokenService } from "../src/modules/auth/token-service.js";
import type { NotificationRepository } from "../src/modules/notifications/notification-repository.js";
import type { AdminSiteRepository } from "../src/modules/sites/admin-site-repository.js";
import { PendingRenewalRequestError } from "../src/modules/sites/admin-site-repository.js";
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

const settings = {
  id: "site-a",
  name: "Nhà Đất Minh Phát",
  slug: "minhphat",
  tagline: "Chọn đúng nơi",
  logo: null,
  banner: null,
  themeKey: "CLASSIC_ESTATE" as const,
  themeColor: "#315c45",
  phone: "0903868979",
  email: "hello@minhphat.vn",
  address: "Đà Nẵng",
  facebookUrl: null,
  zaloPhone: "0903868979",
  updatedAt: "2026-06-20T00:00:00.000Z",
};

function repository(): AdminSiteRepository {
  return {
    getSettings: async (siteId) => (siteId === "site-a" ? settings : null),
    updateSettings: async (siteId, input) =>
      siteId === "site-a" ? { ...settings, ...input } : null,
    getSubscription: async (siteId) =>
      siteId === "site-a"
        ? {
            status: "ACTIVE",
            startsAt: "2026-01-01T00:00:00.000Z",
            endsAt: "2027-01-01T00:00:00.000Z",
            plan: {
              id: "11111111-1111-4111-8111-111111111111",
              code: "PROFESSIONAL",
              name: "Chuyên nghiệp",
              price: 599000,
              durationDays: 30,
              maxPosts: 150,
              maxImagesPerPost: 20,
            },
            usage: { posts: 48, images: 190 },
            latestRenewalRequest: null,
          }
        : null,
    createRenewalRequest: async (siteId, input, userId) => ({
      id: `${siteId}-${userId}`,
      status: "NEW",
      note: input.note ?? null,
      requestedAt: "2026-06-20T00:00:00.000Z",
    }),
  };
}

function createApp(
  adminSiteRepository = repository(),
  resolvedTenantRepository = tenantRepository,
  notificationRepository: NotificationRepository = {
    create: async () => ({ id: "notification-1", createdAt: "2026-06-20T00:00:00.000Z" }),
    listTenantAdmin: async () => ({ items: [], unreadCount: 0 }),
    markTenantAdminRead: async () => false,
    markAllTenantAdminRead: async () => 0,
    listSuperAdmin: async () => ({ items: [], unreadCount: 0 }),
    markSuperAdminRead: async () => false,
    markAllSuperAdminRead: async () => 0,
  },
) {
  return buildApp(config, {
    tenantRepository: resolvedTenantRepository,
    accessTokens,
    adminSiteRepository,
    notificationRepository,
  });
}

const authHeaders = {
  authorization: "Bearer token",
  "x-tenant-host": "minhphat.nice-land.vn",
};

describe("tenant admin site routes", () => {
  it("returns settings for the resolved tenant", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/admin/site-config",
      headers: authHeaders,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id: "site-a", themeColor: "#315c45" });
  });

  it("allows an expired tenant to load branding for the admin shell", async () => {
    const expiredTenantRepository: TenantSiteRepository = {
      findBySlug: async () => ({
        id: "site-a",
        slug: "minhphat",
        isActive: true,
        subscriptionStatus: "EXPIRED",
        subscriptionEnd: new Date("2026-01-01T00:00:00.000Z"),
      }),
      findByHostname: async () => null,
    };
    const response = await createApp(
      repository(),
      expiredTenantRepository,
    ).inject({
      method: "GET",
      url: "/v1/admin/site-config",
      headers: authHeaders,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "site-a",
      name: "Nhà Đất Minh Phát",
    });
  });

  it("ignores a body siteId and updates only the resolved tenant", async () => {
    let receivedSiteId = "";
    const custom = repository();
    custom.updateSettings = async (siteId, input) => {
      receivedSiteId = siteId;
      return { ...settings, ...input };
    };
    const response = await createApp(custom).inject({
      method: "PUT",
      url: "/v1/admin/site-config",
      headers: authHeaders,
      payload: {
        siteId: "site-b",
        name: "Minh Phát mới",
        tagline: "Tận tâm",
        themeColor: "#24405e",
        phone: "0903868979",
        email: "hello@minhphat.vn",
        address: "Đà Nẵng",
      },
    });
    expect(response.statusCode).toBe(200);
    expect(receivedSiteId).toBe("site-a");
    expect(response.json()).toMatchObject({
      themeKey: "CLASSIC_ESTATE",
      themeColor: "#24405e",
    });
  });

  it("does not allow tenant admins to change the public theme", async () => {
    let receivedInput: unknown;
    const custom = repository();
    custom.updateSettings = async (_siteId, input) => {
      receivedInput = input;
      return { ...settings, ...input };
    };

    const response = await createApp(custom).inject({
      method: "PUT",
      url: "/v1/admin/site-config",
      headers: authHeaders,
      payload: {
        name: "Minh Phát mới",
        tagline: "Tận tâm",
        themeKey: "EDITORIAL",
        themeColor: "#24405e",
        phone: "0903868979",
        email: "hello@minhphat.vn",
        address: "Đà Nẵng",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(receivedInput).not.toHaveProperty("themeKey");
    expect(response.json().themeKey).toBe("CLASSIC_ESTATE");
  });

  it("returns real plan limits and usage", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/admin/subscription",
      headers: authHeaders,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ACTIVE",
      plan: { maxPosts: 150, maxImagesPerPost: 20 },
      usage: { posts: 48, images: 190 },
    });
  });

  it("creates a tenant-scoped renewal request", async () => {
    const notificationInputs: Parameters<NotificationRepository["create"]>[0][] = [];
    const response = await createApp(
      repository(),
      tenantRepository,
      {
        create: async (input) => {
          notificationInputs.push(input);
          return { id: "notification-2", createdAt: "2026-06-20T00:00:00.000Z" };
        },
        listTenantAdmin: async () => ({ items: [], unreadCount: 0 }),
        markTenantAdminRead: async () => false,
        markAllTenantAdminRead: async () => 0,
        listSuperAdmin: async () => ({ items: [], unreadCount: 0 }),
        markSuperAdminRead: async () => false,
        markAllSuperAdminRead: async () => 0,
      },
    ).inject({
      method: "POST",
      url: "/v1/admin/renewal-requests",
      headers: authHeaders,
      payload: { note: "Gia hạn thêm một năm" },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      id: "site-a-user-a",
      status: "NEW",
    });
    expect(notificationInputs).toMatchObject([
      expect.objectContaining({
        siteId: "site-a",
        scope: "SUPER_ADMIN",
        type: "RENEWAL_REQUEST_CREATED",
        link: "/superadmin/contacts?highlightRenewal=site-a-user-a",
      }),
    ]);
  });

  it("returns a clear conflict for a duplicate pending renewal", async () => {
    const custom = repository();
    custom.createRenewalRequest = async () => {
      throw new PendingRenewalRequestError();
    };
    const response = await createApp(custom).inject({
      method: "POST",
      url: "/v1/admin/renewal-requests",
      headers: authHeaders,
      payload: {},
    });
    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      code: "RENEWAL_REQUEST_PENDING",
    });
  });

  it("rejects an access token from another tenant", async () => {
    const response = await createApp().inject({
      method: "GET",
      url: "/v1/admin/site-config",
      headers: { ...authHeaders, authorization: "Bearer other" },
    });
    expect(response.statusCode).toBe(403);
  });
});
