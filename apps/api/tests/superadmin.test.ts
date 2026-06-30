// @ts-nocheck
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import type { AccessTokenService } from "../src/modules/auth/token-service.js";
import type { NotificationRepository } from "../src/modules/notifications/notification-repository.js";
import {
  SuperAdminConflictError,
  type SuperAdminRepository,
} from "../src/modules/superadmin/superadmin-repository.js";

const config: AppConfig = {
  NODE_ENV: "test", HOST: "127.0.0.1", PORT: 4000, ROOT_DOMAIN: "nice-land.vn",
  CORS_ORIGINS: "http://localhost:3002", LOG_LEVEL: "silent",
  JWT_ACCESS_SECRET: "test-secret-with-at-least-thirty-two-characters",
  ACCESS_TOKEN_TTL_SECONDS: 900, REFRESH_TOKEN_TTL_DAYS: 30, REFRESH_COOKIE_NAME: "refresh",
  APP_URL: "http://localhost:3002", PASSWORD_RESET_TTL_MINUTES: 30,
};

const site = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Minh Phát", slug: "minhphat", phone: "0903868979",
  email: "hello@minhphat.vn", address: "Đà Nẵng", isActive: true,
  themeKey: "WARM_MINIMAL" as const,
  subscriptionStatus: "ACTIVE" as const, subscriptionStart: null, subscriptionEnd: null,
  plan: { id: "22222222-2222-4222-8222-222222222222", name: "Pro", code: "PRO" },
  usage: { posts: 10, images: 30, users: 1 }, admin: null,
  createdAt: "2026-06-20T00:00:00.000Z",
};

function repository(): SuperAdminRepository {
  return {
    listSites: async () => ({ items: [site], total: 1 }),
    findSite: async () => site,
    createSite: async (input) => ({
      ...site,
      name: input.name,
      slug: input.slug,
      themeKey: "WARM_MINIMAL" as const,
    }),
    updateSite: async (_id, input) => ({ ...site, ...input, subscriptionEnd: input.subscriptionEnd?.toISOString() ?? null }),
    setSiteActive: async () => true,
    resetAdminPassword: async () => "Nl!temporary",
    setAdminActive: async () => true,
    listPlans: async () => [{ id: site.plan.id, name: "Pro", code: "PRO", maxPosts: 150, maxImagesPerPost: 20, price: 599000, durationDays: 30, isActive: true, siteCount: 1 }],
    createPlan: async (input) => ({ id: site.plan.id, ...input, siteCount: 0 }),
    updatePlan: async (_id, input) => ({ id: site.plan.id, ...input, siteCount: 1 }),
    deletePlan: async () => true,
    listRenewals: async () => [],
    resolveRenewal: async () => null,
    listContacts: async () => [],
    updateContactStatus: async () => true,
    listAuditLogs: async () => [],
  };
}

const accessTokens = {
  verify: async (token: string) => token === "super"
    ? { sub: "super-user", username: "superadmin", role: "SUPER_ADMIN" as const, siteId: null }
    : { sub: "tenant-user", username: "admin", role: "ADMIN" as const, siteId: "site-a" },
} as AccessTokenService;

function createApp(
  repo = repository(),
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
    accessTokens,
    superAdminRepository: repo,
    notificationRepository,
  });
}

const headers = { authorization: "Bearer super" };

describe("super admin routes", () => {
  it("lists sites for a super admin", async () => {
    const response = await createApp().inject({ method: "GET", url: "/v1/superadmin/sites", headers });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ total: 1, items: [{ slug: "minhphat" }] });
  });

  it("rejects tenant admin tokens on cross-tenant routes", async () => {
    const response = await createApp().inject({ method: "GET", url: "/v1/superadmin/sites", headers: { authorization: "Bearer tenant" } });
    expect(response.statusCode).toBe(403);
  });

  it("creates a site and admin account through one input", async () => {
    let receivedActor: string | undefined;
    const repo = repository();
    repo.createSite = async (input, actorId) => {
      receivedActor = actorId;
      return {
        ...site,
        name: input.name,
        slug: input.slug,
        themeKey: "WARM_MINIMAL" as const,
      };
    };

    const response = await createApp(repo).inject({
      method: "POST", url: "/v1/superadmin/sites", headers,
      payload: {
        name: "An Land", slug: "an-land", phone: "0912333558", email: "admin@anland.vn",
        themeKey: "WARM_MINIMAL",
        planId: site.plan.id, subscriptionEnd: "2027-06-20T00:00:00.000Z",
        adminName: "Quản trị An Land", adminUsername: "admin.anland", adminPassword: "Secure123!",
      },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json().slug).toBe("an-land");
    expect(response.json().themeKey).toBe("WARM_MINIMAL");
    expect(receivedActor).toBe("super-user");
  });

  it("updates a tenant without accepting theme changes", async () => {
    let receivedActor: string | undefined;
    const repo = repository();
    repo.updateSite = async (_id, input, actorId) => {
      receivedActor = actorId;
      return {
        ...site,
        ...input,
        subscriptionEnd: input.subscriptionEnd?.toISOString() ?? null,
      };
    };

    const response = await createApp(repo).inject({
      method: "PUT",
      url: `/v1/superadmin/sites/${site.id}`,
      headers,
      payload: {
        name: site.name,
        slug: site.slug,
        phone: site.phone,
        email: site.email,
        address: site.address,
        themeKey: "WARM_MINIMAL",
        planId: site.plan.id,
        subscriptionStatus: "ACTIVE",
        subscriptionEnd: "2027-06-20T00:00:00.000Z",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().themeKey).toBe("WARM_MINIMAL");
    expect(receivedActor).toBe("super-user");
  });

  it("rejects unsupported public theme fields from older clients", async () => {
    const response = await createApp().inject({
      method: "POST",
      url: "/v1/superadmin/sites",
      headers,
      payload: {
        name: "An Land",
        slug: "an-land",
        phone: "0912333558",
        email: "admin@anland.vn",
        themeKey: "UNKNOWN_THEME",
        planId: site.plan.id,
        subscriptionEnd: "2027-06-20T00:00:00.000Z",
        adminName: "Quản trị An Land",
        adminUsername: "admin.anland",
        adminPassword: "Secure123!",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("creates a tenant admin notification when resolving a renewal request", async () => {
    const notificationInputs: Parameters<NotificationRepository["create"]>[0][] = [];
    const repo = repository();
    repo.resolveRenewal = async () => ({
      id: "renewal-1",
      status: "APPROVED",
      note: "Gia hạn",
      adminNote: "Đã duyệt",
      requestedAt: "2026-06-20T00:00:00.000Z",
      resolvedAt: "2026-06-21T00:00:00.000Z",
      site: { id: "site-a", name: "Minh Phát", slug: "minhphat" },
      plan: null,
      requestedBy: { username: "admin", fullName: "Admin" },
    });

    const response = await createApp(repo, {
      create: async (input) => {
        notificationInputs.push(input);
        return { id: "notification-2", createdAt: "2026-06-21T00:00:00.000Z" };
      },
      listTenantAdmin: async () => ({ items: [], unreadCount: 0 }),
      markTenantAdminRead: async () => false,
      markAllTenantAdminRead: async () => 0,
      listSuperAdmin: async () => ({ items: [], unreadCount: 0 }),
      markSuperAdminRead: async () => false,
      markAllSuperAdminRead: async () => 0,
    }).inject({
      method: "PATCH",
      url: "/v1/superadmin/renewal-requests/renewal-1",
      headers,
      payload: { status: "APPROVED" },
    });

    expect(response.statusCode).toBe(200);
    expect(notificationInputs).toMatchObject([
      expect.objectContaining({
        siteId: "site-a",
        scope: "TENANT_ADMIN",
        type: "RENEWAL_REQUEST_UPDATED",
        link: "/admin/subscription?highlightRenewal=renewal-1",
      }),
    ]);
  });

  it("returns a password only once after reset", async () => {
    const response = await createApp().inject({ method: "POST", url: `/v1/superadmin/sites/${site.id}/reset-password`, headers });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ temporaryPassword: "Nl!temporary" });
  });

  it("does not delete a plan in use", async () => {
    const repo = repository();
    repo.deletePlan = async () => { throw new SuperAdminConflictError("Đang sử dụng"); };
    const response = await createApp(repo).inject({ method: "DELETE", url: `/v1/superadmin/plans/${site.plan.id}`, headers });
    expect(response.statusCode).toBe(409);
    expect(response.json().code).toBe("PLAN_IN_USE");
  });
});
