import Image from "next/image";
import type { PublicTheme } from "@nice-land/contracts";
import { getPublicTheme } from "@/lib/public-themes";

const house = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80";
const townhouse = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

function Photo({ src, className = "" }: { src: string; className?: string }) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image src={src} alt="" fill className="object-cover" sizes="500px" />
    </span>
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

function ColdThumbnail() {
  return (
    <div className="flex h-full flex-col bg-[#edf3f8] p-3">
      <div className="mb-3 flex items-center justify-between border border-[#c9d7e3] bg-[#071a2f] px-2 py-1.5">
        <div className="h-3 w-12 bg-[#6ee7ff]"></div>
        <div className="flex gap-1">
          <div className="h-2 w-8 bg-white/30"></div>
          <div className="h-2 w-8 bg-white/30"></div>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-[0.8fr_1.2fr] gap-2">
        <div className="border border-[#c9d7e3] bg-white p-2">
          <div className="h-2 w-10 bg-[#027fa4]"></div>
          <div className="mt-2 h-5 w-full bg-[#071a2f]"></div>
          <div className="mt-1 h-5 w-3/4 bg-[#071a2f]"></div>
          <div className="mt-4 h-3 w-16 bg-[#6ee7ff]"></div>
        </div>
        <div className="grid gap-2">
          <div className="border border-[#c9d7e3] bg-white p-1.5">
            <Photo src={house} className="h-12 w-full" />
            <div className="mt-1 h-2 w-16 bg-[#071a2f]"></div>
          </div>
          <div className="border border-[#c9d7e3] bg-white p-1.5">
            <Photo src={townhouse} className="h-12 w-full" />
            <div className="mt-1 h-2 w-14 bg-[#071a2f]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThemeThumbnail({ theme }: { theme: PublicTheme }) {
  const definition = getPublicTheme(theme);
  if (definition.thumbnailRenderer === "cold-modern") return <ColdThumbnail />;
  return <PersonalThumbnail />;
}
