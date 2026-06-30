"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildPublicPostsHref } from "@/lib/pagination";
import type { PropertyPost, PropertyType } from "@/lib/types";
import type { PropertyCategory } from "@nice-land/contracts";
import { createTenantApi } from "@/lib/api";

import { WarmBrowser } from "./browser-variants/warm";
import { DefaultBrowser } from "./browser-variants/default";
import { ColdBrowser } from "./browser-variants/cold";

export interface BrowserVariantProps {
  query: string;
  setQuery: (q: string) => void;
  type: string;
  setType: (t: string) => void;
  categoryId: string;
  setCategoryId: (c: string) => void;
  province: string;
  setProvince: (p: string) => void;
  sort: string;
  setSort: (s: string) => void;
  categories: PropertyCategory[];
  applyFilters: (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent) => void;
  applyCategoryFilter: (categoryId: string) => void;
  posts: PropertyPost[];
  slug: string;
  total: number;
  page: number;
  totalPages: number;
  initialQuery: string;
  initialType: string;
  initialCategoryId: string;
  initialProvince: string;
  initialSort: string;
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
  initialProvince = "",
  initialSort = "newest",
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
  initialProvince?: string;
  initialSort?: "newest" | "price_asc" | "price_desc";
  variant?: "warm" | "cold" | "default";
}) {
  const router = useRouter();
  const client = useMemo(() => createTenantApi(slug), [slug]);
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<string>(initialType);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [province, setProvince] = useState(initialProvince);
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

  function normalizedType(nextType = type): "ALL" | PropertyType {
    return ["LAND", "HOUSE", "APARTMENT", "RENTAL"].includes(nextType)
      ? (nextType as PropertyType)
      : "ALL";
  }

  function pushFilters(overrides: Partial<{
    q: string;
    type: string;
    categoryId: string;
    province: string;
    sort: string;
  }> = {}) {
    router.push(
      buildPublicPostsHref(slug, {
        page: 1,
        q: overrides.q ?? query,
        type: normalizedType(overrides.type ?? type),
        categoryId: overrides.categoryId ?? categoryId,
        province: overrides.province ?? province,
        sort: (overrides.sort ?? sort) as "newest" | "price_asc" | "price_desc",
      }),
    );
  }

  function selectType(nextType: string) {
    setType(nextType);
    setCategoryId("");
  }

  function applyFilters(event?: React.FormEvent<HTMLFormElement> | React.MouseEvent) {
    if (event && "preventDefault" in event) {
      event.preventDefault();
    }
    pushFilters();
  }

  function handleCategoryIdChange(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    if (type === "ALL" && nextCategoryId !== "") {
      const category = categories.find((c) => c.id === nextCategoryId);
      if (category) {
        setType(category.type);
      }
    }
  }

  function applyCategoryFilter(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    const category = categories.find((c) => c.id === nextCategoryId);
    const nextType = category && type === "ALL" ? category.type : type;
    if (nextType !== type) {
      setType(nextType);
    }
    pushFilters({ categoryId: nextCategoryId, type: nextType });
  }

  const props: BrowserVariantProps = {
    query, setQuery,
    type, setType: selectType,
    categoryId, setCategoryId: handleCategoryIdChange,
    province, setProvince,
    sort, setSort,
    categories,
    applyFilters,
    applyCategoryFilter,
    posts, 
    slug, 
    total, 
    page, totalPages,
    initialQuery, initialType, initialCategoryId, initialProvince, initialSort,
  };

  switch (variant) {
    case "warm":
      return <WarmBrowser {...props} />;
    case "cold":
      return <ColdBrowser {...props} />;
    case "default":
    default:
      return <DefaultBrowser {...props} />;
  }
}
