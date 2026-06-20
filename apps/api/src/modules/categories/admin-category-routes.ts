import type { FastifyInstance } from "fastify";
import { propertyCategoryInputSchema } from "@nice-land/contracts";
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
  CategoryInUseError,
  type AdminCategoryRepository,
} from "./admin-category-repository.js";

interface CategoryRouteOptions {
  config: AppConfig;
  tenantRepository: TenantSiteRepository;
  accessTokens: AccessTokenService;
  repository: AdminCategoryRepository;
}

export async function registerAdminCategoryRoutes(
  app: FastifyInstance,
  options: CategoryRouteOptions,
) {
  const tenantGuard = createTenantPreHandler(
    options.config,
    options.tenantRepository,
  );
  const adminGuards = [
    tenantGuard,
    createRequireAuth(options.accessTokens),
    requireRole("ADMIN"),
    requireTenantMatch,
  ];

  app.get(
    "/v1/public/categories",
    { preHandler: tenantGuard },
    (request) => options.repository.list(request.tenant!.siteId),
  );

  app.get(
    "/v1/admin/categories",
    { preHandler: adminGuards },
    (request) => options.repository.list(request.tenant!.siteId),
  );

  app.post(
    "/v1/admin/categories",
    { preHandler: adminGuards },
    async (request, reply) => {
      const input = propertyCategoryInputSchema.parse(request.body);
      const category = await options.repository.create(
        request.tenant!.siteId,
        input,
        request.auth!.sub,
      );
      return reply.status(201).send(category);
    },
  );

  app.patch<{ Params: { id: string } }>(
    "/v1/admin/categories/:id",
    { preHandler: adminGuards },
    async (request, reply) => {
      const input = propertyCategoryInputSchema.parse(request.body);
      const category = await options.repository.update(
        request.tenant!.siteId,
        request.params.id,
        input,
        request.auth!.sub,
      );
      if (!category) {
        return reply.status(404).send({
          code: "CATEGORY_NOT_FOUND",
          message: "Danh mục không tồn tại.",
          requestId: request.id,
        });
      }
      return category;
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/v1/admin/categories/:id",
    { preHandler: adminGuards },
    async (request, reply) => {
      try {
        const removed = await options.repository.remove(
          request.tenant!.siteId,
          request.params.id,
          request.auth!.sub,
        );
        if (!removed) {
          return reply.status(404).send({
            code: "CATEGORY_NOT_FOUND",
            message: "Danh mục không tồn tại.",
            requestId: request.id,
          });
        }
        return reply.status(204).send();
      } catch (error) {
        if (error instanceof CategoryInUseError) {
          return reply.status(409).send({
            code: "CATEGORY_IN_USE",
            message: error.message,
            requestId: request.id,
          });
        }
        throw error;
      }
    },
  );
}
