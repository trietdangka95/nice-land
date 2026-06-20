import type { PropertyType } from "@/lib/types";
import type { PublicTheme } from "@nice-land/contracts";

export interface PublicPostUrlState {
  page: number;
  q?: string;
  type?: "ALL" | PropertyType;
  categoryId?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  themePreview?: PublicTheme;
}

export function buildPublicPostsHref(
  slug: string,
  state: PublicPostUrlState,
) {
  const search = new URLSearchParams();
  if (state.page > 1) search.set("page", String(state.page));
  if (state.q?.trim()) search.set("q", state.q.trim());
  if (state.type && state.type !== "ALL") search.set("type", state.type);
  if (state.categoryId) search.set("categoryId", state.categoryId);
  if (state.sort && state.sort !== "newest") search.set("sort", state.sort);
  if (state.themePreview) search.set("themePreview", state.themePreview);
  const suffix = search.size ? `?${search.toString()}` : "";
  return `/${slug}${suffix}#properties`;
}
