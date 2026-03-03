"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const [profileRes, addressRes] = await Promise.all([
          fetch("/api/users/profile"),
          fetch("/api/users/address")
        ]);
        const profileData = await profileRes.json();
        const addressData = await addressRes.json();

        if (profileData.success) {
          setProfileData(profileData);
        }
        if (addressData.success) {
          setAddresses(addressData.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    if (user && !isEditing) {
      const nameParts = (user.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, isEditing]);

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
        await fetchUser();
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-12 h-12 border-4 border-[#f0b31e] border-t-transparent rounded-full animate-spin text-[#f0b31e]" />
      </div>
    );
  }

  return (
    <main className="bg-[#f5f5f5] font-space-grotesk min-h-screen py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl font-black text-black mb-8 tracking-tight">
          YOUR ACCOUNT
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg pt-4 px-8 pb-8">
            <h2 className="text-right text-[20px] text-[#F0B31E] font-medium tracking-wider mb-8">
              PERSONAL INFORMATION
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-black mb-2 tracking-wide">
                    FIRST NAME
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0B31E] text-black font-medium disabled:bg-gray-50 disabled:text-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-2 tracking-wide">
                    LAST NAME
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0B31E] text-black font-medium disabled:bg-gray-50 disabled:text-gray-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-black mb-2 tracking-wide">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-black rounded-lg text-black font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-2 tracking-wide">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0B31E] text-black font-medium disabled:bg-gray-50 disabled:text-gray-700"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        const nameParts = (user?.name || "").split(" ");
                        setFormData({
                          firstName: nameParts[0] || "",
                          lastName: nameParts.slice(1).join(" ") || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                        });
                      }}
                      className="px-8 py-2.5 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-sm tracking-wide transition-colors"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-2.5 bg-[#f5e6d3] hover:bg-[#ead5ba] text-black rounded-lg font-bold text-sm tracking-wide transition-colors disabled:opacity-50"
                    >
                      {saving ? "SAVING..." : "SAVE"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-[120px] h-[42px] cursor-pointer hover:bg-[#FFDFB9] rounded-[8px] opacity-100 border border-[#FADAB9] bg-[#FFEFD6] shadow-[0_0_0_1px_#FFDFB9,0_0_0_3px_#FFF,0_0_0_5px_#FFDFB9]"
                  >
                    EDIT
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-[20px] pt-4 px-8 pb-8">
              <h2 className="text-right text-[#F0B31E] font-medium text-[20px] tracking-wider mb-8">
                ORDER SUMMARY
              </h2>

              <div className="grid grid-cols-2 font-sans gap-6 mb-4">
                <div>
                  <p className="text-xs font-bold text-black mb-2 tracking-wide">
                    TOTAL SPENT
                  </p>
                  <p className="text-3xl font-black text-black">
                    ₹ {Number(profileData?.stats?.totalSpent || 0).toLocaleString()}
                  </p>
                </div>

                <div className="border-l-4 border-black pl-16">
                  <p className="text-xs font-bold text-black mb-2 tracking-wide">
                    TOTAL ORDERS
                  </p>
                  <p className="text-3xl font-black text-black">
                    {profileData?.stats?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] mt-4 pt-4 px-8 pb-8">
              <h3 className="text-right text-[#F0B31E] font-medium text-[20px] tracking-wider mb-6">
                ADDRESS
              </h3>
              <div className="space-y-4 font-inter mb-4">
                {addresses.slice(0, 3).map((addr, index) => (
                  <div key={addr.id}>
                    <p className="text-sm text-black font-medium">
                      {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    {index < Math.min(addresses.length - 1, 2) && <hr className="border-gray-200 my-4" />}
                  </div>
                ))}
              </div>
              <button onClick={() => router.push("/cart/address")} className="w-full text-[#F0B31E] font-medium text-[16px] tracking-wide hover:text-[#b8873d] transition-colors">
                ADD NEW +
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-black mb-6 tracking-tight">
            My Orders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="bg-white rounded-lg p-12 hover:bg-gray-50 transition-colors text-2xl font-black text-black tracking-tight">
              MY ORDERS
            </h3>
          </div>
        </div>
      </div>
    </main>
  );
}