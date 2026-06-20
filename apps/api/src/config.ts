import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4000),
  ROOT_DOMAIN: z.string().default("datcuatoi.vn"),
  CORS_ORIGINS: z.string().default("http://localhost:3002"),
  DATABASE_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .default("development-access-secret-change-me-123456789"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).default(30),
  REFRESH_COOKIE_NAME: z.string().default("datcuatoi_refresh"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse(environment);
}
