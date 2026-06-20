import type {
  ApiError,
  AuthResponse,
  AuthUser,
  ContactRequestInput,
  HealthResponse,
  LoginInput,
} from "@datcuatoi/contracts";

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
      throw new ApiClientError(payload?.message ?? "API request failed", response.status, payload);
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
    refresh: () =>
      request<AuthResponse>("/v1/auth/refresh", {
        method: "POST",
      }),
    logout: () =>
      request<void>("/v1/auth/logout", {
        method: "POST",
      }),
    me: () => request<AuthUser>("/v1/auth/me"),
    createContactRequest: (input: ContactRequestInput) =>
      request<{ id: string; createdAt: string }>("/v1/public/contact-requests", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  };
}
