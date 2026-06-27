import type { PublicTheme } from "@nice-land/contracts";
import type { PropertyPost, PropertyType, Site } from "@/lib/types";

export interface PublicThemeHomeProps {
  site: Site;
  featured: PropertyPost;
  posts: PropertyPost[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
  type?: PropertyType;
  categoryId?: string;
  sort: "newest" | "price_asc" | "price_desc";
  themePreview?: PublicTheme;
}

