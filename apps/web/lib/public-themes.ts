import type { PublicTheme } from "@nice-land/contracts";

export interface PublicThemeDefinition {
  key: PublicTheme;
  name: string;
  description: string;
  direction: string;
  previewClassName: string;
  stylesheetHref: string;
  homeRenderer: "personal-broker";
  thumbnailRenderer: "personal-broker";
  headerComposition: "personal-signature";
  footerComposition: "personal-contact";
  fontStyle: "friendly";
  density: "airy";
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
] as const;

export function resolvePublicTheme(_value: unknown): PublicTheme {
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
  _theme: PublicTheme,
  slug = "demo",
) {
  return `/${slug}`;
}
