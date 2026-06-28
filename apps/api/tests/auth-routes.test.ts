import { hash } from "bcryptjs";
import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import {
  AuthService,
  type AuthRepository,
  type RefreshSessionRecord,
} from "../src/modules/auth/auth-service.js";
import { AccessTokenService } from "../src/modules/auth/token-service.js";
import type { TenantSiteRepository } from "../src/modules/tenancy/tenant-resolver.js";

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

async function createAuthApp() {
  const passwordHash = await hash("ValidPassword123!", 4);
  const users = [
    {
      id: "admin-a",
      siteId: "site-a",
      username: "admin",
      email: "admin@example.com",
      phone: null,
      passwordHash,
      fullName: "Admin A",
      role: "ADMIN" as const,
      isActive: true,
    },
    {
      id: "super-1",
      siteId: null,
      username: "superadmin",
      email: "superadmin@example.com",
      phone: null,
      passwordHash,
      fullName: "Super Admin",
      role: "SUPER_ADMIN" as const,
      isActive: true,
    },
  ];
  const sessions = new Map<string, RefreshSessionRecord>();
  const resetTokens = new Map<
    string,
    {
      id: string;
      userId: string;
      expiresAt: Date;
      usedAt: Date | null;
    }
  >();
  const repository: AuthRepository = {
    findUserForLogin: async (username, siteId) =>
      users.find(
        (user) => user.username === username && user.siteId === siteId,
      ) ?? null,
    findUserById: async (id) => users.find((user) => user.id === id) ?? null,
    createRefreshSession: async (input) => {
      const record = {
        id: crypto.randomUUID(),
        ...input,
        revokedAt: null,
      };
      sessions.set(input.tokenHash, record);
      return record;
    },
    findActiveRefreshSession: async (tokenHash, now) => {
      const record = sessions.get(tokenHash);
      return record &&
        !record.revokedAt &&
        record.expiresAt.getTime() > now.getTime()
        ? record
        : null;
    },
    rotateRefreshSession: async (id, replacement) => {
      const current = [...sessions.values()].find(
        (session) => session.id === id,
      );
      if (current) current.revokedAt = new Date();
      const record = {
        id: crypto.randomUUID(),
        ...replacement,
        revokedAt: null,
      };
      sessions.set(replacement.tokenHash, record);
      return record;
    },
    revokeRefreshSession: async (tokenHash) => {
      const record = sessions.get(tokenHash);
      if (record) record.revokedAt = new Date();
    },
    updateLastLogin: async () => undefined,
    findUserForPasswordReset: async (identifier, siteId) =>
      users.find(
        (user) =>
          user.siteId === siteId &&
          (user.username === identifier || user.email === identifier),
      ) ?? null,
    invalidatePasswordResetTokens: async (userId, now) => {
      for (const token of resetTokens.values()) {
        if (token.userId === userId && !token.usedAt) token.usedAt = now;
      }
    },
    createPasswordResetToken: async (input) => {
      resetTokens.set(input.tokenHash, {
        id: crypto.randomUUID(),
        userId: input.userId,
        expiresAt: input.expiresAt,
        usedAt: null,
      });
    },
    findValidPasswordResetToken: async (tokenHash, siteId, now) => {
      const token = resetTokens.get(tokenHash);
      const user = token
        ? users.find((candidate) => candidate.id === token.userId)
        : undefined;
      return token &&
        user?.siteId === siteId &&
        !token.usedAt &&
        token.expiresAt > now
        ? token
        : null;
    },
    resetPassword: async (input) => {
      const user = users.find((candidate) => candidate.id === input.userId);
      if (user) user.passwordHash = input.passwordHash;
      for (const token of resetTokens.values()) {
        if (token.userId === input.userId && !token.usedAt) {
          token.usedAt = input.now;
        }
      }
      for (const session of sessions.values()) {
        if (session.userId === input.userId && !session.revokedAt) {
          session.revokedAt = input.now;
        }
      }
    },
    updateProfile: async () => {},
    updatePassword: async () => {},
  };
  const tenantRepository: TenantSiteRepository = {
    findBySlug: async (slug) =>
      slug === "minhphat"
        ? {
            id: "site-a",
            slug,
            isActive: true,
            subscriptionStatus: "ACTIVE",
            subscriptionEnd: new Date("2027-06-30T00:00:00.000Z"),
          }
        : slug === "anland"
          ? {
              id: "site-b",
              slug,
              isActive: true,
              subscriptionStatus: "ACTIVE",
              subscriptionEnd: new Date("2027-06-30T00:00:00.000Z"),
            }
          : null,
    findByHostname: async () => null,
  };
  const config = loadConfig({
    NODE_ENV: "test",
    LOG_LEVEL: "silent",
    ROOT_DOMAIN: "nice-land.vn",
    JWT_ACCESS_SECRET: "test-access-secret-at-least-32-characters",
  });
  const accessTokens = new AccessTokenService(
    config.JWT_ACCESS_SECRET,
    config.ACCESS_TOKEN_TTL_SECONDS,
  );
  const authService = new AuthService(repository, accessTokens, {
    refreshTokenTtlDays: config.REFRESH_TOKEN_TTL_DAYS,
    passwordResetTtlMinutes: config.PASSWORD_RESET_TTL_MINUTES,
    appUrl: config.APP_URL,
    passwordResetNotifier: { notify: async () => undefined },
  });
  const app = buildApp(config, {
    tenantRepository,
    authService,
    accessTokens,
  });
  apps.push(app);
  return app;
}

describe("auth routes", () => {
  it("sets an HttpOnly refresh cookie and returns an access token", async () => {
    const app = await createAuthApp();

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { "x-tenant-host": "minhphat.nice-land.vn" },
      payload: {
        username: "admin",
        password: "ValidPassword123!",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      expiresIn: 900,
      user: { id: "admin-a", siteId: "site-a", role: "ADMIN" },
    });
    expect(response.headers["set-cookie"]).toContain("HttpOnly");
  });

  it("rejects a valid admin credential on another tenant host", async () => {
    const app = await createAuthApp();

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { "x-tenant-host": "anland.nice-land.vn" },
      payload: {
        username: "admin",
        password: "ValidPassword123!",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("blocks an admin access token from a different tenant", async () => {
    const app = await createAuthApp();
    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { "x-tenant-host": "minhphat.nice-land.vn" },
      payload: {
        username: "admin",
        password: "ValidPassword123!",
      },
    });
    const accessToken = login.json().accessToken as string;

    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/tenant-check",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-tenant-host": "anland.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: "TENANT_MISMATCH" });
  });

  it("returns the same accepted response for password reset requests", async () => {
    const app = await createAuthApp();

    const existing = await app.inject({
      method: "POST",
      url: "/v1/auth/forgot-password",
      headers: { "x-tenant-host": "minhphat.nice-land.vn" },
      payload: { identifier: "admin@example.com" },
    });
    const missing = await app.inject({
      method: "POST",
      url: "/v1/auth/forgot-password",
      headers: { "x-tenant-host": "minhphat.nice-land.vn" },
      payload: { identifier: "missing@example.com" },
    });

    expect(existing.statusCode).toBe(202);
    expect(missing.statusCode).toBe(202);
    expect(existing.json()).toEqual(missing.json());
  });
});
