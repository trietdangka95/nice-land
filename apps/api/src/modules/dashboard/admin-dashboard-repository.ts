import type { TenantDashboard } from "@nice-land/contracts";

export interface AdminDashboardRepository {
  getDashboard(siteId: string): Promise<TenantDashboard | null>;
}
