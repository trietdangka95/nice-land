import type { SubscriptionPlan } from "@nice-land/contracts";

export type PublicPlan = SubscriptionPlan & { siteCount: number };

export const trialPlanTemplate: PublicPlan = {
  id: "trial",
  name: "Trải nghiệm",
  code: "TRIAL",
  maxPosts: 10,
  maxImagesPerPost: 3,
  price: 0,
  durationDays: 14,
  isActive: true,
  isPopular: false,
  siteCount: 0,
};

export function ensureTrialPlan(plans: PublicPlan[]) {
  return plans.some((plan) => plan.code === "TRIAL")
    ? plans
    : [trialPlanTemplate, ...plans];
}
