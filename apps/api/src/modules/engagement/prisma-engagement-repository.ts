import { prisma } from "@datcuatoi/database";
import type { LeadUpdate, PropertyLeadInput } from "@datcuatoi/contracts";
import type { EngagementRepository } from "./engagement-repository.js";

export class PrismaEngagementRepository implements EngagementRepository {
  async recordView(input: Parameters<EngagementRepository["recordView"]>[0]) {
    const post = await prisma.propertyPost.findFirst({
      where: {
        id: input.postId,
        siteId: input.siteId,
        deletedAt: null,
        status: { in: ["PUBLISHED", "SOLD"] },
      },
      select: { id: true },
    });
    if (!post) return null;
    const duplicate = await prisma.propertyView.findFirst({
      where: {
        siteId: input.siteId,
        postId: input.postId,
        visitorHash: input.visitorHash,
        viewedAt: { gte: input.since },
      },
      select: { id: true },
    });
    if (duplicate) return false;
    await prisma.$transaction([
      prisma.propertyView.create({
        data: {
          siteId: input.siteId,
          postId: input.postId,
          visitorHash: input.visitorHash,
          referrer: input.referrer,
          userAgent: input.userAgent,
        },
      }),
      prisma.propertyPost.update({
        where: { id: input.postId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);
    return true;
  }

  async createLead(siteId: string, postId: string, input: PropertyLeadInput) {
    const post = await prisma.propertyPost.findFirst({
      where: { id: postId, siteId, deletedAt: null, status: { in: ["PUBLISHED", "SOLD"] } },
      select: {
        id: true,
        title: true,
        site: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!post) return null;
    const lead = await prisma.lead.create({
      data: {
        siteId,
        postId,
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        message: input.message || null,
        source: input.source,
      },
      select: { id: true, createdAt: true },
    });
    return {
      ...lead,
      notification: {
        recipient: post.site.email,
        siteName: post.site.name,
        postTitle: post.title,
      },
    };
  }

  async recordInteraction(
    siteId: string,
    postId: string,
    source: "PHONE_CLICK" | "ZALO_CLICK",
  ) {
    const post = await prisma.propertyPost.findFirst({
      where: {
        id: postId,
        siteId,
        deletedAt: null,
        status: { in: ["PUBLISHED", "SOLD"] },
      },
      select: {
        site: {
          select: {
            phone: true,
            zaloPhone: true,
          },
        },
      },
    });
    if (!post) return false;
    await prisma.lead.create({
      data: {
        siteId,
        postId,
        name: source === "PHONE_CLICK" ? "Khách bấm gọi" : "Khách bấm Zalo",
        phone:
          (source === "ZALO_CLICK"
            ? post.site.zaloPhone
            : post.site.phone) ?? "unknown",
        source,
      },
    });
    return true;
  }

  async listLeads(siteId: string) {
    const items = await prisma.lead.findMany({
      where: { siteId },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { post: { select: { title: true } } },
    });
    return items.map(({ post, ...item }) => ({
      ...item,
      postTitle: post?.title ?? null,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  async updateLead(siteId: string, id: string, input: LeadUpdate) {
    const result = await prisma.lead.updateMany({
      where: { id, siteId },
      data: { status: input.status, notes: input.notes || null },
    });
    return result.count === 1;
  }

  async getAnalytics(siteId: string, since: Date) {
    const [views, leads, posts] = await prisma.$transaction([
      prisma.propertyView.findMany({
        where: { siteId, viewedAt: { gte: since } },
        select: { postId: true, viewedAt: true },
      }),
      prisma.lead.findMany({
        where: { siteId, createdAt: { gte: since } },
        select: { postId: true },
      }),
      prisma.propertyPost.findMany({
        where: { siteId, deletedAt: null },
        select: { id: true, title: true },
      }),
    ]);
    const days = new Map<string, number>();
    const byPost = new Map(posts.map((post) => [post.id, { ...post, views: 0, leads: 0 }]));
    for (const view of views) {
      const date = view.viewedAt.toISOString().slice(0, 10);
      days.set(date, (days.get(date) ?? 0) + 1);
      const post = byPost.get(view.postId);
      if (post) post.views += 1;
    }
    for (const lead of leads) {
      if (!lead.postId) continue;
      const post = byPost.get(lead.postId);
      if (post) post.leads += 1;
    }
    return {
      totals: { views: views.length, leads: leads.length },
      dailyViews: [...days].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
      topPosts: [...byPost.values()].sort((a, b) => b.views - a.views).slice(0, 10),
    };
  }
}
