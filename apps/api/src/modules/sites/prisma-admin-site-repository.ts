import { Prisma, prisma } from "@nice-land/database";
import type {
  RenewalRequestInput,
  SiteSettingsInput,
} from "@nice-land/contracts";
import { writeAuditLog } from "../audit/audit-log-service.js";
import {
  type AdminSiteRepository,
  PendingRenewalRequestError,
} from "./admin-site-repository.js";

const settingsSelect = {
  id: true,
  name: true,
  slug: true,
  tagline: true,
  logo: true,
  banner: true,
  brokerAvatar: true,
  brokerName: true,
  brokerBio: true,
  themeKey: true,
  themeColor: true,
  phone: true,
  email: true,
  address: true,
  facebookUrl: true,
  zaloPhone: true,
  updatedAt: true,
} satisfies Prisma.SiteSelect;

function serializeSettings(
  site: Prisma.SiteGetPayload<{ select: typeof settingsSelect }>,
) {
  return {
    ...site,
    themeColor: site.themeColor ?? "#315c45",
    phone: site.phone ?? "",
    email: site.email ?? "",
    address: site.address ?? "",
    updatedAt: site.updatedAt.toISOString(),
  };
}

export class PrismaAdminSiteRepository implements AdminSiteRepository {
  async getSettings(siteId: string) {
    const site = await prisma.site.findFirst({
      where: { id: siteId, deletedAt: null },
      select: settingsSelect,
    });
    return site ? serializeSettings(site) : null;
  }

  async updateSettings(
    siteId: string,
    input: SiteSettingsInput,
    userId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.site.findFirst({
        where: { id: siteId, deletedAt: null },
        select: { id: true },
      });
      if (!existing) return null;

      const updated = await tx.site.update({
        where: { id: siteId },
        data: {
          name: input.name,
          tagline: input.tagline || null,
          logo: input.logo || null,
          banner: input.banner || null,
          brokerAvatar: input.brokerAvatar || null,
          brokerName: input.brokerName || null,
          brokerBio: input.brokerBio || null,
          themeColor: input.themeColor,
          phone: input.phone,
          email: input.email,
          address: input.address,
          facebookUrl: input.facebookUrl || null,
          zaloPhone: input.zaloPhone || null,
        },
        select: settingsSelect,
      });
      await writeAuditLog(tx, {
        siteId,
        userId,
        action: "SITE_SETTINGS_UPDATED",
        entityType: "Site",
        entityId: siteId,
        details: { fields: Object.keys(input) },
      });
      return serializeSettings(updated);
    });
  }

  async getSubscription(siteId: string) {
    const site = await prisma.site.findFirst({
      where: { id: siteId, deletedAt: null },
      select: {
        subscriptionStatus: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
            price: true,
            durationDays: true,
            maxPosts: true,
            maxImagesPerPost: true,
          },
        },
        renewalRequests: {
          orderBy: { requestedAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            note: true,
            requestedAt: true,
          },
        },
        _count: {
          select: {
            posts: { where: { deletedAt: null } },
          },
        },
      },
    });
    if (!site) return null;

    const images = await prisma.propertyImage.count({
      where: { post: { siteId, deletedAt: null } },
    });
    const latestRequest = site.renewalRequests[0];

    return {
      status: site.subscriptionStatus,
      startsAt: site.subscriptionStart?.toISOString() ?? null,
      endsAt: site.subscriptionEnd?.toISOString() ?? null,
      plan: site.plan
        ? { ...site.plan, price: site.plan.price.toNumber() }
        : null,
      usage: {
        posts: site._count.posts,
        images,
      },
      latestRenewalRequest: latestRequest
        ? {
            ...latestRequest,
            requestedAt: latestRequest.requestedAt.toISOString(),
          }
        : null,
    };
  }

  async createRenewalRequest(
    siteId: string,
    input: RenewalRequestInput,
    userId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const pending = await tx.renewalRequest.findFirst({
        where: {
          siteId,
          status: { in: ["NEW", "IN_PROGRESS"] },
        },
        select: { id: true },
      });
      if (pending) throw new PendingRenewalRequestError();

      const site = await tx.site.findFirstOrThrow({
        where: { id: siteId, deletedAt: null },
        select: { planId: true },
      });
      const planId = input.planId ?? site.planId;
      if (planId) {
        const plan = await tx.subscriptionPlan.findFirst({
          where: { id: planId, isActive: true },
          select: { id: true },
        });
        if (!plan) {
          const error = new Error("Gói dịch vụ không tồn tại.");
          Object.assign(error, { statusCode: 400 });
          throw error;
        }
      }

      let created;
      try {
        created = await tx.renewalRequest.create({
          data: {
            siteId,
            planId,
            requestedById: userId,
            note: input.note || null,
          },
          select: {
            id: true,
            status: true,
            note: true,
            requestedAt: true,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new PendingRenewalRequestError();
        }
        throw error;
      }
      await writeAuditLog(tx, {
        siteId,
        userId,
        action: "RENEWAL_REQUEST_CREATED",
        entityType: "RenewalRequest",
        entityId: created.id,
        details: { planId },
      });
      return {
        ...created,
        requestedAt: created.requestedAt.toISOString(),
      };
    });
  }

  async listAvailablePlans() {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    return plans.map((p) => ({ ...p, price: Number(p.price), siteCount: 0 }));
  }
}
