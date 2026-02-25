"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";

interface CartProduct {
  id: string;
  title: string;
  link: string;
  imageLink: string;
  price: { value: number; currency: string };
  salePrice?: { value: number; currency: string } | null;
  availability: string;
  stockQuantity: number;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
  itemTotal: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  summary: {
    totalItems: number;
    subtotal: number;
    discount: number;
    shippingEstimate: number;
    freeShippingThreshold: number;
    eligibleForFreeShipping: boolean;
    estimatedTotal: number;
  };
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Computed
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return headers;
  }, [token]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/cart", {
        headers: getHeaders(),
        credentials: 'include',
      });

      // 401 = not logged in — just clear cart, don't show error
      if (res.status === 401) {
        setCart(null);
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      setCart(data.data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getHeaders]);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      throw new Error("Please login to add items to cart");
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add to cart");
      }

      // Refresh cart
      await fetchCart();
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update quantity");
      }

      // Update local state
      setCart((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        };
      });

      // Refresh cart to get updated totals
      await fetchCart();
    } catch (err: any) {
      console.error("Failed to update quantity:", err);
      throw err;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove item");
      }

      // Update local state
      setCart((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
        };
      });

      // Refresh cart to get updated totals
      await fetchCart();
    } catch (err: any) {
      console.error("Failed to remove item:", err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch("/api/cart/clear", {
        method: "DELETE",
        headers: getHeaders(),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to clear cart");
      }

      setCart(null);
    } catch (err: any) {
      console.error("Failed to clear cart:", err);
      throw err;
    }
  };

  const cartItemCount = cart?.items?.length || 0;

  const value: CartContextType = {
    cart,
    isLoading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    cartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
