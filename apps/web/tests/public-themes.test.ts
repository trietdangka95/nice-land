import { describe, expect, it } from "vitest";
import {
  DEFAULT_PUBLIC_THEME,
  publicThemes,
  getPublicThemeStylesheet,
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
});
