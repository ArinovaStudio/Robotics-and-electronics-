"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

interface CartProduct {
  id: string;
  title: string;
  link?: string;
  imageLink: string;
  price: number;
  originalPrice: number;
  availability: string;
  stockQuantity: number;
  averageRating?: number;
}

interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct;
  lineTotal: number;
}

interface Cart {
  cartId: string;
  items: CartItem[];
  summary: {
    itemCount: number;
    subtotal: string;
    totalSavings: string;
    total: string;
    shipping?: number;
  };
  hasInventoryChanges?: boolean;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  couponInput: string;
  setCouponInput: any;
  appliedCoupon: {
    code: string;
    discountAmount: number;
  } | null;
  setAppliedCoupon: any;
  couponError: string;
  setCouponError: any;
  isValidatingCoupon: boolean;
  setIsValidatingCoupon: any;
  totals: any;
  handleApplyCoupon: any;
  handleRemoveCoupon: any;
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
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

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
        credentials: "include",
      });

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
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add to cart");
      }

      await fetchCart();
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      throw err;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const res = await fetch(`/api/cart/items`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update quantity");
      }

      setCart((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        };
      });

      await fetchCart();
    } catch (err: any) {
      console.error("Failed to update quantity:", err);
      throw err;
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const res = await fetch(`/api/cart/items`, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove item");
      }

      // Optimistic local state update using product.id
      setCart((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter((item) => item.product.id !== productId),
        };
      });

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
        credentials: "include",
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

  const calculateTotals = () => {
    if (!cart?.items || cart.items.length === 0)
      return {
        itemCount: 0,
        subtotal: 0,
        totalSavings: 0,
        shipping: 0,
        total: 0,
      };
    if (cart.summary && cart.summary.total) {
      return {
        itemCount: Number(cart.summary.itemCount || cart.items.length),
        subtotal: Number(cart.summary.subtotal || 0),
        totalSavings: Number(cart.summary.totalSavings || 0),
        shipping: Number(cart.summary.shipping || 0),
        total: Number(cart.summary.total || 0),
      };
    }
    let subtotal = 0,
      totalSavings = 0;
    cart.items.forEach((item: any) => {
      const price = Number(item.product?.price || item.price || 0);
      const originalPrice = Number(
        item.product?.originalPrice || item.originalPrice || price
      );
      const quantity = Number(item.quantity || 1);
      subtotal += originalPrice * quantity;
      const savings = (originalPrice - price) * quantity;
      if (savings > 0) totalSavings += savings;
    });
    const shipping = subtotal > 1000 ? 0 : 50;
    const total = subtotal - totalSavings + shipping;
    return {
      itemCount: cart.items.length,
      subtotal,
      totalSavings,
      shipping,
      total,
    };
  };

  const totals = calculateTotals();
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/users/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput,
          cartTotal: totals.subtotal - totals.totalSavings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.data);
        setCouponInput("");
      } else {
        setCouponError(data.message);
      }
    } catch (err) {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const cartItemCount = cart?.summary?.itemCount || 0;

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
    couponInput,
    setCouponInput,
    appliedCoupon,
    couponError,
    isValidatingCoupon,
    setAppliedCoupon,
    setCouponError,
    setIsValidatingCoupon,
    totals,
    handleApplyCoupon,
    handleRemoveCoupon,
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
