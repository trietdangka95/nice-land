"use client";

import { Check } from "lucide-react";
import type { PublicTheme } from "@nice-land/contracts";
import { publicThemes } from "@/lib/public-themes";
import { ThemeThumbnail } from "@/components/theme-thumbnail";

export function PublicThemePicker({
  value,
  onChange,
}: {
  value: PublicTheme;
  onChange: (theme: PublicTheme) => void;
}) {
  return (
    <fieldset>
      <legend className="font-display text-2xl">Giao diện website public</legend>
      <p className="mt-2 text-sm leading-6 text-ink/50">
        Theme chỉ thay đổi cách trình bày. Tin đăng, bộ lọc và các tính năng vẫn
        được giữ nguyên.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {publicThemes.map((theme) => {
          const selected = value === theme.key;
          return (
            <button
              key={theme.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(theme.key)}
              className={`overflow-hidden border text-left transition ${
                selected
                  ? "border-moss ring-2 ring-moss/15"
                  : "border-ink/10 hover:border-ink/30"
              }`}
            >
              <span className="relative block h-32 overflow-hidden">
                <ThemeThumbnail theme={theme.key} />
                {selected && (
                  <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-white text-moss">
                    <Check size={15} />
                  </span>
                )}
              </span>
              <span className="block p-4">
                <strong className="block text-sm">{theme.name}</strong>
                <span className="mt-1 block text-xs leading-5 text-ink/50">
                  {theme.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
