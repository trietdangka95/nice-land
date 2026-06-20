import { describe, expect, it } from "vitest";
import {
  resolveTenant,
  TenantResolutionError,
  type TenantSiteRepository,
} from "../src/modules/tenancy/tenant-resolver.js";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const activeSite = {
  id: "site-a",
  slug: "minhphat",
  hostname: "minhphat.nice-land.vn",
  isActive: true,
  subscriptionStatus: "ACTIVE" as const,
  subscriptionEnd: new Date("2027-06-30T00:00:00.000Z"),
};

function createRepository(): TenantSiteRepository {
  return {
    findBySlug: async (slug) => (slug === activeSite.slug ? activeSite : null),
    findByHostname: async (hostname) =>
      hostname === "nhadatminhphat.vn" ? { ...activeSite, hostname } : null,
  };
}

describe("resolveTenant", () => {
  it("resolves a tenant from a platform subdomain", async () => {
    const tenant = await resolveTenant({
      host: "minhphat.nice-land.vn",
      rootDomain: "nice-land.vn",
      repository: createRepository(),
      now: new Date("2026-06-19T00:00:00.000Z"),
    });

    expect(tenant).toMatchObject({ siteId: "site-a", slug: "minhphat" });
  });

  it("resolves a verified custom domain through the repository", async () => {
    const tenant = await resolveTenant({
      host: "nhadatminhphat.vn",
      rootDomain: "nice-land.vn",
      repository: createRepository(),
      now: new Date("2026-06-19T00:00:00.000Z"),
    });

    expect(tenant.hostname).toBe("nhadatminhphat.vn");
  });

  it("supports tenant.localhost during local development", async () => {
    const tenant = await resolveTenant({
      host: "minhphat.localhost:3002",
      rootDomain: "localhost",
      repository: createRepository(),
      now: new Date("2026-06-19T00:00:00.000Z"),
    });

    expect(tenant.siteId).toBe("site-a");
  });

  it("blocks inactive tenants", async () => {
    const repository: TenantSiteRepository = {
      findBySlug: async () => ({ ...activeSite, isActive: false }),
      findByHostname: async () => null,
    };

    await expect(
      resolveTenant({
        host: "minhphat.nice-land.vn",
        rootDomain: "nice-land.vn",
        repository,
      }),
    ).rejects.toMatchObject({ code: "TENANT_INACTIVE" } satisfies Partial<TenantResolutionError>);
  });

  it("blocks tenants whose subscription has expired", async () => {
    const repository: TenantSiteRepository = {
      findBySlug: async () => ({
        ...activeSite,
        subscriptionStatus: "EXPIRED",
        subscriptionEnd: new Date("2026-05-01T00:00:00.000Z"),
      }),
      findByHostname: async () => null,
    };

    await expect(
      resolveTenant({
        host: "minhphat.nice-land.vn",
        rootDomain: "nice-land.vn",
        repository,
        now: new Date("2026-06-19T00:00:00.000Z"),
      }),
    ).rejects.toMatchObject({ code: "TENANT_EXPIRED" } satisfies Partial<TenantResolutionError>);
  });

  it("can resolve an expired tenant for login and renewal flows", async () => {
    const repository: TenantSiteRepository = {
      findBySlug: async () => ({
        ...activeSite,
        subscriptionStatus: "EXPIRED",
        subscriptionEnd: new Date("2026-05-01T00:00:00.000Z"),
      }),
      findByHostname: async () => null,
    };

    const tenant = await resolveTenant({
      host: "minhphat.nice-land.vn",
      rootDomain: "nice-land.vn",
      repository,
      now: new Date("2026-06-19T00:00:00.000Z"),
      allowExpired: true,
    });

    expect(tenant).toMatchObject({
      siteId: "site-a",
      subscriptionStatus: "EXPIRED",
    });
  });

  it("rejects unknown or root hosts", async () => {
    await expect(
      resolveTenant({
        host: "nice-land.vn",
        rootDomain: "nice-land.vn",
        repository: createRepository(),
      }),
    ).rejects.toMatchObject({ code: "TENANT_NOT_FOUND" } satisfies Partial<TenantResolutionError>);
  });
});

describe("tenant request context", () => {
  const publicSiteRepository = {
    findPublicConfig: async (siteId: string) => ({
      id: siteId,
      name: "Nhà Đất Minh Phát",
      slug: "minhphat",
      tagline: null,
      logo: null,
      banner: null,
      themeColor: null,
      phone: null,
      email: null,
      address: null,
      facebookUrl: null,
      zaloPhone: null,
    }),
  };

  it("attaches tenant context only after resolving a valid host", async () => {
    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "nice-land.vn",
      }),
      { tenantRepository: createRepository(), publicSiteRepository },
    );

    const response = await app.inject({
      method: "GET",
      url: "/v1/public/site",
      headers: {
        "x-tenant-host": "minhphat.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "site-a",
      slug: "minhphat",
    });

    await app.close();
  });

  it("returns a clear error for an unknown tenant host", async () => {
    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        ROOT_DOMAIN: "nice-land.vn",
      }),
      { tenantRepository: createRepository(), publicSiteRepository },
    );

    const response = await app.inject({
      method: "GET",
      url: "/v1/public/site",
      headers: {
        "x-tenant-host": "unknown.nice-land.vn",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "TENANT_NOT_FOUND" });

    await app.close();
  });
});
