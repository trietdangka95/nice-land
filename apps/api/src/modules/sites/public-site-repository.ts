import type { PublicTheme, SubscriptionPlan } from "@nice-land/contracts";

export interface PublicSiteConfig {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logo: string | null;
  banner: string | null;
  brokerAvatar: string | null;
  brokerName: string | null;
  brokerBio: string | null;
  themeKey: PublicTheme;
  themeColor: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  facebookUrl: string | null;
  zaloPhone: string | null;
}

export interface PublicSiteRepository {
  findPublicConfig(siteId: string): Promise<PublicSiteConfig | null>;
  getPlatformStats?(): Promise<{
    totalSites: number;
    totalPosts: number;
    totalThemes: number;
    landingPageViews: number;
  }>;
  listPublicPlans?(): Promise<SubscriptionPlan[]>;
  recordPlatformView?(input: { visitorHash: string; userAgent: string; referrer?: string; since: Date }): Promise<boolean>;
}
