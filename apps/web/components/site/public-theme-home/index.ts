import type { PublicTheme } from "@nice-land/contracts";
import { getPublicTheme } from "@/lib/public-themes";
import { ColdModernHome } from "./cold-modern";
import { PersonalBrokerHome } from "./personal-broker";

const homeRenderers = {
  "personal-broker": PersonalBrokerHome,
  "cold-modern": ColdModernHome,
} as const;

export function getPublicThemeHomeRenderer(theme: PublicTheme) {
  return homeRenderers[getPublicTheme(theme).homeRenderer];
}

export type { PublicThemeHomeProps } from "./types";
