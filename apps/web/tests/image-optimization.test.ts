import { describe, expect, it } from "vitest";
import {
  calculateOptimizedDimensions,
  createOptimizedFileName,
  optimizeImageForUpload,
} from "@/lib/image-optimization";

describe("image optimization", () => {
  it("limits a landscape image to 1920 pixels on its longest edge", () => {
    expect(calculateOptimizedDimensions(4000, 3000)).toEqual({
      width: 1920,
      height: 1440,
    });
  });

  it("does not upscale an image that is already within the limit", () => {
    expect(calculateOptimizedDimensions(1200, 800)).toEqual({
      width: 1200,
      height: 800,
    });
  });

  it("uses a webp extension for optimized uploads", () => {
    expect(createOptimizedFileName("mat-tien.can-ho.JPG")).toBe(
      "mat-tien.can-ho.webp",
    );
  });

  it("encodes the resized image as webp", async () => {
    const original = new File(["large-image"], "listing.jpg", {
      type: "image/jpeg",
      lastModified: 123,
    });
    let canvasSize = { width: 0, height: 0 };

    const result = await optimizeImageForUpload(original, {
      decodeImage: async () =>
        ({ width: 4000, height: 3000 }) as unknown as ImageBitmap,
      createCanvas: (width, height) => {
        canvasSize = { width, height };
        return {
          getContext: () => ({ drawImage: () => undefined }),
          toBlob: (callback: BlobCallback) =>
            callback(new Blob(["webp"], { type: "image/webp" })),
        } as unknown as HTMLCanvasElement;
      },
    });

    expect(canvasSize).toEqual({ width: 1920, height: 1440 });
    expect(result.name).toBe("listing.webp");
    expect(result.type).toBe("image/webp");
    expect(result.lastModified).toBe(123);
  });

  it("falls back to the original file when browser conversion fails", async () => {
    const original = new File(["original"], "listing.jpg", {
      type: "image/jpeg",
    });

    const result = await optimizeImageForUpload(original, {
      decodeImage: async () => {
        throw new Error("Image decoder unavailable");
      },
    });

    expect(result).toBe(original);
  });
});
