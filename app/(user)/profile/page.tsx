"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts";
import { useRouter } from "next/navigation";
import { User, Mail, Loader2, Save, X } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, fetchUser } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Profile updated successfully!");
        await fetchUser(); // reload user data
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
    <main className="bg-[#f8fafd] min-h-screen py-10 px-4">
      <div className="max-w-[800px] mx-auto bg-white rounded-2xl shadow-sm border border-[#ececec] overflow-hidden">
        {/* Header */}
        <div className="bg-[#050a30] px-8 py-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-[#f0b31e] rounded-full flex items-center justify-center text-[#050a30] text-4xl font-bold shadow-lg shadow-[#050a30]/20">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="text-center md:text-left text-white">
            <h1 className="text-3xl font-black tracking-wide mb-1">
              {user?.name}
            </h1>
            <p className="text-[#aeb5d1] text-lg font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#050a30]">
              Personal Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#f0b31e] font-semibold hover:text-[#e6a700] transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

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

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#434343] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f8f8] border-none rounded-xl focus:ring-2 focus:ring-[#f0b31e] outline-none text-[#050a30] font-medium transition-shadow"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#434343] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-11 pr-4 py-3 bg-[#f0f0f0] text-gray-500 border-none rounded-xl outline-none font-medium cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Email cannot be changed directly. Contact support for help.
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user?.name || "", email: user?.email || "" });
                  }}
                  className="px-6 py-3 rounded-xl font-semibold text-[#434343] hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <X size={20} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim()}
                  className="px-6 py-3 bg-[#f0b31e] hover:bg-[#e6a700] text-white rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#f8fafd] flex items-center justify-center text-[#f0b31e] shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#8ca0b2] mb-1">
                    Full Name
                  </h3>
                  <p className="text-[#050a30] font-bold text-lg">
                    {user?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#f8fafd] flex items-center justify-center text-[#f0b31e] shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#8ca0b2] mb-1">
                    Email Address
                  </h3>
                  <p className="text-[#050a30] font-bold text-lg">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
