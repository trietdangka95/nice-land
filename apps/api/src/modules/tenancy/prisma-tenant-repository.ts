import { prisma, type SubscriptionStatus } from "@datcuatoi/database";
import type {
  TenantSiteRecord,
  TenantSiteRepository,
  TenantSubscriptionStatus,
} from "./tenant-resolver.js";

function toTenantRecord(site: {
  id: string;
  slug: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEnd: Date | null;
  domains: Array<{ hostname: string }>;
}): TenantSiteRecord {
  return {
    id: site.id,
    slug: site.slug,
    hostname: site.domains[0]?.hostname,
    isActive: site.isActive,
    subscriptionStatus: site.subscriptionStatus as TenantSubscriptionStatus,
    subscriptionEnd: site.subscriptionEnd,
  };
}

export class PrismaTenantSiteRepository implements TenantSiteRepository {
  async findBySlug(slug: string) {
    const site = await prisma.site.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        isActive: true,
        subscriptionStatus: true,
        subscriptionEnd: true,
        domains: {
          where: {
            isPrimary: true,
            status: "VERIFIED",
          },
          select: { hostname: true },
          take: 1,
        },
      },
    });

    return site ? toTenantRecord(site) : null;
  }

  async findByHostname(hostname: string) {
    const domain = await prisma.siteDomain.findFirst({
      where: {
        hostname,
        status: "VERIFIED",
        site: {
          deletedAt: null,
        },
      },
      select: {
        hostname: true,
        site: {
          select: {
            id: true,
            slug: true,
            isActive: true,
            subscriptionStatus: true,
            subscriptionEnd: true,
          },
        },
      },
    });

    return domain
      ? toTenantRecord({
          ...domain.site,
          domains: [{ hostname: domain.hostname }],
        })
      : null;
  }
}
