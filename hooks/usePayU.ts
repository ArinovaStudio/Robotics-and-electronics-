import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function usePayU() {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsProcessing(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const processPayUPayment = async (selectedId: string, couponCode?: string) => {
    setIsProcessing(true);

    try {
      const checkoutRes = await fetch("/api/payments/payu/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedId, couponCode }),
      });

      const orderData = await checkoutRes.json();
      
      if (!orderData.success) {
        toast.error(orderData.message || "Failed to create order");
        setIsProcessing(false);
        return;
      }

      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute("action", orderData.data.actionUrl);

      const payuFields = {
        key: orderData.data.key,
        txnid: orderData.data.txnid,
        amount: orderData.data.amount,
        productinfo: orderData.data.productinfo,
        firstname: orderData.data.firstname,
        email: orderData.data.email,
        phone: orderData.data.phone,
        hash: orderData.data.hash,
        surl: `${window.location.origin}/api/payments/payu/verify`,
        furl: `${window.location.origin}/api/payments/payu/verify`
      };

      for (const key in payuFields) {
        const input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", key);
        input.setAttribute("value", (payuFields as any)[key]);
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      
    } catch {
      toast.error("Something went wrong with checkout.");
      setIsProcessing(false);
    }
  };

  return { processPayUPayment, isProcessing };
}