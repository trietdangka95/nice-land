import type {
  PostStatus,
  PropertyType,
  PublicPostListQuery,
} from "@nice-land/contracts";

export interface PublicPostSummary {
  id: string;
  slug: string;
  title: string;
  featured: boolean;
  type: PropertyType;
  price: string | null;
  area: number | null;
  address: string | null;
  province: string | null;
  district: string | null;
  status: Extract<PostStatus, "PUBLISHED" | "SOLD">;
  publishedAt: Date | null;
  mainImage: string | null;
}

export interface PublicPostDetail extends PublicPostSummary {
  description: string;
  ward: string | null;
  latitude: number | null;
  longitude: number | null;
  legalStatus: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>;
}

export interface ListPublishedPostsInput extends PublicPostListQuery {
  siteId: string;
}

export interface PublicPostRepository {
  listPublished(
    input: ListPublishedPostsInput,
  ): Promise<{ items: PublicPostSummary[]; total: number }>;
  findPublishedByIdOrSlug(
    siteId: string,
    idOrSlug: string,
  ): Promise<PublicPostDetail | null>;
}
