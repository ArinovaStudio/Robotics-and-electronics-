import Image from "next/image";

export default function CertificationsStrip() {
  return (
    <section className="w-full bg-white py-12 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10">
          
          {/* MSME Rectangle Box */}
          <div className="group w-full max-w-[320px] h-[140px] flex items-center justify-center border border-gray-200 rounded-sm bg-white transition-all duration-300 hover:border-[#f0b31e] hover:shadow-md">
            <div className="relative w-[70%] h-[70%] transition-all duration-300 transform group-hover:scale-110">
              <Image
                src="/msme.png"
                alt="MSME Certified"
                fill
                className="object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                unoptimized
              />
            </div>
          </div>

          {/* Startup India Rectangle Box */}
          <div className="group w-full max-w-[320px] h-[140px] flex items-center justify-center border border-gray-200 rounded-sm bg-white transition-all duration-300 hover:border-[#f0b31e] hover:shadow-md">
            <div className="relative w-[80%] h-[80%] transition-all duration-300 transform group-hover:scale-110">
              <Image
                src="/startup-india.png"
                alt="Startup India DPIIT"
                fill
                className="object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                unoptimized
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}