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
      passwordHash,
      fullName: "Admin A",
      role: "ADMIN" as const,
      isActive: true,
    },
    {
      id: "super-1",
      siteId: null,
      username: "superadmin",
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
  };

  const tokenService = new AccessTokenService(
    "test-access-secret-at-least-32-characters",
    900,
  );
  const service = new AuthService(repository, tokenService, {
    refreshTokenTtlDays: 30,
  });

  return { service, tokenService, sessions };
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
});
