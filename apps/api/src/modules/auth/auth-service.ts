import { createHash, randomBytes } from "node:crypto";
import { compare } from "bcryptjs";
import type { AuthUser, UserRole } from "@nice-land/contracts";
import type { AccessTokenService } from "./token-service.js";

export interface AuthUserRecord extends AuthUser {
  passwordHash: string;
  isActive: boolean;
}

export interface RefreshSessionRecord {
  id: string;
  userId: string;
  siteId: string | null;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface CreateRefreshSessionInput {
  userId: string;
  siteId: string | null;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthRepository {
  findUserForLogin(
    username: string,
    siteId: string | null,
  ): Promise<AuthUserRecord | null>;
  findUserById(userId: string): Promise<AuthUserRecord | null>;
  createRefreshSession(
    input: CreateRefreshSessionInput,
  ): Promise<RefreshSessionRecord>;
  findActiveRefreshSession(
    tokenHash: string,
    now: Date,
  ): Promise<RefreshSessionRecord | null>;
  rotateRefreshSession(
    currentSessionId: string,
    replacement: CreateRefreshSessionInput,
  ): Promise<RefreshSessionRecord>;
  revokeRefreshSession(tokenHash: string): Promise<void>;
  updateLastLogin(userId: string, now: Date): Promise<void>;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_DISABLED"
  | "INVALID_REFRESH_TOKEN";

export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    public readonly statusCode = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

interface AuthServiceOptions {
  refreshTokenTtlDays: number;
}

interface LoginInput {
  username: string;
  password: string;
  siteId: string | null;
  userAgent?: string;
  ipAddress?: string;
}

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createRefreshToken() {
  return randomBytes(32).toString("hex");
}

function toPublicUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    siteId: user.siteId,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  };
}

function validateRoleContext(role: UserRole, siteId: string | null) {
  return role === "SUPER_ADMIN" ? siteId === null : siteId !== null;
}

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly accessTokens: AccessTokenService,
    private readonly options: AuthServiceOptions,
  ) {}

  async login(input: LoginInput) {
    const user = await this.repository.findUserForLogin(
      input.username,
      input.siteId,
    );

    if (
      !user ||
      !validateRoleContext(user.role, input.siteId) ||
      !(await compare(input.password, user.passwordHash))
    ) {
      throw new AuthError(
        "INVALID_CREDENTIALS",
        "Tên đăng nhập hoặc mật khẩu không đúng.",
      );
    }

    if (!user.isActive) {
      throw new AuthError(
        "ACCOUNT_DISABLED",
        "Tài khoản đang bị vô hiệu hóa.",
        403,
      );
    }

    const now = new Date();
    const refreshToken = createRefreshToken();
    await this.repository.createRefreshSession({
      userId: user.id,
      siteId: user.siteId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(
        now.getTime() + this.options.refreshTokenTtlDays * 86_400_000,
      ),
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });
    await this.repository.updateLastLogin(user.id, now);

    return {
      accessToken: await this.accessTokens.sign({
        sub: user.id,
        siteId: user.siteId,
        role: user.role,
        username: user.username,
      }),
      refreshToken,
      user: toPublicUser(user),
    };
  }

  async refresh(refreshToken: string) {
    const now = new Date();
    const current = await this.repository.findActiveRefreshSession(
      hashRefreshToken(refreshToken),
      now,
    );

    if (!current) {
      throw new AuthError(
        "INVALID_REFRESH_TOKEN",
        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
      );
    }

    const user = await this.repository.findUserById(current.userId);
    if (!user || !user.isActive) {
      throw new AuthError(
        "INVALID_REFRESH_TOKEN",
        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
      );
    }

    const replacementToken = createRefreshToken();
    await this.repository.rotateRefreshSession(current.id, {
      userId: user.id,
      siteId: user.siteId,
      tokenHash: hashRefreshToken(replacementToken),
      expiresAt: new Date(
        now.getTime() + this.options.refreshTokenTtlDays * 86_400_000,
      ),
    });

    return {
      accessToken: await this.accessTokens.sign({
        sub: user.id,
        siteId: user.siteId,
        role: user.role,
        username: user.username,
      }),
      refreshToken: replacementToken,
      user: toPublicUser(user),
    };
  }

  async logout(refreshToken: string) {
    await this.repository.revokeRefreshSession(hashRefreshToken(refreshToken));
  }

  async getCurrentUser(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user || !user.isActive) {
      throw new AuthError(
        "INVALID_CREDENTIALS",
        "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa.",
      );
    }

    return toPublicUser(user);
  }
}
