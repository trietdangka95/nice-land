import { z } from "zod";

export const userRoleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "GUEST"]);
export const propertyTypeSchema = z.enum(["LAND", "HOUSE", "APARTMENT", "RENTAL"]);
export const postStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "HIDDEN",
  "SOLD",
  "ARCHIVED",
]);
export const subscriptionStatusSchema = z.enum([
  "TRIAL",
  "ACTIVE",
  "GRACE_PERIOD",
  "EXPIRED",
  "SUSPENDED",
]);
export const publicThemeSchema = z.enum([
  "CLASSIC_ESTATE",
  "MODERN_GRID",
  "EDITORIAL",
  "WARM_MINIMAL",
]);

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

export const propertyLeadInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional(),
  source: z.enum(["PROPERTY_FORM", "PHONE_CLICK", "ZALO_CLICK"]).default("PROPERTY_FORM"),
});

export const leadUpdateSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "DONE", "REJECTED"]),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const propertyInteractionInputSchema = z.object({
  source: z.enum(["PHONE_CLICK", "ZALO_CLICK"]),
});

export const publicPostListQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    type: propertyTypeSchema.optional(),
    categoryId: z.string().uuid().optional(),
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

export const forgotPasswordInputSchema = z.object({
  identifier: z.string().trim().min(3).max(180),
});

export const resetPasswordInputSchema = z.object({
  token: z.string().trim().min(32).max(256),
  password: z.string().min(8).max(200),
});

export const updateProfileInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120).nullable().optional(),
  email: z.string().trim().email().max(180).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
});

export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

export const adminPostInputSchema = z.object({
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().min(20).max(10000),
  type: propertyTypeSchema,
  price: z.coerce.number().nonnegative().nullable().optional(),
  area: z.coerce.number().positive().nullable().optional(),
  address: z.string().trim().max(250).nullable().optional(),
  province: z.string().trim().max(120).nullable().optional(),
  district: z.string().trim().max(120).nullable().optional(),
  ward: z.string().trim().max(120).nullable().optional(),
  legalStatus: z.string().trim().max(120).nullable().optional(),
  bedrooms: z.coerce.number().int().nonnegative().nullable().optional(),
  bathrooms: z.coerce.number().int().nonnegative().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  status: postStatusSchema
    .exclude(["ARCHIVED"])
    .default("DRAFT"),
});

export const adminPostUpdateSchema = adminPostInputSchema.partial().extend({
  version: z.coerce.number().int().positive(),
});

export const adminPostListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: postStatusSchema.optional(),
  type: propertyTypeSchema.optional(),
  province: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const propertyCategoryInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: propertyTypeSchema,
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
});

export const imagePresignInputSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.coerce.number().int().positive().max(8 * 1024 * 1024),
});

export const imageCompleteInputSchema = imagePresignInputSchema.extend({
  objectKey: z.string().trim().min(10).max(500),
  altText: z.string().trim().max(180).nullable().optional(),
});

export const imageReorderInputSchema = z.object({
  imageIds: z
    .array(z.string().uuid())
    .min(1)
    .max(30)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "imageIds must be unique",
    }),
});

const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .max(500)
  .nullable()
  .optional()
  .or(z.literal(""));

export const siteSettingsInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  tagline: z.string().trim().max(240).nullable().optional(),
  logo: optionalUrlSchema,
  banner: optionalUrlSchema,
  themeColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Màu chủ đạo phải có dạng #RRGGBB"),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(180),
  address: z.string().trim().min(3).max(300),
  facebookUrl: optionalUrlSchema,
  zaloPhone: z.string().trim().max(20).nullable().optional(),
});

export const renewalRequestInputSchema = z.object({
  planId: z.string().uuid().nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
});

export const requestStatusSchema = z.enum([
  "NEW",
  "IN_PROGRESS",
  "APPROVED",
  "REJECTED",
  "DONE",
]);

export const superAdminSiteListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  active: z
    .preprocess(
      (value) =>
        value === "true" ? true : value === "false" ? false : value,
      z.boolean(),
    )
    .optional(),
  subscriptionStatus: subscriptionStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const superAdminSiteCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(63),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(180),
  address: z.string().trim().max(300).nullable().optional(),
  planId: z.string().uuid(),
  subscriptionEnd: z.coerce.date(),
  adminName: z.string().trim().min(2).max(160),
  adminUsername: z.string().trim().min(3).max(120),
  adminPassword: z.string().min(8).max(200),
});

export const superAdminSiteUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(63),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(180),
  address: z.string().trim().max(300).nullable().optional(),
  planId: z.string().uuid().nullable(),
  subscriptionStatus: subscriptionStatusSchema,
  subscriptionEnd: z.coerce.date().nullable(),
});

export const siteActiveInputSchema = z.object({ isActive: z.boolean() });

export const subscriptionPlanInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_]+$/).max(40),
  maxPosts: z.coerce.number().int().positive().max(1_000_000),
  maxImagesPerPost: z.coerce.number().int().min(1).max(100),
  price: z.coerce.number().nonnegative(),
  durationDays: z.coerce.number().int().positive().max(3650),
  isActive: z.boolean().default(true),
});

export const renewalResolutionInputSchema = z.object({
  status: z.enum(["IN_PROGRESS", "APPROVED", "REJECTED", "DONE"]),
  adminNote: z.string().trim().max(1000).nullable().optional(),
});

export const contactStatusInputSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "DONE", "REJECTED"]),
});

export interface AuthUser {
  id: string;
  siteId: string | null;
  username: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
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
export type PublicTheme = z.infer<typeof publicThemeSchema>;
export type ContactRequestInput = z.infer<typeof contactRequestInputSchema>;
export type PropertyLeadInput = z.infer<typeof propertyLeadInputSchema>;
export type LeadUpdate = z.infer<typeof leadUpdateSchema>;
export type PropertyInteractionInput = z.infer<
  typeof propertyInteractionInputSchema
>;
export type PublicPostListQuery = z.infer<typeof publicPostListQuerySchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;
export type AdminPostInput = z.infer<typeof adminPostInputSchema>;
export type AdminPostUpdate = z.infer<typeof adminPostUpdateSchema>;
export type AdminPostListQuery = z.infer<typeof adminPostListQuerySchema>;
export type PropertyCategoryInput = z.infer<
  typeof propertyCategoryInputSchema
>;
export type ImagePresignInput = z.infer<typeof imagePresignInputSchema>;
export type ImageCompleteInput = z.infer<typeof imageCompleteInputSchema>;
export type ImageReorderInput = z.infer<typeof imageReorderInputSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;
export type RenewalRequestInput = z.infer<typeof renewalRequestInputSchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type SuperAdminSiteListQuery = z.infer<typeof superAdminSiteListQuerySchema>;
export type SuperAdminSiteCreate = z.infer<typeof superAdminSiteCreateSchema>;
export type SuperAdminSiteUpdate = z.infer<typeof superAdminSiteUpdateSchema>;
export type SiteActiveInput = z.infer<typeof siteActiveInputSchema>;
export type SubscriptionPlanInput = z.infer<typeof subscriptionPlanInputSchema>;
export type RenewalResolutionInput = z.infer<typeof renewalResolutionInputSchema>;
export type ContactStatusInput = z.infer<typeof contactStatusInputSchema>;

export interface SuperAdminSite {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  themeKey: PublicTheme;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  plan: { id: string; name: string; code: string } | null;
  usage: { posts: number; images: number; users: number };
  admin: {
    id: string;
    username: string;
    fullName: string | null;
    isActive: boolean;
    lastLoginAt: string | null;
  } | null;
  createdAt: string;
}

export interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
  type: PropertyType;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SuperAdminSiteListResponse {
  items: SuperAdminSite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  maxPosts: number;
  maxImagesPerPost: number;
  price: number;
  durationDays: number;
  isActive: boolean;
  siteCount: number;
}

export interface SuperAdminRenewalRequest {
  id: string;
  status: RequestStatus;
  note: string | null;
  adminNote: string | null;
  requestedAt: string;
  resolvedAt: string | null;
  site: { id: string; name: string; slug: string };
  plan: { id: string; name: string; durationDays: number; price: number } | null;
  requestedBy: { username: string; fullName: string | null };
}

export interface SuperAdminContact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: RequestStatus;
  source: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: unknown;
  createdAt: string;
  site: { id: string; name: string } | null;
  user: { id: string; username: string } | null;
}

export interface TenantLead {
  id: string;
  postId: string | null;
  postTitle: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string | null;
  status: RequestStatus;
  notes: string | null;
  createdAt: string;
}

export interface TenantAnalytics {
  totals: { views: number; leads: number };
  dailyViews: Array<{ date: string; count: number }>;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    leads: number;
  }>;
}

export interface TenantDashboard {
  postCounts: {
    total: number;
    published: number;
    draft: number;
    sold: number;
  };
  engagement: {
    views: number;
    leads: number;
  };
  subscription: AdminSubscription;
  recentPosts: AdminPost[];
}

export interface SiteSettings {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logo: string | null;
  banner: string | null;
  themeKey: PublicTheme;
  themeColor: string;
  phone: string;
  email: string;
  address: string;
  facebookUrl: string | null;
  zaloPhone: string | null;
  updatedAt: string;
}

export interface AdminSubscription {
  status: SubscriptionStatus;
  startsAt: string | null;
  endsAt: string | null;
  plan: {
    id: string;
    code: string;
    name: string;
    price: number;
    durationDays: number;
    maxPosts: number;
    maxImagesPerPost: number;
  } | null;
  usage: {
    posts: number;
    images: number;
  };
  latestRenewalRequest: {
    id: string;
    status: "NEW" | "IN_PROGRESS" | "APPROVED" | "REJECTED" | "DONE";
    note: string | null;
    requestedAt: string;
  } | null;
}

export interface AdminPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number | null;
  area: number | null;
  address: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  legalStatus: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  categoryId: string | null;
  status: PostStatus;
  version: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>;
}

export interface AdminPostListResponse {
  items: AdminPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
}

export interface HealthResponse {
  status: "ok" | "unavailable";
  service: "nice-land-api";
  timestamp: string;
}
