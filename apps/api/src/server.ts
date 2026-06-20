import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { PrismaTenantSiteRepository } from "./modules/tenancy/prisma-tenant-repository.js";
import { prisma } from "@datcuatoi/database";
import { PrismaPublicSiteRepository } from "./modules/sites/prisma-public-site-repository.js";
import { PrismaContactRequestRepository } from "./modules/contacts/prisma-contact-request-repository.js";
import { PrismaPublicPostRepository } from "./modules/posts/prisma-public-post-repository.js";
import { PrismaAuthRepository } from "./modules/auth/prisma-auth-repository.js";
import { AccessTokenService } from "./modules/auth/token-service.js";
import { AuthService } from "./modules/auth/auth-service.js";

const config = loadConfig();
const accessTokens = new AccessTokenService(
  config.JWT_ACCESS_SECRET,
  config.ACCESS_TOKEN_TTL_SECONDS,
);
const app = buildApp(config, {
  tenantRepository: new PrismaTenantSiteRepository(),
  publicSiteRepository: new PrismaPublicSiteRepository(),
  contactRequestRepository: new PrismaContactRequestRepository(),
  publicPostRepository: new PrismaPublicPostRepository(),
  accessTokens,
  authService: new AuthService(new PrismaAuthRepository(), accessTokens, {
    refreshTokenTtlDays: config.REFRESH_TOKEN_TTL_DAYS,
  }),
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
