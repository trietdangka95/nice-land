import Link from "next/link";
import { MapPinHouse } from "lucide-react";

export function Logo({
  compact = false,
  href = "/",
  inverted = false,
}: {
  compact?: boolean;
  href?: string;
  inverted?: boolean;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-w-0 items-center gap-3"
      aria-label="Nice Land - Trang chủ"
    >
      <span className="grid size-10 shrink-0 place-items-center bg-moss text-white">
        <MapPinHouse size={20} strokeWidth={1.8} aria-hidden="true" />
      </span>
      {!compact && (
        <span className={`min-w-0 leading-none ${inverted ? "text-white" : ""}`}>
          <span className="block whitespace-nowrap font-display text-lg font-semibold sm:text-xl">
            Nice Land
          </span>
          <span className={`mt-1 hidden whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] min-[400px]:block sm:tracking-[0.24em] ${inverted ? "text-white/45" : "text-ink/50"}`}>
            Bất động sản của riêng bạn
          </span>
        </span>
      )}
    </Link>
  );
}
