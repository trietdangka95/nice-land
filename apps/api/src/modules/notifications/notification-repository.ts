import type {
  NotificationListResponse,
  NotificationType,
} from "@nice-land/contracts";

export interface CreateNotificationInput {
  siteId?: string | null;
  scope: "TENANT_ADMIN" | "SUPER_ADMIN";
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  payload?: unknown;
}

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<{ id: string; createdAt: string }>;
  listTenantAdmin(siteId: string, limit: number): Promise<NotificationListResponse>;
  markTenantAdminRead(siteId: string, id: string): Promise<boolean>;
  markAllTenantAdminRead(siteId: string): Promise<number>;
  listSuperAdmin(limit: number): Promise<NotificationListResponse>;
  markSuperAdminRead(id: string): Promise<boolean>;
  markAllSuperAdminRead(): Promise<number>;
}
