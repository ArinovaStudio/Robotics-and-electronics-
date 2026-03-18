'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X, Upload, Loader2 } from 'lucide-react'

interface FeatureModalProps {
  open: boolean;
  onClose: () => void;
}

export const FeatureModal = ({ open, onClose }: FeatureModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productUrl: '',
    brand: '',
    quantity: '1'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('name', formData.name.trim());
      if (formData.description) form.append('description', formData.description.trim());
      if (formData.productUrl) form.append('productUrl', formData.productUrl.trim());
      if (formData.brand) form.append('brand', formData.brand.trim());
      form.append('quantity', formData.quantity);
      if (imageFile) form.append('image', imageFile);

      const response = await fetch('/api/users/requests', {
        method: 'POST',
        body: form,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit request');
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      productUrl: '',
      brand: '',
      quantity: '1'
    });
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setSuccess(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#050A30]">Request New Product</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-[#666] text-sm mb-4">
          Can't find what you're looking for? Let us know and we'll try to add it!
        </p>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
            Product request submitted successfully! 🎉
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="mb-4">
            <label className="block text-[#050A30] font-medium mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
              placeholder="e.g., Wireless Gaming Mouse"
              required
            />
          </div>

          {/* Brand */}
          <div className="mb-4">
            <label className="block text-[#050A30] font-medium mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
              placeholder="e.g., Logitech"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-[#050A30] font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
              placeholder="Tell us more about this product..."
              rows={4}
            />
          </div>

          {/* Product URL */}
          <div className="mb-4">
            <label className="block text-[#050A30] font-medium mb-2">Product URL (Optional)</label>
            <input
              type="url"
              name="productUrl"
              value={formData.productUrl}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
              placeholder="https://example.com/product"
            />
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <label className="block text-[#050A30] font-medium mb-2">Quantity Interested</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#f0b31e]"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-[#050A30] font-medium mb-2">Product Image (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <span className="text-sm text-gray-600">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#f0b31e] text-white font-semibold text-sm px-4 py-2 rounded-lg shadow hover:bg-[#e0a01a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};