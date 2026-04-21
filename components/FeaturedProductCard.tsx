import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, ArrowRight } from "lucide-react";
import Link from "next/link";
export enum ProductAvailability {
  IN_STOCK = "IN_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  PREORDER = "PREORDER",
  BACKORDER = "BACKORDER",
}

export enum ProductCondition {
  NEW = "NEW",
  REFURBISHED = "REFURBISHED",
  USED = "USED",
}
export interface Product {
  id: string;
  title: string;
  description: string;
  link: string;

  // Images
  imageLink: string;
  additionalImageLinks: string[];

  // Pricing
  price: number;
  salePrice?: number | null;
  salePriceStartDate?: string | null;
  salePriceEndDate?: string | null;

  // Availability & Stock
  availability: ProductAvailability;
  stockQuantity: number;

  // Identification
  sku: string;
  mpn?: string | null;
  brand?: string | null;

  // Condition
  condition: ProductCondition;

  // Category
  categoryId: string;

  productHighlights: string[];

  // Custom Labels
  customLabel0?: string | null;
  customLabel1?: string | null;

  // Status
  isActive: boolean;
  isBundle: boolean;

  // Featured
  featured?: boolean | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export default function RealEstateCard({ product }: { product: Product }) {
  return (
    <Card className="w-full max-w-xl my-3 relative pb-2 pt-0 rounded-3xl shadow-xl overflow-hidden bg-transparent border-0">
      {/* Image Section */}
      <img
        src={product.imageLink}
        alt="house"
        className="w-full h-full absolute object-cover rounded-3xl"
      />
      <div className="relative h-72">
        {/* Overlay gradient for readability */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-3xl" /> */}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <Badge className="bg-white text-orange-500">FOR SALE</Badge>
          <Badge className="bg-white text-green-600">FEATURED</Badge>
        </div>
      </div>

      {/* Floating Content Card */}
      <CardContent className="relative -mt-16 mx-4 mb-4 p-5 rounded-2xl bg-white shadow-lg flex flex-col">
        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Price + Badge */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-yellow-600">
              ₹{product.salePrice ?? product.price}
            </div>

            {product.salePrice && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-md font-medium">
                Sale
              </span>
            )}
          </div>

          {/* Title */}
          <div className="font-medium text-base leading-snug line-clamp-2">
            {product.title}
          </div>

          {/* Description */}
          <div className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {product.description}
          </div>

          {/* Brand */}
          <div className="text-sm text-gray-500">
            {product.brand ?? "Unbranded"}
          </div>

          {/* Divider */}
          <div className="border-t pt-3 grid grid-cols-2 items-center text-xs text-gray-600">
            {/* Stock */}
            {/* <span>
              <span className="font-bold">Stock:</span>{" "}
              <span className="font-medium text-black">
                {product.stockQuantity}
              </span>
            </span> */}

            {/* Availability */}
            <span className="capitalize">
              <span className="font-bold">Availability:</span>{" "}
              {product.availability.replace("_", " ").toLowerCase()}
            </span>

            {/* Condition */}
            <span className="capitalize">
                <span className="font-bold">Condition:</span>{" "}
              {product.condition.toLowerCase()}
            </span>
          </div>
        </div>

        {/* CTA Button (sticks to bottom) */}
        <Link
          href={`/products/${product.link}`}
          className="group flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium mt-4 transition-all duration-300 hover:bg-yellow-600 hover:shadow-md active:scale-[0.98]"
        >
          View Now
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  );
}
