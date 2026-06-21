import { describe, expect, it } from "vitest";
import {
  DEFAULT_PUBLIC_THEME,
  publicThemes,
  getPublicThemeStylesheet,
  getPublicThemeDemoHref,
  requiredPublicThemeSurfaces,
  resolvePublicTheme,
} from "@/lib/public-themes";

describe("public theme registry", () => {
  it("exposes four unique supported themes", () => {
    expect(publicThemes).toHaveLength(4);
    expect(new Set(publicThemes.map((theme) => theme.key)).size).toBe(4);
  });

  it("falls back safely for unknown or missing theme keys", () => {
    expect(resolvePublicTheme("REMOVED_THEME")).toBe(DEFAULT_PUBLIC_THEME);
    expect(resolvePublicTheme(undefined)).toBe(DEFAULT_PUBLIC_THEME);
  });

  it("preserves a supported theme key", () => {
    expect(resolvePublicTheme("EDITORIAL")).toBe("EDITORIAL");
  });

  it("requires feature-parity surfaces from every theme", () => {
    for (const theme of publicThemes) {
      expect(theme.surfaces).toEqual(requiredPublicThemeSurfaces);
    }
  });

  it("gives every theme a distinct typography and density direction", () => {
    expect(new Set(publicThemes.map((theme) => theme.fontStyle)).size).toBe(4);
    expect(new Set(publicThemes.map((theme) => theme.density)).size).toBe(4);
  });

  it("gives every theme a distinct homepage and thumbnail composition", () => {
    expect(new Set(publicThemes.map((theme) => theme.homeRenderer)).size).toBe(
      4,
    );
    expect(
      new Set(publicThemes.map((theme) => theme.thumbnailRenderer)).size,
    ).toBe(4);
  });

  it("gives every theme a distinct header and footer composition", () => {
    expect(
      new Set(publicThemes.map((theme) => theme.headerComposition)).size,
    ).toBe(4);
    expect(
      new Set(publicThemes.map((theme) => theme.footerComposition)).size,
    ).toBe(4);
  });

  it("documents a distinct real-estate design direction for every theme", () => {
    expect(new Set(publicThemes.map((theme) => theme.direction)).size).toBe(4);
    expect(publicThemes.every((theme) => theme.direction.length > 20)).toBe(
      true,
    );
  });

  it("maps each theme to exactly one distinct presentation stylesheet", () => {
    const stylesheets = publicThemes.map((theme) =>
      getPublicThemeStylesheet(theme.key),
    );
    expect(new Set(stylesheets).size).toBe(4);
    expect(stylesheets).toEqual([
      "/themes/classic-estate.css",
      "/themes/modern-grid.css",
      "/themes/editorial.css",
      "/themes/warm-minimal.css",
    ]);
  });

  it("uses the default theme stylesheet for an unknown key", () => {
    expect(getPublicThemeStylesheet("REMOVED_THEME")).toBe(
      "/themes/classic-estate.css",
    );
  });

  it("builds a full sample website URL for landing-page previews", () => {
    expect(getPublicThemeDemoHref("EDITORIAL")).toBe(
      "/demo?themePreview=EDITORIAL",
    );
    expect(getPublicThemeDemoHref("WARM_MINIMAL", "anland")).toBe(
      "/anland?themePreview=WARM_MINIMAL",
    );
  });
});
