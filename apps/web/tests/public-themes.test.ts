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
  it("exposes warm and cold public themes", () => {
    expect(publicThemes.map((theme) => theme.key)).toEqual([
      "WARM_MINIMAL",
      "COLD_MODERN",
    ]);
  });

  it("falls back safely for unknown or missing theme keys", () => {
    expect(resolvePublicTheme("REMOVED_THEME")).toBe(DEFAULT_PUBLIC_THEME);
    expect(resolvePublicTheme(undefined)).toBe(DEFAULT_PUBLIC_THEME);
  });

  it("always resolves supported legacy theme keys to the default theme", () => {
    expect(resolvePublicTheme("EDITORIAL")).toBe(DEFAULT_PUBLIC_THEME);
  });

  it("requires feature-parity surfaces from every theme", () => {
    for (const theme of publicThemes) {
      expect(theme.surfaces).toEqual(requiredPublicThemeSurfaces);
    }
  });

  it("documents the supported typography and density direction", () => {
    expect(publicThemes[0]?.fontStyle).toBe("friendly");
    expect(publicThemes[0]?.density).toBe("airy");
  });

  it("uses the personal broker homepage and thumbnail composition", () => {
    expect(publicThemes[0]?.homeRenderer).toBe("personal-broker");
    expect(publicThemes[0]?.thumbnailRenderer).toBe("personal-broker");
  });

  it("uses the personal header and footer composition", () => {
    expect(publicThemes[0]?.headerComposition).toBe("personal-signature");
    expect(publicThemes[0]?.footerComposition).toBe("personal-contact");
  });

  it("documents the real-estate design direction", () => {
    expect(publicThemes.every((theme) => theme.direction.length > 20)).toBe(
      true,
    );
  });

  it("maps the default theme to the warm presentation stylesheet", () => {
    const stylesheets = publicThemes.map((theme) =>
      getPublicThemeStylesheet(theme.key),
    );
    expect(stylesheets).toEqual([
      "/themes/warm-minimal.css",
      "/themes/cold-modern.css",
    ]);
  });

  it("uses the default theme stylesheet for an unknown key", () => {
    expect(getPublicThemeStylesheet("REMOVED_THEME")).toBe(
      "/themes/warm-minimal.css",
    );
  });

  it("builds sample website URLs without visitor theme query state", () => {
    expect(getPublicThemeDemoHref("EDITORIAL")).toBe("/demo");
    expect(getPublicThemeDemoHref("WARM_MINIMAL", "anland")).toBe("/anland");
    expect(getPublicThemeDemoHref("COLD_MODERN")).toBe("/demo-cold");
  });

  it("resolves the cold modern theme independently", () => {
    expect(resolvePublicTheme("COLD_MODERN")).toBe("COLD_MODERN");
    expect(getPublicThemeStylesheet("COLD_MODERN")).toBe(
      "/themes/cold-modern.css",
    );
  });
});
