import { prisma } from "@nice-land/database";
import type {
  AuthRepository,
  CreateRefreshSessionInput,
} from "./auth-service.js";

const userSelect = {
  id: true,
  siteId: true,
  username: true,
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
}
