import React from "react";
import Image from "next/image";
import { Dot, Ellipsis } from "lucide-react";

export default function HomePoster() {
  return (
    <section className="w-full flex justify-center items-center mt-8">
      <div className="w-[95vw] h-[380px] bg-[#eaf4ff] rounded-4xl flex items-center justify-center overflow-hidden">
        <Image
          src="/homeposter.png"
          alt="Electronics Store Poster"
          width={1200}
          height={340}
          className="object-cover w-full h-full rounded-4xl"
          priority
        />
        <div
          className="
    absolute
    bottom-50 right-20
    flex items-center gap-3
    px-4 py-2
    rounded-full
    bg-white/20
    shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]
    shadow-[0_4px_8px_rgba(0,0,0,0.25)]
    backdrop-blur-sm
  "
        >
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="w-2 h-2 rounded-full bg-white/60" />
          <span className="w-2 h-2 rounded-full bg-white/50" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>
    </section>
  );
}
