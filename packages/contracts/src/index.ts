import { z } from "zod";

export const userRoleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "GUEST"]);
export const propertyTypeSchema = z.enum(["LAND", "HOUSE", "APARTMENT", "RENTAL"]);
export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "SOLD"]);
export const subscriptionStatusSchema = z.enum(["ACTIVE", "TRIAL", "EXPIRED"]);

export const tenantHostSchema = z
  .string()
  .trim()
  .min(1)
  .max(253)
  .transform((value) => value.toLowerCase().split(":")[0]);

export const contactRequestInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional(),
});

export const publicPostListQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    type: propertyTypeSchema.optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    minArea: z.coerce.number().nonnegative().optional(),
    maxArea: z.coerce.number().nonnegative().optional(),
    province: z.string().trim().max(120).optional(),
    district: z.string().trim().max(120).optional(),
    sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  })
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      query.minPrice <= query.maxPrice,
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["minPrice"],
    },
  )
  .refine(
    (query) =>
      query.minArea === undefined ||
      query.maxArea === undefined ||
      query.minArea <= query.maxArea,
    {
      message: "minArea must be less than or equal to maxArea",
      path: ["minArea"],
    },
  );

export const loginInputSchema = z.object({
  username: z.string().trim().min(3).max(120),
  password: z.string().min(8).max(200),
});

export interface AuthUser {
  id: string;
  siteId: string | null;
  username: string;
  fullName: string | null;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export type UserRole = z.infer<typeof userRoleSchema>;
export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type PostStatus = z.infer<typeof postStatusSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type ContactRequestInput = z.infer<typeof contactRequestInputSchema>;
export type PublicPostListQuery = z.infer<typeof publicPostListQuerySchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;

export interface ApiError {
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
}

export interface HealthResponse {
  status: "ok" | "unavailable";
  service: "datcuatoi-api";
  timestamp: string;
}
