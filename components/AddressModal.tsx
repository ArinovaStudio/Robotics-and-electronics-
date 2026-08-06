"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import indianCitiesData from "@/lib/indianCities.json";

const ACCENT = "#eab308";
const BORDER = "#232323";

const typedCitiesData: Record<string, string[]> = indianCitiesData;
const indianStates = Object.keys(typedCitiesData).sort();

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

const inputClasses =
  "w-full h-11 px-3 border bg-transparent text-sm font-mono text-gray-900 dark:text-white outline-none focus:border-current transition-colors placeholder:text-gray-400 dark:placeholder:text-white/30";

export default function AddressModal({ isOpen, onClose, onSuccess, initialData }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    name: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", pincode: "", type: "SHIPPING"
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableCities = formData.state ? typedCitiesData[formData.state] || [] : [];

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

    if (formData.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-3 sm:p-4">
      <div
        className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl relative"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 text-gray-400 dark:text-white/40 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <X size={22} />
        </button>

        <h2 className="font-dm-sans text-lg sm:text-xl font-extrabold mb-6 pr-8 text-gray-900 dark:text-white">
          {initialData ? "Update Address" : "Add New Address"}
        </h2>

        {error && (
          <div className="mb-5 border border-red-500/30 text-red-500 px-4 py-3 font-mono text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-1.5">
              Name <span style={{ color: ACCENT }}>*</span>
            </label>
            <input
              required
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClasses}
              style={{ borderColor: BORDER }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-1.5">
              Phone <span style={{ color: ACCENT }}>*</span>
            </label>
            <input
              required
              type="tel"
              maxLength={10}
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
              className={inputClasses}
              style={{ borderColor: BORDER }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-1.5">
              Address Line 1 <span style={{ color: ACCENT }}>*</span>
            </label>
            <input
              required
              placeholder="e.g. Flat 402, Sunshine Apartments"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className={inputClasses}
              style={{ borderColor: BORDER }}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-1.5">
              Address Line 2 (Optional)
            </label>
            <input
              placeholder="e.g. Near City Mall"
              value={formData.addressLine2 || ""}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className={inputClasses}
              style={{ borderColor: BORDER }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-1.5">
                City <span style={{ color: ACCENT }}>*</span>
              </label>
              <select
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!formData.state}
                className={`${inputClasses} appearance-none bg-white dark:bg-[#0a0a0a] disabled:opacity-40`}
                style={{ borderColor: BORDER }}
              >
                <option value="" disabled>Select City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-1.5">
                State <span style={{ color: ACCENT }}>*</span>
              </label>
              <select
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value, city: "" })}
                className={`${inputClasses} appearance-none bg-white dark:bg-[#0a0a0a]`}
                style={{ borderColor: BORDER }}
              >
                <option value="" disabled>Select State</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-1.5">
              Pincode <span style={{ color: ACCENT }}>*</span>
            </label>
            <input
              required
              maxLength={6}
              placeholder="e.g. 110001"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
              className={inputClasses}
              style={{ borderColor: BORDER }}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-700 dark:text-white/70 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
              style={{ borderColor: BORDER }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex justify-center items-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 py-3 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: ACCENT }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}