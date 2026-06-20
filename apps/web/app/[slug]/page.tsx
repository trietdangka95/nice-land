import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, CheckCircle2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { TenantHeader } from "@/components/tenant-header";
import { PropertyBrowser } from "@/components/property-browser";
import { getTenantPosts, getTenantSite } from "@/lib/server-api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await getTenantSite(slug);
  return {
    title: site?.name ?? "Website bất động sản",
    description: site?.tagline,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002"}/${slug}` },
    openGraph: site ? { title: site.name, description: site.tagline, url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002"}/${slug}`, images: site.banner ? [site.banner] : undefined } : undefined,
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
          <h1 className="mt-6 font-display text-4xl">Website đang tạm ngưng hoạt động</h1>
          <p className="mt-4 leading-7 text-ink/60">
            Vui lòng liên hệ chủ website hoặc Đất Của Tôi để biết thêm thông tin.
          </p>
          <Link href="/" className="button-primary mt-7">Về trang Đất Của Tôi</Link>
        </div>
      </main>
    );
  }

  const rawPage = Number(Array.isArray(queryParams.page) ? queryParams.page[0] : queryParams.page);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const q = String(Array.isArray(queryParams.q) ? queryParams.q[0] ?? "" : queryParams.q ?? "").slice(0, 120);
  const typeValue = Array.isArray(queryParams.type) ? queryParams.type[0] : queryParams.type;
  const type = ["LAND", "HOUSE", "APARTMENT", "RENTAL"].includes(typeValue ?? "")
    ? typeValue as "LAND" | "HOUSE" | "APARTMENT" | "RENTAL"
    : undefined;
  const categoryIdValue = Array.isArray(queryParams.categoryId)
    ? queryParams.categoryId[0]
    : queryParams.categoryId;
  const categoryId =
    typeof categoryIdValue === "string" &&
    /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(categoryIdValue)
      ? categoryIdValue
      : undefined;
  const sortValue = Array.isArray(queryParams.sort) ? queryParams.sort[0] : queryParams.sort;
  const sort = ["newest", "price_asc", "price_desc"].includes(sortValue ?? "")
    ? sortValue as "newest" | "price_asc" | "price_desc"
    : "newest";

  const [listing, featuredListing] = await Promise.all([
    getTenantPosts(slug, site.id, { page, limit: 9, q: q || undefined, type, categoryId, sort }),
    getTenantPosts(slug, site.id, { page: 1, limit: 1 }),
  ]);
  const featured = featuredListing.items[0];
  if (!featured) notFound();

  return (
    <main>
      <TenantHeader site={site} />
      <section className="relative overflow-hidden bg-[#e7e2d7]">
        <div className="page-shell grid min-h-[620px] items-center gap-10 py-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="relative z-10" data-reveal="left">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--tenant-color)]">
              Bất động sản tuyển chọn tại Đà Nẵng
            </p>
            <h1 className="mt-5 text-balance font-display text-5xl font-medium leading-[1] sm:text-6xl lg:text-7xl">
              Nơi một ngôi nhà trở thành
              <span className="block italic text-[var(--tenant-color)]">chốn để trở về.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-ink/60">
              {site.name} đồng hành cùng bạn tìm kiếm không gian sống và cơ hội đầu tư phù hợp,
              bằng sự thấu hiểu thị trường địa phương.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#properties" className="button-primary !bg-[var(--tenant-color)]">
                Khám phá bất động sản
                <ArrowRight size={17} />
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="button-secondary">
                <Phone size={16} />
                {site.phone}
              </a>
            </div>
          </div>
          <div className="relative min-h-[430px] lg:min-h-[540px]" data-reveal="right">
            <div className="absolute inset-y-0 right-0 w-[90%] overflow-hidden">
              <Image
                src={site.banner ?? featured.images[0]}
                alt={featured.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
            <Link
              href={`/${site.slug}/posts/${featured.slug ?? featured.id}`}
              className="absolute bottom-5 left-0 max-w-sm bg-white p-5 shadow-soft sm:p-6"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--tenant-color)]">
                Bất động sản nổi bật
              </span>
              <h2 className="mt-2 font-display text-2xl font-medium">{featured.title}</h2>
              <p className="mt-3 flex items-center gap-2 text-xs text-ink/50">
                <MapPin size={13} />
                {featured.district}, {featured.province}
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section id="properties" className="py-20 sm:py-28">
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--tenant-color)]">
                Danh mục mới nhất
              </p>
              <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
                Tìm một nơi phù hợp với bạn
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-ink/55">
              Bộ sưu tập được cập nhật và xác minh thông tin thường xuyên bởi đội ngũ tư vấn địa phương.
            </p>
          </div>
          <div className="mt-10">
            <PropertyBrowser
              posts={listing.items}
              slug={site.slug}
              total={listing.total}
              page={listing.page}
              totalPages={listing.totalPages}
              initialQuery={q}
              initialType={type ?? "ALL"}
              initialCategoryId={categoryId ?? ""}
              initialSort={sort}
            />
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-20 sm:py-28">
        <div className="page-shell grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden" data-reveal="left">
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=85"
              alt="Chuyên viên tư vấn bất động sản"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="lg:pl-10" data-reveal="right">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--tenant-color)]">
              Hiểu đất, hiểu người
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-medium leading-tight sm:text-5xl">
              Tư vấn bằng hiểu biết. Đồng hành bằng sự tử tế.
            </h2>
            <p className="mt-6 leading-7 text-ink/60">
              Chúng tôi tin một giao dịch tốt không bắt đầu từ việc bán, mà từ việc lắng nghe. Mỗi bất
              động sản được chọn lọc dựa trên pháp lý, tiềm năng và mức độ phù hợp với nhu cầu thực tế.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                [Award, "8+ năm", "kinh nghiệm địa phương"],
                [CheckCircle2, "500+", "giao dịch đồng hành"],
                [ShieldCheck, "Rõ ràng", "thông tin và pháp lý"],
              ].map(([Icon, value, label]) => {
                const ItemIcon = Icon as typeof Award;
                return (
                  <div key={value as string} className="border-t border-ink/15 pt-5">
                    <ItemIcon className="text-[var(--tenant-color)]" size={21} />
                    <strong className="mt-3 block font-display text-2xl">{value as string}</strong>
                    <span className="mt-1 block text-xs leading-5 text-ink/50">{label as string}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[var(--tenant-color)] py-16 text-white">
        <div className="page-shell flex flex-col justify-between gap-8 md:flex-row md:items-center" data-reveal="soft">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Bạn cần một lời khuyên?</p>
            <h2 className="mt-3 font-display text-4xl font-medium">Hãy bắt đầu bằng một cuộc trò chuyện.</h2>
          </div>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-14 items-center justify-center gap-3 bg-white px-7 font-bold text-[var(--tenant-color)]">
            <Phone size={18} />
            Gọi {site.phone}
          </a>
        </div>
      </section>

      <footer className="bg-ink py-10 text-white">
        <div className="page-shell flex flex-col justify-between gap-7 text-sm md:flex-row">
          <div>
            <strong className="font-display text-2xl">{site.name}</strong>
            <p className="mt-2 text-white/45">{site.address}</p>
          </div>
          <div className="text-white/45 md:text-right">
            <p>{site.email} · {site.phone}</p>
            <p className="mt-2">Website vận hành trên nền tảng Đất Của Tôi</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
