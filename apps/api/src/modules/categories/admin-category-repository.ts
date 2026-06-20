import type {
  PropertyCategory,
  PropertyCategoryInput,
} from "@datcuatoi/contracts";

export interface AdminCategoryRepository {
  list(siteId: string): Promise<PropertyCategory[]>;
  create(
    siteId: string,
    input: PropertyCategoryInput,
    userId?: string,
  ): Promise<PropertyCategory>;
  update(
    siteId: string,
    id: string,
    input: PropertyCategoryInput,
    userId?: string,
  ): Promise<PropertyCategory | null>;
  remove(siteId: string, id: string, userId?: string): Promise<boolean>;
}

export class CategoryInUseError extends Error {
  statusCode = 409;

  constructor() {
    super("Danh mục đang được sử dụng bởi tin đăng.");
    this.name = "CategoryInUseError";
  }
}

export class CategorySlugConflictError extends Error {
  statusCode = 409;

  constructor() {
    super("Đường dẫn danh mục đã tồn tại.");
    this.name = "CategorySlugConflictError";
  }
}
