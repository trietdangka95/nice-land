import type {
  AdminSubscription,
  RenewalRequestInput,
  SiteSettings,
  SiteSettingsInput,
} from "@datcuatoi/contracts";

export interface AdminSiteRepository {
  getSettings(siteId: string): Promise<SiteSettings | null>;
  updateSettings(
    siteId: string,
    input: SiteSettingsInput,
    userId: string,
  ): Promise<SiteSettings | null>;
  getSubscription(siteId: string): Promise<AdminSubscription | null>;
  createRenewalRequest(
    siteId: string,
    input: RenewalRequestInput,
    userId: string,
  ): Promise<NonNullable<AdminSubscription["latestRenewalRequest"]>>;
}

export class PendingRenewalRequestError extends Error {
  statusCode = 409;

  constructor() {
    super("Website đã có một yêu cầu gia hạn đang chờ xử lý.");
    this.name = "PendingRenewalRequestError";
  }
}
