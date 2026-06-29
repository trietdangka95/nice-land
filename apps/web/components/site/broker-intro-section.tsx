import type { PublicTheme } from "@/lib/types";
import type { Site } from "@/lib/types";

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

  const isCold = theme === "COLD_MODERN";

  return (
    <section
      className={isCold ? "bg-[var(--cold-surface-2)] py-14 sm:py-16" : "bg-[#fcfbf9] py-14 sm:py-16"}
      aria-labelledby="broker-intro-title"
    >
      <div className="page-shell">
        <div
          className={
            isCold
              ? "grid gap-6 border border-[var(--cold-border)] bg-white p-6 sm:grid-cols-[220px_minmax(0,1fr)] sm:p-8"
              : "grid gap-6 rounded-[2.5rem] bg-white/90 p-6 shadow-[0_28px_70px_rgba(124,58,36,0.08)] sm:grid-cols-[240px_minmax(0,1fr)] sm:p-8"
          }
        >
          <div className="flex items-start justify-center sm:justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.brokerAvatar}
              alt={site.brokerName}
              className={
                isCold
                  ? "h-56 w-full max-w-[220px] object-cover"
                  : "h-56 w-full max-w-[240px] rounded-[2rem] object-cover"
              }
            />
          </div>
          <div className="flex flex-col justify-center">
            <p
              className={
                isCold
                  ? "text-xs font-black uppercase tracking-[0.22em] text-[var(--cold-accent-dark)]"
                  : "text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--tenant-color)]"
              }
            >
              {isCold ? "Lead advisor" : "Người đồng hành cùng bạn"}
            </p>
            <h2
              id="broker-intro-title"
              className={
                isCold
                  ? "mt-4 text-3xl font-black tracking-tight text-[var(--cold-ink)] sm:text-4xl"
                  : "mt-4 font-display text-3xl font-semibold tracking-tight text-[#2d1f18] sm:text-4xl"
              }
            >
              {site.brokerName}
            </h2>
            <p
              className={
                isCold
                  ? "mt-4 max-w-3xl text-base leading-8 text-[var(--cold-muted)]"
                  : "mt-4 max-w-3xl text-base leading-8 text-[#7a5a4e]"
              }
            >
              {site.brokerBio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
