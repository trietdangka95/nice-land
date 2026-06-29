import type { PublicTheme } from "@nice-land/contracts";

export interface PublicThemeDefinition {
  key: PublicTheme;
  preference: "warm" | "cold";
  preferenceLabel: string;
  name: string;
  description: string;
  direction: string;
  demoSlug: string;
  demoSiteId: string;
  demoDataSiteId: string;
  previewSwatches: [string, string, string, string];
  previewClassName: string;
  stylesheetHref: string;
  homeRenderer: "personal-broker" | "cold-modern";
  thumbnailRenderer: "personal-broker" | "cold-modern";
  headerComposition: "personal-signature" | "cold-architectural";
  footerComposition: "personal-contact" | "cold-grid";
  detailComposition: "personal-soft" | "cold-sharp";
  fontStyle: "friendly" | "geometric";
  density: "airy" | "precise";
  surfaces: readonly PublicThemeSurface[];
}

export const requiredPublicThemeSurfaces = [
  "header",
  "homepage",
  "listing",
  "propertyCard",
  "propertyDetail",
  "footer",
] as const;

export type PublicThemeSurface = (typeof requiredPublicThemeSurfaces)[number];

export const DEFAULT_PUBLIC_THEME: PublicTheme = "WARM_MINIMAL";

export const publicThemes = [
  {
    key: "WARM_MINIMAL",
    preference: "warm",
    preferenceLabel: "Warm",
    name: "Personal Broker",
    description: "Đặt uy tín và câu chuyện của môi giới cá nhân ở vị trí trung tâm.",
    direction: "Personal realtor website gần gũi, giàu tín nhiệm và ưu tiên liên hệ trực tiếp.",
    demoSlug: "demo",
    demoSiteId: "site-demo",
    demoDataSiteId: "site-demo",
    previewSwatches: ["bg-[#f1e8dd]", "bg-[#b25e43]", "bg-[#fffaf3]", "bg-[#ead5c4]"],
    previewClassName: "bg-[#f1e8dd] text-[#8b5a3c]",
    stylesheetHref: "/themes/warm-minimal.css",
    homeRenderer: "personal-broker",
    thumbnailRenderer: "personal-broker",
    headerComposition: "personal-signature",
    footerComposition: "personal-contact",
    detailComposition: "personal-soft",
    fontStyle: "friendly",
    density: "airy",
    surfaces: requiredPublicThemeSurfaces,
  },
  {
    key: "COLD_MODERN",
    preference: "cold",
    preferenceLabel: "Cold",
    name: "Cold Modern",
    description: "Giao diện sắc nét với navy, cyan và bố cục kiến trúc cho listing cao cấp.",
    direction: "Modern real estate website lạnh, sắc cạnh, chuyên nghiệp và ưu tiên độ tin cậy.",
    demoSlug: "demo-cold",
    demoSiteId: "site-demo-cold",
    demoDataSiteId: "site-demo",
    previewSwatches: ["bg-[#071a2f]", "bg-[#6ee7ff]", "bg-[#edf3f8]", "bg-[#d7e1ea]"],
    previewClassName: "bg-[#e8f1f8] text-[#0b1d35]",
    stylesheetHref: "/themes/cold-modern.css",
    homeRenderer: "cold-modern",
    thumbnailRenderer: "cold-modern",
    headerComposition: "cold-architectural",
    footerComposition: "cold-grid",
    detailComposition: "cold-sharp",
    fontStyle: "geometric",
    density: "precise",
    surfaces: requiredPublicThemeSurfaces,
  },
] as const satisfies readonly PublicThemeDefinition[];

const publicThemeMap = new Map(publicThemes.map((theme) => [theme.key, theme]));

const legacyPublicThemeAliases: Readonly<Record<string, PublicTheme>> = {
  CLASSIC_ESTATE: DEFAULT_PUBLIC_THEME,
  MODERN_GRID: DEFAULT_PUBLIC_THEME,
  EDITORIAL: DEFAULT_PUBLIC_THEME,
  WARM_MINIMAL: "WARM_MINIMAL",
  COLD_MODERN: "COLD_MODERN",
};

function normalizePublicThemeKey(value: string) {
  return value.trim().replace(/-/g, "_").toUpperCase();
}

export function resolvePublicTheme(value: unknown): PublicTheme {
  if (typeof value === "string") {
    const normalized = normalizePublicThemeKey(value);
    return legacyPublicThemeAliases[normalized] ?? DEFAULT_PUBLIC_THEME;
  }
  return DEFAULT_PUBLIC_THEME;
}

export function getPublicTheme(value: unknown) {
  const key = resolvePublicTheme(value);
  return publicThemeMap.get(key as (typeof publicThemes)[number]["key"])!;
}

export function getPublicThemeStylesheet(value: unknown) {
  return getPublicTheme(value).stylesheetHref;
}

export function getPublicThemeDemoHref(
  theme: unknown,
  slug: string = getPublicTheme(theme).demoSlug,
) {
  return `/${slug}`;
}

export function getPublicThemePreference(theme: unknown) {
  return getPublicTheme(theme).preference;
}

export function getPublicThemeByDemoSlug(slug: string) {
  return publicThemes.find((theme) => theme.demoSlug === slug);
}

export function isPublicThemeDemoSlug(slug: string) {
  return Boolean(getPublicThemeByDemoSlug(slug));
}

export function resolvePublicThemeDemoDataSiteId(siteId: string) {
  const theme = publicThemes.find((item) => item.demoSiteId === siteId);
  return theme?.demoDataSiteId ?? siteId;
}

export interface PublicThemePreferenceOption {
  preference: "warm" | "cold";
  label: string;
  description: string;
  themeKey: PublicTheme;
  previewSwatches: [string, string, string, string];
}

export function getPublicThemePreferenceOptions(): PublicThemePreferenceOption[] {
  const seen = new Set<string>();
  return publicThemes.flatMap((theme) => {
    if (seen.has(theme.preference)) return [];
    seen.add(theme.preference);
    return [{
      preference: theme.preference,
      label: theme.preferenceLabel,
      description: theme.description,
      themeKey: theme.key,
      previewSwatches: theme.previewSwatches,
    }];
  });
}

export function getPublicThemePreferenceLabel(
  preference: "warm" | "cold",
) {
  return (
    getPublicThemePreferenceOptions().find((item) => item.preference === preference)
      ?.label ?? preference
  );
}
