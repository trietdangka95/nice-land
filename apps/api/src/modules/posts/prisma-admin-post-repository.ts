import { Prisma, prisma } from "@nice-land/database";
import type {
  AdminPostInput,
  AdminPostListQuery,
  AdminPostUpdate,
} from "@nice-land/contracts";
import { writeAuditLog } from "../audit/audit-log-service.js";
import {
  type AdminPostMutationContext,
  type AdminPostRecord,
  type AdminPostRepository,
  InvalidPostCategoryError,
  PostLimitError,
} from "./admin-post-repository.js";

const adminPostSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  type: true,
  price: true,
  area: true,
  address: true,
  province: true,
  district: true,
  ward: true,
  legalStatus: true,
  bedrooms: true,
  bathrooms: true,
  categoryId: true,
  status: true,
  version: true,
  viewCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      url: true,
      altText: true,
      sortOrder: true,
    },
  },
} satisfies Prisma.PropertyPostSelect;

type SelectedPost = Prisma.PropertyPostGetPayload<{
  select: typeof adminPostSelect;
}>;

function toRecord(post: SelectedPost): AdminPostRecord {
  return {
    ...post,
    price: post.price?.toNumber() ?? null,
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function postData(input: Partial<AdminPostInput>) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.price !== undefined ? { price: input.price } : {}),
    ...(input.area !== undefined ? { area: input.area } : {}),
    ...(input.address !== undefined ? { address: input.address } : {}),
    ...(input.province !== undefined ? { province: input.province } : {}),
    ...(input.district !== undefined ? { district: input.district } : {}),
    ...(input.ward !== undefined ? { ward: input.ward } : {}),
    ...(input.legalStatus !== undefined
      ? { legalStatus: input.legalStatus }
      : {}),
    ...(input.bedrooms !== undefined ? { bedrooms: input.bedrooms } : {}),
    ...(input.bathrooms !== undefined ? { bathrooms: input.bathrooms } : {}),
    ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
    ...(input.status !== undefined
      ? {
          status: input.status,
          publishedAt:
            input.status === "PUBLISHED" ? new Date() : undefined,
        }
      : {}),
  };
}

export class PrismaAdminPostRepository implements AdminPostRepository {
  async list(input: AdminPostListQuery & { siteId: string }) {
    const where: Prisma.PropertyPostWhereInput = {
      siteId: input.siteId,
      deletedAt: null,
      ...(input.q
        ? { title: { contains: input.q, mode: "insensitive" } }
        : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.type ? { type: input.type } : {}),
      ...(input.province ? { province: input.province } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.propertyPost.findMany({
        where,
        select: adminPostSelect,
        orderBy: { updatedAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.propertyPost.count({ where }),
    ]);

    return { items: items.map(toRecord), total };
  }

  async findById(siteId: string, id: string) {
    const post = await prisma.propertyPost.findFirst({
      where: { id, siteId, deletedAt: null },
      select: adminPostSelect,
    });
    return post ? toRecord(post) : null;
  }

  async create(input: AdminPostInput, context: AdminPostMutationContext) {
    return prisma.$transaction(async (tx) => {
      const site = await tx.site.findUnique({
        where: { id: context.siteId },
        select: { plan: { select: { maxPosts: true } } },
      });
      const count = await tx.propertyPost.count({
        where: { siteId: context.siteId, deletedAt: null },
      });
      if (site?.plan && count >= site.plan.maxPosts) {
        throw new PostLimitError();
      }
      if (input.categoryId) {
        const category = await tx.propertyCategory.findFirst({
          where: {
            id: input.categoryId,
            siteId: context.siteId,
            deletedAt: null,
          },
          select: { id: true },
        });
        if (!category) throw new InvalidPostCategoryError();
      }

      const baseSlug = slugify(input.title) || "tin-dang";
      const duplicateCount = await tx.propertyPost.count({
        where: {
          siteId: context.siteId,
          slug: { startsWith: baseSlug },
        },
      });
      const slug = duplicateCount === 0 ? baseSlug : `${baseSlug}-${duplicateCount + 1}`;

      const created = await tx.propertyPost.create({
        data: {
          siteId: context.siteId,
          slug,
          title: input.title,
          description: input.description,
          type: input.type,
          price: input.price,
          area: input.area,
          address: input.address,
          province: input.province,
          district: input.district,
          ward: input.ward,
          legalStatus: input.legalStatus,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          categoryId: input.categoryId,
          status: input.status,
          publishedAt: input.status === "PUBLISHED" ? new Date() : null,
          createdById: context.userId,
          updatedById: context.userId,
        },
        select: adminPostSelect,
      });
      await writeAuditLog(tx, {
        siteId: context.siteId,
        userId: context.userId,
        action: "POST_CREATED",
        entityType: "PropertyPost",
        entityId: created.id,
        details: { status: created.status, title: created.title },
      });
      return toRecord(created);
    });
  }

  async update(
    siteId: string,
    id: string,
    input: AdminPostUpdate,
    context: AdminPostMutationContext,
  ) {
    const { version, ...changes } = input;
    return prisma.$transaction(async (tx) => {
      const existing = await tx.propertyPost.findFirst({
        where: { id, siteId, version, deletedAt: null },
        select: { id: true, title: true, status: true },
      });
      if (!existing) return null;
      if (changes.categoryId) {
        const category = await tx.propertyCategory.findFirst({
          where: {
            id: changes.categoryId,
            siteId,
            deletedAt: null,
          },
          select: { id: true },
        });
        if (!category) throw new InvalidPostCategoryError();
      }

      const result = await tx.propertyPost.updateMany({
        where: { id, siteId, version, deletedAt: null },
        data: {
          ...postData(changes),
          version: { increment: 1 },
          updatedById: context.userId,
        },
      });
      if (result.count !== 1) return null;

      const updated = await tx.propertyPost.findFirstOrThrow({
        where: { id, siteId },
        select: adminPostSelect,
      });
      await writeAuditLog(tx, {
        siteId,
        userId: context.userId,
        action: "POST_UPDATED",
        entityType: "PropertyPost",
        entityId: id,
        details: {
          previousStatus: existing.status,
          status: updated.status,
          fields: Object.keys(changes),
        },
      });
      return toRecord(updated);
    });
  }

  async archive(
    siteId: string,
    id: string,
    version: number,
    context: AdminPostMutationContext,
  ) {
    return prisma.$transaction(async (tx) => {
      const images = await tx.propertyImage.findMany({
        where: {
          postId: id,
          post: { siteId, version, deletedAt: null },
        },
        select: { id: true, storageKey: true },
      });
      const result = await tx.propertyPost.updateMany({
        where: { id, siteId, version, deletedAt: null },
        data: {
          status: "ARCHIVED",
          deletedAt: new Date(),
          version: { increment: 1 },
          updatedById: context.userId,
        },
      });
      if (result.count !== 1) return false;
      await tx.propertyImage.deleteMany({
        where: { id: { in: images.map((image) => image.id) } },
      });
      await writeAuditLog(tx, {
        siteId,
        userId: context.userId,
        action: "POST_ARCHIVED",
        entityType: "PropertyPost",
        entityId: id,
        details: {
          removedImageCount: images.length,
          storageCleanup: "ORPHAN_IMAGE_JOB",
        },
      });
      return true;
    });
  }
}
