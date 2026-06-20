import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { PrismaTenantSiteRepository } from "./modules/tenancy/prisma-tenant-repository.js";
import { prisma } from "@nice-land/database";
import { PrismaPublicSiteRepository } from "./modules/sites/prisma-public-site-repository.js";
import { PrismaContactRequestRepository } from "./modules/contacts/prisma-contact-request-repository.js";
import { PrismaPublicPostRepository } from "./modules/posts/prisma-public-post-repository.js";
import { PrismaAuthRepository } from "./modules/auth/prisma-auth-repository.js";
import { AccessTokenService } from "./modules/auth/token-service.js";
import { AuthService } from "./modules/auth/auth-service.js";
import { PrismaAdminPostRepository } from "./modules/posts/prisma-admin-post-repository.js";
import {
  PrismaPostImageRepository,
  S3PostImageStorage,
} from "./modules/uploads/post-image-service.js";
import { PrismaAdminSiteRepository } from "./modules/sites/prisma-admin-site-repository.js";
import { PrismaSuperAdminRepository } from "./modules/superadmin/prisma-superadmin-repository.js";
import { PrismaEngagementRepository } from "./modules/engagement/prisma-engagement-repository.js";
import { ResendLeadNotifier } from "./modules/engagement/lead-notifier.js";
import { PrismaAdminCategoryRepository } from "./modules/categories/prisma-admin-category-repository.js";
import { ResendPasswordResetNotifier } from "./modules/auth/password-reset-notifier.js";

const config = loadConfig();
const accessTokens = new AccessTokenService(
  config.JWT_ACCESS_SECRET,
  config.ACCESS_TOKEN_TTL_SECONDS,
);
const postImageDependencies =
  config.AWS_REGION && config.AWS_S3_BUCKET && config.AWS_S3_PUBLIC_URL
    ? {
        repository: new PrismaPostImageRepository(config.AWS_S3_PUBLIC_URL),
        storage: new S3PostImageStorage(
          config.AWS_REGION,
          config.AWS_S3_BUCKET,
        ),
      }
    : undefined;
const leadNotifier =
  config.RESEND_API_KEY && config.EMAIL_FROM
    ? new ResendLeadNotifier(config.RESEND_API_KEY, config.EMAIL_FROM)
    : undefined;
const passwordResetNotifier =
  config.RESEND_API_KEY && config.EMAIL_FROM
    ? new ResendPasswordResetNotifier(config.RESEND_API_KEY, config.EMAIL_FROM)
    : undefined;
const app = buildApp(config, {
  tenantRepository: new PrismaTenantSiteRepository(),
  publicSiteRepository: new PrismaPublicSiteRepository(),
  contactRequestRepository: new PrismaContactRequestRepository(),
  publicPostRepository: new PrismaPublicPostRepository(),
  accessTokens,
  authService: new AuthService(new PrismaAuthRepository(), accessTokens, {
    refreshTokenTtlDays: config.REFRESH_TOKEN_TTL_DAYS,
    passwordResetTtlMinutes: config.PASSWORD_RESET_TTL_MINUTES,
    appUrl: config.APP_URL,
    passwordResetNotifier,
  }),
  adminPostRepository: new PrismaAdminPostRepository(),
  adminCategoryRepository: new PrismaAdminCategoryRepository(),
  adminSiteRepository: new PrismaAdminSiteRepository(),
  superAdminRepository: new PrismaSuperAdminRepository(),
  engagementRepository: new PrismaEngagementRepository(),
  leadNotifier,
  postImageDependencies,
  readinessCheck: async () => {
    await prisma.$queryRaw`SELECT 1`;
  },
});

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "graceful shutdown started");
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

try {
  await app.listen({ host: config.HOST, port: config.PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
