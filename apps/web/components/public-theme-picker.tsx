"use client";

import { Check } from "lucide-react";
import type { PublicTheme } from "@nice-land/contracts";
import { publicThemes } from "@/lib/public-themes";

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
              <span
                className={`relative block h-28 p-4 ${theme.previewClassName}`}
              >
                <span className="block h-2 w-16 bg-current opacity-80" />
                <span className="mt-4 block h-5 w-4/5 border-y border-current opacity-70" />
                <span className="mt-3 grid grid-cols-3 gap-2">
                  <i className="h-8 bg-current opacity-20" />
                  <i className="h-8 bg-current opacity-30" />
                  <i className="h-8 bg-current opacity-20" />
                </span>
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
