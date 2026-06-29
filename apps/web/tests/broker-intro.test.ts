import { describe, expect, it } from "vitest";
import { hasBrokerIntroContent } from "@/components/site/broker-intro-section";
import { getPublicThemeBrokerIntroComposition } from "@/components/site/public-theme-composition";

describe("broker intro visibility", () => {
  it("renders only when avatar, name and bio are all present", () => {
    expect(
      hasBrokerIntroContent({
        brokerAvatar: "https://cdn.example.com/avatar.jpg",
        brokerName: "Nguyen Van A",
        brokerBio: "Mo ta day du",
      }),
    ).toBe(true);

    expect(
      hasBrokerIntroContent({
        brokerAvatar: "https://cdn.example.com/avatar.jpg",
        brokerName: "",
        brokerBio: "Mo ta day du",
      }),
    ).toBe(false);

    expect(
      hasBrokerIntroContent({
        brokerAvatar: "",
        brokerName: "Nguyen Van A",
        brokerBio: "Mo ta day du",
      }),
    ).toBe(false);
  });

  it("derives broker intro presentation from theme composition", () => {
    expect(
      getPublicThemeBrokerIntroComposition("WARM_MINIMAL").eyebrowLabel,
    ).toBe("Nguoi dong hanh cung ban");
    expect(
      getPublicThemeBrokerIntroComposition("COLD_MODERN").eyebrowLabel,
    ).toBe("Lead advisor");
  });
});
