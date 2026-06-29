import type { PublicTheme } from "@nice-land/contracts";
import { ColdModernHome } from "./cold-modern";
import { PersonalBrokerHome } from "./personal-broker";

export function getPublicThemeHomeRenderer(theme: PublicTheme) {
  if (theme === "COLD_MODERN") return ColdModernHome;
  return PersonalBrokerHome;
}

export type { PublicThemeHomeProps } from "./types";
