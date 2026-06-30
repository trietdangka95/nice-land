import type {
  ApiError,
  AdminPost,
  AdminPostInput,
  AdminPostListQuery,
  AdminPostListResponse,
  AdminPostUpdate,
  AdminSubscription,
  AuthResponse,
  AuthUser,
  ContactRequestInput,
  ForgotPasswordInput,
  HealthResponse,
  ImageCompleteInput,
  ImagePresignInput,
  ImageReorderInput,
  GenericImagePresignInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
  ChangePasswordInput,
  RenewalRequestInput,
  SiteSettings,
  SiteSettingsInput,
  SiteActiveInput,
  SubscriptionPlan,
  SubscriptionPlanInput,
  SuperAdminContact,
  SuperAdminRenewalRequest,
  SuperAdminSite,
  SuperAdminSiteCreate,
  SuperAdminSiteListQuery,
  SuperAdminSiteListResponse,
  SuperAdminSiteUpdate,
  RenewalResolutionInput,
  AuditLogItem,
  ContactStatusInput,
  LeadUpdate,
  NotificationListResponse,
  PropertyLeadInput,
  PropertyInteractionInput,
  PropertyCategory,
  PropertyCategoryInput,
  TenantAnalytics,
  TenantDashboard,
  TenantLead,
  SystemSetting,
  SystemSettingInput,
} from "@nice-land/contracts";

export interface ApiClientOptions {
  baseUrl: string;
  getTenantHost?: () => string | undefined;
  getAccessToken?: () => string | undefined;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: ApiError,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function formatApiErrorMessage(payload: ApiError | undefined) {
  if (!payload) return "API request failed";

  const details = payload.details;
  if (
    details &&
    typeof details === "object" &&
    "fieldErrors" in details &&
    details.fieldErrors &&
    typeof details.fieldErrors === "object"
  ) {
    const fieldErrors = Object.entries(details.fieldErrors)
      .flatMap(([field, messages]) =>
        Array.isArray(messages)
          ? messages.map((message) => `${field}: ${String(message)}`)
          : [],
      );

    if (fieldErrors.length > 0) {
      return `${payload.message} ${fieldErrors.join("; ")}`;
    }
  }

  return payload.message;
}

export function createApiClient(options: ApiClientOptions) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const tenantHost = options.getTenantHost?.();
    if (tenantHost) headers.set("X-Tenant-Host", tenantHost);

    const accessToken = options.getAccessToken?.();
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(`${options.baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => undefined)) as ApiError | undefined;
      throw new ApiClientError(formatApiErrorMessage(payload), response.status, payload);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  return {
    health: () => request<HealthResponse>("/health/live"),
    login: (input: LoginInput) =>
      request<AuthResponse>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    forgotPassword: (input: ForgotPasswordInput) =>
      request<{ message: string }>("/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    resetPassword: (input: ResetPasswordInput) =>
      request<{ message: string }>("/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    refresh: () =>
      request<AuthResponse>("/v1/auth/refresh", {
        method: "POST",
      }),
    logout: () =>
      request<void>("/v1/auth/logout", {
        method: "POST",
      }),
    me: () => request<AuthUser>("/v1/auth/me"),
    updateProfile: (input: UpdateProfileInput) =>
      request<{ message: string }>("/v1/auth/me", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    changePassword: (input: ChangePasswordInput) =>
      request<{ message: string }>("/v1/auth/me/password", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    getTenantDashboard: () =>
      request<TenantDashboard>("/v1/admin/dashboard"),
    listAdminPosts: (query: Partial<AdminPostListQuery> = {}) => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") search.set(key, String(value));
      }
      const suffix = search.size ? `?${search.toString()}` : "";
      return request<AdminPostListResponse>(`/v1/admin/posts${suffix}`);
    },
    getAdminPost: (id: string) =>
      request<AdminPost>(`/v1/admin/posts/${encodeURIComponent(id)}`),
    createAdminPost: (input: AdminPostInput) =>
      request<AdminPost>("/v1/admin/posts", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateAdminPost: (id: string, input: AdminPostUpdate) =>
      request<AdminPost>(`/v1/admin/posts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    archiveAdminPost: (id: string, version: number) =>
      request<void>(
        `/v1/admin/posts/${encodeURIComponent(id)}?version=${version}`,
        { method: "DELETE" },
      ),
    listAdminCategories: () =>
      request<PropertyCategory[]>("/v1/admin/categories"),
    createAdminCategory: (input: PropertyCategoryInput) =>
      request<PropertyCategory>("/v1/admin/categories", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateAdminCategory: (id: string, input: PropertyCategoryInput) =>
      request<PropertyCategory>(
        `/v1/admin/categories/${encodeURIComponent(id)}`,
        { method: "PATCH", body: JSON.stringify(input) },
      ),
    deleteAdminCategory: (id: string) =>
      request<void>(`/v1/admin/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    listPublicCategories: () =>
      request<PropertyCategory[]>("/v1/public/categories"),
    presignPostImage: (postId: string, input: ImagePresignInput) =>
      request<{
        uploadUrl: string;
        objectKey: string;
        expiresIn: number;
        headers: Record<string, string>;
      }>(`/v1/admin/posts/${encodeURIComponent(postId)}/images/presign`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    completePostImage: (postId: string, input: ImageCompleteInput) =>
      request<{ id: string; url: string; sortOrder: number }>(
        `/v1/admin/posts/${encodeURIComponent(postId)}/images/complete`,
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      ),
    reorderPostImages: (postId: string, input: ImageReorderInput) =>
      request<void>(
        `/v1/admin/posts/${encodeURIComponent(postId)}/images/reorder`,
        {
          method: "PATCH",
          body: JSON.stringify(input),
        },
      ),
    deletePostImage: (postId: string, imageId: string) =>
      request<void>(
        `/v1/admin/posts/${encodeURIComponent(postId)}/images/${encodeURIComponent(imageId)}`,
        { method: "DELETE" },
      ),
    presignGenericImage: (input: GenericImagePresignInput) =>
      request<{
        uploadUrl: string;
        objectKey: string;
        publicUrl: string;
        expiresIn: number;
        headers: Record<string, string>;
      }>("/v1/admin/uploads/presign", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    getSiteSettings: () =>
      request<SiteSettings>("/v1/admin/site-config"),
    updateSiteSettings: (input: SiteSettingsInput) =>
      request<SiteSettings>("/v1/admin/site-config", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    getSubscription: () =>
      request<AdminSubscription>("/v1/admin/subscription"),
    getAvailablePlans: () =>
      request<SubscriptionPlan[]>("/v1/admin/plans"),
    createRenewalRequest: (input: RenewalRequestInput) =>
      request<NonNullable<AdminSubscription["latestRenewalRequest"]>>(
        "/v1/admin/renewal-requests",
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      ),
    listAdminNotifications: (limit?: number) =>
      request<NotificationListResponse>(
        `/v1/admin/notifications${limit ? `?limit=${encodeURIComponent(String(limit))}` : ""}`,
      ),
    markAdminNotificationRead: (id: string) =>
      request<void>(`/v1/admin/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
      }),
    markAllAdminNotificationsRead: () =>
      request<void>("/v1/admin/notifications/read-all", {
        method: "POST",
      }),
    listSuperAdminSites: (query: Partial<SuperAdminSiteListQuery> = {}) => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") search.set(key, String(value));
      }
      return request<SuperAdminSiteListResponse>(
        `/v1/superadmin/sites${search.size ? `?${search}` : ""}`,
      );
    },
    getSuperAdminSite: (id: string) =>
      request<SuperAdminSite>(`/v1/superadmin/sites/${encodeURIComponent(id)}`),
    createSuperAdminSite: (input: SuperAdminSiteCreate) =>
      request<SuperAdminSite>("/v1/superadmin/sites", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateSuperAdminSite: (id: string, input: SuperAdminSiteUpdate) =>
      request<SuperAdminSite>(`/v1/superadmin/sites/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    setSuperAdminSiteActive: (id: string, input: SiteActiveInput) =>
      request<void>(`/v1/superadmin/sites/${encodeURIComponent(id)}/active`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    resetSuperAdminSitePassword: (id: string) =>
      request<{ temporaryPassword: string }>(
        `/v1/superadmin/sites/${encodeURIComponent(id)}/reset-password`,
        { method: "POST" },
      ),
    setSuperAdminAdminActive: (id: string, input: SiteActiveInput) =>
      request<void>(`/v1/superadmin/sites/${encodeURIComponent(id)}/admin-active`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    listSubscriptionPlans: () =>
      request<SubscriptionPlan[]>("/v1/superadmin/plans"),
    createSubscriptionPlan: (input: SubscriptionPlanInput) =>
      request<SubscriptionPlan>("/v1/superadmin/plans", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateSubscriptionPlan: (id: string, input: SubscriptionPlanInput) =>
      request<SubscriptionPlan>(`/v1/superadmin/plans/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    deleteSubscriptionPlan: (id: string) =>
      request<void>(`/v1/superadmin/plans/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    listSuperAdminRenewals: () =>
      request<SuperAdminRenewalRequest[]>("/v1/superadmin/renewal-requests"),
    resolveSuperAdminRenewal: (id: string, input: RenewalResolutionInput) =>
      request<SuperAdminRenewalRequest>(
        `/v1/superadmin/renewal-requests/${encodeURIComponent(id)}`,
        { method: "PATCH", body: JSON.stringify(input) },
      ),
    listSuperAdminContacts: () =>
      request<SuperAdminContact[]>("/v1/superadmin/contacts"),
    updateSuperAdminContactStatus: (id: string, input: ContactStatusInput) =>
      request<void>(`/v1/superadmin/contacts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    listSuperAdminNotifications: (limit?: number) =>
      request<NotificationListResponse>(
        `/v1/superadmin/notifications${limit ? `?limit=${encodeURIComponent(String(limit))}` : ""}`,
      ),
    markSuperAdminNotificationRead: (id: string) =>
      request<void>(`/v1/superadmin/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
      }),
    markAllSuperAdminNotificationsRead: () =>
      request<void>("/v1/superadmin/notifications/read-all", {
        method: "POST",
      }),
    listAuditLogs: () =>
      request<AuditLogItem[]>("/v1/superadmin/audit-logs"),
    getSystemSetting: () =>
      request<SystemSetting>("/v1/superadmin/settings"),
    updateSystemSetting: (input: SystemSettingInput) =>
      request<SystemSetting>("/v1/superadmin/settings", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    createContactRequest: (input: ContactRequestInput) =>
      request<{ id: string; createdAt: string }>("/v1/public/contact-requests", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    getPublicBankInfo: () =>
      request<SystemSetting>("/v1/public/bank-info"),
    trackPostView: (postId: string) =>
      request<void>(`/v1/public/posts/${encodeURIComponent(postId)}/view`, {
        method: "POST",
      }),
    createPropertyLead: (postId: string, input: PropertyLeadInput) =>
      request<{ id: string; createdAt: string }>(
        `/v1/public/posts/${encodeURIComponent(postId)}/leads`,
        { method: "POST", body: JSON.stringify(input) },
      ),
    trackPropertyInteraction: (
      postId: string,
      input: PropertyInteractionInput,
    ) =>
      request<void>(
        `/v1/public/posts/${encodeURIComponent(postId)}/interactions`,
        { method: "POST", body: JSON.stringify(input) },
      ),
    listTenantLeads: () => request<TenantLead[]>("/v1/admin/leads"),
    updateTenantLead: (id: string, input: LeadUpdate) =>
      request<void>(`/v1/admin/leads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    getTenantAnalytics: () =>
      request<TenantAnalytics>("/v1/admin/analytics"),
  };
}
