import type { PropertyPost, Site } from "@/lib/types";
import type { SubscriptionPlan } from "@nice-land/contracts";
import {
  isPublicThemeDemoSlug,
  resolvePublicTheme,
} from "@/lib/public-themes";
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
  if (isPublicThemeDemoSlug(slug)) return getMockSite(slug);
  return allowMockFallback ? getMockSite(slug) : undefined;
}

function tenantHost(slug: string) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "nice-land.id.vn";
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

function filterMockPosts(
  siteId: string,
  options: {
    q?: string;
    type?: PropertyPost["type"];
    province?: string;
    sort?: "newest" | "price_asc" | "price_desc";
  },
) {
  const keyword = options.q?.trim().toLowerCase();
  const province = options.province?.trim().toLowerCase();
  const items = getMockPosts(siteId).filter((post) => {
    if (options.type && post.type !== options.type) return false;
    if (province && post.province.toLowerCase() !== province) return false;
    if (!keyword) return true;

    return [post.title, post.description, post.address, post.district, post.province]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  return items.sort((left, right) => {
    if (options.sort === "price_asc") return left.price - right.price;
    if (options.sort === "price_desc") return right.price - left.price;
    return (
      new Date(right.createdAt).getTime() -
      new Date(left.createdAt).getTime()
    );
  });
}

export async function getTenantSite(slug: string): Promise<Site | undefined> {
  const fallback = mockSite(slug);
  if (isPublicThemeDemoSlug(slug) && fallback) {
    return fallback;
  }

  try {
    const response = await tenantFetch(slug, "/v1/public/site");
    if (response.status === 402 || response.status === 403) {
      if (fallback) {
        return {
          ...fallback,
          isActive: false,
          subscriptionStatus:
            response.status === 402 ? "EXPIRED" : fallback.subscriptionStatus,
        };
      }
      return {
        id: `inactive-${slug}`,
        name: "Website tin đăng",
        slug,
        tagline: "",
        logoMark: "WT",
        brokerAvatar: undefined,
        brokerName: undefined,
        brokerBio: undefined,
        themeKey: resolvePublicTheme("warm-minimal"),
        themeColor: "#315c45",
        phone: "",
        email: "",
        address: "",
        isActive: false,
        subscriptionStatus: response.status === 402 ? "EXPIRED" : "SUSPENDED",
        subscriptionEnd: "",
        plan: "",
        createdAt: new Date().toISOString(),
      };
    }
    if (!response.ok) return fallback;
    const site = (await response.json()) as {
      id: string;
      name: string;
      slug: string;
      tagline: string | null;
      logo: string | null;
      banner: string | null;
      brokerAvatar: string | null;
      brokerName: string | null;
      brokerBio: string | null;
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
      brokerAvatar: site.brokerAvatar ?? undefined,
      brokerName: site.brokerName ?? undefined,
      brokerBio: site.brokerBio ?? undefined,
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
    province?: string;
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
  if (options.province) query.set("province", options.province);
  if (options.sort) query.set("sort", options.sort);

  if (isPublicThemeDemoSlug(slug)) {
    const items = filterMockPosts(siteId, options);
    const page = options.page ?? 1;
    const limit = options.limit ?? 12;
    return {
      items: items.slice((page - 1) * limit, page * limit),
      total: items.length,
      page,
      limit,
      totalPages: items.length ? Math.ceil(items.length / limit) : 0,
    };
  }

  try {
    const response = await tenantFetch(slug, `/v1/public/posts?${query}`);
    if (!response.ok) {
      const items = allowMockFallback ? getMockPosts(siteId) : [];
      const page = options.page ?? 1;
      const limit = options.limit ?? 12;
      return {
        items: items.slice((page - 1) * limit, page * limit),
        total: items.length,
        page,
        limit,
        totalPages: items.length ? Math.ceil(items.length / limit) : 0,
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
    const page = options.page ?? 1;
    const limit = options.limit ?? 12;
    return {
      items: items.slice((page - 1) * limit, page * limit),
      total: items.length,
      page,
      limit,
      totalPages: items.length ? Math.ceil(items.length / limit) : 0,
    };
  }
}

export async function getTenantPost(
  slug: string,
  siteId: string,
  postId: string,
): Promise<PropertyPost | undefined> {
  if (isPublicThemeDemoSlug(slug)) {
    return getMockPost(siteId, postId);
  }

  try {
    const response = await tenantFetch(
      slug,
      `/v1/public/posts/${encodeURIComponent(postId)}`,
    );
    if (!response.ok) {
      return allowMockFallback ? getMockPost(siteId, postId) : undefined;
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
    return allowMockFallback ? getMockPost(siteId, postId) : undefined;
  }
}

export async function getPlatformStats(): Promise<{
  totalSites: number;
  totalPosts: number;
  totalThemes: number;
}> {
  try {
    const response = await fetch(`${apiUrl}/v1/public/stats`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return { totalSites: 0, totalPosts: 0, totalThemes: 0 };
    }
    return (await response.json()) as {
      totalSites: number;
      totalPosts: number;
      totalThemes: number;
    };
  } catch {
    return { totalSites: 0, totalPosts: 0, totalThemes: 0 };
  }
}

export async function getPublicPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await fetch(`${apiUrl}/v1/public/plans`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return [];
    }
    return (await response.json()) as SubscriptionPlan[];
  } catch {
    return [];
  }
}
