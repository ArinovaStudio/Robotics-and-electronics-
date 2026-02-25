"use client";
import SingleProductPage from "@/components/SingleProductPage";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        
        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.message || "Failed to load product");
        }
      } catch (err) {
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    }
    
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#f0b31e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black text-[#050a30] mb-2">OOPS! 😥</h2>
        <p className="text-[#bdbdbd] text-lg mb-6">{error || "Product not found"}</p>
      </div>
    );
  }

  return <SingleProductPage product={product} />;
}
