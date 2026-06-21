import type { PublicTheme } from "@nice-land/contracts";

export interface PublicThemeDefinition {
  key: PublicTheme;
  name: string;
  description: string;
  direction: string;
  previewClassName: string;
  stylesheetHref: string;
  homeRenderer: "luxury-showcase" | "search-first" | "property-editorial" | "personal-broker";
  thumbnailRenderer: "luxury-showcase" | "search-first" | "property-editorial" | "personal-broker";
  headerComposition: "overlay-luxury" | "portal-double-row" | "editorial-masthead" | "personal-signature";
  footerComposition: "private-advisory" | "portal-directory" | "magazine-colophon" | "personal-contact";
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
    name: "Luxury Showcase",
    description: "Sân khấu ảnh toàn màn hình cho biệt thự và bất động sản cao cấp.",
    direction: "Luxury brokerage với hero điện ảnh, chữ serif và nhịp nội dung có chọn lọc.",
    previewClassName: "bg-[#e7e2d7] text-[#315c45]",
    stylesheetHref: "/themes/classic-estate.css",
    homeRenderer: "luxury-showcase",
    thumbnailRenderer: "luxury-showcase",
    headerComposition: "overlay-luxury",
    footerComposition: "private-advisory",
    fontStyle: "heritage",
    density: "comfortable",
    surfaces: requiredPublicThemeSurfaces,
  },
  {
    key: "MODERN_GRID",
    name: "Search First",
    description: "Tìm kiếm nhanh, bộ lọc rõ và mật độ tin cao như một property portal.",
    direction: "Property portal lấy search làm trung tâm, card giàu dữ liệu và thao tác nhanh.",
    previewClassName: "bg-[#e8eef2] text-[#24405e]",
    stylesheetHref: "/themes/modern-grid.css",
    homeRenderer: "search-first",
    thumbnailRenderer: "search-first",
    headerComposition: "portal-double-row",
    footerComposition: "portal-directory",
    fontStyle: "contemporary",
    density: "compact",
    surfaces: requiredPublicThemeSurfaces,
  },
  {
    key: "EDITORIAL",
    name: "Property Editorial",
    description: "Bố cục tạp chí bất đối xứng dành cho bộ sưu tập tuyển chọn.",
    direction: "Real-estate magazine với typography thời trang và nhịp ảnh bất đối xứng.",
    previewClassName: "bg-[#1c1b19] text-[#d6a85f]",
    stylesheetHref: "/themes/editorial.css",
    homeRenderer: "property-editorial",
    thumbnailRenderer: "property-editorial",
    headerComposition: "editorial-masthead",
    footerComposition: "magazine-colophon",
    fontStyle: "editorial",
    density: "immersive",
    surfaces: requiredPublicThemeSurfaces,
  },
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

export function getPublicThemeDemoHref(
  theme: PublicTheme,
  slug = "minhphat",
) {
  return `/${slug}?themePreview=${theme}`;
}
