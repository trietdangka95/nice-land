"use client";

import { useMemo } from "react";
import type { PropertyInteractionInput } from "@nice-land/contracts";
import { createTenantApi } from "@/lib/api";

export function TrackedContactLink({
  slug,
  postId,
  source,
  href,
  className,
  children,
}: {
  slug: string;
  postId: string;
  source: PropertyInteractionInput["source"];
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const client = useMemo(() => createTenantApi(slug), [slug]);

  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        void client
          .trackPropertyInteraction(postId, { source })
          .catch(() => undefined);
      }}
    >
      {children}
    </a>
  );
}
