import Navbar from "@/components/Navbar";
import ProductsSection from "@/components/ProductsSection";
import Footer from "@/components/Footer";

export default function ProductsPage() {
  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <ProductsSection />
      <Footer />
    </main>
  );
}
