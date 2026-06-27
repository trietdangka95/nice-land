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

export function ThemeThumbnail({ theme }: { theme: PublicTheme }) {
  getPublicTheme(theme);
  return <PersonalThumbnail />;
}
