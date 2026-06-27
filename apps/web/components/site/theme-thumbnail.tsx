import Image from "next/image";
import type { PublicTheme } from "@nice-land/contracts";
import { getPublicTheme } from "@/lib/public-themes";

const house = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80";
const apartment = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";
const townhouse = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

function Photo({ src, className = "" }: { src: string; className?: string }) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image src={src} alt="" fill className="object-cover" sizes="500px" />
    </span>
  );
}

function LuxuryThumbnail() {
  return (
    <div className="h-full bg-[#EFECE6] text-[#2A3028] p-3 flex flex-col">
      <div className="flex items-center justify-between border-b border-[#2A3028]/10 pb-2 mb-3">
        <strong className="font-serif text-[10px] tracking-wide">MINH PHÁT ESTATES</strong>
        <span className="text-[5px] uppercase tracking-[0.18em]">Portfolio · Contact</span>
      </div>
      <div className="flex flex-1 gap-3">
        <div className="w-1/3 flex flex-col gap-2">
          <div className="text-[6px] uppercase tracking-widest mb-1 border-b border-[#2A3028]/10 pb-1">Filters</div>
          <div className="h-4 border border-[#2A3028]/15 bg-[#EFECE6]"></div>
          <div className="h-4 border border-[#2A3028]/15 bg-[#EFECE6]"></div>
          <div className="h-6 bg-[#2A3028] text-white flex items-center justify-center text-[5px] uppercase tracking-widest mt-auto">Search</div>
        </div>
        <div className="w-2/3 flex flex-col gap-2">
          <div className="flex-1 border border-[#2A3028]/10 bg-[#EFECE6] p-1 flex flex-col">
            <Photo src={house} className="flex-1 w-full" />
            <div className="pt-1.5 flex justify-between items-center">
              <span className="font-serif text-[7px]">The Crown Villa</span>
              <span className="text-[6px] italic">18.5B</span>
            </div>
          </div>
          <div className="flex-1 border border-[#2A3028]/10 bg-[#EFECE6] p-1 flex flex-col">
            <Photo src={townhouse} className="flex-1 w-full" />
            <div className="pt-1.5 flex justify-between items-center">
              <span className="font-serif text-[7px]">Heritage Row</span>
              <span className="text-[6px] italic">8.9B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchThumbnail() {
  return (
    <div className="h-full bg-[#0F172A] p-3 flex flex-col">
      <div className="flex items-center justify-between pb-2 mb-2">
        <strong className="text-[9px] text-[#F8FAFC] font-bold">MINH PHÁT</strong>
        <span className="text-[5px] text-[#94A3B8]">Buy · Rent · Sell</span>
      </div>
      <div className="flex flex-1 gap-3">
        <div className="w-1/3 flex flex-col gap-2 bg-[#1E293B] rounded-md p-2 border border-[#334155]">
          <div className="h-4 bg-[#0F172A] rounded border border-[#334155]"></div>
          <div className="h-4 bg-[#0F172A] rounded border border-[#334155]"></div>
          <div className="h-4 bg-[#0F172A] rounded border border-[#334155]"></div>
          <div className="h-5 bg-[#0F766E] rounded text-white flex items-center justify-center text-[5px] mt-auto">Search</div>
        </div>
        <div className="w-2/3 flex flex-col gap-2">
          <div className="flex-1 bg-[#1E293B] rounded-md p-1 border border-[#334155] flex flex-col">
            <Photo src={apartment} className="flex-1 w-full rounded-[2px]" />
            <div className="pt-1.5">
              <div className="text-[6px] text-[#F8FAFC] font-bold">Skyline Apartment</div>
              <div className="text-[5px] text-[#0F766E] font-bold mt-0.5">4.25T</div>
            </div>
          </div>
          <div className="flex-1 bg-[#1E293B] rounded-md p-1 border border-[#334155] flex flex-col">
            <Photo src={house} className="flex-1 w-full rounded-[2px]" />
            <div className="pt-1.5">
              <div className="text-[6px] text-[#F8FAFC] font-bold">Modern Villa</div>
              <div className="text-[5px] text-[#0F766E] font-bold mt-0.5">18.5T</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorialThumbnail() {
  return (
    <div className="h-full bg-[#EAE6DF] text-[#3C3224] p-3 flex flex-col">
      <div className="flex items-center justify-between border-b-2 border-[#3C3224] pb-1 mb-3">
        <strong className="font-serif text-[10px] tracking-tight italic">Minh Phát</strong>
        <span className="text-[5px] uppercase tracking-[0.2em] font-bold">Editorial</span>
      </div>
      <div className="flex-1 flex gap-2">
        <div className="w-1/2 relative bg-white border border-[#3C3224]/20 p-1 flex flex-col">
          <Photo src={house} className="flex-1 w-full" />
          <div className="absolute top-2 left-2 bg-white/90 px-1 py-0.5 text-[4px] uppercase tracking-widest border border-[#3C3224]">Featured</div>
          <div className="pt-2 text-center pb-1">
            <div className="font-serif text-[7px] font-bold">Ocean Villa</div>
            <div className="text-[5px] uppercase tracking-widest mt-1 border-t border-[#3C3224]/20 pt-1 mx-2">18.5 TỶ</div>
          </div>
        </div>
        <div className="w-1/2 flex flex-col gap-2">
          <div className="flex-1 bg-white border border-[#3C3224]/20 p-1 flex flex-col">
            <Photo src={apartment} className="flex-1 w-full" />
            <div className="pt-1 px-1">
              <div className="font-serif text-[5px] font-bold">Skyline</div>
            </div>
          </div>
          <div className="flex-1 bg-[#3C3224] p-1 flex flex-col justify-center items-center text-center text-[#EAE6DF]">
            <div className="font-serif text-[7px] italic">Curated Space</div>
            <div className="text-[4px] uppercase tracking-widest mt-1 opacity-70 border-t border-white/20 pt-1 w-2/3">Explore</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalThumbnail() {
  return (
    <div className="h-full bg-[#FDFBF7] p-3 flex flex-col">
      <div className="flex justify-center mb-3">
        <div className="flex items-center bg-white rounded-full shadow-sm border border-[#F0ECE1] px-2 py-1 w-3/4">
          <div className="w-4 h-4 bg-[#E0D7CD] rounded-full mr-2"></div>
          <div className="flex-1 h-1.5 bg-[#F5F2EB] rounded-full"></div>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-[#F0ECE1] p-1.5 flex flex-col">
          <Photo src={house} className="flex-1 w-full rounded-lg" />
          <div className="pt-1.5 px-0.5">
            <div className="text-[6px] font-bold text-[#4A433A]">Sunny Villa</div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[5px] text-[#A69785]">18.5T</div>
              <div className="w-3 h-3 rounded-full bg-[#FAEDEB] flex items-center justify-center text-[#D26B59] text-[4px]">→</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#F0ECE1] p-1.5 flex flex-col">
          <Photo src={townhouse} className="flex-1 w-full rounded-lg" />
          <div className="pt-1.5 px-0.5">
            <div className="text-[6px] font-bold text-[#4A433A]">Cozy House</div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[5px] text-[#A69785]">8.9T</div>
              <div className="w-3 h-3 rounded-full bg-[#FAEDEB] flex items-center justify-center text-[#D26B59] text-[4px]">→</div>
            </div>
          </div>
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
