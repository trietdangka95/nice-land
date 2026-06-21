import { describe, expect, it } from "vitest";
import {
  adminPostInputSchema,
  adminPostUpdateSchema,
} from "../src/index.js";

const validPost = {
  title: "Nhà phố gần sông Hàn",
  description:
    "Nhà phố ba tầng có không gian thoáng, vị trí đẹp và pháp lý rõ ràng.",
  type: "HOUSE",
  price: 8_500_000_000,
  area: 120,
  address: "Lê Đình Dương",
  province: "Đà Nẵng",
  district: "Hải Châu",
  ward: "Phước Ninh",
  bedrooms: 3,
  bathrooms: 3,
  status: "DRAFT",
} as const;

describe("admin post validation", () => {
  it("trims text and coerces numeric form values", () => {
    const result = adminPostInputSchema.parse({
      ...validPost,
      title: "  Nhà phố gần sông Hàn  ",
      price: "8500000000",
      area: "120",
      bedrooms: "3",
      bathrooms: "3",
    });

    expect(result).toMatchObject({
      title: "Nhà phố gần sông Hàn",
      price: 8_500_000_000,
      area: 120,
      bedrooms: 3,
      bathrooms: 3,
    });
  });

  it.each([
    ["title shorter than five characters", { title: "Nhà" }],
    ["description shorter than twenty characters", { description: "Mô tả ngắn" }],
    ["unsupported property type", { type: "HOTEL" }],
    ["negative price", { price: -1 }],
    ["zero area", { area: 0 }],
    ["fractional bedrooms", { bedrooms: 2.5 }],
    ["archived status from an editor", { status: "ARCHIVED" }],
    ["address longer than 250 characters", { address: "a".repeat(251) }],
    ["province longer than 120 characters", { province: "a".repeat(121) }],
  ])("rejects %s", (_caseName, invalidChange) => {
    const result = adminPostInputSchema.safeParse({
      ...validPost,
      ...invalidChange,
    });

    expect(result.success).toBe(false);
  });

  it("defaults a new post to draft", () => {
    const { status } = adminPostInputSchema.parse({
      ...validPost,
      status: undefined,
    });

    expect(status).toBe("DRAFT");
  });

  it("requires a positive integer version for updates", () => {
    expect(
      adminPostUpdateSchema.safeParse({ title: validPost.title }).success,
    ).toBe(false);
    expect(
      adminPostUpdateSchema.safeParse({
        title: validPost.title,
        version: 0,
      }).success,
    ).toBe(false);
    expect(
      adminPostUpdateSchema.safeParse({
        title: validPost.title,
        version: 2,
      }).success,
    ).toBe(true);
  });
});
