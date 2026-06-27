import type { PropertyPost, Site } from "@/lib/types";
import { resolvePublicTheme } from "@/lib/public-themes";
import {
  getPublicPost as getMockPost,
  getPublicPosts as getMockPosts,
  getSiteBySlug as getMockSite,
} from "@/lib/data";
import { getApiBaseUrl } from "@/lib/api-url";

const apiUrl = getApiBaseUrl();
const allowMockFallback =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

function mockSite(slug: string) {
  return allowMockFallback ? getMockSite(slug) : undefined;
}

function tenantHost(slug: string) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";
  return `${slug}.${rootDomain}`;
}

async function tenantFetch(slug: string, path: string) {
  return fetch(`${apiUrl}${path}`, {
    headers: { "X-Tenant-Host": tenantHost(slug) },
    next: { tags: [`tenant-${slug}`] },
  });
}

function logoMark(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export async function getTenantSite(slug: string): Promise<Site | undefined> {
  const fallback = mockSite(slug);
  try {
    const response = await tenantFetch(slug, "/v1/public/site");
    if (response.status === 402 || response.status === 403) {
      return fallback
        ? {
            ...fallback,
            isActive: false,
            subscriptionStatus:
              response.status === 402 ? "EXPIRED" : fallback.subscriptionStatus,
          }
        : undefined;
    }
    if (!response.ok) return fallback;
    const site = (await response.json()) as {
      id: string;
      name: string;
      slug: string;
      tagline: string | null;
      logo: string | null;
      banner: string | null;
      themeKey: string;
      themeColor: string | null;
      phone: string | null;
      email: string | null;
      address: string | null;
      facebookUrl: string | null;
      zaloPhone: string | null;
    };
    return {
      id: site.id,
      name: site.name,
      slug: site.slug,
      tagline: site.tagline ?? "",
      logoMark: logoMark(site.name),
      logo: site.logo ?? undefined,
      banner: site.banner ?? undefined,
      themeKey: resolvePublicTheme(site.themeKey),
      themeColor: site.themeColor ?? "#315c45",
      phone: site.phone ?? "",
      email: site.email ?? "",
      address: site.address ?? "",
      facebookUrl: site.facebookUrl ?? undefined,
      zaloPhone: site.zaloPhone ?? undefined,
      isActive: true,
      subscriptionStatus: "ACTIVE",
      subscriptionEnd: fallback?.subscriptionEnd ?? "",
      plan: fallback?.plan ?? "",
      createdAt: fallback?.createdAt ?? "",
    };
  } catch {
    return fallback;
  }
}

export async function getTenantPosts(
  slug: string,
  siteId: string,
  options: {
    page?: number;
    limit?: number;
    q?: string;
    type?: PropertyPost["type"];
    categoryId?: string;
    sort?: "newest" | "price_asc" | "price_desc";
  } = {},
): Promise<{
  items: PropertyPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 12),
  });
  if (options.q) query.set("q", options.q);
  if (options.type) query.set("type", options.type);
  if (options.categoryId) query.set("categoryId", options.categoryId);
  if (options.sort) query.set("sort", options.sort);

  try {
    const response = await tenantFetch(slug, `/v1/public/posts?${query}`);
    if (!response.ok) {
      const items = allowMockFallback ? getMockPosts(siteId) : [];
      return {
        items,
        total: items.length,
        page: 1,
        limit: items.length || (options.limit ?? 12),
        totalPages: items.length ? 1 : 0,
      };
    }
    const data = (await response.json()) as {
      items: Array<{
        id: string;
        slug: string;
        title: string;
        type: PropertyPost["type"];
        price: string | null;
        area: number | null;
        address: string | null;
        province: string | null;
        district: string | null;
        status: PropertyPost["status"];
        publishedAt: string | null;
        mainImage: string | null;
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    return {
      items: data.items.map((post) => ({
        id: post.id,
        slug: post.slug,
        siteId,
        title: post.title,
        description: "",
        type: post.type,
        price: Number(post.price ?? 0),
        area: post.area ?? 0,
        address: post.address ?? "",
        province: post.province ?? "",
        district: post.district ?? "",
        ward: "",
        status: post.status,
        images: post.mainImage
          ? [post.mainImage]
          : [
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
            ],
        createdAt: post.publishedAt ?? "",
      })),
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    };
  } catch {
    const items = allowMockFallback ? getMockPosts(siteId) : [];
    return {
      items,
      total: items.length,
      page: 1,
      limit: items.length || (options.limit ?? 12),
      totalPages: items.length ? 1 : 0,
    };
  }
}

export async function getTenantPost(
  slug: string,
  siteId: string,
  id: string,
): Promise<PropertyPost | undefined> {
  try {
    const response = await tenantFetch(
      slug,
      `/v1/public/posts/${encodeURIComponent(id)}`,
    );
    if (!response.ok) {
      return allowMockFallback ? getMockPost(siteId, id) : undefined;
    }
    const post = (await response.json()) as {
      id: string;
      slug: string;
      title: string;
      description: string;
      type: PropertyPost["type"];
      price: string | null;
      area: number | null;
      address: string | null;
      province: string | null;
      district: string | null;
      ward: string | null;
      latitude: number | null;
      longitude: number | null;
      status: PropertyPost["status"];
      publishedAt: string | null;
      images: Array<{ url: string }>;
    };
    return {
      id: post.id,
      slug: post.slug,
      siteId,
      title: post.title,
      description: post.description,
      type: post.type,
      price: Number(post.price ?? 0),
      area: post.area ?? 0,
      address: post.address ?? "",
      province: post.province ?? "",
      district: post.district ?? "",
      ward: post.ward ?? "",
      latitude: post.latitude ?? undefined,
      longitude: post.longitude ?? undefined,
      status: post.status,
      images: post.images.map((image) => image.url),
      createdAt: post.publishedAt ?? "",
    };
  } catch {
    return allowMockFallback ? getMockPost(siteId, id) : undefined;
  }
}
