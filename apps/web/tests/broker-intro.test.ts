import { describe, expect, it } from "vitest";
import { hasBrokerIntroContent } from "@/components/site/broker-intro-section";

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
});
