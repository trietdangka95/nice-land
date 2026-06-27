import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Facebook, Mail, MapPin, Maximize2, Phone, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { TenantHeader } from "@/components/site/tenant-header";
import { PersonalHeader, PersonalFooter } from "@/components/site/public-theme-home/chrome";
import { getTenantPost, getTenantSite } from "@/lib/server-api";
import { formatPrice, propertyTypeLabels } from "@/lib/format";
import { PropertyEngagement } from "@/components/site/property-engagement";
import { TrackedContactLink } from "@/components/site/tracked-contact-link";
import { resolvePublicTheme } from "@/lib/public-themes";
import { PublicThemeStylesheet } from "@/components/site/public-theme-stylesheet";

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
  const renderedTheme = resolvePublicTheme(site.themeKey);
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
    <main
      className="tenant-public tenant-detail"
      data-public-theme={renderedTheme}
      style={{ "--tenant-color": site.themeColor } as React.CSSProperties}
    >
      <PublicThemeStylesheet theme={renderedTheme} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {renderedTheme === "WARM_MINIMAL" ? <PersonalHeader site={site} /> : <TenantHeader site={site} />}
      <div className="tenant-detail-back page-shell py-7">
        <Link href={`/${slug}#properties`} className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink">
          <ArrowLeft size={16} />
          Trở lại danh sách
        </Link>
      </div>

      <section className="tenant-detail-gallery page-shell">
        <div className="tenant-detail-gallery-grid grid gap-3 md:grid-cols-[1.6fr_1fr]" data-reveal="soft">
          <div className="tenant-detail-main-image relative min-h-[380px] overflow-hidden md:min-h-[570px]">
            <Image
              src={post.images[0]}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 65vw"
            />
          </div>
          <div className="tenant-detail-thumbnails grid grid-cols-2 gap-3 md:grid-cols-1">
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

      <section className="tenant-detail-layout page-shell grid gap-12 py-14 lg:grid-cols-[1fr_360px]">
        <article className="tenant-detail-content" data-reveal="left">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[var(--tenant-color)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-white">
              {propertyTypeLabels[post.type]}
            </span>
            <span className="text-xs font-semibold text-ink/45">Mã tin: {post.id.toUpperCase()}</span>
          </div>
          <h1 className="tenant-detail-title mt-5 max-w-4xl text-balance font-display text-4xl font-medium leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink/55">
            <MapPin size={17} className="text-[var(--tenant-color)]" />
            {post.address}, {post.district}, {post.province}
          </p>
          <div className="tenant-detail-facts mt-8 flex flex-wrap gap-8 border-y border-ink/10 py-6">
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
            <div className="mt-5 h-[400px] w-full bg-[#dbe1d7]">
              <iframe
                title="Bản đồ vị trí"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${post.address}, ${post.ward}, ${post.district}, ${post.province}`
                )}&output=embed`}
              />
            </div>
          </div>
        </article>

        <aside className="tenant-detail-aside" data-reveal="right">
          <div className="tenant-contact-card sticky top-6 border border-ink/10 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tenant-color)]">Chuyên viên phụ trách</p>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--tenant-color)] font-display text-xl text-white">
                {site.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.logo}
                    alt={`Logo ${site.name}`}
                    className="size-full object-cover"
                  />
                ) : (
                  site.logoMark
                )}
              </div>
              <div>
                <strong className="font-display text-xl">{site.name}</strong>
                <p className="mt-1 text-xs text-ink/45">
                  Tư vấn bất động sản tại {post.province}
                </p>
              </div>
            </div>
            <TrackedContactLink slug={slug} postId={post.id} source="PHONE_CLICK" href={`tel:${site.phone.replace(/\s/g, "")}`} className={`mt-6 flex min-h-13 items-center justify-center gap-2 px-5 py-4 text-sm font-bold text-white transition-transform active:scale-[0.98] ${renderedTheme === "WARM_MINIMAL" ? "rounded-full bg-[var(--tenant-color)]" : "bg-[var(--tenant-color)]"}`}>
              <Phone size={17} />
              Gọi {site.phone}
            </TrackedContactLink>
            {site.zaloPhone && (
              <TrackedContactLink slug={slug} postId={post.id} source="ZALO_CLICK" href={`https://zalo.me/${site.zaloPhone.replace(/\D/g, "")}`} className={`mt-3 flex min-h-13 items-center justify-center gap-2 border border-[var(--tenant-color)] px-5 py-4 text-sm font-bold text-[var(--tenant-color)] transition-transform active:scale-[0.98] ${renderedTheme === "WARM_MINIMAL" ? "rounded-full" : ""}`}>
                Nhắn Zalo
              </TrackedContactLink>
            )}
            <a href={`mailto:${site.email}`} className={`mt-3 flex min-h-13 items-center justify-center gap-2 border px-5 py-4 text-sm font-bold transition-transform active:scale-[0.98] ${renderedTheme === "WARM_MINIMAL" ? "rounded-full border-black/5 bg-[#f8f6f0]" : "border-ink/15"}`}>
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
      {renderedTheme === "WARM_MINIMAL" && <PersonalFooter site={site} />}
    </main>
  );
}
