"use server";

import { revalidateTag } from "next/cache";

export async function revalidateTenant(slug: string) {
  // @ts-expect-error - Next 16 experimental type signature change
  revalidateTag(`tenant-${slug}`);
}
