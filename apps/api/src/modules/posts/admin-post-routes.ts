import type { FastifyInstance } from "fastify";
import {
  adminPostInputSchema,
  adminPostListQuerySchema,
  adminPostUpdateSchema,
} from "@nice-land/contracts";
import { z } from "zod";
import type { AppConfig } from "../../config.js";
import type { AccessTokenService } from "../auth/token-service.js";
import {
  createRequireAuth,
  requireRole,
  requireTenantMatch,
} from "../auth/auth-guards.js";
import { createTenantPreHandler } from "../tenancy/tenant-context.js";
import type { TenantSiteRepository } from "../tenancy/tenant-resolver.js";
import type { AdminPostRepository } from "./admin-post-repository.js";

function serializePost(post: Awaited<ReturnType<AdminPostRepository["findById"]>>) {
  if (!post) return null;
  return {
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

interface AdminPostRouteOptions {
  config: AppConfig;
  tenantRepository: TenantSiteRepository;
  accessTokens: AccessTokenService;
  repository: AdminPostRepository;
}

export async function registerAdminPostRoutes(
  app: FastifyInstance,
  options: AdminPostRouteOptions,
) {
  const guards = [
    createTenantPreHandler(options.config, options.tenantRepository),
    createRequireAuth(options.accessTokens),
    requireRole("ADMIN"),
    requireTenantMatch,
  ];

  app.get("/v1/admin/posts", { preHandler: guards }, async (request) => {
    const query = adminPostListQuerySchema.parse(request.query);
    const result = await options.repository.list({
      ...query,
      siteId: request.tenant!.siteId,
    });
    return {
      items: result.items.map((post) => serializePost(post)),
      total: result.total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(result.total / query.limit),
    };
  });

  app.get<{ Params: { id: string } }>(
    "/v1/admin/posts/:id",
    { preHandler: guards },
    async (request, reply) => {
      const post = await options.repository.findById(
        request.tenant!.siteId,
        request.params.id,
      );
      if (!post) {
        return reply.status(404).send({
          code: "POST_NOT_FOUND",
          message: "Tin đăng không tồn tại.",
          requestId: request.id,
        });
      }
      return serializePost(post);
    },
  );

  app.post("/v1/admin/posts", { preHandler: guards }, async (request, reply) => {
    const input = adminPostInputSchema.parse(request.body);
    const created = await options.repository.create(input, {
      siteId: request.tenant!.siteId,
      userId: request.auth!.sub,
    });
    return reply.status(201).send(serializePost(created));
  });

  app.patch<{ Params: { id: string } }>(
    "/v1/admin/posts/:id",
    { preHandler: guards },
    async (request, reply) => {
      const input = adminPostUpdateSchema.parse(request.body);
      const updated = await options.repository.update(
        request.tenant!.siteId,
        request.params.id,
        input,
        {
          siteId: request.tenant!.siteId,
          userId: request.auth!.sub,
        },
      );
      if (!updated) {
        return reply.status(409).send({
          code: "POST_VERSION_CONFLICT",
          message: "Tin đã được chỉnh sửa ở nơi khác. Hãy tải lại trang.",
          requestId: request.id,
        });
      }
      return serializePost(updated);
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/v1/admin/posts/:id",
    { preHandler: guards },
    async (request, reply) => {
      const query = z
        .object({ version: z.coerce.number().int().positive() })
        .parse(request.query);
      const archived = await options.repository.archive(
        request.tenant!.siteId,
        request.params.id,
        query.version,
        {
          siteId: request.tenant!.siteId,
          userId: request.auth!.sub,
        },
      );
      if (!archived) {
        return reply.status(409).send({
          code: "POST_VERSION_CONFLICT",
          message: "Tin đã được chỉnh sửa hoặc không còn tồn tại.",
          requestId: request.id,
        });
      }
      return reply.status(204).send();
    },
  );
}
