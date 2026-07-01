import { Prisma, prisma } from "@nice-land/database";
import type {
  ListPublishedPostsInput,
  PublicPostDetail,
  PublicPostRepository,
  PublicPostSummary,
} from "./public-post-repository.js";

const summarySelect = {
  id: true,
  slug: true,
  title: true,
  featured: true,
  type: true,
  price: true,
  area: true,
  address: true,
  province: true,
  district: true,
  status: true,
  publishedAt: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { url: true },
    take: 1,
  },
} satisfies Prisma.PropertyPostSelect;

function mapSummary(
  post: Prisma.PropertyPostGetPayload<{ select: typeof summarySelect }>,
): PublicPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    featured: post.featured,
    type: post.type,
    price: post.price?.toString() ?? null,
    area: post.area,
    address: post.address,
    province: post.province,
    district: post.district,
    status: post.status as PublicPostSummary["status"],
    publishedAt: post.publishedAt,
    mainImage: post.images[0]?.url ?? null,
  };
}

export class PrismaPublicPostRepository implements PublicPostRepository {
  async listPublished(input: ListPublishedPostsInput) {
    const where: Prisma.PropertyPostWhereInput = {
      siteId: input.siteId,
      deletedAt: null,
      status: { in: ["PUBLISHED", "SOLD"] },
      ...(input.featured ? { featured: true } : {}),
      ...(input.type ? { type: input.type } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.province
        ? { province: { equals: input.province, mode: "insensitive" } }
        : {}),
      ...(input.district
        ? { district: { equals: input.district, mode: "insensitive" } }
        : {}),
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" } },
              { description: { contains: input.q, mode: "insensitive" } },
              { address: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.minPrice !== undefined || input.maxPrice !== undefined
        ? {
            price: {
              ...(input.minPrice !== undefined ? { gte: input.minPrice } : {}),
              ...(input.maxPrice !== undefined ? { lte: input.maxPrice } : {}),
            },
          }
        : {}),
      ...(input.minArea !== undefined || input.maxArea !== undefined
        ? {
            area: {
              ...(input.minArea !== undefined ? { gte: input.minArea } : {}),
              ...(input.maxArea !== undefined ? { lte: input.maxArea } : {}),
            },
          }
        : {}),
    };

    const orderBy: Prisma.PropertyPostOrderByWithRelationInput =
      input.sort === "price_asc"
        ? { price: "asc" }
        : input.sort === "price_desc"
          ? { price: "desc" }
          : { publishedAt: "desc" };

    const [posts, total] = await prisma.$transaction([
      prisma.propertyPost.findMany({
        where,
        select: summarySelect,
        orderBy,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.propertyPost.count({ where }),
    ]);

    return {
      items: posts.map(mapSummary),
      total,
    };
  }

  async findPublishedByIdOrSlug(
    siteId: string,
    idOrSlug: string,
  ): Promise<PublicPostDetail | null> {
    const post = await prisma.propertyPost.findFirst({
      where: {
        siteId,
        deletedAt: null,
        status: { in: ["PUBLISHED", "SOLD"] },
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: {
        ...summarySelect,
        description: true,
        ward: true,
        latitude: true,
        longitude: true,
        legalStatus: true,
        bedrooms: true,
        bathrooms: true,
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            altText: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!post) return null;

    return {
      ...mapSummary(post),
      description: post.description,
      ward: post.ward,
      latitude: post.latitude,
      longitude: post.longitude,
      legalStatus: post.legalStatus,
      bedrooms: post.bedrooms,
      bathrooms: post.bathrooms,
      images: post.images,
    };
  }
}
