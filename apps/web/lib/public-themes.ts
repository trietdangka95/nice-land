import type { PublicTheme } from "@nice-land/contracts";

export interface PublicThemeDefinition {
  key: PublicTheme;
  name: string;
  description: string;
  direction: string;
  previewClassName: string;
  stylesheetHref: string;
  homeRenderer: "personal-broker" | "cold-modern";
  thumbnailRenderer: "personal-broker" | "cold-modern";
  headerComposition: "personal-signature" | "cold-architectural";
  footerComposition: "personal-contact" | "cold-grid";
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

export const publicThemes: readonly PublicThemeDefinition[] = [
  {
    key: "WARM_MINIMAL",
    name: "Personal Broker",
    description: "Đặt uy tín và câu chuyện của môi giới cá nhân ở vị trí trung tâm.",
    direction: "Personal realtor website gần gũi, giàu tín nhiệm và ưu tiên liên hệ trực tiếp.",
    previewClassName: "bg-[#f1e8dd] text-[#8b5a3c]",
    stylesheetHref: "/themes/warm-minimal.css",
    homeRenderer: "personal-broker",
    thumbnailRenderer: "personal-broker",
    headerComposition: "personal-signature",
    footerComposition: "personal-contact",
    fontStyle: "friendly",
    density: "airy",
    surfaces: requiredPublicThemeSurfaces,
  },
  {
    key: "COLD_MODERN",
    name: "Cold Modern",
    description: "Giao diện sắc nét với navy, cyan và bố cục kiến trúc cho listing cao cấp.",
    direction: "Modern real estate website lạnh, sắc cạnh, chuyên nghiệp và ưu tiên độ tin cậy.",
    previewClassName: "bg-[#e8f1f8] text-[#0b1d35]",
    stylesheetHref: "/themes/cold-modern.css",
    homeRenderer: "cold-modern",
    thumbnailRenderer: "cold-modern",
    headerComposition: "cold-architectural",
    footerComposition: "cold-grid",
    fontStyle: "geometric",
    density: "precise",
    surfaces: requiredPublicThemeSurfaces,
  },
] as const;

export function resolvePublicTheme(value: unknown): PublicTheme {
  if (value === "COLD_MODERN" || value === "WARM_MINIMAL") return value;
  return DEFAULT_PUBLIC_THEME;
}

export function getPublicTheme(value: unknown) {
  const key = resolvePublicTheme(value);
  return publicThemes.find((theme) => theme.key === key)!;
}

export function getPublicThemeStylesheet(value: unknown) {
  return getPublicTheme(value).stylesheetHref;
}

export function getPublicThemeDemoHref(
  theme: PublicTheme,
  slug = theme === "COLD_MODERN" ? "demo-cold" : "demo",
) {
  return `/${slug}`;
}
