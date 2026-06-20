import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Maximize2 } from "lucide-react";
import { formatPrice, propertyTypeLabels } from "@/lib/format";
import type { PropertyPost } from "@/lib/types";
import type { PublicTheme } from "@nice-land/contracts";

export function PropertyCard({
  post,
  slug,
  themePreview,
}: {
  post: PropertyPost;
  slug: string;
  themePreview?: PublicTheme;
}) {
  const previewSuffix = themePreview
    ? `?themePreview=${encodeURIComponent(themePreview)}`
    : "";
  return (
    <article className="tenant-property-card motion-card group bg-white">
      <Link
        href={`/${slug}/posts/${post.slug ?? post.id}${previewSuffix}`}
        className="block"
      >
        <div className="tenant-card-media relative aspect-[4/3] overflow-hidden bg-sand">
          <Image
            src={post.images[0]}
            alt={post.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <span className="absolute left-4 top-4 bg-white/95 px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest">
            {propertyTypeLabels[post.type]}
          </span>
          {post.status === "SOLD" && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-xs font-bold uppercase tracking-widest text-white">
              Đã giao dịch
            </span>
          )}
        </div>
        <div className="tenant-card-body border border-t-0 border-ink/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-extrabold text-[var(--tenant-color)]">
              {formatPrice(post.price, post.type)}
            </p>
            <ArrowUpRight className="text-ink/35 transition group-hover:text-ink" size={19} />
          </div>
          <h3 className="tenant-card-title mt-3 line-clamp-2 font-display text-2xl font-medium leading-tight">{post.title}</h3>
          <p className="mt-4 flex items-center gap-2 text-xs text-ink/50">
            <MapPin size={14} aria-hidden="true" />
            {post.district}, {post.province}
          </p>
          <div className="mt-4 flex items-center gap-5 border-t border-ink/10 pt-4 text-xs font-semibold text-ink/60">
            <span className="flex items-center gap-2">
              <Maximize2 size={14} aria-hidden="true" />
              {post.area} m²
            </span>
            <span>Mã: {post.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
