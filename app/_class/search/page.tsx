"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SearchResults from "./SearchResults";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <main className="bg-[#FFFFFF] min-h-screen">
      <div className="max-w-[1200px] mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-[#050a30] mb-8">
          {query ? `Search results for "${query}"` : "Search Products"}
        </h1>
        <SearchResults query={query} />
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-[#FFFFFF] min-h-screen">
          <div className="max-w-[1200px] mx-auto py-8 px-4">
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-[#f0b31e] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
