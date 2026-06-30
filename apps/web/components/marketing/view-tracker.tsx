"use client";

import { useEffect } from "react";
import { getApiBaseUrl } from "@/lib/api-url";

export function ViewTracker() {
  useEffect(() => {
    fetch(`${getApiBaseUrl()}/v1/public/platform-views`, {
      method: "POST",
    }).catch(console.error);
  }, []);

  return null;
}
