import type { PropertyType } from "@/lib/types";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

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
  HOUSE: "Căn liền thổ",
  APARTMENT: "Căn hộ",
  RENTAL: "Cho thuê",
};

export function formatVietnamDate(value: string | Date) {
  return new Date(value).toLocaleDateString("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
  });
}
