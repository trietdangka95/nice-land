import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { PublicThemeStylesheet } from "@/components/public-theme-stylesheet";
import { getPublicThemeHomeRenderer } from "@/components/public-theme-home";
import { getTenantPosts, getTenantSite } from "@/lib/server-api";
import { resolvePublicTheme } from "@/lib/public-themes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await getTenantSite(slug);
  const canonical = `${
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002"
  }/${slug}`;

  return {
    title: site?.name ?? "Website bất động sản",
    description: site?.tagline,
    alternates: { canonical },
    openGraph: site
      ? {
          title: site.name,
          description: site.tagline,
          url: canonical,
          images: site.banner ? [site.banner] : undefined,
        }
      : undefined,
  };
}

export default async function TenantHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const site = await getTenantSite(slug);
  if (!site) notFound();

  if (!site.isActive || site.subscriptionStatus === "EXPIRED") {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-center">
        <div className="max-w-lg">
          <span className="mx-auto grid size-16 place-items-center bg-amber-100 text-amber-700">
            <ShieldCheck size={30} />
          </span>
          <h1 className="mt-6 font-display text-4xl">
            Website đang tạm ngưng hoạt động
          </h1>
          <p className="mt-4 leading-7 text-ink/60">
            Vui lòng liên hệ chủ website hoặc Nice Land để biết thêm thông tin.
          </p>
          <Link href="/" className="button-primary mt-7">
            Về trang Nice Land
          </Link>
        </div>
      </main>
    );
  }

  const rawPage = Number(
    Array.isArray(queryParams.page) ? queryParams.page[0] : queryParams.page,
  );
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const q = String(
    Array.isArray(queryParams.q)
      ? queryParams.q[0] ?? ""
      : queryParams.q ?? "",
  ).slice(0, 120);
  const typeValue = Array.isArray(queryParams.type)
    ? queryParams.type[0]
    : queryParams.type;
  const type = ["LAND", "HOUSE", "APARTMENT", "RENTAL"].includes(
    typeValue ?? "",
  )
    ? (typeValue as "LAND" | "HOUSE" | "APARTMENT" | "RENTAL")
    : undefined;
  const categoryIdValue = Array.isArray(queryParams.categoryId)
    ? queryParams.categoryId[0]
    : queryParams.categoryId;
  const categoryId =
    typeof categoryIdValue === "string" &&
    /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(categoryIdValue)
      ? categoryIdValue
      : undefined;
  const sortValue = Array.isArray(queryParams.sort)
    ? queryParams.sort[0]
    : queryParams.sort;
  const sort = ["newest", "price_asc", "price_desc"].includes(sortValue ?? "")
    ? (sortValue as "newest" | "price_asc" | "price_desc")
    : "newest";
  const previewValue = Array.isArray(queryParams.themePreview)
    ? queryParams.themePreview[0]
    : queryParams.themePreview;
  const renderedTheme = resolvePublicTheme(previewValue ?? site.themeKey);
  const themePreview =
    typeof previewValue === "string"
      ? resolvePublicTheme(previewValue)
      : undefined;

  const [listing, featuredListing] = await Promise.all([
    getTenantPosts(slug, site.id, {
      page,
      limit: 9,
      q: q || undefined,
      type,
      categoryId,
      sort,
    }),
    getTenantPosts(slug, site.id, { page: 1, limit: 1 }),
  ]);
  const featured = featuredListing.items[0];
  if (!featured) notFound();

  const ThemeHome = getPublicThemeHomeRenderer(renderedTheme);

  return (
    <main
      className="tenant-public"
      data-public-theme={renderedTheme}
      style={{ "--tenant-color": site.themeColor } as React.CSSProperties}
    >
      <PublicThemeStylesheet theme={renderedTheme} />
      <ThemeHome
        site={site}
        featured={featured}
        posts={listing.items}
        total={listing.total}
        page={listing.page}
        totalPages={listing.totalPages}
        query={q}
        type={type}
        categoryId={categoryId}
        sort={sort}
        themePreview={themePreview}
      />
    </main>
  );
}
