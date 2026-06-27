"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { PropertyPost, PropertyType } from "@/lib/types";
import type { PropertyCategory } from "@nice-land/contracts";
import type { PublicTheme } from "@nice-land/contracts";
import { createTenantApi } from "@/lib/api";

import { ClassicBrowser } from "./browser-variants/classic";
import { ModernBrowser } from "./browser-variants/modern";
import { EditorialBrowser } from "./browser-variants/editorial";
import { WarmBrowser } from "./browser-variants/warm";
import { DefaultBrowser } from "./browser-variants/default";

export interface BrowserVariantProps {
  query: string;
  setQuery: (q: string) => void;
  type: string;
  setType: (t: string) => void;
  categoryId: string;
  setCategoryId: (c: string) => void;
  sort: string;
  setSort: (s: string) => void;
  categories: PropertyCategory[];
  applyFilters: (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent) => void;
  posts: PropertyPost[];
  slug: string;
  total: number;
  page: number;
  totalPages: number;
  initialQuery: string;
  initialType: string;
  initialCategoryId: string;
  initialSort: string;
  themePreview?: PublicTheme;
}

export function PropertyBrowser({
  posts,
  slug,
  total,
  page,
  totalPages,
  initialQuery = "",
  initialType = "ALL",
  initialCategoryId = "",
  initialSort = "newest",
  themePreview,
  variant = "default",
}: {
  posts: PropertyPost[];
  slug: string;
  total: number;
  page: number;
  totalPages: number;
  initialQuery?: string;
  initialType?: "ALL" | PropertyType;
  initialCategoryId?: string;
  initialSort?: "newest" | "price_asc" | "price_desc";
  themePreview?: PublicTheme;
  variant?: "classic" | "modern" | "editorial" | "warm" | "default";
}) {
  const router = useRouter();
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<string>(initialType);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [sort, setSort] = useState<string>(initialSort);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);

  useEffect(() => {
    let active = true;
    void client.listPublicCategories().then((result) => {
      if (active) setCategories(result);
    }).catch(() => {
      if (active) setCategories([]);
    });
    return () => {
      active = false;
    };
  }, [client]);

  function applyFilters(event?: React.FormEvent<HTMLFormElement> | React.MouseEvent) {
    if (event && "preventDefault" in event) {
      event.preventDefault();
    }
    router.push(
      buildPublicPostsHref(slug, {
        page: 1,
        q: query,
        type: type as any,
        categoryId,
        sort: sort as any,
        themePreview,
      }),
    );
  }

  // --- MOCK UI 8 ITEMS FOR VISUALIZATION ---
  const displayPosts = useMemo(() => {
    if (posts.length === 0) return posts;
    const mocked = [...posts];
    while (mocked.length < 8) {
      mocked.push({
        ...mocked[mocked.length % posts.length],
        id: `mock-${mocked.length}`,
      });
    }
    return mocked;
  }, [posts]);

  const props: BrowserVariantProps = {
    query, setQuery,
    type, setType,
    categoryId, setCategoryId,
    sort, setSort,
    categories,
    applyFilters,
    posts: displayPosts, 
    slug, 
    total: Math.max(total, displayPosts.length), 
    page, totalPages,
    initialQuery, initialType, initialCategoryId, initialSort,
    themePreview,
  };

  switch (variant) {
    case "classic":
      return <ClassicBrowser {...props} />;
    case "modern":
      return <ModernBrowser {...props} />;
    case "editorial":
      return <EditorialBrowser {...props} />;
    case "warm":
      return <WarmBrowser {...props} />;
    case "default":
    default:
      return <DefaultBrowser {...props} />;
  }
}
