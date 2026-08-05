import Navbar from "@/components/Navbar";
import ProductsSection from "@/components/ProductsSection";
import Footer from "@/components/Footer";
import { Suspense } from "react";

export default function ProductsPage() {
  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <Suspense>
      <Navbar />
      <ProductsSection />
      <Footer />
      </Suspense>
    </main>
  );
}
