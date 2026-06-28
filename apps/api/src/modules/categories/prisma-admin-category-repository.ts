import { Prisma, prisma } from "@nice-land/database";
import type { PropertyCategoryInput } from "@nice-land/contracts";
import { writeAuditLog } from "../audit/audit-log-service.js";
import {
  CategoryInUseError,
  CategorySlugConflictError,
  type AdminCategoryRepository,
} from "./admin-category-repository.js";

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      posts: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.PropertyCategorySelect;

function serialize(
  category: Prisma.PropertyCategoryGetPayload<{
    select: typeof categorySelect;
  }>,
) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    type: category.type,
    postCount: category._count.posts,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function translateConflict(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new CategorySlugConflictError();
  }
  throw error;
}

export class PrismaAdminCategoryRepository
  implements AdminCategoryRepository
{
  async list(siteId: string) {
    const categories = await prisma.propertyCategory.findMany({
      where: { siteId, deletedAt: null },
      select: categorySelect,
      orderBy: [{ name: "asc" }],
    });
    return categories.map(serialize);
  }

  async create(
    siteId: string,
    input: PropertyCategoryInput,
    userId?: string,
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.propertyCategory.findUnique({
          where: { siteId_slug: { siteId, slug: input.slug } },
          select: { id: true, deletedAt: true },
        });
        if (existing && !existing.deletedAt) {
          throw new CategorySlugConflictError();
        }
        const category = existing
          ? await tx.propertyCategory.update({
              where: { id: existing.id },
              data: { name: input.name, type: input.type, deletedAt: null },
              select: categorySelect,
            })
          : await tx.propertyCategory.create({
              data: { siteId, name: input.name, slug: input.slug, type: input.type },
              select: categorySelect,
            });
        await writeAuditLog(tx, {
          siteId,
          userId,
          action: "CATEGORY_CREATED",
          entityType: "PropertyCategory",
          entityId: category.id,
          details: { name: input.name, slug: input.slug },
        });
        return serialize(category);
      });
    } catch (error) {
      return translateConflict(error);
    }
  }

  async update(
    siteId: string,
    id: string,
    input: PropertyCategoryInput,
    userId?: string,
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.propertyCategory.findFirst({
          where: { id, siteId, deletedAt: null },
          select: { id: true },
        });
        if (!existing) return null;

        const category = await tx.propertyCategory.update({
          where: { id },
          data: { name: input.name, slug: input.slug, type: input.type },
          select: categorySelect,
        });
        await writeAuditLog(tx, {
          siteId,
          userId,
          action: "CATEGORY_UPDATED",
          entityType: "PropertyCategory",
          entityId: id,
          details: { name: input.name, slug: input.slug },
        });
        return serialize(category);
      });
    } catch (error) {
      return translateConflict(error);
    }
  }

  async remove(siteId: string, id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const category = await tx.propertyCategory.findFirst({
        where: { id, siteId, deletedAt: null },
        select: {
          id: true,
          _count: { select: { posts: { where: { deletedAt: null } } } },
        },
      });
      if (!category) return false;
      if (category._count.posts > 0) throw new CategoryInUseError();

      await tx.propertyCategory.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      await writeAuditLog(tx, {
        siteId,
        userId,
        action: "CATEGORY_DELETED",
        entityType: "PropertyCategory",
        entityId: id,
      });
      return true;
    });
  }
}
