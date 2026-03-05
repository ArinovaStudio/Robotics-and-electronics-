"use client";

import { Loader2, Plus } from "lucide-react";
import BannerCard, { Banner } from "./_components/BannerCard";
import useSWR from "swr";
import BannerModal from "./_components/BannerModal";
import { useState } from "react";
const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function BannerPage() {
  const {
    isLoading: loading,
    data,
    error,
    mutate,
  } = useSWR("/api/admin/banners", fetcher, { revalidateOnFocus: false });
  const [pending, setPending] = useState(false);
  const banners = data?.data ?? [];
  const upsertItem = async (data: any, mode: "create" | "edit") => {
    try {
      console.log(data);
      setPending(true);
      const url = `/api/admin/banners${mode === "edit" ? `/${data.id}` : ""}`;
      const method = mode === "create" ? "POST" : "PUT";
      const formData = new FormData();
      formData.append("title",data.title);
      formData.append("image",data.image);
      const request = await fetch(url, {
        method: method,
        body: formData,
      });
      const response = await request.json();
      if (!response.success) {
        throw Error(response.message);
      }
      mutate();
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Banners</h1>
        <BannerModal loading={pending} mode="create" onSubmit={upsertItem}>
          <button className="bg-[#4a439a] max-w-[200px] text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 flex-1 md:flex-none cursor-pointer hover:bg-[#3e3685] transition-colors shadow-sm">
            <Plus size={20} />
            <span className="font-medium">Add Banner</span>
          </button>
        </BannerModal>
      </div>

      {/* Banner Grid */}
      {loading ? (
        <Loader2 className="animate-spin mx-auto" />
      ) : banners.length === 0 ? (
        <div className="text-center">No Banners Found!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner: any) => (
            <BannerCard banner={banner} />
          ))}
        </div>
      )}
    </div>
  );
}
