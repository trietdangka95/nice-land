import type { FastifyInstance } from "fastify";
import {
  renewalRequestInputSchema,
  siteSettingsInputSchema,
} from "@datcuatoi/contracts";
import type { AppConfig } from "../../config.js";
import {
  createRequireAuth,
  requireRole,
  requireTenantMatch,
} from "../auth/auth-guards.js";
import type { AccessTokenService } from "../auth/token-service.js";
import { createTenantPreHandler } from "../tenancy/tenant-context.js";
import type { TenantSiteRepository } from "../tenancy/tenant-resolver.js";
import {
  type AdminSiteRepository,
  PendingRenewalRequestError,
} from "./admin-site-repository.js";

interface AdminSiteRouteOptions {
  config: AppConfig;
  tenantRepository: TenantSiteRepository;
  accessTokens: AccessTokenService;
  repository: AdminSiteRepository;
}

function notFound(requestId: string) {
  return {
    code: "SITE_NOT_FOUND",
    message: "Website không tồn tại.",
    requestId,
  };
}

export async function registerAdminSiteRoutes(
  app: FastifyInstance,
  options: AdminSiteRouteOptions,
) {
  const activeGuards = [
    createTenantPreHandler(options.config, options.tenantRepository),
    createRequireAuth(options.accessTokens),
    requireRole("ADMIN"),
    requireTenantMatch,
  ];
  const subscriptionGuards = [
    createTenantPreHandler(options.config, options.tenantRepository, {
      allowExpired: true,
    }),
    createRequireAuth(options.accessTokens),
    requireRole("ADMIN"),
    requireTenantMatch,
  ];

  app.get("/v1/admin/site-config", { preHandler: subscriptionGuards }, async (request, reply) => {
    const settings = await options.repository.getSettings(request.tenant!.siteId);
    return settings ?? reply.status(404).send(notFound(request.id));
  });

  app.put("/v1/admin/site-config", { preHandler: activeGuards }, async (request, reply) => {
    const input = siteSettingsInputSchema.parse(request.body);
    const settings = await options.repository.updateSettings(
      request.tenant!.siteId,
      input,
      request.auth!.sub,
    );
    return settings ?? reply.status(404).send(notFound(request.id));
  });

  app.get("/v1/admin/subscription", { preHandler: subscriptionGuards }, async (request, reply) => {
    const subscription = await options.repository.getSubscription(
      request.tenant!.siteId,
    );
    return subscription ?? reply.status(404).send(notFound(request.id));
  });

  app.post("/v1/admin/renewal-requests", { preHandler: subscriptionGuards }, async (request, reply) => {
    const input = renewalRequestInputSchema.parse(request.body);
    try {
      const created = await options.repository.createRenewalRequest(
        request.tenant!.siteId,
        input,
        request.auth!.sub,
      );
      return reply.status(201).send(created);
    } catch (error) {
      if (error instanceof PendingRenewalRequestError) {
        return reply.status(409).send({
          code: "RENEWAL_REQUEST_PENDING",
          message: error.message,
          requestId: request.id,
        });
      }
      throw error;
    }
  });
}
