import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { notificationListQuerySchema } from "@nice-land/contracts";
import type { AppConfig } from "../../config.js";
import { createRequireAuth, requireRole, requireTenantMatch } from "../auth/auth-guards.js";
import type { AccessTokenService } from "../auth/token-service.js";
import { createTenantPreHandler } from "../tenancy/tenant-context.js";
import type { TenantSiteRepository } from "../tenancy/tenant-resolver.js";
import type { NotificationRepository } from "./notification-repository.js";

export async function registerNotificationRoutes(
  app: FastifyInstance,
  options: {
    config: AppConfig;
    tenantRepository: TenantSiteRepository;
    accessTokens: AccessTokenService;
    repository: NotificationRepository;
  },
) {
  const tenant = createTenantPreHandler(options.config, options.tenantRepository);
  const admin = [tenant, createRequireAuth(options.accessTokens), requireRole("ADMIN"), requireTenantMatch];
  const superAdmin = [
    createRequireAuth(options.accessTokens),
    requireRole("SUPER_ADMIN"),
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.auth?.siteId !== null) {
        return reply.status(403).send({
          code: "FORBIDDEN",
          message: "Tài khoản không có quyền quản trị hệ thống.",
          requestId: request.id,
        });
      }
    },
  ];
  const notFound = (requestId: string) => ({
    code: "NOT_FOUND",
    message: "Thông báo không tồn tại.",
    requestId,
  });

  app.get("/v1/admin/notifications", { preHandler: admin }, async (request) => {
    const query = notificationListQuerySchema.parse(request.query);
    return options.repository.listTenantAdmin(request.tenant!.siteId, query.limit);
  });

  app.patch<{ Params: { id: string } }>(
    "/v1/admin/notifications/:id/read",
    { preHandler: admin },
    async (request, reply) =>
      (await options.repository.markTenantAdminRead(request.tenant!.siteId, request.params.id))
        ? reply.status(204).send()
        : reply.status(404).send(notFound(request.id)),
  );

  app.post(
    "/v1/admin/notifications/read-all",
    { preHandler: admin },
    async (request, reply) => {
      await options.repository.markAllTenantAdminRead(request.tenant!.siteId);
      return reply.status(204).send();
    },
  );

  app.get("/v1/superadmin/notifications", { preHandler: superAdmin }, async (request) => {
    const query = notificationListQuerySchema.parse(request.query);
    return options.repository.listSuperAdmin(query.limit);
  });

  app.patch<{ Params: { id: string } }>(
    "/v1/superadmin/notifications/:id/read",
    { preHandler: superAdmin },
    async (request, reply) =>
      (await options.repository.markSuperAdminRead(request.params.id))
        ? reply.status(204).send()
        : reply.status(404).send(notFound(request.id)),
  );

  app.post(
    "/v1/superadmin/notifications/read-all",
    { preHandler: superAdmin },
    async (_request, reply) => {
      await options.repository.markAllSuperAdminRead();
      return reply.status(204).send();
    },
  );
}
