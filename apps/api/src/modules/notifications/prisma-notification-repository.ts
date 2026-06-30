import { prisma, Prisma } from "@nice-land/database";
import type { NotificationItem, NotificationListResponse } from "@nice-land/contracts";
import type {
  CreateNotificationInput,
  NotificationRepository,
} from "./notification-repository.js";

const notificationSelect = {
  id: true,
  type: true,
  title: true,
  body: true,
  link: true,
  isRead: true,
  readAt: true,
  createdAt: true,
  payload: true,
  site: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.NotificationSelect;

function mapNotification(
  item: Prisma.NotificationGetPayload<{ select: typeof notificationSelect }>,
): NotificationItem {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    link: item.link,
    isRead: item.isRead,
    readAt: item.readAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    payload: item.payload,
    site: item.site,
  };
}

export class PrismaNotificationRepository implements NotificationRepository {
  async create(input: CreateNotificationInput) {
    const created = await prisma.notification.create({
      data: {
        siteId: input.siteId ?? null,
        scope: input.scope,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
        payload:
          input.payload === undefined
            ? Prisma.JsonNull
            : (input.payload as Prisma.InputJsonValue),
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
    return {
      id: created.id,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async listTenantAdmin(
    siteId: string,
    limit: number,
  ): Promise<NotificationListResponse> {
    const [items, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { siteId, scope: "TENANT_ADMIN" },
        select: notificationSelect,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { siteId, scope: "TENANT_ADMIN", isRead: false },
      }),
    ]);
    return { items: items.map(mapNotification), unreadCount };
  }

  async markTenantAdminRead(siteId: string, id: string) {
    const result = await prisma.notification.updateMany({
      where: { id, siteId, scope: "TENANT_ADMIN", isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count > 0;
  }

  async markAllTenantAdminRead(siteId: string) {
    const result = await prisma.notification.updateMany({
      where: { siteId, scope: "TENANT_ADMIN", isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }

  async listSuperAdmin(limit: number): Promise<NotificationListResponse> {
    const [items, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { scope: "SUPER_ADMIN" },
        select: notificationSelect,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { scope: "SUPER_ADMIN", isRead: false },
      }),
    ]);
    return { items: items.map(mapNotification), unreadCount };
  }

  async markSuperAdminRead(id: string) {
    const result = await prisma.notification.updateMany({
      where: { id, scope: "SUPER_ADMIN", isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count > 0;
  }

  async markAllSuperAdminRead() {
    const result = await prisma.notification.updateMany({
      where: { scope: "SUPER_ADMIN", isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }
}
