"use client";
// ─── Breadcrumbs Component ────────────────────────────────────────────────
type BreadcrumbItem = { label: string; href?: string };
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      className="flex flex-wrap items-center gap-y-2 gap-x-2 text-sm text-[#9ca3af] mb-8"
      aria-label="Breadcrumb"
    >
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          {item.href && idx !== items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-[#050a30] transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#050a30] font-semibold break-words min-w-0">
              {item.label}
            </span>
          )}
          {idx < items.length - 1 && <span className="text-[#ccc] flex-shrink-0">›</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

import { Unbounded } from "next/font/google";

const unbounded = Unbounded({ subsets: ["latin"], weight: ["900"] });

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Loader2, Check } from "lucide-react";
import { useCart, useAuth } from "@/app/contexts";
import ReviewModal from "@/components/ReviewModal";
import ReviewCard from "./ReviewCard";
import ProductGrid from "./ProductGrid";

type APIProduct = {
  id: string;
  title: string;
  description: string;
  imageLink: string;
  additionalImageLinks: string[];
  price: number;
  salePrice: number | null;
  link: string;
  productHighlights: string[];
  productDetails: any;
  availability: string;
};

// ─── Star Rating ──────────────────────────────────────────────────
function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <span
            key={star}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              fill="#e0e0e0"
              className="text-[#e0e0e0] absolute inset-0"
            />
            {filled || half ? (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <Star size={size} fill="#f0b31e" className="text-[#f0b31e]" />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function SingleProductPage({
  product,
}: {
  product: APIProduct;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "faqs">(
    "details"
  );
  const [suggestedProducts, setSuggestedProducts] = useState<APIProduct[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [faqs, setFaqs] = useState<
    { id: string; question: string; answer: string }[]
  >([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [productDetails, setProductDetails] = useState<any>({});
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  useEffect(() => {
    if (product) {
      const groupedDetails: any = {};
      for (let item of product.productDetails) {
        const sectionName = (item?.sectionName as string).toLowerCase();
        const attributeName = (item?.attributeName as string).toLowerCase();
        const attributeValue = (item?.attributeValue as string).toLowerCase();
        if (Object.keys(groupedDetails).includes(sectionName)) {
          groupedDetails[sectionName].push({ attributeName, attributeValue });
        } else {
          groupedDetails[sectionName] = [{ attributeName, attributeValue }];
        }
      }
      setProductDetails(groupedDetails);
    }
  }, []);
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err: any) {
      alert(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      router.push("/cart");
    } catch (err: any) {
      alert(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (formData: FormData, reviewId?: string) => {
    const url = reviewId
      ? `/api/users/reviews/${reviewId}`
      : "/api/users/reviews";
    const method = reviewId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const [reviewRes, userRevRes] = await Promise.all([
      fetch(`/api/products/${product.id}/reviews?page=1&limit=6`),
      fetch(`/api/users/reviews?productId=${product.id}`),
    ]);

    const reviewData = await reviewRes.json();
    const userRevData = await userRevRes.json();

    if (reviewData.success) {
      setReviews(reviewData.data.reviews || []);
      setAverageRating(reviewData.data.averageRating || 0);
      setTotalReviews(reviewData.data.total || 0);
    }

    if (userRevData.success) {
      const reviewsWithUserAttached = (userRevData.data.reviews || []).map(
        (r: any) => ({
          ...r,
          user: { name: user?.name || "Me" },
        })
      );
      setUserReviews(reviewsWithUserAttached);
    }
  };

  const loadMoreReviews = async () => {
    if (reviewsLoading) return;
    setReviewsLoading(true);
    const nextPage = reviewPage + 1;

    try {
      const res = await fetch(
        `/api/products/${product.id}/reviews?page=${nextPage}&limit=6`
      );
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => [...prev, ...data.data.reviews]);
        setReviewPage(nextPage);
        setHasMoreReviews(data.data.hasMore);
        setHasMoreReviews(data.data.page < data.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to load more", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/users/reviews/${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUserReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setTotalReviews((prev) => prev - 1);
        if (userReviews.length === 1) setShowMyReviews(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  // Load similar products, FAQs, and reviews
  useEffect(() => {
    async function fetchData() {
      if (!product?.id) return;
      try {
        const [similarRes, faqRes, reviewRes] = await Promise.all([
          fetch(`/api/products/${product.id}/similar?limit=4`),
          fetch(`/api/products/${product.id}/faqs`),
          fetch(`/api/products/${product.id}/reviews?page=1&limit=6`),
        ]);
        const similarData = await similarRes.json();
        const faqData = await faqRes.json();
        const reviewData = await reviewRes.json();
        if (similarData.success) {
          const formattedProducts = (similarData.data.products || []).map((p: any) => ({
            ...p,
            image: p.imageLink 
          }));
          setSuggestedProducts(formattedProducts);
        }
        if (faqData.success) setFaqs(faqData.data || []);
        if (reviewData.success) {
          setReviews(reviewData.data.reviews || []);
          setAverageRating(reviewData.data.averageRating || 0);
          setTotalReviews(reviewData.data.total || 0);
          setHasMoreReviews(reviewData.data.hasMore || false);
          setHasMoreReviews(reviewData.data.page < reviewData.data.totalPages);
        }

        if (isAuthenticated) {
          const userRevRes = await fetch(
            `/api/users/reviews?productId=${product.id}`
          );
          const userRevData = await userRevRes.json();
          if (userRevData.success) {
            const reviewsWithUserAttached = (
              userRevData.data.reviews || []
            ).map((r: any) => ({
              ...r,
              user: { name: user?.name || "Me" },
            }));
            setUserReviews(reviewsWithUserAttached);
          }
        }
      } catch (err) {
        console.error("Failed to load data", err);
      }
    }
    fetchData();
  }, [product?.id, product?.link]);

  const tabs = [
    { id: "details" as const, label: "Product Details" },
    { id: "reviews" as const, label: "Rating & Reviews" },
    { id: "faqs" as const, label: "FAQs" },
  ];

  const allImages = [
    product.imageLink,
    ...(product.additionalImageLinks || []),
  ].filter(Boolean);

  let discountPct = 0;
  if (product.salePrice && product.price > product.salePrice) {
    discountPct = Math.round(
      ((product.price - product.salePrice) / product.price) * 100
    );
  }

  const currentPrice = product.salePrice ? product.salePrice : product.price;
  return (
    <div className="bg-white min-h-screen font-sans">
      {/* ── PAGE BODY ── */}
      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/products" },
            { label: product.title },
          ]}
        />

        {/* ── PRODUCT LAYOUT ── */}
        <div className="flex xl:flex-row flex-col gap-8 xl:gap-8 items-start">
          <div className="flex lg:flex-row flex-col gap-6 items-start w-full xl:w-[60%] shrink-0">
            {/* Thumbnails + Main */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 sm:gap-6 w-full">
              {/* Thumbnails */}
              <div className="flex sm:flex-col flex-row gap-3 sm:gap-3 overflow-x-auto sm:overflow-visible">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-[70px] h-[70px] sm:w-[100px] sm:h-[95px] lg:w-[120px] lg:h-[110px] 
                      rounded-xl border-2 overflow-hidden bg-gray-100 transition-all relative
                      ${
                        selectedImage === idx
                          ? "border-[#f0b31e]"
                          : "border-[#e8e8e8] hover:border-[#f0b31e]/50"
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumb ${idx}`}
                      fill
                      unoptimized
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="flex-1 flex justify-center sm:justify-start w-full">
              <div className="w-full relative h-[350px] md:h-[450px] shrink-0">
                {allImages.length > 0 && (
                  <Image
                    src={allImages[selectedImage]}
                    alt={product.title}
                    fill
                    unoptimized
                    className="object-contain p-2 sm:p-6" 
                  />
                )}
              </div>
            </div>
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 w-full pl-0 xl:pl-6 leading-tight">
            <h1 className="text-[#050a30] font-inter text-[28px] md:text-[32px] font-extrabold leading-tight mb-3">
              {product.title}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={averageRating} />
              <span className="text-[#434343] text-sm font-semibold">
                {averageRating.toFixed(1)}/5 ({totalReviews} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#050a30] text-[28px] font-extrabold">
                ₹{Number(currentPrice).toFixed(2)}
              </span>
              {discountPct > 0 && (
                <span className="text-[#9ca3af] text-xl font-bold line-through">
                  ₹{Number(product.price).toFixed(2)}
                </span>
              )}
              {discountPct > 0 && (
                <span className="bg-[#ffe5e5] text-[#ff4d4d] text-sm font-bold px-3 py-[5px] rounded-md">
                  -{Number(discountPct).toFixed(0)}% OFF
                </span>
              )}
            </div>

            <p className="text-[#555] text-sm leading-relaxed mb-5 whitespace-pre-wrap">
              {product.description}
            </p>

            <div className="mb-4 text-sm font-semibold">
              <span
                className={
                  product.availability === "IN_STOCK"
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                {product.availability === "IN_STOCK"
                  ? "✓ In Stock"
                  : "✗ Out of Stock"}
              </span>
            </div>

            <hr className="border-[#e8e8e8] mb-6 mt-6" />

            {/* Quantity + Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between bg-[#f5f5f5] rounded-full px-5 py-[12px] md:py-[10px] gap-4 border border-[#e8e8e8] w-full md:w-[130px] shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[#050a30] text-2xl font-bold hover:text-[#f0b31e] w-8 h-8 flex items-center justify-center leading-none"
                >
                  −
                </button>

                <span className="text-[#050a30] text-base font-bold text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-[#050a30] text-2xl font-bold hover:text-[#f0b31e] w-8 h-8 flex items-center justify-center leading-none"
                >
                  +
                </button>
              </div>

              <div className="flex flex-row gap-3 w-full">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.availability !== "IN_STOCK"}
                  className="w-[170px] text-[#f0b31e] font-bold text-sm px-5 py-[15px] rounded-full border-2 border-[#f0b31e] hover:bg-[#fffbe6] transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : addedToCart ? (
                    <>
                      <Check size={18} /> Added!
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart || product.availability !== "IN_STOCK"}
                  className="
        w-[170px] font-space-grotesk
        bg-[#f0b31e] text-white
        font-bold text-sm
        px-6 py-[14px] md:py-[12px]
        rounded-full
        border-2 border-[#f0b31e]
        hover:bg-[#e0a800] hover:border-[#e0a800]
        transition-all shadow-md hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
      "
                >
                  BUY NOW
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            TABS SECTION
        ══════════════════════════════════════════ */}
        <div className="mt-20">
          {/* Tab bar */}
          <div className="flex border-b border-[#e8e8e8]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-center pb-4 text-sm md:text-base transition-all relative
                  ${
                    activeTab === tab.id
                      ? "text-[#050a30] font-bold"
                      : "text-[#9ca3af] font-semibold hover:text-[#050a30]"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-[20%] right-[20%] md:left-1/2 md:-translate-x-1/2 md:w-[170px] h-[3px] bg-[#050a30] rounded-t-lg" />
                )}
              </button>
            ))}
          </div>

          {/* ── Product Details ── */}
          {activeTab === "details" && (
            <div className="mt-8 text-[#434343] text-sm md:text-base leading-relaxed space-y-6">
              {/* Features & Specifications */}
              <div>
                <h3 className="text-xl border-b-2 border-b pb-3 px-[5px] font-bold text-[#050a30] mb-4">
                  Features & Specifications
                </h3>

                {product.productHighlights &&
                product.productHighlights.length > 0 ? (
                  <ul className="space-y-2">
                    {product.productHighlights.map((highlight, i) => (
                      <li
                        key={i}
                        className="border-b-2 pl-2 text-md font-[600] border-b pb-3"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No extra specifications strictly defined for this product
                    right now.
                  </p>
                )}
              </div>

              {/* Dynamic Sections */}
              {Object.keys(productDetails).map((section: string) => {
                return (
                  <div key={section}>
                    <h3 className="text-xl capitalize border-b-2 border-b pb-3 px-[5px] font-bold text-[#050a30] mb-4">
                      {section}
                    </h3>

                    {productDetails && productDetails[section]?.length > 0 ? (
                      <ul className="space-y-4">
                        {productDetails[section]?.map(
                          (
                            { attributeName, attributeValue }: any,
                            i: number
                          ) => (
                            <li
                              key={i}
                              className="border-b-2 grid grid-cols-2 md:pl-2 px-2 max-md:w-full text-md font-[600] border-b pb-3"
                            >
                              <div className="font-[500] capitalize max-md:text-left">
                                {attributeName}
                              </div>
                              <div className="font-[500] capitalize max-md:text-right">
                                {attributeValue}
                              </div>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>
                        No extra specifications strictly defined for this
                        product right now.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Rating & Reviews ── */}
          {activeTab === "reviews" && (
            <div className="mt-8">
              {/* Header & Buttons */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:justify-between mb-8">
                <h2 className="text-[#050a30] text-2xl font-extrabold">
                  {showMyReviews ? "My Reviews" : "All Reviews"}
                  <span className="text-[#9ca3af] text-lg font-semibold ml-2">
                    ({showMyReviews ? userReviews.length : totalReviews})
                  </span>
                </h2>

                <div className="flex gap-3 w-full md:w-auto">
                  {/* Toggle My Reviews Button */}
                  {userReviews.length > 0 && (
                    <button
                      onClick={() => setShowMyReviews(!showMyReviews)}
                      className="flex-1 md:flex-none justify-center bg-white border-2 border-[#050a30] text-[#050a30] text-sm font-bold px-6 py-[10px] rounded-full hover:bg-gray-50 transition-all"
                    >
                      {showMyReviews ? "Show All Reviews" : "My Reviews"}
                    </button>
                  )}

                  {/* Write a Review Button */}
                  <button
                    onClick={() => {
                      if (!isAuthenticated)
                        return router.push(
                          `/login?callbackUrl=/products/${product.id}`
                        );
                      setEditingReview(null); // Ensure modal opens fresh
                      setShowReviewModal(true);
                    }}
                    className="flex-1 md:flex-none justify-center bg-[#050a30] text-white text-sm font-bold px-6 py-[12px] rounded-full hover:bg-[#0a1560] shadow-md transition-all"
                  >
                    Write a Review
                  </button>
                </div>
              </div>

              {/* Render the Reviews Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                {(showMyReviews ? userReviews : reviews).map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isOwnReview={showMyReviews || (!!user?.id && review.userId === user.id)}
                    onEdit={() => {
                      setEditingReview(review);
                      setShowReviewModal(true);
                    }}
                    onDelete={() => handleDeleteReview(review.id)}
                  />
                ))}
              </div>

              {!reviews.length && !showMyReviews && (
                <p className="text-center text-gray-500 py-10">
                  No reviews yet. Be the first to review!
                </p>
              )}

              {/* Load More Button */}
              {!showMyReviews && hasMoreReviews && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={loadMoreReviews}
                    disabled={reviewsLoading}
                    className="px-8 py-3 border-2 border-gray-200 rounded-full text-sm font-bold text-[#050a30] hover:border-[#050a30] transition-all disabled:opacity-50"
                  >
                    {reviewsLoading ? (
                      <Loader2 className="animate-spin inline mr-2" size={16} />
                    ) : null}
                    {reviewsLoading ? "Loading..." : "Load More Reviews"}
                  </button>
                </div>
              )}
            </div>
          )}

          <ReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setEditingReview(null);
            }}
            onSubmit={handleSubmitReview}
            productId={product.id}
            initialData={editingReview}
          />

          {/* ── FAQs ── */}
          {activeTab === "faqs" && (
            <div className="mt-8 md:max-w-4xl">
              <h3 className="text-xl font-bold text-[#050a30] mb-6">
                Frequently Asked Questions
              </h3>
              {faqs.length > 0 ? (
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div
                      key={faq.id}
                      className="border border-[#e8e8e8] rounded-xl overflow-hidden bg-white"
                    >
                      <button
                        onClick={() =>
                          setOpenFaqIndex(openFaqIndex === index ? null : index)
                        }
                        className="w-full flex justify-between items-center p-4 text-left hover:bg-[#f8fafd] transition-colors"
                      >
                        <span className="font-semibold text-[#050a30] pr-4">
                          {faq.question}
                        </span>
                        <span
                          className={`text-[#9ca3af] text-xl transition-transform ${
                            openFaqIndex === index ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                      {openFaqIndex === index && (
                        <div className="px-4 pb-4 text-[#434343] text-sm border-t border-[#e8e8e8] pt-3 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#9ca3af] text-sm">
                  No FAQs available for this product yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            YOU MIGHT ALSO LIKE
        ══════════════════════════════════════════ */}
        {suggestedProducts.length > 0 && (
          <section className="mt-24 mb-10">
            {/* Title */}
            <h2
              className={`text-center font-unbounded text-[#050a30] text-[32px] md:text-[38px] font-black tracking-tight mb-12 ${unbounded.className}`}
            >
              You might also like
            </h2>

            {/* 4-column product grid */}
            <ProductGrid products={suggestedProducts as any}/>
          </section>
        )}
      </div>
    </div>
  );
}
