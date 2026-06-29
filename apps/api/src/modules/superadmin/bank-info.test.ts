import { test, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import { PrismaClient } from "@nice-land/database";
import { buildApp } from "../../app";
import { PrismaSuperAdminRepository } from "./prisma-superadmin-repository";

const prisma = new PrismaClient();

test("GET /v1/public/bank-info returns 200", async () => {
  const repo = new PrismaSuperAdminRepository(prisma);
  const app = buildApp({ CORS_ORIGINS: "*", LOG_LEVEL: "silent", COOKIE_SECRET: "test-secret" } as any, { superAdminRepository: repo });
  await app.ready();

  const response = await app.inject({
    method: "GET",
    url: "/v1/public/bank-info",
  });

  expect(response.statusCode).toBe(200);
  const data = JSON.parse(response.payload);
  expect(data.id).toBe("default");
});
