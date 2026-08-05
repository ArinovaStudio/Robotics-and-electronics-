import ProductDetail from "@/components/ProductDetail";

type SimilarProduct = {
  id: string;
  title: string;
  imageLink: string | null;
  price: any;
  salePrice: any;
  link: string;
};

async function getSimilarProducts(
  link: string
): Promise<SimilarProduct[]> {
  // Optional 1.5 second delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/products/${link}/similar?limit=8`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) return [];

  const json = await res.json();

  return json?.data?.products ?? [];
}

export default async function SimilarProducts({
  product,
  link,
}: {
  product: any;
  link: string;
}) {
  const similarProducts = await getSimilarProducts(link);

  return (
    <ProductDetail
    product={product}
      similarProducts={similarProducts}
    />
  );
}