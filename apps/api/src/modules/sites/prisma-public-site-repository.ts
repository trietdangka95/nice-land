import { prisma } from "@datcuatoi/database";
import type { PublicSiteRepository } from "./public-site-repository.js";

export class PrismaPublicSiteRepository implements PublicSiteRepository {
  async findPublicConfig(siteId: string) {
    return prisma.site.findFirst({
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
        themeColor: true,
        phone: true,
        email: true,
        address: true,
        facebookUrl: true,
        zaloPhone: true,
      },
    });
  }
}
