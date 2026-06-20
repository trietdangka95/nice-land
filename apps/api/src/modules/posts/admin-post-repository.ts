import type {
  AdminPostInput,
  AdminPostListQuery,
  AdminPostUpdate,
  PostStatus,
  PropertyType,
} from "@datcuatoi/contracts";

export interface AdminPostRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number | null;
  area: number | null;
  address: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  legalStatus: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  categoryId: string | null;
  status: PostStatus;
  version: number;
  viewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>;
}

export interface AdminPostMutationContext {
  siteId: string;
  userId: string;
}

export interface AdminPostRepository {
  list(
    input: AdminPostListQuery & { siteId: string },
  ): Promise<{ items: AdminPostRecord[]; total: number }>;
  findById(siteId: string, id: string): Promise<AdminPostRecord | null>;
  create(
    input: AdminPostInput,
    context: AdminPostMutationContext,
  ): Promise<AdminPostRecord>;
  update(
    siteId: string,
    id: string,
    input: AdminPostUpdate,
    context: AdminPostMutationContext,
  ): Promise<AdminPostRecord | null>;
  archive(
    siteId: string,
    id: string,
    version: number,
    context: AdminPostMutationContext,
  ): Promise<boolean>;
}

export class PostLimitError extends Error {
  statusCode = 409;

  constructor() {
    super("Gói hiện tại đã đạt giới hạn số lượng tin đăng.");
    this.name = "PostLimitError";
  }
}

export class InvalidPostCategoryError extends Error {
  statusCode = 400;

  constructor() {
    super("Danh mục không tồn tại trong website hiện tại.");
    this.name = "InvalidPostCategoryError";
  }
}
