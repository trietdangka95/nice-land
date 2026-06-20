import type {
  LeadUpdate,
  PropertyLeadInput,
  TenantAnalytics,
  TenantLead,
} from "@nice-land/contracts";

export interface EngagementRepository {
  recordView(input: {
    siteId: string;
    postId: string;
    visitorHash: string;
    referrer?: string;
    userAgent?: string;
    since: Date;
  }): Promise<boolean | null>;
  createLead(
    siteId: string,
    postId: string,
    input: PropertyLeadInput,
  ): Promise<{
    id: string;
    createdAt: Date;
    notification: {
      recipient: string | null;
      siteName: string;
      postTitle: string;
    };
  } | null>;
  recordInteraction(
    siteId: string,
    postId: string,
    source: "PHONE_CLICK" | "ZALO_CLICK",
  ): Promise<boolean>;
  listLeads(siteId: string): Promise<TenantLead[]>;
  updateLead(
    siteId: string,
    id: string,
    input: LeadUpdate,
  ): Promise<boolean>;
  getAnalytics(siteId: string, since: Date): Promise<TenantAnalytics>;
}
