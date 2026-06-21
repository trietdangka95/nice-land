import type { FastifyInstance } from "fastify";
import {
  imageCompleteInputSchema,
  imagePresignInputSchema,
  imageReorderInputSchema,
} from "@nice-land/contracts";
import type { AppConfig } from "../../config.js";
import type { AccessTokenService } from "../auth/token-service.js";
import {
  createRequireAuth,
  requireRole,
  requireTenantMatch,
} from "../auth/auth-guards.js";
import { createTenantPreHandler } from "../tenancy/tenant-context.js";
import type { TenantSiteRepository } from "../tenancy/tenant-resolver.js";
import type {
  PostImageRepository,
  PostImageStorage,
} from "./post-image-service.js";

interface PostImageRouteOptions {
  config: AppConfig;
  tenantRepository: TenantSiteRepository;
  accessTokens: AccessTokenService;
  repository: PostImageRepository;
  storage: PostImageStorage;
}

function safeExtension(fileName: string, mimeType: string) {
  const expected = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[mimeType];
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension === "jpeg" || extension === expected ? expected : expected;
}

export async function registerPostImageRoutes(
  app: FastifyInstance,
  options: PostImageRouteOptions,
) {
  const guards = [
    createTenantPreHandler(options.config, options.tenantRepository),
    createRequireAuth(options.accessTokens),
    requireRole("ADMIN"),
    requireTenantMatch,
  ];

  app.post<{ Params: { id: string } }>(
    "/v1/admin/posts/:id/images/presign",
    { preHandler: guards },
    async (request, reply) => {
      const input = imagePresignInputSchema.parse(request.body);
      const siteId = request.tenant!.siteId;
      const context = await options.repository.getUploadContext(
        siteId,
        request.params.id,
      );
      if (!context.postExists) {
        return reply.status(404).send({
          code: "POST_NOT_FOUND",
          message: "Tin đăng không tồn tại.",
          requestId: request.id,
        });
      }
      if (context.imageCount >= context.maxImages) {
        return reply.status(409).send({
          code: "IMAGE_LIMIT_REACHED",
          message: "Tin đăng đã đạt giới hạn số lượng ảnh.",
          requestId: request.id,
        });
      }

      const objectKey = `sites/${siteId}/posts/${request.params.id}/${crypto.randomUUID()}.${safeExtension(input.fileName, input.mimeType)}`;
      const signed = await options.storage.createUploadUrl({
        objectKey,
        mimeType: input.mimeType,
        size: input.size,
      });
      return {
        ...signed,
        objectKey,
        headers: { "Content-Type": input.mimeType },
      };
    },
  );

  app.post<{ Params: { id: string } }>(
    "/v1/admin/posts/:id/images/complete",
    { preHandler: guards },
    async (request, reply) => {
      const input = imageCompleteInputSchema.parse(request.body);
      const siteId = request.tenant!.siteId;
      const prefix = `sites/${siteId}/posts/${request.params.id}/`;
      if (!input.objectKey.startsWith(prefix)) {
        return reply.status(403).send({
          code: "INVALID_OBJECT_KEY",
          message: "Object key không thuộc tin đăng này.",
          requestId: request.id,
        });
      }
      await options.storage.assertUploaded(input);
      const image = await options.repository.addImage({
        ...input,
        siteId,
        postId: request.params.id,
        userId: request.auth!.sub,
      });
      return reply.status(201).send(image);
    },
  );

  app.patch<{ Params: { id: string } }>(
    "/v1/admin/posts/:id/images/reorder",
    { preHandler: guards },
    async (request, reply) => {
      const input = imageReorderInputSchema.parse(request.body);
      const reordered = await options.repository.reorderImages(
        request.tenant!.siteId,
        request.params.id,
        input.imageIds,
      );
      if (!reordered) {
        return reply.status(409).send({
          code: "IMAGE_SET_CONFLICT",
          message: "Danh sách ảnh đã thay đổi. Hãy tải lại trang.",
          requestId: request.id,
        });
      }
      return reply.status(204).send();
    },
  );

  app.delete<{ Params: { id: string; imageId: string } }>(
    "/v1/admin/posts/:id/images/:imageId",
    { preHandler: guards },
    async (request, reply) => {
      const removed = await options.repository.removeImage(
        request.tenant!.siteId,
        request.params.id,
        request.params.imageId,
      );
      if (!removed) {
        return reply.status(404).send({
          code: "IMAGE_NOT_FOUND",
          message: "Ảnh không tồn tại.",
          requestId: request.id,
        });
      }

      try {
        await options.storage.deleteObject(removed.objectKey);
      } catch (error) {
        request.log.error(
          {
            err: error,
            objectKey: removed.objectKey,
            siteId: request.tenant!.siteId,
            postId: request.params.id,
          },
          "S3 image cleanup failed",
        );
      }
      return reply.status(204).send();
    },
  );
}
