import type { PublicTheme } from "@nice-land/contracts";
import { PersonalBrokerHome } from "./personal-broker";

export function getPublicThemeHomeRenderer(_theme: PublicTheme) {
  return PersonalBrokerHome;
}

export type { PublicThemeHomeProps } from "./types";
