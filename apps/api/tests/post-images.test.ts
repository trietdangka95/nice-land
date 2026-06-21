import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { AccessTokenService } from "../src/modules/auth/token-service.js";
import type { TenantSiteRepository } from "../src/modules/tenancy/tenant-resolver.js";
import type {
  PostImageRepository,
  PostImageStorage,
} from "../src/modules/uploads/post-image-service.js";
import type { AppConfig } from "../src/config.js";

const config: AppConfig = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: 4000,
  ROOT_DOMAIN: "nice-land.vn",
  CORS_ORIGINS: "http://localhost:3002",
  LOG_LEVEL: "silent",
  JWT_ACCESS_SECRET: "test-secret-with-at-least-thirty-two-characters",
  ACCESS_TOKEN_TTL_SECONDS: 900,
  REFRESH_TOKEN_TTL_DAYS: 30,
  REFRESH_COOKIE_NAME: "nice_land_refresh",
  APP_URL: "http://localhost:3002",
  PASSWORD_RESET_TTL_MINUTES: 30,
  AWS_REGION: "ap-southeast-1",
  AWS_S3_BUCKET: "nice-land-media",
  AWS_S3_PUBLIC_URL: "https://cdn.example.com",
};

const tenantRepository: TenantSiteRepository = {
  findBySlug: async () => ({
    id: "site-a",
    slug: "minhphat",
    isActive: true,
    subscriptionStatus: "ACTIVE",
    subscriptionEnd: null,
  }),
  findByHostname: async () => null,
};

const accessTokens = {
  verify: async () => ({
    sub: "user-a",
    username: "admin",
    role: "ADMIN" as const,
    siteId: "site-a",
  }),
} as unknown as AccessTokenService;

function dependencies() {
  const firstImageId = "11111111-1111-4111-8111-111111111111";
  const secondImageId = "22222222-2222-4222-8222-222222222222";
  const repository: PostImageRepository = {
    getUploadContext: async () => ({
      postExists: true,
      imageCount: 0,
      maxImages: 10,
    }),
    addImage: async (input) => ({
      id: firstImageId,
      url: `https://cdn.example.com/${input.objectKey}`,
      sortOrder: 0,
    }),
    reorderImages: async (_siteId, _postId, imageIds) =>
      imageIds.length === 2,
    removeImage: async (_siteId, _postId, imageId) =>
      imageId === firstImageId
        ? { objectKey: "sites/site-a/posts/post-a/image-a.jpg" }
        : null,
  };
  const storage: PostImageStorage = {
    createUploadUrl: async (input) => ({
      uploadUrl: `https://s3.example.com/${input.objectKey}`,
      expiresIn: 600,
    }),
    assertUploaded: async () => undefined,
    deleteObject: async () => undefined,
  };
  return { repository, storage, firstImageId, secondImageId };
}

function createApp(custom = dependencies()) {
  return buildApp(config, {
    tenantRepository,
    accessTokens,
    postImageDependencies: custom,
  });
}

describe("post image upload routes", () => {
  it("creates a tenant-scoped presigned upload", async () => {
    const response = await createApp().inject({
      method: "POST",
      url: "/v1/admin/posts/post-a/images/presign",
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
      payload: {
        fileName: "mat-tien.jpg",
        mimeType: "image/jpeg",
        size: 200_000,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().objectKey).toMatch(
      /^sites\/site-a\/posts\/post-a\//,
    );
  });

  it("rejects unsupported image types", async () => {
    const response = await createApp().inject({
      method: "POST",
      url: "/v1/admin/posts/post-a/images/presign",
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
      payload: {
        fileName: "payload.svg",
        mimeType: "image/svg+xml",
        size: 100,
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it("rejects completion for an object key outside the tenant post prefix", async () => {
    const response = await createApp().inject({
      method: "POST",
      url: "/v1/admin/posts/post-a/images/complete",
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
      payload: {
        objectKey: "sites/site-b/posts/post-b/stolen.jpg",
        fileName: "stolen.jpg",
        mimeType: "image/jpeg",
        size: 100,
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it("records the authenticated admin when completing an upload", async () => {
    const current = dependencies();
    let completedBy: string | undefined;
    const originalAddImage = current.repository.addImage;
    current.repository.addImage = async (input) => {
      completedBy = input.userId;
      return originalAddImage(input);
    };

    const response = await createApp(current).inject({
      method: "POST",
      url: "/v1/admin/posts/post-a/images/complete",
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
      payload: {
        objectKey: "sites/site-a/posts/post-a/front.jpg",
        fileName: "front.jpg",
        mimeType: "image/jpeg",
        size: 200_000,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(completedBy).toBe("user-a");
  });

  it("reorders all images and makes the first image the cover", async () => {
    const { repository, storage, firstImageId, secondImageId } = dependencies();
    const response = await createApp({
      repository,
      storage,
      firstImageId,
      secondImageId,
    }).inject({
      method: "PATCH",
      url: "/v1/admin/posts/post-a/images/reorder",
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
      payload: {
        imageIds: [secondImageId, firstImageId],
      },
    });

    expect(response.statusCode).toBe(204);
  });

  it("returns conflict when reorder does not contain the full image set", async () => {
    const current = dependencies();
    current.repository.reorderImages = async () => false;
    const response = await createApp(current).inject({
      method: "PATCH",
      url: "/v1/admin/posts/post-a/images/reorder",
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
      payload: {
        imageIds: [current.firstImageId],
      },
    });

    expect(response.statusCode).toBe(409);
  });

  it("deletes only an image owned by the tenant post", async () => {
    const current = dependencies();
    const response = await createApp(current).inject({
      method: "DELETE",
      url: `/v1/admin/posts/post-a/images/${current.firstImageId}`,
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(204);
  });

  it("does not expose whether another tenant image exists", async () => {
    const current = dependencies();
    const response = await createApp(current).inject({
      method: "DELETE",
      url: `/v1/admin/posts/post-a/images/${current.secondImageId}`,
      headers: {
        authorization: "Bearer token",
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(404);
  });
});
