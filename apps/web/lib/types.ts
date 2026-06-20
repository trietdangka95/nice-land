export type PropertyType = "LAND" | "HOUSE" | "APARTMENT" | "RENTAL";
export type PostStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "SOLD";
export type SubscriptionStatus = "ACTIVE" | "TRIAL" | "EXPIRED";

export interface Site {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoMark: string;
  logo?: string;
  banner?: string;
  themeColor: string;
  phone: string;
  email: string;
  address: string;
  facebookUrl?: string;
  zaloPhone?: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEnd: string;
  plan: string;
  createdAt: string;
}

export interface PropertyPost {
  id: string;
  slug?: string;
  siteId: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  area: number;
  address: string;
  province: string;
  district: string;
  ward: string;
  latitude?: number;
  longitude?: number;
  status: PostStatus;
  images: string[];
  featured?: boolean;
  createdAt: string;
}
