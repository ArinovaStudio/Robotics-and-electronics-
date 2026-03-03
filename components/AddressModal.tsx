"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

type AddressFormData = {
  id?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
};

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AddressFormData | null;
}

export default function AddressModal({ isOpen, onClose, onSuccess, initialData }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    name: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", pincode: "", type: "SHIPPING"
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "", phone: "", addressLine1: "", addressLine2: "",
        city: "", state: "", pincode: "", type: "SHIPPING"
      });
    }
    setError("");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const isUpdating = !!initialData?.id;
      const url = isUpdating ? `/api/users/address/${initialData.id}` : "/api/users/address";
      const method = isUpdating ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || data.error || "Failed to save address");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl relative">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {initialData ? "Update Address" : "Add New Address"}
        </h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#f0b31e]" />
          <input required placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#f0b31e]" />
          <input required placeholder="Address Line 1" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#f0b31e]" />
          <input placeholder="Address Line 2 (Optional)" value={formData.addressLine2 || ""} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#f0b31e]" />
          
          <div className="flex gap-4">
            <input required placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-1/2 border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#f0b31e]" />
            <input required placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-1/2 border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#f0b31e]" />
          </div>
          
          <input required placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#f0b31e]" />
          
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 flex justify-center items-center gap-2 bg-[#f0b31e] text-white py-2.5 rounded font-bold hover:bg-[#e0a800] transition-colors disabled:opacity-50">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "SAVING..." : "SAVE ADDRESS"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded font-bold hover:bg-gray-50 transition-colors">
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}