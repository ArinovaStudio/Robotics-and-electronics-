import Image from "next/image";

export default function CertificationsStrip() {
  return (
    <section className="w-full bg-white py-14 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-12">
          
          {/* MSME */}
          <div className="group w-full max-w-[380px] h-[200px] flex items-center justify-center border border-gray-200 rounded-md bg-white transition-all duration-300 hover:border-[#050a30] hover:shadow-xl hover:-translate-y-1">
            <div className="relative w-[75%] h-[75%] transition-all duration-500 transform group-hover:scale-105">
              <Image
                src="/msme.png"
                alt="MSME Certified"
                fill
                className="object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                unoptimized
              />
            </div>
          </div>

          {/* Startup India DPIIT */}
          <div className="group w-full max-w-[380px] h-[200px] flex items-center justify-center border border-gray-200 rounded-md bg-white transition-all duration-300 hover:border-[#050a30] hover:shadow-xl hover:-translate-y-1">
            <div className="relative w-[85%] h-[85%] transition-all duration-500 transform group-hover:scale-105">
              <Image
                src="/startup-india.png"
                alt="Startup India DPIIT"
                fill
                className="object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                unoptimized
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}