import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartPage from "@/components/CartPage";

export default function Cart() {
  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <CartPage />
      <Footer />
    </main>
  );
}