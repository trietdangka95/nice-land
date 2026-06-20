import type { PublicTheme } from "@nice-land/contracts";
import { getPublicThemeStylesheet } from "@/lib/public-themes";

export function PublicThemeStylesheet({ theme }: { theme: PublicTheme }) {
  return (
    <link
      data-public-theme-stylesheet={theme}
      rel="stylesheet"
      href={getPublicThemeStylesheet(theme)}
    />
  );
}
