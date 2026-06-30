import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import {
  leadUpdateSchema,
  propertyInteractionInputSchema,
  propertyLeadInputSchema,
} from "@nice-land/contracts";
import type { AppConfig } from "../../config.js";
import { createRequireAuth, requireRole, requireTenantMatch } from "../auth/auth-guards.js";
import type { AccessTokenService } from "../auth/token-service.js";
import { createTenantPreHandler } from "../tenancy/tenant-context.js";
import type { TenantSiteRepository } from "../tenancy/tenant-resolver.js";
import type { EngagementRepository } from "./engagement-repository.js";
import type { LeadNotifier } from "./lead-notifier.js";
import type { NotificationRepository } from "../notifications/notification-repository.js";
import { buildLeadCreatedNotification } from "../notifications/notification-content.js";

const BOT_PATTERN = /bot|crawler|spider|slurp|preview|facebookexternalhit/i;

export async function registerEngagementRoutes(
  app: FastifyInstance,
  options: {
    config: AppConfig;
    tenantRepository: TenantSiteRepository;
    accessTokens: AccessTokenService;
    repository: EngagementRepository;
    notifier?: LeadNotifier;
    notificationRepository?: NotificationRepository;
  },
) {
  const tenant = createTenantPreHandler(options.config, options.tenantRepository);
  const admin = [tenant, createRequireAuth(options.accessTokens), requireRole("ADMIN"), requireTenantMatch];

  app.post<{ Params: { id: string } }>("/v1/public/posts/:id/view", { preHandler: tenant }, async (request, reply) => {
    const userAgent = request.headers["user-agent"] ?? "";
    if (BOT_PATTERN.test(userAgent)) return reply.status(204).send();
    const visitorHash = createHash("sha256")
      .update(`${request.ip}|${userAgent}|${options.config.JWT_ACCESS_SECRET}`)
      .digest("hex");
    const result = await options.repository.recordView({
      siteId: request.tenant!.siteId,
      postId: request.params.id,
      visitorHash,
      referrer: request.headers.referer,
      userAgent,
      since: new Date(Date.now() - 86_400_000),
    });
    if (result === null) return reply.status(404).send({ code: "POST_NOT_FOUND", message: "Tin đăng không tồn tại.", requestId: request.id });
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>("/v1/public/posts/:id/leads", { preHandler: tenant }, async (request, reply) => {
    const input = propertyLeadInputSchema.parse(request.body);
    const lead = await options.repository.createLead(request.tenant!.siteId, request.params.id, input);
    if (!lead) return reply.status(404).send({ code: "POST_NOT_FOUND", message: "Tin đăng không tồn tại.", requestId: request.id });
    if (options.notificationRepository) {
      const notification = buildLeadCreatedNotification({
        siteName: lead.notification.siteName,
        postTitle: lead.notification.postTitle,
        leadName: input.name,
        leadId: lead.id,
      });
      void options.notificationRepository.create({
        siteId: request.tenant!.siteId,
        scope: "TENANT_ADMIN",
        type: "LEAD_CREATED",
        title: notification.title,
        body: notification.body,
        link: notification.link,
        payload: {
          ...notification.payload,
          leadId: lead.id,
          postId: request.params.id,
        },
      }).catch((error) => {
        request.log.error(
          { err: error, leadId: lead.id, siteId: request.tenant!.siteId },
          "notification create failed",
        );
      });
    }
    if (options.notifier && lead.notification.recipient) {
      void options.notifier
        .notify({
          recipient: lead.notification.recipient,
          siteName: lead.notification.siteName,
          postTitle: lead.notification.postTitle,
          leadName: input.name,
          leadPhone: input.phone,
          leadEmail: input.email || undefined,
          message: input.message,
        })
        .catch((error) => {
          request.log.error(
            { err: error, leadId: lead.id, siteId: request.tenant!.siteId },
            "lead notification failed",
          );
        });
    }
    return reply.status(201).send({ id: lead.id, createdAt: lead.createdAt.toISOString() });
  });

  app.post<{ Params: { id: string } }>(
    "/v1/public/posts/:id/interactions",
    { preHandler: tenant },
    async (request, reply) => {
      const input = propertyInteractionInputSchema.parse(request.body);
      const recorded = await options.repository.recordInteraction(
        request.tenant!.siteId,
        request.params.id,
        input.source,
      );
      return recorded
        ? reply.status(204).send()
        : reply.status(404).send({
            code: "POST_NOT_FOUND",
            message: "Tin đăng không tồn tại.",
            requestId: request.id,
          });
    },
  );

  app.get("/v1/admin/leads", { preHandler: admin }, (request) =>
    options.repository.listLeads(request.tenant!.siteId));
  app.patch<{ Params: { id: string } }>("/v1/admin/leads/:id", { preHandler: admin }, async (request, reply) =>
    (await options.repository.updateLead(request.tenant!.siteId, request.params.id, leadUpdateSchema.parse(request.body)))
      ? reply.status(204).send()
      : reply.status(404).send({ code: "LEAD_NOT_FOUND", message: "Lead không tồn tại.", requestId: request.id }));
  app.get("/v1/admin/analytics", { preHandler: admin }, (request) =>
    options.repository.getAnalytics(request.tenant!.siteId, new Date(Date.now() - 30 * 86_400_000)));
}
