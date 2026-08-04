import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PopularNow from "@/components/PopularNow";
import CategoryGrid from "@/components/CategoryGrid";
import Recommended from "@/components/Recommended";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import ProductsSection from "@/components/ProductsSection";
import TechEngiSection from "@/components/TechEngiSection";
import PromoStrip from "@/components/PromoStrip";
import FeatureChipsStrip from "@/components/FeatureChipsStrip";

export default function BetaHomePage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <PromoStrip/>
      <Hero />
      <PopularNow />
      <CategoryGrid />
      <FeatureChipsStrip/>
      <ProductsSection />
      <Recommended />
      <TechEngiSection/>
      <Newsletter />
      <Footer />
    </main>
  );
}