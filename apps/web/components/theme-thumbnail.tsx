import Image from "next/image";
import type { PublicTheme } from "@nice-land/contracts";
import { getPublicTheme } from "@/lib/public-themes";

const house =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80";
const apartment =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";
const townhouse =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
const agent =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80";

function Photo({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image src={src} alt="" fill className="object-cover" sizes="500px" />
    </span>
  );
}

function LuxuryThumbnail() {
  return (
    <div className="relative h-full bg-[#17211b] text-white">
      <Photo src={house} className="!absolute inset-0" />
      <span className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-x-4 top-3 flex items-center justify-between border-b border-white/35 pb-2">
        <strong className="font-serif text-[10px] tracking-wide">MINH PHÁT ESTATES</strong>
        <span className="text-[5px] uppercase tracking-[0.18em]">Collection · About · Contact</span>
      </div>
      <div className="absolute bottom-5 left-4 w-3/5">
        <span className="text-[5px] uppercase tracking-[0.28em] text-[#e8c990]">Private residence</span>
        <p className="mt-1 font-serif text-xl leading-[0.92]">A rare view.<br />A remarkable home.</p>
        <span className="mt-3 inline-block border border-white/60 px-3 py-1 text-[5px] uppercase tracking-widest">
          View residence
        </span>
      </div>
    </div>
  );
}

function SearchThumbnail() {
  return (
    <div className="h-full bg-[#f3f6f8] text-[#162b3a]">
      <div className="flex h-9 items-center justify-between bg-white px-4 shadow-sm">
        <strong className="text-[9px]">NHÀ ĐẤT MINH PHÁT</strong>
        <span className="text-[5px]">Mua · Thuê · Khu vực · Liên hệ</span>
      </div>
      <div className="bg-[#24405e] px-5 py-4 text-white">
        <p className="text-center text-sm font-bold">Tìm bất động sản phù hợp</p>
        <div className="mt-3 grid grid-cols-[1fr_72px_42px] gap-1 bg-white p-1 text-[#24405e]">
          <span className="px-2 py-2 text-[6px] text-black/45">Nhập khu vực, dự án...</span>
          <span className="border-l px-2 py-2 text-[6px]">Loại hình</span>
          <span className="bg-[#e2574c] py-2 text-center text-[6px] text-white">Tìm</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {[house, apartment, townhouse].map((src, index) => (
          <div key={src} className="bg-white shadow-sm">
            <Photo src={src} className="aspect-[4/3]" />
            <div className="p-2">
              <strong className="block text-[7px]">{["18,5 tỷ", "4,25 tỷ", "8,9 tỷ"][index]}</strong>
              <span className="mt-1 block h-1 w-full bg-slate-200" />
              <span className="mt-1 block h-1 w-2/3 bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorialThumbnail() {
  return (
    <div className="h-full bg-[#f1ede5] text-[#1c1b19]">
      <div className="flex h-10 items-center justify-between border-b border-black/25 px-4">
        <span className="text-[5px] uppercase tracking-[0.2em]">Issue No. 06 — Đà Nẵng</span>
        <strong className="font-serif text-sm">The Property Edit</strong>
        <span className="text-[5px] uppercase tracking-[0.2em]">Minh Phát</span>
      </div>
      <div className="grid h-[calc(100%-2.5rem)] grid-cols-[1.3fr_0.7fr] gap-2 p-3">
        <Photo src={house} className="h-full" />
        <div className="flex flex-col">
          <span className="text-[5px] uppercase tracking-[0.25em] text-[#8a6735]">Cover story</span>
          <p className="mt-2 font-serif text-xl leading-[0.9]">Living<br />above<br />the sea</p>
          <p className="mt-2 text-[6px] leading-relaxed text-black/55">
            Những không gian đặc biệt được chọn lọc cho một đời sống có gu.
          </p>
          <Photo src={apartment} className="mt-auto aspect-[5/3]" />
        </div>
      </div>
    </div>
  );
}

function PersonalThumbnail() {
  return (
    <div className="h-full bg-[#eee3d6] text-[#3d3028]">
      <div className="flex h-10 items-center justify-between px-4">
        <strong className="font-serif text-[10px] italic">Minh Phát</strong>
        <span className="text-[5px] uppercase tracking-widest">Nhà đẹp · Về tôi · Liên hệ</span>
      </div>
      <div className="grid h-[calc(100%-2.5rem)] grid-cols-2">
        <Photo src={agent} className="h-full" />
        <div className="flex flex-col justify-center bg-[#725746] px-4 text-white">
          <span className="text-[5px] uppercase tracking-[0.24em] text-[#ead6c3]">Môi giới địa phương</span>
          <p className="mt-2 font-serif text-xl leading-[0.95]">Tìm đúng nhà,<br />bằng sự thấu hiểu.</p>
          <p className="mt-2 text-[6px] leading-relaxed text-white/65">8 năm đồng hành cùng người mua nhà tại Đà Nẵng.</p>
          <span className="mt-3 w-fit bg-white px-3 py-1.5 text-[5px] font-bold text-[#725746]">TRÒ CHUYỆN CÙNG TÔI</span>
        </div>
      </div>
    </div>
  );
}

const thumbnails = {
  "luxury-showcase": LuxuryThumbnail,
  "search-first": SearchThumbnail,
  "property-editorial": EditorialThumbnail,
  "personal-broker": PersonalThumbnail,
};

export function ThemeThumbnail({ theme }: { theme: PublicTheme }) {
  const definition = getPublicTheme(theme);
  const Thumbnail = thumbnails[definition.thumbnailRenderer];
  return <Thumbnail />;
}
