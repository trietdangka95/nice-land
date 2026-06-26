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
    <article 
      className="tenant-property-card group flex h-full flex-col overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: "var(--tenant-card-bg, #ffffff)",
        borderRadius: "var(--tenant-card-radius, 0px)",
        border: "var(--tenant-card-border, 1px solid rgba(0,0,0,0.05))",
        boxShadow: "var(--tenant-card-shadow, none)",
      }}
    >
      <Link href={href} className="block">
        <div 
          className="tenant-card-media relative overflow-hidden bg-sand"
          style={{ aspectRatio: "var(--tenant-card-ratio, 16/10)" }}
        >
          <Image
            src={post.images[0]}
            alt={post.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <span className="tenant-card-type absolute left-3 top-3 px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider transition-colors"
                style={{
                  backgroundColor: "var(--tenant-tag-bg, rgba(255,255,255,0.95))",
                  color: "var(--tenant-tag-color, #000)"
                }}>
            {propertyTypeLabels[post.type]}
          </span>
          {post.status === "SOLD" && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-xs font-bold uppercase tracking-widest text-white">
              Đã giao dịch
            </span>
          )}
        </div>
      </Link>
      <div 
        className="tenant-card-body flex flex-1 flex-col p-4"
        style={{
          borderTop: "var(--tenant-card-border-inner, none)",
          padding: "var(--tenant-card-padding, 1rem)"
        }}
      >
        <Link href={href}>
          <h3 
            className="tenant-card-title line-clamp-2 text-[15px] font-bold leading-5 transition-colors"
            style={{ color: "var(--tenant-card-title, #111)" }}
          >
            {post.title}
          </h3>
          <p className="tenant-card-price mt-2.5 text-base font-extrabold text-[var(--tenant-color)]">
            {formatPrice(post.price, post.type)}
            <span className="mx-2 font-normal opacity-25">·</span>
            <span>{post.area} m²</span>
          </p>
          <p className="tenant-card-location mt-2.5 flex items-center gap-1.5 text-xs opacity-60"
             style={{ color: "var(--tenant-card-text, #111)" }}>
            <MapPin size={14} aria-hidden="true" />
            {post.district}, {post.province}
          </p>
        </Link>
        <div className="tenant-card-meta mt-auto flex items-center justify-between pt-5 text-[11px] opacity-50"
             style={{ color: "var(--tenant-card-text, #111)" }}>
          <span>
            Đăng{" "}
            {new Date(post.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
          <span
            className="grid size-8 place-items-center rounded border opacity-70 transition-colors hover:bg-black/5"
            style={{ borderColor: "var(--tenant-card-border-inner, rgba(0,0,0,0.1))" }}
            aria-label="Tính năng lưu tin sẽ sớm có"
          >
            <Heart size={16} aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}
