import { hash } from "bcryptjs";
import { describe, expect, it } from "vitest";
import {
  AuthError,
  AuthService,
  type AuthRepository,
} from "../src/modules/auth/auth-service.js";
import { AccessTokenService } from "../src/modules/auth/token-service.js";

async function createFixture() {
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
  const sessions = new Map<
    string,
    {
      id: string;
      userId: string;
      siteId: string | null;
      tokenHash: string;
      expiresAt: Date;
      revokedAt: Date | null;
    }
  >();
  const resetTokens = new Map<
    string,
    {
      id: string;
      userId: string;
      expiresAt: Date;
      usedAt: Date | null;
    }
  >();
  const notifications: Array<{ recipient: string; resetUrl: string }> = [];

  const repository: AuthRepository = {
    findUserForLogin: async (username, siteId) =>
      users.find(
        (user) => user.username === username && user.siteId === siteId,
      ) ?? null,
    findUserById: async (id) => users.find((user) => user.id === id) ?? null,
    createRefreshSession: async (input) => {
      const session = {
        id: `session-${sessions.size + 1}`,
        ...input,
        revokedAt: null,
      };
      sessions.set(session.tokenHash, session);
      return session;
    },
    findActiveRefreshSession: async (tokenHash, now) => {
      const session = sessions.get(tokenHash);
      return session &&
        !session.revokedAt &&
        session.expiresAt.getTime() > now.getTime()
        ? session
        : null;
    },
    rotateRefreshSession: async (currentId, replacement) => {
      const current = [...sessions.values()].find(
        (session) => session.id === currentId,
      );
      if (current) current.revokedAt = new Date();
      const session = {
        id: `session-${sessions.size + 1}`,
        ...replacement,
        revokedAt: null,
      };
      sessions.set(session.tokenHash, session);
      return session;
    },
    revokeRefreshSession: async (tokenHash) => {
      const session = sessions.get(tokenHash);
      if (session) session.revokedAt = new Date();
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
        id: `reset-${resetTokens.size + 1}`,
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

  const tokenService = new AccessTokenService(
    "test-access-secret-at-least-32-characters",
    900,
  );
  const service = new AuthService(repository, tokenService, {
    refreshTokenTtlDays: 30,
    passwordResetTtlMinutes: 30,
    appUrl: "http://localhost:3002",
    passwordResetNotifier: {
      notify: async (notification) => {
        notifications.push(notification);
      },
    },
  });

  return { service, tokenService, sessions, notifications };
}

describe("AuthService", () => {
  it("logs a tenant admin in only within the resolved tenant", async () => {
    const { service, tokenService } = await createFixture();

    const result = await service.login({
      username: "admin",
      password: "ValidPassword123!",
      siteId: "site-a",
      userAgent: "vitest",
      ipAddress: "127.0.0.1",
    });

    expect(result.user).toMatchObject({
      id: "admin-a",
      siteId: "site-a",
      role: "ADMIN",
    });
    expect(result.refreshToken).toHaveLength(64);

    await expect(tokenService.verify(result.accessToken)).resolves.toMatchObject({
      sub: "admin-a",
      siteId: "site-a",
      role: "ADMIN",
    });
  });

  it("does not allow a tenant admin credential on another tenant", async () => {
    const { service } = await createFixture();

    await expect(
      service.login({
        username: "admin",
        password: "ValidPassword123!",
        siteId: "site-b",
      }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("logs a super admin in only on the root platform context", async () => {
    const { service } = await createFixture();

    const result = await service.login({
      username: "superadmin",
      password: "ValidPassword123!",
      siteId: null,
    });

    expect(result.user.role).toBe("SUPER_ADMIN");

    await expect(
      service.login({
        username: "superadmin",
        password: "ValidPassword123!",
        siteId: "site-a",
      }),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("rotates refresh tokens and rejects reuse of the old token", async () => {
    const { service } = await createFixture();
    const login = await service.login({
      username: "admin",
      password: "ValidPassword123!",
      siteId: "site-a",
    });

    const refreshed = await service.refresh(login.refreshToken);

    expect(refreshed.refreshToken).not.toBe(login.refreshToken);
    await expect(service.refresh(login.refreshToken)).rejects.toMatchObject({
      code: "INVALID_REFRESH_TOKEN",
    });
  });

  it("revokes a refresh token on logout", async () => {
    const { service } = await createFixture();
    const login = await service.login({
      username: "admin",
      password: "ValidPassword123!",
      siteId: "site-a",
    });

    await service.logout(login.refreshToken);

    await expect(service.refresh(login.refreshToken)).rejects.toMatchObject({
      code: "INVALID_REFRESH_TOKEN",
    });
  });

  it("creates a one-time tenant reset link without exposing the stored token", async () => {
    const { service, notifications } = await createFixture();

    await service.requestPasswordReset({
      identifier: "admin@example.com",
      siteId: "site-a",
      siteSlug: "minhphat",
    });

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      recipient: "admin@example.com",
    });
    expect(notifications[0]?.resetUrl).toContain(
      "/minhphat/admin/reset-password?token=",
    );
  });

  it("returns silently for an unknown password-reset account", async () => {
    const { service, notifications } = await createFixture();

    await expect(
      service.requestPasswordReset({
        identifier: "unknown@example.com",
        siteId: "site-a",
        siteSlug: "minhphat",
      }),
    ).resolves.toBeUndefined();
    expect(notifications).toHaveLength(0);
  });

  it("resets the password once and revokes existing sessions", async () => {
    const { service, notifications } = await createFixture();
    const login = await service.login({
      username: "admin",
      password: "ValidPassword123!",
      siteId: "site-a",
    });
    await service.requestPasswordReset({
      identifier: "admin",
      siteId: "site-a",
      siteSlug: "minhphat",
    });
    const resetUrl = new URL(notifications[0]!.resetUrl);
    const token = resetUrl.searchParams.get("token")!;

    await service.resetPassword({
      token,
      password: "NewPassword123!",
      siteId: "site-a",
    });

    await expect(service.refresh(login.refreshToken)).rejects.toMatchObject({
      code: "INVALID_REFRESH_TOKEN",
    });
    await expect(
      service.resetPassword({
        token,
        password: "AnotherPassword123!",
        siteId: "site-a",
      }),
    ).rejects.toMatchObject({ code: "INVALID_RESET_TOKEN" });
    await expect(
      service.login({
        username: "admin",
        password: "NewPassword123!",
        siteId: "site-a",
      }),
    ).resolves.toMatchObject({ user: { id: "admin-a" } });
  });
});
