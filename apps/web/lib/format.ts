import type { PropertyType } from "@/lib/types";

export function formatPrice(price: number, type?: PropertyType) {
  if (type === "RENTAL") {
    return `${new Intl.NumberFormat("vi-VN").format(price)} đ/tháng`;
  }

  if (price >= 1_000_000_000) {
    const value = price / 1_000_000_000;
    return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
  }

  return `${new Intl.NumberFormat("vi-VN").format(price)} đ`;
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  LAND: "Đất",
  HOUSE: "Nhà ở",
  APARTMENT: "Căn hộ",
  RENTAL: "Cho thuê",
};
