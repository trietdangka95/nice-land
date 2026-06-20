import { describe, expect, it } from "vitest";
import { findOrphanImageKeys } from "../src/jobs/cleanup-orphan-images.js";

describe("findOrphanImageKeys", () => {
  it("returns only unreferenced objects older than the grace period", () => {
    const now = new Date("2026-06-20T12:00:00.000Z");
    const result = findOrphanImageKeys({
      objects: [
        {
          key: "sites/site-a/posts/post-a/referenced.jpg",
          lastModified: new Date("2026-06-18T00:00:00.000Z"),
        },
        {
          key: "sites/site-a/posts/post-a/orphan.jpg",
          lastModified: new Date("2026-06-18T00:00:00.000Z"),
        },
        {
          key: "sites/site-a/posts/post-a/uploading.jpg",
          lastModified: new Date("2026-06-20T11:30:00.000Z"),
        },
      ],
      referencedKeys: new Set([
        "sites/site-a/posts/post-a/referenced.jpg",
      ]),
      now,
      gracePeriodMs: 24 * 60 * 60 * 1000,
    });

    expect(result).toEqual(["sites/site-a/posts/post-a/orphan.jpg"]);
  });

  it("ignores malformed or missing object keys", () => {
    const result = findOrphanImageKeys({
      objects: [
        { key: undefined, lastModified: new Date(0) },
        { key: "other/file.jpg", lastModified: new Date(0) },
      ],
      referencedKeys: new Set(),
      now: new Date("2026-06-20T00:00:00.000Z"),
      gracePeriodMs: 0,
    });

    expect(result).toEqual([]);
  });
});
