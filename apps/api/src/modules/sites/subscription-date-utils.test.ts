import { describe, expect, it } from "vitest";
import {
  isSubscriptionExpired,
  resolveRenewalPeriod,
} from "./subscription-date-utils.js";

describe("isSubscriptionExpired", () => {
  it("keeps the site active through the full expiration day in Vietnam time", () => {
    expect(
      isSubscriptionExpired(
        "ACTIVE",
        new Date("2026-07-31T00:00:00.000Z"),
        new Date("2026-07-31T15:30:00.000Z"),
      ),
    ).toBe(false);
  });

  it("marks the site expired starting from the next Vietnam day", () => {
    expect(
      isSubscriptionExpired(
        "ACTIVE",
        new Date("2026-07-31T00:00:00.000Z"),
        new Date("2026-07-31T17:30:00.000Z"),
      ),
    ).toBe(true);
  });
});

describe("resolveRenewalPeriod", () => {
  it("starts the renewed package on the day after the current package ends", () => {
    expect(
      resolveRenewalPeriod(
        new Date("2026-07-31T00:00:00.000Z"),
        30,
        new Date("2026-07-29T03:00:00.000Z"),
      ),
    ).toEqual({
      startsAt: new Date("2026-08-01T00:00:00.000Z"),
      endsAt: new Date("2026-08-30T00:00:00.000Z"),
    });
  });

  it("starts immediately when the previous package is already expired", () => {
    expect(
      resolveRenewalPeriod(
        new Date("2026-07-31T00:00:00.000Z"),
        30,
        new Date("2026-08-02T01:00:00.000Z"),
      ),
    ).toEqual({
      startsAt: new Date("2026-08-02T00:00:00.000Z"),
      endsAt: new Date("2026-08-31T00:00:00.000Z"),
    });
  });
});
