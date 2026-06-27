import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@nice-land/database";
import type { ImageCompleteInput } from "@nice-land/contracts";
import { writeAuditLog } from "../audit/audit-log-service.js";

export interface PostImageStorage {
  createUploadUrl(input: {
    objectKey: string;
    mimeType: string;
    size: number;
  }): Promise<{ uploadUrl: string; expiresIn: number }>;
  assertUploaded(input: {
    objectKey: string;
    mimeType: string;
    size: number;
  }): Promise<void>;
  deleteObject(objectKey: string): Promise<void>;
}

export interface PostImageRepository {
  getUploadContext(
    siteId: string,
    postId: string,
  ): Promise<{ postExists: boolean; imageCount: number; maxImages: number }>;
  addImage(
    input: ImageCompleteInput & {
      siteId: string;
      postId: string;
      userId: string;
    },
  ): Promise<{ id: string; url: string; sortOrder: number }>;
  reorderImages(
    siteId: string,
    postId: string,
    imageIds: string[],
  ): Promise<boolean>;
  removeImage(
    siteId: string,
    postId: string,
    imageId: string,
  ): Promise<{ objectKey: string } | null>;
}

export class PrismaPostImageRepository implements PostImageRepository {
  constructor(private readonly publicUrl: string) {}

  async getUploadContext(siteId: string, postId: string) {
    const post = await prisma.propertyPost.findFirst({
      where: { id: postId, siteId, deletedAt: null },
      select: {
        _count: { select: { images: true } },
        site: {
          select: {
            plan: { select: { maxImagesPerPost: true } },
          },
        },
      },
    });
    return {
      postExists: Boolean(post),
      imageCount: post?._count.images ?? 0,
      maxImages: post?.site.plan?.maxImagesPerPost ?? 10,
    };
  }

  async addImage(
    input: ImageCompleteInput & {
      siteId: string;
      postId: string;
      userId: string;
    },
  ) {
    const context = await this.getUploadContext(input.siteId, input.postId);
    if (!context.postExists || context.imageCount >= context.maxImages) {
      throw new Error("Không thể thêm ảnh cho tin đăng này.");
    }
    return prisma.$transaction(async (tx) => {
      const image = await tx.propertyImage.create({
        data: {
          postId: input.postId,
          storageKey: input.objectKey,
          url: `${this.publicUrl.replace(/\/$/, "")}/${input.objectKey}`,
          mimeType: input.mimeType,
          size: input.size,
          altText: input.altText,
          sortOrder: context.imageCount,
        },
        select: { id: true, url: true, sortOrder: true },
      });
      await writeAuditLog(tx, {
        siteId: input.siteId,
        userId: input.userId,
        action: "IMAGE_UPLOADED",
        entityType: "PropertyImage",
        entityId: image.id,
        details: {
          postId: input.postId,
          mimeType: input.mimeType,
          size: input.size,
        },
      });
      return image;
    });
  }

  async reorderImages(siteId: string, postId: string, imageIds: string[]) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.propertyImage.findMany({
        where: {
          postId,
          post: { siteId, deletedAt: null },
        },
        select: { id: true },
      });
      const currentIds = new Set(current.map((image) => image.id));
      if (
        currentIds.size !== imageIds.length ||
        imageIds.some((id) => !currentIds.has(id))
      ) {
        return false;
      }

      await Promise.all(
        imageIds.map((id, sortOrder) =>
          tx.propertyImage.update({
            where: { id },
            data: { sortOrder },
          }),
        ),
      );
      return true;
    });
  }

  async removeImage(siteId: string, postId: string, imageId: string) {
    return prisma.$transaction(async (tx) => {
      const image = await tx.propertyImage.findFirst({
        where: {
          id: imageId,
          postId,
          post: { siteId, deletedAt: null },
        },
        select: { id: true, storageKey: true },
      });
      if (!image) return null;

      await tx.propertyImage.delete({ where: { id: image.id } });
      const remaining = await tx.propertyImage.findMany({
        where: { postId },
        orderBy: { sortOrder: "asc" },
        select: { id: true },
      });
      await Promise.all(
        remaining.map((item, sortOrder) =>
          tx.propertyImage.update({
            where: { id: item.id },
            data: { sortOrder },
          }),
        ),
      );
      return { objectKey: image.storageKey };
    });
  }
}

export class S3PostImageStorage implements PostImageStorage {
  private readonly client: S3Client;

  constructor(
    region: string,
    private readonly bucket: string,
  ) {
    this.client = new S3Client({
      region,
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
  }

  async createUploadUrl(input: {
    objectKey: string;
    mimeType: string;
    size: number;
  }) {
    const expiresIn = 600;
    const uploadUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.objectKey,
        ContentType: input.mimeType,
      }),
      { expiresIn },
    );
    return { uploadUrl, expiresIn };
  }

  async assertUploaded(input: {
    objectKey: string;
    mimeType: string;
    size: number;
  }) {
    const result = await this.client.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: input.objectKey,
      }),
    );
    if (
      result.ContentLength !== input.size ||
      result.ContentType !== input.mimeType
    ) {
      throw new Error("Thông tin file trên S3 không khớp.");
    }
  }

  async deleteObject(objectKey: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
  }
}
