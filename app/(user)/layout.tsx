"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";
import { AppProviders } from "@/app/contexts";

export default function layout({ children }: React.PropsWithChildren) {
  return (
    <AppProviders>
      <div>
        <Navbar />
        {children}
        <Footer />
      </div>
    </AppProviders>
  );
}
