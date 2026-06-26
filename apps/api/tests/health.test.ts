import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("health endpoints", () => {
  it("reports the API as live", async () => {
    const app = buildApp(loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" }));
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/health/live" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      service: "nice-land-api",
    });
  });

  it("reports readiness failure when a dependency is unavailable", async () => {
    const app = buildApp(
      loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" }),
      {
        readinessCheck: async () => {
          throw new Error("database unavailable");
        },
      },
    );
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/health/ready" });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({
      status: "unavailable",
      service: "nice-land-api",
    });
  });

  it("allows CORS requests from the production root domain", async () => {
    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        CORS_ORIGINS: "https://nice-land.id.vn,https://*.nice-land.id.vn",
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "OPTIONS",
      url: "/health/live",
      headers: {
        origin: "https://nice-land.id.vn",
        "access-control-request-method": "GET",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://nice-land.id.vn",
    );
  });

  it("allows CORS requests from production tenant subdomains", async () => {
    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        CORS_ORIGINS: "https://nice-land.id.vn,https://*.nice-land.id.vn",
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "OPTIONS",
      url: "/health/live",
      headers: {
        origin: "https://minhphat.nice-land.id.vn",
        "access-control-request-method": "GET",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://minhphat.nice-land.id.vn",
    );
  });

  it("does not allow CORS requests from unrelated domains", async () => {
    const app = buildApp(
      loadConfig({
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
        CORS_ORIGINS: "https://nice-land.id.vn,https://*.nice-land.id.vn",
      }),
    );
    apps.push(app);

    const response = await app.inject({
      method: "OPTIONS",
      url: "/health/live",
      headers: {
        origin: "https://example.com",
        "access-control-request-method": "GET",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
