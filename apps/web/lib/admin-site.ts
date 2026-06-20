import type { SiteSettings } from "@datcuatoi/contracts";

export interface AdminSiteIdentity {
  id: string;
  name: string;
  slug: string;
  logoMark: string;
}

function logoMark(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function siteSettingsToAdminIdentity(
  settings: SiteSettings,
): AdminSiteIdentity {
  return {
    id: settings.id,
    name: settings.name,
    slug: settings.slug,
    logoMark: logoMark(settings.name),
  };
}
