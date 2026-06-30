import { prisma } from "@nice-land/database";
import { ensureTrialPlan, type PublicPlan } from "./public-plan-utils.js";
import type { PublicSiteRepository } from "./public-site-repository.js";

export class PrismaPublicSiteRepository implements PublicSiteRepository {
  async findPublicConfig(siteId: string) {
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        deletedAt: null,
        isActive: true,
      },
      select: {
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
      },
    });
    return site;
  }

  async getPlatformStats() {
    const [totalSites, totalPosts, activeThemes] = await Promise.all([
      prisma.site.count({ where: { isActive: true, deletedAt: null } }),
      prisma.propertyPost.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.site.findMany({
        where: { isActive: true, deletedAt: null },
        distinct: ["themeKey"],
        select: { themeKey: true },
      }),
    ]);

    return {
      totalSites,
      totalPosts,
      totalThemes: activeThemes.length,
    };
  }

  async listPublicPlans() {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { OR: [{ isActive: true }, { code: "TRIAL" }] },
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        maxPosts: true,
        maxImagesPerPost: true,
        price: true,
        durationDays: true,
        isActive: true,
        _count: { select: { sites: true } },
      },
    });

    return ensureTrialPlan(plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      code: plan.code,
      maxPosts: plan.maxPosts,
      maxImagesPerPost: plan.maxImagesPerPost,
      price: plan.price.toNumber(),
      durationDays: plan.durationDays,
      isActive: plan.isActive,
      siteCount: plan._count.sites,
    })) as PublicPlan[]);
  }
}
