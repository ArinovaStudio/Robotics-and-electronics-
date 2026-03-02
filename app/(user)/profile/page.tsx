"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, fetchUser } = useAuth();
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

  // Mock data for order summary and addresses
  const [orderSummary] = useState({
    totalSpent: 14000,
    totalOrders: 132,
  });

  const [addresses] = useState([
    "20 Soojian Dr, Leicester MA 1524",
    "121 Worcester Rd, Framingham MA 1701",
  ]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user && !isEditing) {
      const nameParts = (user.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "", // <-- FIXED: use phone
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
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Profile updated successfully!");
        await fetchUser();
        setIsEditing(false);
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
    <main className="bg-[#f5f5f5]  font-space-grotesk  min-h-screen py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-black text-black mb-8 tracking-tight">
          YOUR ACCOUNT
        </h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Personal Information Card */}
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
                {/* First Name */}
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

                {/* Last Name */}
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
                {/* Email Address */}
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

                {/* Phone Number */}
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

              {/* Edit/Save Button */}
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
                          phone: "",
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
                    className=" w-[120px] h-[42px] cursor-pointer hover:bg-[#FFDFB9] rounded-[8px] opacity-100 border border-[#FADAB9] bg-[#FFEFD6] shadow-[0_0_0_1px_#FFDFB9,0_0_0_3px_#FFF,0_0_0_5px_#FFDFB9]" >
                    EDIT
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary Card */}
          <div>

            <div className="bg-white rounded-[20px]  pt-4 px-8 pb-8">
              <h2 className="text-right text-[#F0B31E] font-medium text-[20px] tracking-wider mb-8">
                ORDER SUMMARY
              </h2>

              <div className="grid grid-cols-2 font-sans gap-6 mb-4">
                <div>
                  <p className="text-xs font-bold text-black mb-2 tracking-wide">
                    TOTAL SPENT
                  </p>
                  <p className="text-3xl font-black text-black">
                    ₹ {orderSummary.totalSpent.toLocaleString()}
                  </p>
                </div>

                <div className="border-l-4 border-black pl-16">
                  <p className="text-xs font-bold text-black mb-2 tracking-wide">
                    TOTAL ORDERS
                  </p>
                  <p className="text-3xl font-black text-black">
                    {orderSummary.totalOrders}
                  </p>
                </div>
              </div>
            </div>
            {/* Address Section */}
            <div className="bg-white rounded-[20px] mt-4 pt-4 px-8 pb-8">
              <h3 className="text-right text-[#F0B31E] font-medium text-[20px] tracking-wider mb-6">
                ADDRESS
              </h3>
              <div className="space-y-4 font-inter mb-4">
                {addresses.map((address, index) => (
                  <p key={index} className="text-sm text-black font-medium">
                    {address}
                    <hr className="border-gray-200 my-4" />
                  </p>
                ))}
              </div>
              <button className="w-full text-[#F0B31E] font-medium text-[16px] tracking-wide hover:text-[#b8873d] transition-colors">
                ADD NEW +
              </button>
            </div>
          </div>

        </div>

        {/* Menu Section */}
        <div>
          <h2 className="text-3xl font-black text-black mb-6 tracking-tight">
            MENU
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Orders Card */}
            <button className="bg-white rounded-lg p-12 hover:bg-gray-50 transition-colors">
              <h3 className="text-2xl font-black text-black tracking-tight">
                MY ORDERS
              </h3>
            </button>

            {/* Wishlist Card */}
            <button className="bg-white rounded-lg p-12 hover:bg-gray-50 transition-colors">
              <h3 className="text-2xl font-black text-black tracking-tight">
                WISHLIST
              </h3>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}