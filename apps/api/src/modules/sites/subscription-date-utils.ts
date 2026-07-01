const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const DAY_IN_MS = 86_400_000;

const vietnamDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: VIETNAM_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toDateKey(date: Date) {
  return vietnamDateFormatter.format(date);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
}

function addDays(dateKey: string, days: number) {
  return toDateKey(new Date(parseDateKey(dateKey).getTime() + days * DAY_IN_MS));
}

export function isSubscriptionExpired(
  subscriptionStatus: "TRIAL" | "ACTIVE" | "GRACE_PERIOD" | "EXPIRED" | "SUSPENDED",
  subscriptionEnd: Date | null,
  now: Date,
) {
  if (!subscriptionEnd) {
    return subscriptionStatus === "EXPIRED";
  }

  return toDateKey(now) > toDateKey(subscriptionEnd);
}

export function resolveRenewalPeriod(
  subscriptionEnd: Date | null,
  durationDays: number,
  now: Date,
) {
  const todayKey = toDateKey(now);
  const currentEndKey = subscriptionEnd ? toDateKey(subscriptionEnd) : null;
  const startsAtKey =
    currentEndKey && currentEndKey >= todayKey
      ? addDays(currentEndKey, 1)
      : todayKey;
  const endsAtKey = addDays(startsAtKey, Math.max(durationDays - 1, 0));

  return {
    startsAt: parseDateKey(startsAtKey),
    endsAt: parseDateKey(endsAtKey),
  };
}
