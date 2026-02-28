"use client";

import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

// Re-export hooks for convenience
export { useAuth } from "./AuthContext";
export { useCart } from "./CartContext";
