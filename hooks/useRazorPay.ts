import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useRazorpay(user: any, address: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const cancelOrder = async (orderId: string) => {
    try {
      await fetch("/api/payments/razorpay/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  const processRazorpayPayment = async (selectedId: string, couponCode?: string) => {
    if (!(window as any).Razorpay) {
      toast.error("Razorpay SDK not loaded.");
      return;
    }
    
    setIsProcessing(true);

    try {
      const checkoutRes = await fetch("/api/payments/razorpay/checkout", {
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

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Robotics Store",
        description: "Secure Order Checkout",
        order_id: orderData.data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.data.orderId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
                router.push(`/order-success?orderId=${orderData.data.orderId}`);
            } else {
              toast.error(verifyData.message);
              setIsProcessing(false);
            }
          } catch {
            toast.error("Something went wrong verifying the payment.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: address?.phone || "",
        },
        theme: { color: "#f0b31e" },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            if (orderData?.data?.orderId) cancelOrder(orderData.data.orderId);
          },
        },
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description);
        setIsProcessing(false);
        if (orderData?.data?.orderId) cancelOrder(orderData.data.orderId);
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong verifying the payment.");
      setIsProcessing(false);
    }
  };

  return { processRazorpayPayment, isProcessing };
}