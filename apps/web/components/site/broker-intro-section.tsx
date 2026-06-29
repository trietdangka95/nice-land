import type { PublicTheme } from "@/lib/types";
import type { Site } from "@/lib/types";
import { getPublicThemeBrokerIntroComposition } from "@/components/site/public-theme-composition";

export function hasBrokerIntroContent(
  site: Pick<Site, "brokerAvatar" | "brokerName" | "brokerBio">,
) {
  return Boolean(
    site.brokerAvatar?.trim() &&
      site.brokerName?.trim() &&
      site.brokerBio?.trim(),
  );
}

export function BrokerIntroSection({
  site,
  theme,
}: {
  site: Site;
  theme: PublicTheme;
}) {
  if (!hasBrokerIntroContent(site)) return null;
  const composition = getPublicThemeBrokerIntroComposition(theme);

  return (
    <section className={composition.sectionClassName} aria-labelledby="broker-intro-title">
      <div className="page-shell">
        <div className={composition.containerClassName}>
          <div className="flex items-start justify-center sm:justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.brokerAvatar}
              alt={site.brokerName}
              className={composition.imageClassName}
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className={composition.eyebrowClassName}>
              {composition.eyebrowLabel}
            </p>
            <h2 id="broker-intro-title" className={composition.titleClassName}>
              {site.brokerName}
            </h2>
            <p className={composition.bodyClassName}>
              {site.brokerBio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
