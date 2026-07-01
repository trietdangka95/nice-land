import { Prisma, prisma } from "@nice-land/database";
import type { TenantDashboard } from "@nice-land/contracts";
import type { AdminDashboardRepository } from "./admin-dashboard-repository.js";

const recentPostSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  featured: true,
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

export class PrismaAdminDashboardRepository
  implements AdminDashboardRepository
{
  async getDashboard(siteId: string): Promise<TenantDashboard | null> {
    const since = new Date(Date.now() - 30 * 86_400_000);
    const [
      site,
      total,
      published,
      draft,
      sold,
      recentPosts,
      views,
      leads,
      images,
      newLeads,
    ] = await prisma.$transaction([
      prisma.site.findFirst({
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
        },
      }),
      prisma.propertyPost.count({
        where: { siteId, deletedAt: null },
      }),
      prisma.propertyPost.count({
        where: { siteId, deletedAt: null, status: "PUBLISHED" },
      }),
      prisma.propertyPost.count({
        where: { siteId, deletedAt: null, status: "DRAFT" },
      }),
      prisma.propertyPost.count({
        where: { siteId, deletedAt: null, status: "SOLD" },
      }),
      prisma.propertyPost.findMany({
        where: { siteId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: recentPostSelect,
      }),
      prisma.propertyView.count({
        where: { siteId, viewedAt: { gte: since } },
      }),
      prisma.lead.count({
        where: { siteId, createdAt: { gte: since } },
      }),
      prisma.propertyImage.count({
        where: { post: { siteId, deletedAt: null } },
      }),
      prisma.lead.count({
        where: { siteId, status: "NEW" },
      }),
    ]);

    if (!site) return null;

    const latestRequest = site.renewalRequests[0];

    return {
      postCounts: {
        total,
        published,
        draft,
        sold,
      },
      engagement: { views, leads, newLeads },
      subscription: {
        status: site.subscriptionStatus,
        startsAt: site.subscriptionStart?.toISOString() ?? null,
        endsAt: site.subscriptionEnd?.toISOString() ?? null,
        plan: site.plan
          ? { ...site.plan, price: site.plan.price.toNumber() }
          : null,
        usage: { posts: total, images },
        latestRenewalRequest: latestRequest
          ? {
              ...latestRequest,
              requestedAt: latestRequest.requestedAt.toISOString(),
            }
          : null,
      },
      recentPosts: recentPosts.map((post) => ({
        ...post,
        price: post.price?.toNumber() ?? null,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      })),
    };
  }
}
