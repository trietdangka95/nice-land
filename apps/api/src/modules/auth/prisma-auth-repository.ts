import { prisma } from "@nice-land/database";
import type {
  AuthRepository,
  CreateRefreshSessionInput,
} from "./auth-service.js";

const userSelect = {
  id: true,
  siteId: true,
  username: true,
  email: true,
  passwordHash: true,
  fullName: true,
  role: true,
  isActive: true,
} as const;

export class PrismaAuthRepository implements AuthRepository {
  findUserForLogin(username: string, siteId: string | null) {
    return prisma.user.findFirst({
      where: {
        username,
        siteId,
        deletedAt: null,
      },
      select: userSelect,
    });
  }

  findUserById(userId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: userSelect,
    });
  }

  createRefreshSession(input: CreateRefreshSessionInput) {
    return prisma.refreshSession.create({
      data: input,
      select: {
        id: true,
        userId: true,
        siteId: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
      },
    });
  }

  findActiveRefreshSession(tokenHash: string, now: Date) {
    return prisma.refreshSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        userId: true,
        siteId: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
      },
    });
  }

  async rotateRefreshSession(
    currentSessionId: string,
    replacement: CreateRefreshSessionInput,
  ) {
    return prisma.$transaction(async (transaction) => {
      const created = await transaction.refreshSession.create({
        data: replacement,
        select: {
          id: true,
          userId: true,
          siteId: true,
          tokenHash: true,
          expiresAt: true,
          revokedAt: true,
        },
      });

      await transaction.refreshSession.update({
        where: { id: currentSessionId },
        data: {
          revokedAt: new Date(),
          replacedById: created.id,
        },
      });

      return created;
    });
  }

  async revokeRefreshSession(tokenHash: string) {
    await prisma.refreshSession.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async updateLastLogin(userId: string, now: Date) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: now },
    });
  }

  findUserForPasswordReset(identifier: string, siteId: string | null) {
    return prisma.user.findFirst({
      where: {
        siteId,
        deletedAt: null,
        OR: [{ username: identifier }, { email: identifier.toLowerCase() }],
      },
      select: userSelect,
    });
  }

  async invalidatePasswordResetTokens(userId: string, now: Date) {
    await prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: now },
    });
  }

  async createPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    await prisma.passwordResetToken.create({ data: input });
  }

  findValidPasswordResetToken(
    tokenHash: string,
    siteId: string | null,
    now: Date,
  ) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
        user: {
          siteId,
          isActive: true,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });
  }

  async resetPassword(input: {
    tokenId: string;
    userId: string;
    passwordHash: string;
    now: Date;
  }) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: input.userId },
        data: { passwordHash: input.passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: input.tokenId },
        data: { usedAt: input.now },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: input.userId,
          id: { not: input.tokenId },
          usedAt: null,
        },
        data: { usedAt: input.now },
      }),
      prisma.refreshSession.updateMany({
        where: { userId: input.userId, revokedAt: null },
        data: { revokedAt: input.now },
      }),
    ]);
  }
}
