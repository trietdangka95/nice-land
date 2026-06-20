import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import type { ContactRequestRepository } from "../src/modules/contacts/contact-request-repository.js";
import type { TenantSiteRepository } from "../src/modules/tenancy/tenant-resolver.js";

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

const tenantRepository: TenantSiteRepository = {
  findBySlug: async () => ({
    id: "site-a",
    slug: "minhphat",
    isActive: true,
    subscriptionStatus: "ACTIVE",
    subscriptionEnd: new Date("2027-06-30T00:00:00.000Z"),
  }),
  findByHostname: async () => null,
};

describe("POST /v1/public/contact-requests", () => {
  it("persists a tenant-scoped contact request", async () => {
    const createdInputs: Parameters<ContactRequestRepository["create"]>[0][] = [];
    const contactRequestRepository: ContactRequestRepository = {
      create: async (input) => {
        createdInputs.push(input);
        return {
          id: "contact-1",
          createdAt: new Date("2026-06-20T00:00:00.000Z"),
        };
      },
    };

    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "nice-land.vn",
      }),
      { tenantRepository, contactRequestRepository },
    );
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/public/contact-requests",
      headers: { "x-tenant-host": "minhphat.nice-land.vn" },
      payload: {
        name: "Nguyễn Minh Anh",
        phone: "0905123456",
        email: "minhanh@example.com",
        message: "Tôi muốn xem căn biệt thự.",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(createdInputs).toEqual([
      {
        siteId: "site-a",
        name: "Nguyễn Minh Anh",
        phone: "0905123456",
        email: "minhanh@example.com",
        message: "Tôi muốn xem căn biệt thự.",
        source: "TENANT_WEBSITE",
      },
    ]);
  });

  it("persists a platform landing request without a tenant siteId", async () => {
    const createdInputs: Parameters<ContactRequestRepository["create"]>[0][] = [];
    const contactRequestRepository: ContactRequestRepository = {
      create: async (input) => {
        createdInputs.push(input);
        return {
          id: "contact-platform",
          createdAt: new Date("2026-06-20T00:00:00.000Z"),
        };
      },
    };

    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "nice-land.vn",
      }),
      { tenantRepository, contactRequestRepository },
    );
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/public/contact-requests",
      headers: { "x-tenant-host": "nice-land.vn" },
      payload: {
        name: "Khách nền tảng",
        phone: "0905123456",
        message: "Tôi muốn tạo website.",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(createdInputs).toEqual([
      {
        siteId: null,
        name: "Khách nền tảng",
        phone: "0905123456",
        email: undefined,
        message: "Tôi muốn tạo website.",
        source: "LANDING_PAGE",
      },
    ]);
  });

  it("rejects invalid contact data before persistence", async () => {
    let createCount = 0;
    const contactRequestRepository: ContactRequestRepository = {
      create: async () => {
        createCount += 1;
        throw new Error("should not persist");
      },
    };

    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "nice-land.vn",
      }),
      { tenantRepository, contactRequestRepository },
    );
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/public/contact-requests",
      headers: { "x-tenant-host": "minhphat.nice-land.vn" },
      payload: { name: "A", phone: "123" },
    });

    expect(response.statusCode).toBe(400);
    expect(createCount).toBe(0);
  });
});
