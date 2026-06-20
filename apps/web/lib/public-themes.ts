import type { PublicTheme } from "@nice-land/contracts";

export interface PublicThemeDefinition {
  key: PublicTheme;
  name: string;
  description: string;
  previewClassName: string;
  stylesheetHref: string;
  fontStyle: "heritage" | "contemporary" | "editorial" | "friendly";
  density: "comfortable" | "compact" | "immersive" | "airy";
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

export const DEFAULT_PUBLIC_THEME: PublicTheme = "CLASSIC_ESTATE";

export const publicThemes: readonly PublicThemeDefinition[] = [
  {
    key: "CLASSIC_ESTATE",
    name: "Classic Estate",
    description: "Thanh lịch, cao cấp, phù hợp nhà phố và bất động sản giá trị lớn.",
    previewClassName: "bg-[#e7e2d7] text-[#315c45]",
    stylesheetHref: "/themes/classic-estate.css",
    fontStyle: "heritage",
    density: "comfortable",
    surfaces: requiredPublicThemeSurfaces,
  },
  {
    key: "MODERN_GRID",
    name: "Modern Grid",
    description: "Gọn, hiện đại, ưu tiên tìm kiếm và xem nhiều tin cùng lúc.",
    previewClassName: "bg-[#e8eef2] text-[#24405e]",
    stylesheetHref: "/themes/modern-grid.css",
    fontStyle: "contemporary",
    density: "compact",
    surfaces: requiredPublicThemeSurfaces,
  },
  {
    key: "EDITORIAL",
    name: "Editorial",
    description: "Ảnh lớn và bố cục tạp chí dành cho bộ sưu tập tuyển chọn.",
    previewClassName: "bg-[#1c1b19] text-[#d6a85f]",
    stylesheetHref: "/themes/editorial.css",
    fontStyle: "editorial",
    density: "immersive",
    surfaces: requiredPublicThemeSurfaces,
  },
  {
    key: "WARM_MINIMAL",
    name: "Warm Minimal",
    description: "Ấm áp, thoáng và gần gũi với thương hiệu môi giới cá nhân.",
    previewClassName: "bg-[#f1e8dd] text-[#8b5a3c]",
    stylesheetHref: "/themes/warm-minimal.css",
    fontStyle: "friendly",
    density: "airy",
    surfaces: requiredPublicThemeSurfaces,
  },
] as const;

const themeKeys = new Set<PublicTheme>(publicThemes.map((theme) => theme.key));

export function resolvePublicTheme(value: unknown): PublicTheme {
  return typeof value === "string" && themeKeys.has(value as PublicTheme)
    ? (value as PublicTheme)
    : DEFAULT_PUBLIC_THEME;
}

export function getPublicTheme(value: unknown) {
  const key = resolvePublicTheme(value);
  return publicThemes.find((theme) => theme.key === key)!;
}

export function getPublicThemeStylesheet(value: unknown) {
  return getPublicTheme(value).stylesheetHref;
}
