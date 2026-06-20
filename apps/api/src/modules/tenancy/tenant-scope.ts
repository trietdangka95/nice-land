import type { TenantContext } from "./tenant-resolver.js";

type QueryFilters = Record<string, unknown>;

export function tenantWhere<TFilters extends QueryFilters>(
  tenant: TenantContext,
  filters: TFilters,
) {
  return {
    AND: [{ siteId: tenant.siteId }, filters],
  };
}
