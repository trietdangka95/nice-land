import type { PublicTheme } from "@nice-land/contracts";
import { getPublicTheme } from "@/lib/public-themes";
import { LuxuryShowcaseHome } from "./luxury-showcase";
import { PersonalBrokerHome } from "./personal-broker";
import { PropertyEditorialHome } from "./property-editorial";
import { SearchFirstHome } from "./search-first";

const homeRenderers = {
  "luxury-showcase": LuxuryShowcaseHome,
  "search-first": SearchFirstHome,
  "property-editorial": PropertyEditorialHome,
  "personal-broker": PersonalBrokerHome,
};

export function getPublicThemeHomeRenderer(theme: PublicTheme) {
  return homeRenderers[getPublicTheme(theme).homeRenderer];
}

export type { PublicThemeHomeProps } from "./types";
