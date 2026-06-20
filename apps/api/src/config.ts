import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);
const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4000),
  ROOT_DOMAIN: z.string().default("datcuatoi.vn"),
  CORS_ORIGINS: z.string().default("http://localhost:3002"),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .default("development-access-secret-change-me-123456789"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).default(30),
  REFRESH_COOKIE_NAME: z.string().default("datcuatoi_refresh"),
  AWS_REGION: optionalString,
  AWS_S3_BUCKET: optionalString,
  AWS_S3_PUBLIC_URL: optionalUrl,
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().email().optional(),
  ),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
}).superRefine((config, context) => {
  if (config.NODE_ENV !== "test" && !config.DATABASE_URL) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DATABASE_URL"],
      message:
        "DATABASE_URL is required. Create .env from .env.example or configure it in the deployment environment.",
    });
  }
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse(environment);
}
