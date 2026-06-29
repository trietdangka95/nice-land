import type { PublicTheme } from "@nice-land/contracts";
import { getPublicThemeDemoHref } from "@/lib/public-themes";

export function ThemeThumbnail({ theme }: { theme: PublicTheme }) {
  const href = getPublicThemeDemoHref(theme);

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <div className="flex h-9 items-center gap-2 border-b border-black/5 bg-[#f3f3f3] px-3">
        <span className="size-2.5 rounded-full bg-[#ff5f56]" />
        <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="size-2.5 rounded-full bg-[#27c93f]" />
        <div className="ml-3 flex h-6 flex-1 items-center justify-center rounded-md bg-white text-[10px] font-semibold text-black/35 shadow-sm">
          {href.replace("/", "")}.nice-land.id.vn
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-9 overflow-hidden bg-white">
        <iframe
          src={href}
          title={`Preview ${theme}`}
          tabIndex={-1}
          loading="lazy"
          aria-hidden="true"
          className="absolute left-0 top-0 h-[300%] w-[300%] origin-top-left scale-[0.3334] border-0"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.03] via-transparent to-white/[0.02]" />
    </div>
  );
}
