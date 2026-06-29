import type { PropertyPost, PropertyType, PublicTheme, Site } from "@/lib/types";

export interface PublicThemeHomeProps {
  site: Site;
  theme: PublicTheme;
  featured: PropertyPost;
  posts: PropertyPost[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
  type?: PropertyType;
  categoryId?: string;
  province?: string;
  sort: "newest" | "price_asc" | "price_desc";
}
