import { ColdFooter, ColdHeader } from "@/components/site/public-theme-home/cold-modern";
import { PersonalFooter, PersonalHeader } from "@/components/site/public-theme-home/chrome";
import { TenantHeader } from "@/components/site/tenant-header";
import { getPublicTheme } from "@/lib/public-themes";
import type { PublicTheme } from "@nice-land/contracts";

const headerCompositions = {
  "personal-signature": PersonalHeader,
  "cold-architectural": ColdHeader,
} as const;

const footerCompositions = {
  "personal-contact": PersonalFooter,
  "cold-grid": ColdFooter,
} as const;

const detailCompositions = {
  "personal-soft": {
    primaryActionClassName: "rounded-full bg-[var(--tenant-color)]",
    secondaryActionClassName: "rounded-full",
    tertiaryActionClassName: "rounded-full border-black/5 bg-[#f8f6f0] hover:bg-white",
  },
  "cold-sharp": {
    primaryActionClassName: "bg-[var(--tenant-color)]",
    secondaryActionClassName: "",
    tertiaryActionClassName: "border-ink/15",
  },
} as const;

const brokerIntroCompositions = {
  "personal-soft": {
    sectionClassName: "bg-[#fcfbf9] py-14 sm:py-16",
    containerClassName:
      "grid gap-6 rounded-[2.5rem] bg-white/90 p-6 shadow-[0_28px_70px_rgba(124,58,36,0.08)] sm:grid-cols-[240px_minmax(0,1fr)] sm:p-8",
    imageClassName:
      "h-56 w-full max-w-[240px] rounded-[2rem] object-cover",
    eyebrowClassName:
      "text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--tenant-color)]",
    eyebrowLabel: "Nguoi dong hanh cung ban",
    titleClassName:
      "mt-4 font-display text-3xl font-semibold tracking-tight text-[#2d1f18] sm:text-4xl",
    bodyClassName:
      "mt-4 max-w-3xl text-base leading-8 text-[#7a5a4e]",
  },
  "cold-sharp": {
    sectionClassName: "bg-[var(--cold-surface-2)] py-14 sm:py-16",
    containerClassName:
      "grid gap-6 border border-[var(--cold-border)] bg-white p-6 sm:grid-cols-[220px_minmax(0,1fr)] sm:p-8",
    imageClassName: "h-56 w-full max-w-[220px] object-cover",
    eyebrowClassName:
      "text-xs font-black uppercase tracking-[0.22em] text-[var(--cold-accent-dark)]",
    eyebrowLabel: "Lead advisor",
    titleClassName:
      "mt-4 text-3xl font-black tracking-tight text-[var(--cold-ink)] sm:text-4xl",
    bodyClassName:
      "mt-4 max-w-3xl text-base leading-8 text-[var(--cold-muted)]",
  },
} as const;

export function getPublicThemeHeaderComponent(theme: PublicTheme) {
  const definition = getPublicTheme(theme);
  return headerCompositions[definition.headerComposition] ?? TenantHeader;
}

export function getPublicThemeFooterComponent(theme: PublicTheme) {
  const definition = getPublicTheme(theme);
  return footerCompositions[definition.footerComposition] ?? null;
}

export function getPublicThemeDetailComposition(theme: PublicTheme) {
  const definition = getPublicTheme(theme);
  return detailCompositions[definition.detailComposition];
}

export function getPublicThemeBrokerIntroComposition(theme: PublicTheme) {
  const definition = getPublicTheme(theme);
  return brokerIntroCompositions[definition.detailComposition];
}
