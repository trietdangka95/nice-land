import { prisma } from "@nice-land/database";
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
        themeKey: true,
        themeColor: true,
        phone: true,
        email: true,
        address: true,
        facebookUrl: true,
        zaloPhone: true,
      },
    });
    return site ? { ...site, themeKey: "WARM_MINIMAL" as const } : null;
  }

  async getPlatformStats() {
    const [totalSites, totalPosts] = await Promise.all([
      prisma.site.count({ where: { isActive: true, deletedAt: null } }),
      prisma.propertyPost.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    ]);
    return {
      totalSites: Math.max(totalSites, 200),
      totalPosts: Math.max(totalPosts, 48000),
    };
  }
}
