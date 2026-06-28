import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import type { AuthUser, UserRole } from "@nice-land/contracts";
import type { AccessTokenService } from "./token-service.js";
import type { PasswordResetNotifier } from "./password-reset-notifier.js";

export interface AuthUserRecord extends AuthUser {
  email: string | null;
  phone: string | null;
  passwordHash: string;
  isActive: boolean;
}

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
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
  findUserForPasswordReset(
    identifier: string,
    siteId: string | null,
  ): Promise<AuthUserRecord | null>;
  invalidatePasswordResetTokens(userId: string, now: Date): Promise<void>;
  createPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  findValidPasswordResetToken(
    tokenHash: string,
    siteId: string | null,
    now: Date,
  ): Promise<PasswordResetTokenRecord | null>;
  resetPassword(input: {
    tokenId: string;
    userId: string;
    passwordHash: string;
    now: Date;
  }): Promise<void>;
  updateProfile(userId: string, data: { fullName?: string | null; email?: string | null; phone?: string | null }): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_DISABLED"
  | "INVALID_REFRESH_TOKEN"
  | "INVALID_RESET_TOKEN";

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
  passwordResetTtlMinutes: number;
  appUrl: string;
  passwordResetNotifier?: PasswordResetNotifier;
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
    email: user.email,
    phone: user.phone,
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

  async requestPasswordReset(input: {
    identifier: string;
    siteId: string | null;
    siteSlug?: string;
  }) {
    const notifier = this.options.passwordResetNotifier;
    if (!notifier) return;

    const user = await this.repository.findUserForPasswordReset(
      input.identifier,
      input.siteId,
    );
    if (
      !user ||
      !user.email ||
      !user.isActive ||
      !validateRoleContext(user.role, input.siteId)
    ) {
      return;
    }

    const now = new Date();
    const token = createRefreshToken();
    await this.repository.invalidatePasswordResetTokens(user.id, now);
    await this.repository.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashRefreshToken(token),
      expiresAt: new Date(
        now.getTime() + this.options.passwordResetTtlMinutes * 60_000,
      ),
    });

    const resetPath =
      user.role === "SUPER_ADMIN"
        ? "/superadmin/reset-password"
        : `/${input.siteSlug}/admin/reset-password`;
    const resetUrl = new URL(resetPath, this.options.appUrl);
    resetUrl.searchParams.set("token", token);

    await notifier.notify({
      recipient: user.email,
      displayName: user.fullName ?? user.username,
      resetUrl: resetUrl.toString(),
      expiresInMinutes: this.options.passwordResetTtlMinutes,
    });
  }

  async resetPassword(input: {
    token: string;
    password: string;
    siteId: string | null;
  }) {
    const now = new Date();
    const resetToken = await this.repository.findValidPasswordResetToken(
      hashRefreshToken(input.token),
      input.siteId,
      now,
    );
    if (!resetToken) {
      throw new AuthError(
        "INVALID_RESET_TOKEN",
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
        400,
      );
    }

    await this.repository.resetPassword({
      tokenId: resetToken.id,
      userId: resetToken.userId,
      passwordHash: await hash(input.password, 12),
      now,
    });
  }

  async updateProfile(userId: string, data: { fullName?: string | null; email?: string | null; phone?: string | null }) {
    await this.repository.updateProfile(userId, data);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) throw new AuthError("INVALID_CREDENTIALS", "Tài khoản không tồn tại.");

    if (!(await compare(currentPassword, user.passwordHash))) {
      throw new AuthError("INVALID_CREDENTIALS", "Mật khẩu hiện tại không đúng.", 400);
    }

    const passwordHash = await hash(newPassword, 12);
    await this.repository.updatePassword(userId, passwordHash);
  }
}
