import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `About Us | ${SITE_NAME}`,
  description: "Learn more about our robotics and electronics store.",
};

export default function AboutPage() {
  return (
    <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center justify-center py-12 px-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-[#050a30] tracking-tight uppercase">
          About Us
        </h1>
      </div>
    </div>
  );
}