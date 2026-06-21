import { describe, expect, it } from "vitest";
import {
  writeAuditLog,
  type AuditLogClient,
} from "../src/modules/audit/audit-log-service.js";

describe("writeAuditLog", () => {
  it("maps a tenant mutation to one normalized audit record", async () => {
    const records: unknown[] = [];
    const client = {
      auditLog: {
        create: async (input: unknown) => {
          records.push(input);
          return { id: "audit-a" };
        },
      },
    } as AuditLogClient;

    await writeAuditLog(client, {
      siteId: "site-a",
      userId: "user-a",
      action: "POST_UPDATED",
      entityType: "PropertyPost",
      entityId: "post-a",
      details: { fields: ["title"], status: "PUBLISHED" },
    });

    expect(records).toEqual([
      {
        data: {
          siteId: "site-a",
          userId: "user-a",
          action: "POST_UPDATED",
          entityType: "PropertyPost",
          entityId: "post-a",
          details: { fields: ["title"], status: "PUBLISHED" },
        },
      },
    ]);
  });

  it("keeps platform actions independent from a tenant", async () => {
    let record: unknown;
    const client = {
      auditLog: {
        create: async (input: unknown) => {
          record = input;
          return { id: "audit-b" };
        },
      },
    } as AuditLogClient;

    await writeAuditLog(client, {
      userId: "super-user",
      action: "PLAN_CREATED",
      entityType: "SubscriptionPlan",
      entityId: "plan-a",
    });

    expect(record).toEqual({
      data: {
        userId: "super-user",
        action: "PLAN_CREATED",
        entityType: "SubscriptionPlan",
        entityId: "plan-a",
      },
    });
  });
});
