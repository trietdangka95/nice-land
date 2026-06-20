import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Facebook, Mail, MapPin, Maximize2, Phone, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { TenantHeader } from "@/components/tenant-header";
import { getTenantPost, getTenantSite } from "@/lib/server-api";
import { formatPrice, propertyTypeLabels } from "@/lib/format";
import { PropertyEngagement } from "@/components/property-engagement";
import { TrackedContactLink } from "@/components/tracked-contact-link";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const site = await getTenantSite(slug);
  const post = site ? await getTenantPost(slug, site.id, id) : undefined;
  return {
    title: post?.title ?? "Chi tiết bất động sản",
    description: post?.description.slice(0, 155),
    alternates: { canonical: `${appUrl}/${slug}/posts/${post?.slug ?? id}` },
    openGraph: post
      ? { title: post.title, description: post.description.slice(0, 155), url: `${appUrl}/${slug}/posts/${post.slug ?? id}`, images: [post.images[0]] }
      : undefined,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const site = await getTenantSite(slug);
  if (!site || !site.isActive || site.subscriptionStatus === "EXPIRED") notFound();
  const post = await getTenantPost(slug, site.id, id);
  if (!post) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: post.title,
    description: post.description,
    url: `${appUrl}/${slug}/posts/${post.slug ?? id}`,
    image: post.images,
    address: {
      "@type": "PostalAddress",
      streetAddress: post.address,
      addressLocality: post.district,
      addressRegion: post.province,
      addressCountry: "VN",
    },
    offers: {
      "@type": "Offer",
      price: post.price,
      priceCurrency: "VND",
    },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <TenantHeader site={site} />
      <div className="page-shell py-7">
        <Link href={`/${slug}#properties`} className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink">
          <ArrowLeft size={16} />
          Trở lại danh sách
        </Link>
      </div>

      <section className="page-shell">
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]" data-reveal="soft">
          <div className="relative min-h-[380px] overflow-hidden md:min-h-[570px]">
            <Image
              src={post.images[0]}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 65vw"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            {(post.images.slice(1, 3).length ? post.images.slice(1, 3) : [post.images[0], post.images[0]]).map(
              (image, index) => (
                <div key={`${image}-${index}`} className="relative min-h-44 overflow-hidden md:min-h-0">
                  <Image src={image} alt={`${post.title} - ảnh ${index + 2}`} fill className="object-cover" sizes="35vw" />
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-12 py-14 lg:grid-cols-[1fr_360px]">
        <article data-reveal="left">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[var(--tenant-color)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-white">
              {propertyTypeLabels[post.type]}
            </span>
            <span className="text-xs font-semibold text-ink/45">Mã tin: {post.id.toUpperCase()}</span>
          </div>
          <h1 className="mt-5 max-w-4xl text-balance font-display text-4xl font-medium leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink/55">
            <MapPin size={17} className="text-[var(--tenant-color)]" />
            {post.address}, {post.district}, {post.province}
          </p>
          <div className="mt-8 flex flex-wrap gap-8 border-y border-ink/10 py-6">
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink/40">Mức giá</span>
              <strong className="mt-1 block font-display text-3xl text-[var(--tenant-color)]">
                {formatPrice(post.price, post.type)}
              </strong>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink/40">Diện tích</span>
              <strong className="mt-1 flex items-center gap-2 font-display text-3xl">
                <Maximize2 size={20} /> {post.area} m²
              </strong>
            </div>
          </div>
          <div className="py-9">
            <h2 className="font-display text-3xl font-medium">Thông tin chi tiết</h2>
            <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-ink/65">
              {post.description}
              {"\n\n"}
              Bất động sản được đội ngũ {site.name} khảo sát trực tiếp. Thông tin quy hoạch, pháp lý và
              lịch xem nhà sẽ được chuyên viên phụ trách xác nhận trước buổi hẹn.
            </p>
          </div>
          <div className="border-t border-ink/10 pt-8">
            <h2 className="font-display text-3xl font-medium">Vị trí bất động sản</h2>
            <div className="mt-5 grid min-h-64 place-items-center bg-[#dbe1d7] text-center">
              <div>
                <MapPin className="mx-auto text-[var(--tenant-color)]" size={34} />
                <p className="mt-3 font-bold">{post.address}</p>
                <p className="mt-1 text-sm text-ink/50">{post.ward}, {post.district}, {post.province}</p>
              </div>
            </div>
          </div>
        </article>

        <aside data-reveal="right">
          <div className="sticky top-6 border border-ink/10 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tenant-color)]">Chuyên viên phụ trách</p>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid size-14 place-items-center rounded-full bg-[var(--tenant-color)] font-display text-xl text-white">
                MP
              </div>
              <div>
                <strong className="font-display text-xl">Minh Phát</strong>
                <p className="mt-1 text-xs text-ink/45">Tư vấn bất động sản Đà Nẵng</p>
              </div>
            </div>
            <TrackedContactLink slug={slug} postId={post.id} source="PHONE_CLICK" href={`tel:${site.phone.replace(/\s/g, "")}`} className="mt-6 flex min-h-13 items-center justify-center gap-2 bg-[var(--tenant-color)] px-5 py-4 text-sm font-bold text-white">
              <Phone size={17} />
              Gọi {site.phone}
            </TrackedContactLink>
            {site.zaloPhone && (
              <TrackedContactLink slug={slug} postId={post.id} source="ZALO_CLICK" href={`https://zalo.me/${site.zaloPhone.replace(/\D/g, "")}`} className="mt-3 flex min-h-13 items-center justify-center gap-2 border border-[var(--tenant-color)] px-5 py-4 text-sm font-bold text-[var(--tenant-color)]">
                Nhắn Zalo
              </TrackedContactLink>
            )}
            <a href={`mailto:${site.email}`} className="mt-3 flex min-h-13 items-center justify-center gap-2 border border-ink/15 px-5 py-4 text-sm font-bold">
              <Mail size={17} />
              Gửi email
            </a>
            <PropertyEngagement slug={slug} postId={post.id} />
            <div className="mt-6 flex items-center justify-center gap-6 border-t border-ink/10 pt-5 text-ink/45">
              <button aria-label="Chia sẻ tin đăng"><Share2 size={18} /></button>
              <a href={site.facebookUrl} aria-label="Chia sẻ Facebook"><Facebook size={18} /></a>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
