import { isSubscriptionExpired } from "../sites/subscription-date-utils.js";

export type TenantSubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "GRACE_PERIOD"
  | "EXPIRED"
  | "SUSPENDED";

export interface TenantSiteRecord {
  id: string;
  slug: string;
  hostname?: string;
  isActive: boolean;
  subscriptionStatus: TenantSubscriptionStatus;
  subscriptionEnd: Date | null;
}

export interface TenantSiteRepository {
  findBySlug(slug: string): Promise<TenantSiteRecord | null>;
  findByHostname(hostname: string): Promise<TenantSiteRecord | null>;
}

export interface TenantContext {
  siteId: string;
  slug: string;
  hostname: string;
  subscriptionStatus: TenantSubscriptionStatus;
}

export type TenantResolutionErrorCode =
  | "TENANT_NOT_FOUND"
  | "TENANT_INACTIVE"
  | "TENANT_EXPIRED";

export class TenantResolutionError extends Error {
  constructor(
    public readonly code: TenantResolutionErrorCode,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "TenantResolutionError";
  }
}

interface ResolveTenantOptions {
  host: string;
  rootDomain: string;
  repository: TenantSiteRepository;
  now?: Date;
  allowExpired?: boolean;
}

function normalizeHostname(value: string) {
  return value.trim().toLowerCase().split(":")[0].replace(/\.$/, "");
}

function getPlatformSlug(hostname: string, rootDomain: string) {
  if (rootDomain === "localhost") {
    if (!hostname.endsWith(".localhost")) return null;
    const labels = hostname.slice(0, -".localhost".length).split(".");
    return labels.length === 1 && labels[0] ? labels[0] : null;
  }

  if (!hostname.endsWith(`.${rootDomain}`)) return null;
  const labels = hostname.slice(0, -(rootDomain.length + 1)).split(".");
  return labels.length === 1 && labels[0] ? labels[0] : null;
}

export async function resolveTenant({
  host,
  rootDomain,
  repository,
  now = new Date(),
  allowExpired = false,
}: ResolveTenantOptions): Promise<TenantContext> {
  const hostname = normalizeHostname(host);
  const normalizedRootDomain = normalizeHostname(rootDomain);
  const slug = getPlatformSlug(hostname, normalizedRootDomain);

  const site = slug
    ? await repository.findBySlug(slug)
    : hostname !== normalizedRootDomain && hostname !== `www.${normalizedRootDomain}`
      ? await repository.findByHostname(hostname)
      : null;

  if (!site) {
    throw new TenantResolutionError(
      "TENANT_NOT_FOUND",
      "Website không tồn tại.",
      404,
    );
  }

  if (!site.isActive || site.subscriptionStatus === "SUSPENDED") {
    throw new TenantResolutionError(
      "TENANT_INACTIVE",
      "Website đang tạm ngưng hoạt động.",
      403,
    );
  }

  if (
    !allowExpired &&
    isSubscriptionExpired(site.subscriptionStatus, site.subscriptionEnd, now)
  ) {
    throw new TenantResolutionError(
      "TENANT_EXPIRED",
      "Gói dịch vụ của website đã hết hạn.",
      402,
    );
  }

  return {
    siteId: site.id,
    slug: site.slug,
    hostname,
    subscriptionStatus: site.subscriptionStatus,
  };
}
