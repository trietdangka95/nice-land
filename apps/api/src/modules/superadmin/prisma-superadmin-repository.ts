import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { Prisma, prisma } from "@nice-land/database";
import type {
  RenewalResolutionInput,
  SubscriptionPlanInput,
  SuperAdminSiteCreate,
  SuperAdminSiteListQuery,
  SuperAdminSiteUpdate,
} from "@nice-land/contracts";
import {
  SuperAdminConflictError,
  type SuperAdminRepository,
} from "./superadmin-repository.js";

const siteSelect = {
  id: true,
  name: true,
  slug: true,
  phone: true,
  email: true,
  address: true,
  themeKey: true,
  isActive: true,
  subscriptionStatus: true,
  subscriptionStart: true,
  subscriptionEnd: true,
  createdAt: true,
  plan: { select: { id: true, name: true, code: true } },
  users: {
    where: { role: "ADMIN" as const, deletedAt: null },
    take: 1,
    select: {
      id: true,
      username: true,
      fullName: true,
      isActive: true,
      lastLoginAt: true,
    },
  },
  _count: {
    select: {
      posts: { where: { deletedAt: null } },
      users: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.SiteSelect;

type SelectedSite = Prisma.SiteGetPayload<{ select: typeof siteSelect }>;

async function mapSite(site: SelectedSite) {
  const images = await prisma.propertyImage.count({
    where: { post: { siteId: site.id, deletedAt: null } },
  });
  const admin = site.users[0];
  return {
    id: site.id,
    name: site.name,
    slug: site.slug,
    phone: site.phone,
    email: site.email,
    address: site.address,
    themeKey: site.themeKey,
    isActive: site.isActive,
    subscriptionStatus: site.subscriptionStatus,
    subscriptionStart: site.subscriptionStart?.toISOString() ?? null,
    subscriptionEnd: site.subscriptionEnd?.toISOString() ?? null,
    plan: site.plan,
    usage: { posts: site._count.posts, images, users: site._count.users },
    admin: admin
      ? {
          ...admin,
          lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
        }
      : null,
    createdAt: site.createdAt.toISOString(),
  };
}

const planSelect = {
  id: true,
  name: true,
  code: true,
  maxPosts: true,
  maxImagesPerPost: true,
  price: true,
  durationDays: true,
  isActive: true,
  _count: { select: { sites: true } },
} satisfies Prisma.SubscriptionPlanSelect;

function mapPlan(plan: Prisma.SubscriptionPlanGetPayload<{ select: typeof planSelect }>) {
  return {
    id: plan.id,
    name: plan.name,
    code: plan.code,
    maxPosts: plan.maxPosts,
    maxImagesPerPost: plan.maxImagesPerPost,
    price: plan.price.toNumber(),
    durationDays: plan.durationDays,
    isActive: plan.isActive,
    siteCount: plan._count.sites,
  };
}

const renewalSelect = {
  id: true,
  status: true,
  note: true,
  adminNote: true,
  requestedAt: true,
  resolvedAt: true,
  site: { select: { id: true, name: true, slug: true } },
  plan: { select: { id: true, name: true, durationDays: true, price: true } },
  requestedBy: { select: { username: true, fullName: true } },
} satisfies Prisma.RenewalRequestSelect;

function mapRenewal(item: Prisma.RenewalRequestGetPayload<{ select: typeof renewalSelect }>) {
  return {
    ...item,
    requestedAt: item.requestedAt.toISOString(),
    resolvedAt: item.resolvedAt?.toISOString() ?? null,
    plan: item.plan ? { ...item.plan, price: item.plan.price.toNumber() } : null,
  };
}

export class PrismaSuperAdminRepository implements SuperAdminRepository {
  async listSites(input: SuperAdminSiteListQuery) {
    const where: Prisma.SiteWhereInput = {
      deletedAt: null,
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { slug: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.active !== undefined ? { isActive: input.active } : {}),
      ...(input.subscriptionStatus
        ? { subscriptionStatus: input.subscriptionStatus }
        : {}),
    };
    const [sites, total] = await prisma.$transaction([
      prisma.site.findMany({
        where,
        select: siteSelect,
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.site.count({ where }),
    ]);
    return { items: await Promise.all(sites.map(mapSite)), total };
  }

  async findSite(id: string) {
    const site = await prisma.site.findFirst({
      where: { id, deletedAt: null },
      select: siteSelect,
    });
    return site ? mapSite(site) : null;
  }

  async createSite(input: SuperAdminSiteCreate, actorId: string) {
    try {
      const created = await prisma.$transaction(async (tx) => {
        const site = await tx.site.create({
          data: {
            name: input.name,
            slug: input.slug,
            phone: input.phone,
            email: input.email,
            address: input.address || null,
            themeKey: input.themeKey,
            planId: input.planId,
            subscriptionStatus: "ACTIVE",
            subscriptionStart: new Date(),
            subscriptionEnd: input.subscriptionEnd,
          },
          select: { id: true },
        });
        await tx.siteDomain.create({
          data: {
            siteId: site.id,
            hostname: `${input.slug}.nice-land.vn`,
            isPrimary: true,
            isPlatform: true,
            status: "VERIFIED",
            verifiedAt: new Date(),
          },
        });
        await tx.user.create({
          data: {
            siteId: site.id,
            username: input.adminUsername,
            email: input.email,
            fullName: input.adminName,
            phone: input.phone,
            passwordHash: await hash(input.adminPassword, 12),
            role: "ADMIN",
          },
        });
        await tx.subscriptionHistory.create({
          data: {
            siteId: site.id,
            planId: input.planId,
            status: "ACTIVE",
            startsAt: new Date(),
            endsAt: input.subscriptionEnd,
            note: "Khởi tạo website",
          },
        });
        await tx.auditLog.create({
          data: {
            siteId: site.id,
            userId: actorId,
            action: "SITE_CREATED",
            entityType: "Site",
            entityId: site.id,
            details: {
              slug: input.slug,
              planId: input.planId,
              themeKey: input.themeKey,
            },
          },
        });
        return site;
      });
      return (await this.findSite(created.id))!;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new SuperAdminConflictError("Subdomain, email hoặc tên đăng nhập đã tồn tại.");
      }
      throw error;
    }
  }

  async updateSite(id: string, input: SuperAdminSiteUpdate, actorId: string) {
    const exists = await prisma.site.findFirst({ where: { id, deletedAt: null }, select: { id: true, slug: true } });
    if (!exists) return null;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.site.update({
        where: { id },
        data: {
          name: input.name,
          slug: input.slug,
          phone: input.phone,
          email: input.email,
          address: input.address || null,
          themeKey: input.themeKey,
          planId: input.planId,
          subscriptionStatus: input.subscriptionStatus,
          subscriptionEnd: input.subscriptionEnd,
        },
        });
        if (exists.slug !== input.slug) {
          await tx.siteDomain.updateMany({
            where: { siteId: id, isPlatform: true },
            data: { hostname: `${input.slug}.nice-land.vn` },
          });
        }
        await tx.auditLog.create({
        data: {
          siteId: id,
          userId: actorId,
          action: "SITE_UPDATED",
          entityType: "Site",
          entityId: id,
          details: {
            planId: input.planId,
            status: input.subscriptionStatus,
            themeKey: input.themeKey,
          },
        },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new SuperAdminConflictError("Subdomain hoặc email đã tồn tại.");
      }
      throw error;
    }
    return this.findSite(id);
  }

  async setSiteActive(id: string, isActive: boolean, actorId: string) {
    const result = await prisma.site.updateMany({ where: { id, deletedAt: null }, data: { isActive } });
    if (!result.count) return false;
    await prisma.auditLog.create({
      data: { siteId: id, userId: actorId, action: isActive ? "SITE_ACTIVATED" : "SITE_DEACTIVATED", entityType: "Site", entityId: id },
    });
    return true;
  }

  async resetAdminPassword(id: string, actorId: string) {
    const admin = await prisma.user.findFirst({ where: { siteId: id, role: "ADMIN", deletedAt: null }, select: { id: true } });
    if (!admin) return null;
    const temporaryPassword = `Nl!${randomBytes(8).toString("base64url")}`;
    await prisma.$transaction([
      prisma.user.update({ where: { id: admin.id }, data: { passwordHash: await hash(temporaryPassword, 12), isActive: true } }),
      prisma.refreshSession.updateMany({ where: { userId: admin.id, revokedAt: null }, data: { revokedAt: new Date() } }),
      prisma.auditLog.create({ data: { siteId: id, userId: actorId, action: "ADMIN_PASSWORD_RESET", entityType: "User", entityId: admin.id } }),
    ]);
    return temporaryPassword;
  }

  async setAdminActive(id: string, isActive: boolean, actorId: string) {
    const admin = await prisma.user.findFirst({ where: { siteId: id, role: "ADMIN", deletedAt: null }, select: { id: true } });
    if (!admin) return false;
    await prisma.$transaction([
      prisma.user.update({ where: { id: admin.id }, data: { isActive } }),
      ...(!isActive ? [prisma.refreshSession.updateMany({ where: { userId: admin.id, revokedAt: null }, data: { revokedAt: new Date() } })] : []),
      prisma.auditLog.create({ data: { siteId: id, userId: actorId, action: isActive ? "ADMIN_ACTIVATED" : "ADMIN_DISABLED", entityType: "User", entityId: admin.id } }),
    ]);
    return true;
  }

  async listPlans() {
    return (await prisma.subscriptionPlan.findMany({ select: planSelect, orderBy: { price: "asc" } })).map(mapPlan);
  }

  async createPlan(input: SubscriptionPlanInput, actorId: string) {
    let plan;
    try {
      plan = await prisma.subscriptionPlan.create({ data: input, select: planSelect });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new SuperAdminConflictError("Tên hoặc mã gói đã tồn tại.");
      }
      throw error;
    }
    await prisma.auditLog.create({ data: { userId: actorId, action: "PLAN_CREATED", entityType: "SubscriptionPlan", entityId: plan.id } });
    return mapPlan(plan);
  }

  async updatePlan(id: string, input: SubscriptionPlanInput, actorId: string) {
    const exists = await prisma.subscriptionPlan.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return null;
    let plan;
    try {
      plan = await prisma.subscriptionPlan.update({ where: { id }, data: input, select: planSelect });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new SuperAdminConflictError("Tên hoặc mã gói đã tồn tại.");
      }
      throw error;
    }
    await prisma.auditLog.create({ data: { userId: actorId, action: "PLAN_UPDATED", entityType: "SubscriptionPlan", entityId: id } });
    return mapPlan(plan);
  }

  async deletePlan(id: string, actorId: string) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id }, select: { _count: { select: { sites: true } } } });
    if (!plan) return false;
    if (plan._count.sites > 0) throw new SuperAdminConflictError("Không thể xóa gói đang được website sử dụng.");
    await prisma.$transaction([
      prisma.subscriptionPlan.delete({ where: { id } }),
      prisma.auditLog.create({ data: { userId: actorId, action: "PLAN_DELETED", entityType: "SubscriptionPlan", entityId: id } }),
    ]);
    return true;
  }

  async listRenewals() {
    return (await prisma.renewalRequest.findMany({ select: renewalSelect, orderBy: { requestedAt: "desc" }, take: 100 })).map(mapRenewal);
  }

  async resolveRenewal(id: string, input: RenewalResolutionInput, actorId: string) {
    const request = await prisma.renewalRequest.findUnique({ where: { id }, select: { id: true, siteId: true, planId: true, plan: { select: { durationDays: true, price: true } } } });
    if (!request) return null;
    await prisma.$transaction(async (tx) => {
      const now = new Date();
      await tx.renewalRequest.update({
        where: { id },
        data: {
          status: input.status,
          adminNote: input.adminNote || null,
          resolvedAt: ["APPROVED", "REJECTED", "DONE"].includes(input.status) ? now : null,
        },
      });
      if (input.status === "APPROVED" && request.planId && request.plan) {
        const current = await tx.site.findUniqueOrThrow({ where: { id: request.siteId }, select: { subscriptionEnd: true } });
        const startsAt = current.subscriptionEnd && current.subscriptionEnd > now ? current.subscriptionEnd : now;
        const endsAt = new Date(startsAt.getTime() + request.plan.durationDays * 86_400_000);
        await tx.site.update({ where: { id: request.siteId }, data: { planId: request.planId, subscriptionStatus: "ACTIVE", subscriptionStart: startsAt, subscriptionEnd: endsAt, isActive: true } });
        await tx.subscriptionHistory.create({ data: { siteId: request.siteId, planId: request.planId, status: "ACTIVE", startsAt, endsAt, amount: request.plan.price, note: input.adminNote || "Gia hạn được duyệt" } });
      }
      await tx.auditLog.create({ data: { siteId: request.siteId, userId: actorId, action: `RENEWAL_${input.status}`, entityType: "RenewalRequest", entityId: id, details: { adminNote: input.adminNote } } });
    });
    const updated = await prisma.renewalRequest.findUnique({ where: { id }, select: renewalSelect });
    return updated ? mapRenewal(updated) : null;
  }

  async listContacts() {
    const items = await prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }));
  }

  async updateContactStatus(id: string, status: "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED", actorId: string) {
    const result = await prisma.contactRequest.updateMany({ where: { id }, data: { status } });
    if (!result.count) return false;
    await prisma.auditLog.create({ data: { userId: actorId, action: "CONTACT_STATUS_UPDATED", entityType: "ContactRequest", entityId: id, details: { status } } });
    return true;
  }

  async listAuditLogs() {
    const items = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true, action: true, entityType: true, entityId: true, details: true, createdAt: true,
        site: { select: { id: true, name: true } },
        user: { select: { id: true, username: true } },
      },
    });
    return items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }));
  }
}
