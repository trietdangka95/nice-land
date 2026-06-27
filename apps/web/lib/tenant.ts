const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "superadmin"]);

export function parseTenantSlug(
  hostname: string,
  rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "nice-land.id.vn",
) {
  const cleanHost = hostname.toLowerCase().split(":")[0];
  const cleanRoot = rootDomain.toLowerCase().split(":")[0];

  if (cleanHost === "localhost" || cleanHost === cleanRoot || cleanHost === `www.${cleanRoot}`) {
    return null;
  }

  if (cleanHost.endsWith(".localhost")) {
    const slug = cleanHost.slice(0, -".localhost".length).split(".").at(-1);
    return slug && !RESERVED_SUBDOMAINS.has(slug) ? slug : null;
  }

  if (!cleanHost.endsWith(`.${cleanRoot}`)) {
    return null;
  }

  const slug = cleanHost.slice(0, -(cleanRoot.length + 1)).split(".").at(-1);
  return slug && !RESERVED_SUBDOMAINS.has(slug) ? slug : null;
}

export function tenantWhere(siteId: string) {
  if (!siteId.trim()) {
    throw new Error("siteId is required for every tenant query");
  }

  return { siteId };
}

export function assertTenantAccess(tokenSiteId: string | null, resolvedSiteId: string) {
  if (!tokenSiteId || tokenSiteId !== resolvedSiteId) {
    throw new Error("Cross-tenant access denied");
  }

  return true;
}
