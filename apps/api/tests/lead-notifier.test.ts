import { afterEach, describe, expect, it, vi } from "vitest";
import { ResendLeadNotifier } from "../src/modules/engagement/lead-notifier.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ResendLeadNotifier", () => {
  it("sends a lead notification without exposing the API key in payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const notifier = new ResendLeadNotifier(
      "resend-secret",
      "notifications@example.com",
    );

    await notifier.notify({
      recipient: "admin@example.com",
      siteName: "Minh Phát",
      postTitle: "Nhà phố ven sông",
      leadName: "Minh Anh",
      leadPhone: "0905123456",
      message: "Tôi muốn xem nhà",
    });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.headers.Authorization).toBe("Bearer resend-secret");
    expect(String(init.body)).not.toContain("resend-secret");
    expect(String(init.body)).toContain("0905123456");
  });

  it("throws when the provider rejects the request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("failed", { status: 500 })),
    );
    const notifier = new ResendLeadNotifier(
      "resend-secret",
      "notifications@example.com",
    );

    await expect(
      notifier.notify({
        recipient: "admin@example.com",
        siteName: "Minh Phát",
        postTitle: "Nhà phố ven sông",
        leadName: "Minh Anh",
        leadPhone: "0905123456",
      }),
    ).rejects.toThrow("Resend returned 500");
  });
});
