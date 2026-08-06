"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import AddressModal from "@/components/AddressModal";

const ACCENT = "#eab308";
const BORDER = "#232323";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchProfile = useCallback(async (showGlobalLoader: boolean = true) => {
    try {
      if (showGlobalLoader) setFetchingProfile(true);

      const res = await fetch("/api/users/profile");
      const json = await res.json();

      if (json.success) {
        setProfileData(json.data);
        setAddresses(json.data.addresses || []);

        const nameParts = (json.data.user.name || "").split(" ");
        setFormData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: json.data.user.email || "",
          phone: json.data.user.phone || "",
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      if (showGlobalLoader) setFetchingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchProfile(true);
  }, [isAuthenticated, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, phone: formData.phone }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Profile updated successfully!");

        await fetchProfile(false);

        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || fetchingProfile || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex justify-center items-center py-24 sm:py-40">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 sm:py-16 px-4 sm:px-6 md:px-16 transition-colors">
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchProfile(false)}
      />

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href=""
          className="inline-block font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          Home
        </Link>

        <h1 className="font-dm-sans text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-6 sm:mb-8">
          Your Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Personal information */}
          <div className="lg:col-span-2 border border-gray-300 dark:border-white/10 p-5 sm:p-8">
            <h2 className="font-mono text-[11px] uppercase tracking-widest mb-6 sm:mb-8" style={{ color: "#92700a" }}>
              Personal Information
            </h2>

            {error && (
              <div className="mb-6 p-4 border border-red-500/40 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-mono text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 border border-green-500/40 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-mono text-xs">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white dark:bg-black border font-dm-sans text-sm text-gray-900 dark:text-white focus:outline-none disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:text-gray-600 dark:disabled:text-white/50 transition-colors"
                    style={{ borderColor: BORDER }}
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white dark:bg-black border font-dm-sans text-sm text-gray-900 dark:text-white focus:outline-none disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:text-gray-600 dark:disabled:text-white/50 transition-colors"
                    style={{ borderColor: BORDER }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border font-dm-sans text-sm text-gray-600 dark:text-white/50 cursor-not-allowed"
                    style={{ borderColor: BORDER }}
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white dark:bg-black border font-dm-sans text-sm text-gray-900 dark:text-white focus:outline-none disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:text-gray-600 dark:disabled:text-white/50 transition-colors"
                    style={{ borderColor: BORDER }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                {isEditing ? (
                  <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        const nameParts = (profileData?.user?.name || user?.name || "").split(" ");
                        setFormData({
                          firstName: nameParts[0] || "",
                          lastName: nameParts.slice(1).join(" ") || "",
                          email: profileData?.user?.email || user?.email || "",
                          phone: profileData?.user?.phone || user?.phone || "",
                        });
                      }}
                      className="px-8 py-3 border font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-700 dark:text-white/70 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 w-full sm:w-auto"
                      style={{ borderColor: BORDER }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
                      style={{ backgroundColor: ACCENT }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3 border font-dm-sans text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-gray-50 dark:hover:bg-white/5 w-full sm:w-auto"
                    style={{ borderColor: ACCENT, color: "#92700a" }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right column: summary + addresses */}
          <div className="flex flex-col gap-6">
            <div className="border border-gray-300 dark:border-white/10 p-5 sm:p-8">
              <h2 className="font-mono text-[11px] uppercase tracking-widest mb-6 sm:mb-8" style={{ color: "#92700a" }}>
                Order Summary
              </h2>

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                    Total Spent
                  </p>
                  <p className="font-dm-sans text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white break-words">
                    ₹{Number(profileData?.stats?.totalSpent || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="border-l pl-4 sm:pl-6" style={{ borderColor: BORDER }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                    Total Orders
                  </p>
                  <p className="font-dm-sans text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                    {profileData?.stats?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 dark:border-white/10 p-5 sm:p-8">
              <h3 className="font-mono text-[11px] uppercase tracking-widest mb-6" style={{ color: "#92700a" }}>
                Address
              </h3>
              <div className="space-y-4 mb-6">
                {addresses.slice(0, 3).map((addr, index) => (
                  <div key={addr.id}>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400 dark:text-white/30" />
                      <p className="font-mono text-xs text-gray-700 dark:text-white/70 leading-relaxed break-words">
                        {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                    {index < Math.min(addresses.length - 1, 2) && (
                      <hr className="border-gray-100 dark:border-white/5 my-4" />
                    )}
                  </div>
                ))}

                {addresses.length === 0 && (
                  <p className="font-mono text-xs text-gray-500 dark:text-white/40">
                    No addresses saved yet.
                  </p>
                )}
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border font-mono text-[11px] font-bold uppercase tracking-widest transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                style={{ borderColor: ACCENT, color: "#92700a" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>
          </div>
        </div>

        {/* My Orders link-out */}
        <div>
          <h2 className="font-dm-sans text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6">
            My Orders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/orders"
              className="border border-gray-300 dark:border-white/10 p-6 sm:p-10 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <h3 className="font-dm-sans text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                My Orders
              </h3>
              <p className="font-mono text-xs text-gray-500 dark:text-white/40 mt-2">
                View, track, and manage all your orders
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}