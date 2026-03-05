"use client";
import { useState, useRef, useEffect } from "react";
import { Star, X, ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";

export type ReviewInitialData = {
  id?: string;
  rating: number;
  comment: string;
  images?: string[]; 
};

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  productId,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData, reviewId?: string) => Promise<void>;
  productId: string;
  initialData?: ReviewInitialData | null;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Image States
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setRating(initialData.rating || 5);
        setComment(initialData.comment || "");
        setExistingImages(initialData.images || []);
      } else {
        setRating(5);
        setComment("");
        setExistingImages([]);
      }
      setNewFiles([]);
      setNewFilePreviews([]);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    return () => {
      newFilePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newFilePreviews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      setNewFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setNewFilePreviews((prev) => [...prev, ...newPreviews]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeNewFile = (indexToRemove: number) => {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setNewFilePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[indexToRemove]); 
      newPreviews.splice(indexToRemove, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", rating.toString());
      if (comment) formData.append("comment", comment);

      if (initialData?.id) {
        existingImages.forEach((img) => formData.append("existingImages", img));
        newFiles.forEach((file) => formData.append("newImages", file));
      } else {
        newFiles.forEach((file) => formData.append("images", file));
      }

      await onSubmit(formData, initialData?.id);
      onClose();
    } catch (error: any) {
      alert(error?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-[#050a30] mb-6">
          {initialData?.id ? "Edit Your Review" : "Write a Review"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={36}
                    fill={(hoveredRating || rating) >= star ? "#f0b31e" : "#e0e0e0"}
                    className={(hoveredRating || rating) >= star ? "text-[#f0b31e]" : "text-[#e0e0e0]"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text Section */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full border border-gray-200 rounded-xl p-4 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#f0b31e] focus:border-transparent transition-all resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1 text-right font-medium">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Image Upload Section */}
          <div>
            {/* <label className="block text-sm font-bold text-gray-800 mb-2">
              Add Photos <span className="text-gray-400 font-medium text-xs">(Optional, Max 5)</span>
            </label> */}
            
            <div className="flex flex-wrap gap-3">
              {/* Existing Images (for edit mode) */}
              {existingImages.map((imgUrl, idx) => (
                <div key={`existing-${idx}`} className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden group">
                  <Image src={imgUrl} alt="review image" fill className="object-cover" />
                  <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}

              {/* Newly Selected Images */}
              {newFilePreviews.map((previewUrl, idx) => (
                <div key={`new-${idx}`} className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden group">
                  <Image src={previewUrl} alt="new review image" fill className="object-cover" />
                  <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Button */}
              {existingImages.length + newFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#f0b31e] hover:text-[#f0b31e] hover:bg-yellow-50 transition-all"
                >
                  <ImagePlus size={22} />
                </button>
              )}
            </div>
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              multiple
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileSelect}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-[#050a30] text-white rounded-xl text-sm font-bold hover:bg-[#0a1560] transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting...</>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}