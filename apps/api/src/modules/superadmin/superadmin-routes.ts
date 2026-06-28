import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  renewalResolutionInputSchema,
  contactStatusInputSchema,
  siteActiveInputSchema,
  subscriptionPlanInputSchema,
  superAdminSiteCreateSchema,
  superAdminSiteListQuerySchema,
  superAdminSiteUpdateSchema,
  systemSettingInputSchema,
} from "@nice-land/contracts";
import { createRequireAuth, requireRole } from "../auth/auth-guards.js";
import type { AccessTokenService } from "../auth/token-service.js";
import {
  SuperAdminConflictError,
  type SuperAdminRepository,
} from "./superadmin-repository.js";

export async function registerSuperAdminRoutes(
  app: FastifyInstance,
  options: { accessTokens: AccessTokenService; repository: SuperAdminRepository },
) {
  const guards = [
    createRequireAuth(options.accessTokens),
    requireRole("SUPER_ADMIN"),
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.auth?.siteId !== null) {
        return reply.status(403).send({ code: "FORBIDDEN", message: "Tài khoản không có quyền quản trị hệ thống.", requestId: request.id });
      }
    },
  ];
  const notFound = (requestId: string) => ({ code: "NOT_FOUND", message: "Dữ liệu không tồn tại.", requestId });

  app.get("/v1/superadmin/sites", { preHandler: guards }, async (request) => {
    const query = superAdminSiteListQuerySchema.parse(request.query);
    const result = await options.repository.listSites(query);
    return { ...result, page: query.page, limit: query.limit, totalPages: Math.ceil(result.total / query.limit) };
  });
  app.get<{ Params: { id: string } }>("/v1/superadmin/sites/:id", { preHandler: guards }, async (request, reply) =>
    (await options.repository.findSite(request.params.id)) ?? reply.status(404).send(notFound(request.id)));
  app.post("/v1/superadmin/sites", { preHandler: guards }, async (request, reply) => {
    try {
      return reply.status(201).send(await options.repository.createSite(superAdminSiteCreateSchema.parse(request.body), request.auth!.sub));
    } catch (error) {
      if (error instanceof SuperAdminConflictError) return reply.status(409).send({ code: "CONFLICT", message: error.message, requestId: request.id });
      throw error;
    }
  });
  app.put<{ Params: { id: string } }>("/v1/superadmin/sites/:id", { preHandler: guards }, async (request, reply) =>
    (await options.repository.updateSite(request.params.id, superAdminSiteUpdateSchema.parse(request.body), request.auth!.sub)) ?? reply.status(404).send(notFound(request.id)));
  app.patch<{ Params: { id: string } }>("/v1/superadmin/sites/:id/active", { preHandler: guards }, async (request, reply) => {
    const input = siteActiveInputSchema.parse(request.body);
    return (await options.repository.setSiteActive(request.params.id, input.isActive, request.auth!.sub)) ? reply.status(204).send() : reply.status(404).send(notFound(request.id));
  });
  app.post<{ Params: { id: string } }>("/v1/superadmin/sites/:id/reset-password", { preHandler: guards }, async (request, reply) => {
    const password = await options.repository.resetAdminPassword(request.params.id, request.auth!.sub);
    return password ? { temporaryPassword: password } : reply.status(404).send(notFound(request.id));
  });
  app.patch<{ Params: { id: string } }>("/v1/superadmin/sites/:id/admin-active", { preHandler: guards }, async (request, reply) => {
    const input = siteActiveInputSchema.parse(request.body);
    return (await options.repository.setAdminActive(request.params.id, input.isActive, request.auth!.sub))
      ? reply.status(204).send()
      : reply.status(404).send(notFound(request.id));
  });

  app.get("/v1/superadmin/plans", { preHandler: guards }, () => options.repository.listPlans());
  app.post("/v1/superadmin/plans", { preHandler: guards }, async (request, reply) =>
    reply.status(201).send(await options.repository.createPlan(subscriptionPlanInputSchema.parse(request.body), request.auth!.sub)));
  app.put<{ Params: { id: string } }>("/v1/superadmin/plans/:id", { preHandler: guards }, async (request, reply) =>
    (await options.repository.updatePlan(request.params.id, subscriptionPlanInputSchema.parse(request.body), request.auth!.sub)) ?? reply.status(404).send(notFound(request.id)));
  app.delete<{ Params: { id: string } }>("/v1/superadmin/plans/:id", { preHandler: guards }, async (request, reply) => {
    try {
      return (await options.repository.deletePlan(request.params.id, request.auth!.sub)) ? reply.status(204).send() : reply.status(404).send(notFound(request.id));
    } catch (error) {
      if (error instanceof SuperAdminConflictError) return reply.status(409).send({ code: "PLAN_IN_USE", message: error.message, requestId: request.id });
      throw error;
    }
  });

  app.get("/v1/superadmin/renewal-requests", { preHandler: guards }, () => options.repository.listRenewals());
  app.patch<{ Params: { id: string } }>("/v1/superadmin/renewal-requests/:id", { preHandler: guards }, async (request, reply) =>
    (await options.repository.resolveRenewal(request.params.id, renewalResolutionInputSchema.parse(request.body), request.auth!.sub)) ?? reply.status(404).send(notFound(request.id)));
  app.get("/v1/superadmin/contacts", { preHandler: guards }, () => options.repository.listContacts());
  app.patch<{ Params: { id: string } }>("/v1/superadmin/contacts/:id", { preHandler: guards }, async (request, reply) => {
    const input = contactStatusInputSchema.parse(request.body);
    return (await options.repository.updateContactStatus(request.params.id, input.status, request.auth!.sub))
      ? reply.status(204).send()
      : reply.status(404).send(notFound(request.id));
  });
  app.get("/v1/superadmin/audit-logs", { preHandler: guards }, () => options.repository.listAuditLogs());

  app.get("/v1/superadmin/settings", { preHandler: guards }, () => options.repository.getSystemSetting());
  app.put("/v1/superadmin/settings", { preHandler: guards }, async (request) => {
    const input = systemSettingInputSchema.parse(request.body);
    return options.repository.updateSystemSetting(input, request.auth!.sub);
  });
}
