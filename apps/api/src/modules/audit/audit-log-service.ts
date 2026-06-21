import type { Prisma } from "@nice-land/database";

export type AuditLogClient = {
  auditLog: {
    create(input: {
      data: Prisma.AuditLogUncheckedCreateInput;
    }): Promise<unknown>;
  };
};

export interface AuditLogEvent {
  siteId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Prisma.InputJsonValue;
}

export function writeAuditLog(
  client: AuditLogClient,
  event: AuditLogEvent,
) {
  return client.auditLog.create({
    data: {
      ...(event.siteId ? { siteId: event.siteId } : {}),
      ...(event.userId ? { userId: event.userId } : {}),
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      ...(event.details !== undefined ? { details: event.details } : {}),
    },
  });
}
