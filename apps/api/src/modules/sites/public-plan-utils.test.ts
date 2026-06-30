import { describe, expect, it } from "vitest";
import { ensureTrialPlan, trialPlanTemplate } from "./public-plan-utils.js";

describe("ensureTrialPlan", () => {
  it("prepends the default trial plan when it is missing", () => {
    const plans = ensureTrialPlan([
      {
        id: "starter",
        name: "Khởi đầu",
        code: "STARTER",
        maxPosts: 30,
        maxImagesPerPost: 10,
        price: 299000,
        durationDays: 30,
        isActive: true,
        siteCount: 4,
      },
    ]);

    expect(plans[0]).toMatchObject(trialPlanTemplate);
    expect(plans[1]?.code).toBe("STARTER");
  });

  it("keeps the existing trial plan when it already exists", () => {
    const plans = ensureTrialPlan([
      {
        ...trialPlanTemplate,
        siteCount: 2,
      },
    ]);

    expect(plans).toHaveLength(1);
    expect(plans[0]?.siteCount).toBe(2);
  });
});
