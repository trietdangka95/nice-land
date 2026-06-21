import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
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
  const href = `/${slug}/posts/${post.slug ?? post.id}${previewSuffix}`;
  return (
    <article className="tenant-property-card motion-card group flex h-full flex-col overflow-hidden bg-white">
      <Link href={href} className="block">
        <div className="tenant-card-media relative aspect-[16/10] overflow-hidden bg-sand">
          <Image
            src={post.images[0]}
            alt={post.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <span className="tenant-card-type absolute left-3 top-3 bg-white/95 px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider">
            {propertyTypeLabels[post.type]}
          </span>
          {post.status === "SOLD" && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-xs font-bold uppercase tracking-widest text-white">
              Đã giao dịch
            </span>
          )}
        </div>
      </Link>
      <div className="tenant-card-body flex flex-1 flex-col border border-t-0 border-ink/10 p-4">
        <Link href={href}>
          <h3 className="tenant-card-title line-clamp-2 text-[15px] font-bold leading-5">
            {post.title}
          </h3>
          <p className="tenant-card-price mt-2.5 text-base font-extrabold text-[var(--tenant-color)]">
            {formatPrice(post.price, post.type)}
            <span className="mx-2 font-normal text-ink/25">·</span>
            <span>{post.area} m²</span>
          </p>
          <p className="tenant-card-location mt-2.5 flex items-center gap-1.5 text-xs text-ink/60">
            <MapPin size={14} aria-hidden="true" />
            {post.district}, {post.province}
          </p>
        </Link>
        <div className="tenant-card-meta mt-auto flex items-center justify-between pt-5 text-[11px] text-ink/40">
          <span>
            Đăng{" "}
            {new Date(post.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
          <span
            className="grid size-8 place-items-center rounded border border-ink/20 text-ink/70"
            aria-label="Tính năng lưu tin sẽ sớm có"
          >
            <Heart size={16} aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}
