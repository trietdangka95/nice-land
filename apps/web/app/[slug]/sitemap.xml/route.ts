import { getTenantPosts, getTenantSite } from "@/lib/server-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const site = await getTenantSite(slug);
  if (!site) return new Response("Not found", { status: 404 });
  const posts = await getTenantPosts(slug, site.id, { limit: 50 });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
  const urls = [
    `<url><loc>${base}/${slug}</loc></url>`,
    ...posts.items.map(
      (post) =>
        `<url><loc>${base}/${slug}/posts/${post.slug ?? post.id}</loc><lastmod>${new Date(post.createdAt).toISOString()}</lastmod></url>`,
    ),
  ].join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
