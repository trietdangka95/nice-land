import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../../config.js";
import {
  createRequireAuth,
  requireRole,
  requireTenantMatch,
} from "../auth/auth-guards.js";
import type { AccessTokenService } from "../auth/token-service.js";
import { createTenantPreHandler } from "../tenancy/tenant-context.js";
import type { TenantSiteRepository } from "../tenancy/tenant-resolver.js";
import type { AdminDashboardRepository } from "./admin-dashboard-repository.js";

export async function registerAdminDashboardRoutes(
  app: FastifyInstance,
  options: {
    config: AppConfig;
    tenantRepository: TenantSiteRepository;
    accessTokens: AccessTokenService;
    repository: AdminDashboardRepository;
  },
) {
  const guards = [
    createTenantPreHandler(options.config, options.tenantRepository, {
      allowExpired: true,
    }),
    createRequireAuth(options.accessTokens),
    requireRole("ADMIN"),
    requireTenantMatch,
  ];

  app.get(
    "/v1/admin/dashboard",
    { preHandler: guards },
    async (request, reply) => {
      const dashboard = await options.repository.getDashboard(
        request.tenant!.siteId,
      );
      return (
        dashboard ??
        reply.status(404).send({
          code: "SITE_NOT_FOUND",
          message: "Website không tồn tại.",
          requestId: request.id,
        })
      );
    },
  );
}
