import Fastify from "fastify";
import { createHash } from "node:crypto";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import {
  contactRequestInputSchema,
  publicPostListQuerySchema,
  type ApiError,
  type HealthResponse,
} from "@nice-land/contracts";
import { ZodError } from "zod";
import type { AppConfig } from "./config.js";
import {
  createOptionalTenantPreHandler,
  createTenantPreHandler,
} from "./modules/tenancy/tenant-context.js";
import type { TenantSiteRepository } from "./modules/tenancy/tenant-resolver.js";
import type { PublicSiteRepository } from "./modules/sites/public-site-repository.js";
import type { ContactRequestRepository } from "./modules/contacts/contact-request-repository.js";
import type { PublicPostRepository } from "./modules/posts/public-post-repository.js";
import type { AuthService } from "./modules/auth/auth-service.js";
import type { AccessTokenService } from "./modules/auth/token-service.js";
import { registerAuthRoutes } from "./modules/auth/auth-routes.js";
import type { AdminPostRepository } from "./modules/posts/admin-post-repository.js";
import { registerAdminPostRoutes } from "./modules/posts/admin-post-routes.js";
import type {
  PostImageRepository,
  PostImageStorage,
} from "./modules/uploads/post-image-service.js";
import { registerPostImageRoutes } from "./modules/uploads/post-image-routes.js";
import { registerGenericImageRoutes } from "./modules/uploads/generic-image-routes.js";
import type { AdminSiteRepository } from "./modules/sites/admin-site-repository.js";
import { registerAdminSiteRoutes } from "./modules/sites/admin-site-routes.js";
import type { SuperAdminRepository } from "./modules/superadmin/superadmin-repository.js";
import { registerSuperAdminRoutes } from "./modules/superadmin/superadmin-routes.js";
import type { EngagementRepository } from "./modules/engagement/engagement-repository.js";
import { registerEngagementRoutes } from "./modules/engagement/engagement-routes.js";
import type { LeadNotifier } from "./modules/engagement/lead-notifier.js";
import type { AdminCategoryRepository } from "./modules/categories/admin-category-repository.js";
import { registerAdminCategoryRoutes } from "./modules/categories/admin-category-routes.js";
import type { AdminDashboardRepository } from "./modules/dashboard/admin-dashboard-repository.js";
import { registerAdminDashboardRoutes } from "./modules/dashboard/admin-dashboard-routes.js";
import type { NotificationRepository } from "./modules/notifications/notification-repository.js";
import { registerNotificationRoutes } from "./modules/notifications/notification-routes.js";
import { buildContactRequestCreatedNotification } from "./modules/notifications/notification-content.js";

interface BuildAppOptions {
  tenantRepository?: TenantSiteRepository;
  publicSiteRepository?: PublicSiteRepository;
  contactRequestRepository?: ContactRequestRepository;
  publicPostRepository?: PublicPostRepository;
  authService?: AuthService;
  accessTokens?: AccessTokenService;
  adminPostRepository?: AdminPostRepository;
  adminCategoryRepository?: AdminCategoryRepository;
  adminDashboardRepository?: AdminDashboardRepository;
  adminSiteRepository?: AdminSiteRepository;
  superAdminRepository?: SuperAdminRepository;
  engagementRepository?: EngagementRepository;
  notificationRepository?: NotificationRepository;
  leadNotifier?: LeadNotifier;
  postImageDependencies?: {
    repository: PostImageRepository;
    storage: PostImageStorage;
  };
  readinessCheck?: () => Promise<void>;
}

function createCorsOriginMatcher(corsOrigins: string) {
  const origins = corsOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const exactOrigins = new Set(
    origins.filter((origin) => !origin.includes("*")),
  );
  const wildcardSuffixes = origins
    .filter((origin) => origin.startsWith("https://*."))
    .map((origin) => origin.replace("https://*.", "."));

  return (
    origin: string | undefined,
    callback: (error: Error | null, allow: boolean) => void,
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (exactOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    let originUrl: URL;
    try {
      originUrl = new URL(origin);
    } catch {
      callback(null, false);
      return;
    }

    const isAllowedWildcardOrigin =
      originUrl.protocol === "https:" &&
      wildcardSuffixes.some(
        (suffix) =>
          originUrl.hostname.endsWith(suffix) &&
          originUrl.hostname.length > suffix.length,
      );

    callback(null, isAllowedWildcardOrigin);
  };
}

export function buildApp(config: AppConfig, options: BuildAppOptions = {}) {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
    genReqId: () => crypto.randomUUID(),
    bodyLimit: 1_048_576,
  });

  app.decorateRequest("tenant", null);
  app.decorateRequest("auth", null);

  void app.register(cookie);
  void app.register(cors, {
    credentials: true,
    origin: createCorsOriginMatcher(config.CORS_ORIGINS),
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Host"],
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: "Dữ liệu gửi lên không hợp lệ.",
        requestId: request.id,
        details: error.flatten(),
      } satisfies ApiError);
    }

    request.log.error({ err: error }, "request failed");
    const message = error instanceof Error ? error.message : "Unknown error";
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500;

    const payload: ApiError = {
      code: statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR",
      message:
        config.NODE_ENV === "production" && statusCode >= 500
          ? "Đã xảy ra lỗi hệ thống."
          : message,
      requestId: request.id,
    };

    return reply.status(statusCode).send(payload);
  });

  app.get("/health/live", async (): Promise<HealthResponse> => ({
    status: "ok",
    service: "nice-land-api",
    timestamp: new Date().toISOString(),
  }));

  app.get("/health/ready", async (_request, reply): Promise<HealthResponse> => {
    try {
      await options.readinessCheck?.();
      return {
        status: "ok",
        service: "nice-land-api",
        timestamp: new Date().toISOString(),
      };
    } catch {
      return reply.status(503).send({
        status: "unavailable",
        service: "nice-land-api",
        timestamp: new Date().toISOString(),
      });
    }
  });

  if (options.tenantRepository && options.publicSiteRepository) {
    app.get(
      "/v1/public/site",
      {
        preHandler: createTenantPreHandler(config, options.tenantRepository),
      },
      async (request, reply) => {
        const site = await options.publicSiteRepository!.findPublicConfig(
          request.tenant!.siteId,
        );

        if (!site) {
          return reply.status(404).send({
            code: "TENANT_NOT_FOUND",
            message: "Website không tồn tại.",
            requestId: request.id,
          });
        }

        return site;
      },
    );

    if (options.publicSiteRepository.getPlatformStats) {
      app.get("/v1/public/stats", async () => {
        return options.publicSiteRepository!.getPlatformStats!();
      });
    }

    if (options.publicSiteRepository.listPublicPlans) {
      app.get("/v1/public/plans", async () => {
        return options.publicSiteRepository!.listPublicPlans!();
      });
    }

    if (options.publicSiteRepository.recordPlatformView) {
      const BOT_PATTERN = /bot|crawler|spider|slurp|preview|facebookexternalhit/i;
      app.post("/v1/public/platform-views", async (request, reply) => {
        const userAgent = request.headers["user-agent"] ?? "";
        if (BOT_PATTERN.test(userAgent)) return reply.status(204).send();
        const visitorHash = createHash("sha256")
          .update(`${request.ip}|${userAgent}|${config.JWT_ACCESS_SECRET}`)
          .digest("hex");
        await options.publicSiteRepository!.recordPlatformView!({
          visitorHash,
          userAgent,
          referrer: request.headers.referer,
          since: new Date(Date.now() - 86_400_000),
        });
        return reply.status(204).send();
      });
    }
  }

  if (options.superAdminRepository) {
    app.get("/v1/public/bank-info", async () => {
      return options.superAdminRepository!.getSystemSetting();
    });
  }

  if (options.tenantRepository && options.contactRequestRepository) {
    app.post(
      "/v1/public/contact-requests",
      {
        preHandler: createOptionalTenantPreHandler(
          config,
          options.tenantRepository,
        ),
      },
      async (request, reply) => {
        const input = contactRequestInputSchema.parse(request.body);
        const created = await options.contactRequestRepository!.create({
          siteId: request.tenant?.siteId ?? null,
          name: input.name,
          phone: input.phone,
          email: input.email || undefined,
          message: input.message,
          selectedPlan: input.selectedPlan || undefined,
          themePreference: input.themePreference,
          source: request.tenant ? "TENANT_WEBSITE" : "LANDING_PAGE",
        });

        request.log.info(
          {
            siteId: request.tenant?.siteId,
            contactRequestId: created.id,
          },
          "contact request created",
        );

        if (options.notificationRepository) {
          const notification = buildContactRequestCreatedNotification({
            contactName: input.name,
            source: request.tenant ? "TENANT_WEBSITE" : "LANDING_PAGE",
            themePreference: input.themePreference,
            contactRequestId: created.id,
          });
          void options.notificationRepository.create({
            siteId: request.tenant?.siteId ?? null,
            scope: "SUPER_ADMIN",
            type: "CONTACT_REQUEST_CREATED",
            title: notification.title,
            body: notification.body,
            link: notification.link,
            payload: {
              ...notification.payload,
              contactRequestId: created.id,
            },
          }).catch((error) => {
            request.log.error(
              { err: error, contactRequestId: created.id, siteId: request.tenant?.siteId },
              "notification create failed",
            );
          });
        }

        return reply.status(201).send({
          id: created.id,
          createdAt: created.createdAt.toISOString(),
        });
      },
    );
  }

  if (options.tenantRepository && options.publicPostRepository) {
    const tenantPreHandler = createTenantPreHandler(
      config,
      options.tenantRepository,
    );

    app.get(
      "/v1/public/posts",
      { preHandler: tenantPreHandler },
      async (request) => {
        const query = publicPostListQuerySchema.parse(request.query);
        const result = await options.publicPostRepository!.listPublished({
          ...query,
          siteId: request.tenant!.siteId,
        });

        return {
          ...result,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        };
      },
    );

    app.get<{ Params: { idOrSlug: string } }>(
      "/v1/public/posts/:idOrSlug",
      { preHandler: tenantPreHandler },
      async (request, reply) => {
        const post =
          await options.publicPostRepository!.findPublishedByIdOrSlug(
            request.tenant!.siteId,
            request.params.idOrSlug,
          );

        if (!post) {
          return reply.status(404).send({
            code: "POST_NOT_FOUND",
            message: "Tin đăng không tồn tại.",
            requestId: request.id,
          });
        }

        return post;
      },
    );
  }

  if (
    options.tenantRepository &&
    options.authService &&
    options.accessTokens
  ) {
    void registerAuthRoutes(app, {
      config,
      authService: options.authService,
      accessTokens: options.accessTokens,
      tenantRepository: options.tenantRepository,
    });
  }

  if (
    options.tenantRepository &&
    options.accessTokens &&
    options.adminDashboardRepository
  ) {
    void registerAdminDashboardRoutes(app, {
      config,
      tenantRepository: options.tenantRepository,
      accessTokens: options.accessTokens,
      repository: options.adminDashboardRepository,
    });
  }

  if (options.accessTokens && options.superAdminRepository) {
    void registerSuperAdminRoutes(app, {
      accessTokens: options.accessTokens,
      repository: options.superAdminRepository,
      notificationRepository: options.notificationRepository,
    });
  }

  if (
    options.tenantRepository &&
    options.accessTokens &&
    options.engagementRepository
  ) {
    void registerEngagementRoutes(app, {
      config,
      tenantRepository: options.tenantRepository,
      accessTokens: options.accessTokens,
      repository: options.engagementRepository,
      notifier: options.leadNotifier,
      notificationRepository: options.notificationRepository,
    });
  }

  if (
    options.tenantRepository &&
    options.accessTokens &&
    options.notificationRepository
  ) {
    void registerNotificationRoutes(app, {
      config,
      tenantRepository: options.tenantRepository,
      accessTokens: options.accessTokens,
      repository: options.notificationRepository,
    });
  }

  if (
    options.tenantRepository &&
    options.accessTokens &&
    options.adminPostRepository
  ) {
    void registerAdminPostRoutes(app, {
      config,
      tenantRepository: options.tenantRepository,
      accessTokens: options.accessTokens,
      repository: options.adminPostRepository,
    });
  }

  if (
    options.tenantRepository &&
    options.accessTokens &&
    options.adminCategoryRepository
  ) {
    void registerAdminCategoryRoutes(app, {
      config,
      tenantRepository: options.tenantRepository,
      accessTokens: options.accessTokens,
      repository: options.adminCategoryRepository,
    });
  }

  if (
    options.tenantRepository &&
    options.accessTokens &&
    options.postImageDependencies
  ) {
    void registerPostImageRoutes(app, {
      config,
      tenantRepository: options.tenantRepository,
      accessTokens: options.accessTokens,
      ...options.postImageDependencies,
    });
    void registerGenericImageRoutes(app, {
      config,
      tenantRepository: options.tenantRepository,
      accessTokens: options.accessTokens,
      storage: options.postImageDependencies.storage,
    });
  }

  if (
    options.tenantRepository &&
    options.accessTokens &&
    options.adminSiteRepository
  ) {
    void registerAdminSiteRoutes(app, {
      config,
      tenantRepository: options.tenantRepository,
      accessTokens: options.accessTokens,
      repository: options.adminSiteRepository,
      notificationRepository: options.notificationRepository,
    });
  }

  return app;
}
