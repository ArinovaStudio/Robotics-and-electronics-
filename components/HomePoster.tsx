import React from "react";
import Image from "next/image";

export default function HomePoster() {
  return (
    <section className="w-full flex justify-center items-center mt-8">
      <div className="w-[95vw] max-w-[1200px] h-[380px] bg-[#eaf4ff] rounded-b-lg  bord3e8r-[# p-050a30] flex items-cen ter justify-center overflow-hidden">
        <Image
          src="/homeposter.png"
          alt="Electronics Store Poster"
          width={1200}
          height={340}
          className="object-cover w-full h-full rounded-lg"
          priority
        />
      </div>
    </section>
  );
}
