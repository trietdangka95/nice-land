"use server";

import { revalidateTag } from "next/cache";

export async function revalidateTenant(slug: string) {
  revalidateTag(`tenant-${slug}`);
}
