import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"; 
import StarRating from "./StarRating";

interface ReviewCardProps {
  review: any; 
  isOwnReview?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ReviewCard({ 
  review,
  isOwnReview, 
  onEdit, 
  onDelete
 }: ReviewCardProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const hasImages = review.images && review.images.length > 0;
  const hasMultipleImages = review.images && review.images.length > 1;

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % review.images.length);
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) => 
      (prev - 1 + review.images.length) % review.images.length
    );
  };

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-5 flex flex-col gap-3 relative group">
      
      {/* Edit & Delete Action Buttons */}
      {isOwnReview && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={onEdit} className="p-1.5 bg-gray-100 hover:bg-[#f0b31e] hover:text-white rounded-md text-gray-600 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 bg-gray-100 hover:bg-red-500 hover:text-white rounded-md text-gray-600 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Star Rating */}
      <div className="flex items-center justify-between">
        <StarRating rating={review.rating} size={18} />
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2">
        <span className="text-[#050a30] text-sm font-extrabold">
          {review.user?.name || "Anonymous"}
        </span>
        {review.isVerifiedPurchase && (
          <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-[#22c55e] rounded-full shrink-0">
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-[#434343] text-[13px] leading-relaxed">{review.comment}</p>
      )}

      {/* Image Carousel */}
      {hasImages && (
        <div className="relative w-full h-[180px] mt-2 rounded-xl border border-gray-100 overflow-hidden group bg-gray-50">
          <Image 
            src={review.images[currentImageIdx]} 
            alt={`Review attachment ${currentImageIdx + 1}`} 
            fill 
            className="object-contain" 
          />
          
          {hasMultipleImages && (
            <>
              {/* Previous Button */}
              <button 
                onClick={prevImage} 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Next Button */}
              <button 
                onClick={nextImage} 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
              >
                <ChevronRight size={18} />
              </button>

              {/* Carousel Indicators (Dots) */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {review.images.map((_: any, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all shadow-sm ${
                      idx === currentImageIdx ? "bg-[#f0b31e] scale-110" : "bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Date */}
      <p className="text-[#9ca3af] text-xs font-semibold mt-1">
        {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}