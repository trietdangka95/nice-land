import type { Metadata } from "next";
import { ChevronLeft, Facebook, Mail, MapPin, Maximize2, Phone, Share2 } from "lucide-react";
import { TenantLink } from "@/components/shared/tenant-link";
import { notFound } from "next/navigation";
import { getTenantPost, getTenantSite } from "@/lib/server-api";
import { formatPrice, propertyTypeLabels } from "@/lib/format";
import { PropertyEngagement } from "@/components/site/property-engagement";
import { TrackedContactLink } from "@/components/site/tracked-contact-link";
import { resolvePublicTheme } from "@/lib/public-themes";
import { PublicThemeStylesheet } from "@/components/site/public-theme-stylesheet";
import { PropertyGallery } from "@/components/site/property-gallery";
import { BrokerIntroSection } from "@/components/site/broker-intro-section";
import {
  getPublicThemeDetailComposition,
  getPublicThemeFooterComponent,
  getPublicThemeHeaderComponent,
} from "@/components/site/public-theme-composition";

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
    title: post?.title ?? "Chi tiết tin đăng",
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
  const ThemeHeader = getPublicThemeHeaderComponent(renderedTheme);
  const ThemeFooter = getPublicThemeFooterComponent(renderedTheme);
  const detailComposition = getPublicThemeDetailComposition(renderedTheme);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: post.title,
    description: post.description,
    url: `${appUrl}/${slug}/posts/${post.slug ?? id}`,
    image: post.images,
    address: {
      "@type": "PostalAddress",
      streetAddress: "",
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
      <ThemeHeader site={site} />
      <div className="page-shell py-6">
        <TenantLink href="" slug={slug} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-ink/55 transition-colors hover:text-ink">
          <ChevronLeft size={16} />
          Trở lại danh sách
        </TenantLink>
      </div>

      <section className="tenant-detail-gallery page-shell">
        <PropertyGallery images={post.images} title={post.title} />
      </section>

      <section className="tenant-detail-layout page-shell grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="tenant-detail-content" data-reveal="left">
          <div className="flex flex-wrap items-center gap-3">
            <span className="tenant-detail-badge rounded-full bg-[var(--tenant-color)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
              {propertyTypeLabels[post.type]}
            </span>
            <span className="rounded-full border border-ink/10 bg-white/60 px-3 py-2 text-xs font-semibold text-ink/45">Mã tin: {post.id.toUpperCase()}</span>
          </div>
          <h1 className="tenant-detail-title mt-5 max-w-4xl text-balance font-display text-3xl font-semibold leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink/55">
            <MapPin size={17} className="tenant-detail-location-icon text-[var(--tenant-color)]" />
            {post.ward && `${post.ward}, `}{post.district}, {post.province}
          </p>
          <div className="tenant-detail-facts mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 shadow-[0_12px_36px_rgba(23,33,27,0.05)]">
              <span className="block text-xs uppercase tracking-wider text-ink/40">Mức giá</span>
              <strong className="tenant-detail-price mt-1 block font-display text-3xl text-[var(--tenant-color)]">
                {formatPrice(post.price, post.type)}
              </strong>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 shadow-[0_12px_36px_rgba(23,33,27,0.05)]">
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
              Tin đăng được đội ngũ {site.name} khảo sát trực tiếp. Thông tin quy hoạch, pháp lý và
              lịch xem thực tế sẽ được chuyên viên phụ trách xác nhận trước buổi hẹn.
            </p>
          </div>
          <div className="border-t border-ink/10 pt-8">
            <h2 className="font-display text-3xl font-medium">Vị trí tin đăng</h2>
            <div className="mt-5 h-[360px] w-full overflow-hidden rounded-3xl border border-ink/10 bg-[#dbe1d7] shadow-[0_18px_48px_rgba(23,33,27,0.08)]">
              <iframe
                title="Bản đồ vị trí"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${post.ward}, ${post.district}, ${post.province}`
                )}&output=embed`}
              />
            </div>
          </div>
        </article>

        <aside className="tenant-detail-aside" data-reveal="right">
          <div className="tenant-contact-card sticky top-24 border border-ink/10 bg-white p-6 shadow-soft transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <p className="tenant-detail-contact-label text-xs font-bold uppercase tracking-[0.18em] text-[var(--tenant-color)]">Chuyên viên phụ trách</p>
            <div className="mt-5 flex items-center gap-4">
              <div className="tenant-detail-contact-mark grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--tenant-color)] font-display text-xl text-white">
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
                  Tư vấn tin đăng tại {post.province}
                </p>
              </div>
            </div>
            <TrackedContactLink slug={slug} postId={post.id} source="PHONE_CLICK" href={`tel:${site.phone.replace(/\s/g, "")}`} className={`tenant-detail-primary-action mt-6 flex min-h-13 items-center justify-center gap-2 px-5 py-4 text-sm font-bold text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${detailComposition.primaryActionClassName}`}>
              <Phone size={17} />
              Gọi {site.phone}
            </TrackedContactLink>
            {site.zaloPhone && (
              <TrackedContactLink slug={slug} postId={post.id} source="ZALO_CLICK" href={`https://zalo.me/${site.zaloPhone.replace(/\D/g, "")}`} className={`tenant-detail-secondary-action mt-3 flex min-h-13 items-center justify-center gap-2 border border-[var(--tenant-color)] px-5 py-4 text-sm font-bold text-[var(--tenant-color)] transition-colors duration-200 hover:bg-[var(--tenant-color)] hover:text-white active:scale-[0.98] ${detailComposition.secondaryActionClassName}`}>
                Nhắn Zalo
              </TrackedContactLink>
            )}
            <a href={`mailto:${site.email}`} className={`tenant-detail-tertiary-action mt-3 flex min-h-13 items-center justify-center gap-2 border px-5 py-4 text-sm font-bold transition-colors duration-200 active:scale-[0.98] ${detailComposition.tertiaryActionClassName}`}>
              <Mail size={17} />
              Gửi email
            </a>
            <PropertyEngagement slug={slug} postId={post.id} />
            <div className="mt-6 flex items-center justify-center gap-6 border-t border-ink/10 pt-5 text-ink/45">
              <button className="tenant-detail-share-action transition-colors hover:text-[var(--tenant-color)]" aria-label="Chia sẻ tin đăng"><Share2 size={18} /></button>
              <a href={site.facebookUrl} className="tenant-detail-share-action transition-colors hover:text-[var(--tenant-color)]" aria-label="Chia sẻ Facebook"><Facebook size={18} /></a>
            </div>
          </div>
        </aside>
      </section>
      <BrokerIntroSection site={site} theme={renderedTheme} />
      {ThemeFooter ? <ThemeFooter site={site} /> : null}
    </main>
  );
}
