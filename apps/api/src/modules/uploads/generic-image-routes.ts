import type { FastifyInstance } from "fastify";
import { genericImagePresignInputSchema } from "@nice-land/contracts";
import type { AppConfig } from "../../config.js";
import type { AccessTokenService } from "../auth/token-service.js";
import {
  createRequireAuth,
  requireRole,
  requireTenantMatch,
} from "../auth/auth-guards.js";
import { createTenantPreHandler } from "../tenancy/tenant-context.js";
import type { TenantSiteRepository } from "../tenancy/tenant-resolver.js";
import type { PostImageStorage } from "./post-image-service.js";

interface GenericImageRouteOptions {
  config: AppConfig;
  tenantRepository: TenantSiteRepository;
  accessTokens: AccessTokenService;
  storage: PostImageStorage;
}

function safeExtension(fileName: string, mimeType: string) {
  const expected: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return expected[mimeType] ?? "webp";
}

export async function registerGenericImageRoutes(
  app: FastifyInstance,
  options: GenericImageRouteOptions,
) {
  const guards = [
    createTenantPreHandler(options.config, options.tenantRepository),
    createRequireAuth(options.accessTokens),
    requireRole("ADMIN"),
    requireTenantMatch,
  ];

  app.post(
    "/v1/admin/uploads/presign",
    { preHandler: guards },
    async (request, reply) => {
      const input = genericImagePresignInputSchema.parse(request.body);
      const siteId = request.tenant!.siteId;

      const objectKey = `sites/${siteId}/${input.folder}/${crypto.randomUUID()}.${safeExtension(input.fileName, input.mimeType)}`;
      const signed = await options.storage.createUploadUrl({
        objectKey,
        mimeType: input.mimeType,
        size: input.size,
      });
      const publicUrl = options.config.AWS_S3_PUBLIC_URL
        ? `${options.config.AWS_S3_PUBLIC_URL.replace(/\/$/, "")}/${objectKey}`
        : objectKey;

      return {
        ...signed,
        objectKey,
        publicUrl,
        headers: { "Content-Type": input.mimeType },
      };
    },
  );
}
