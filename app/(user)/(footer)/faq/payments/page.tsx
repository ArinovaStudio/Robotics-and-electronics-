import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

export const metadata = {
  title: `Payments FAQ | ${SITE_NAME}`,
  description: "Frequently asked questions about payment methods, refunds, and security.",
};

export default function PaymentsFAQPage() {
  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We use Razorpay as our secure payment gateway, which allows us to accept a wide variety of payment methods including UPI (GPay, PhonePe, Paytm), all major Credit and Debit Cards, NetBanking, and popular mobile wallets."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. All transactions are securely processed through Razorpay using industry-standard SSL encryption. We do not store or even have access to your raw credit card numbers, UPI PINs, or bank account details on our servers."
    },
    {
      question: "My payment failed, but the money was deducted from my bank. What should I do?",
      answer: "Don't panic! This is a common banking delay. If your order shows as 'Payment Failed' or 'Cancelled' in your account, your bank will automatically refund the deducted amount to your original payment method within 3-5 business days."
    },
    {
      question: "Do you offer Cash on Delivery (COD)?",
      answer: "Currently, we only accept prepaid orders. This helps us process your electronics and robotics components much faster and ensures a smooth, contactless delivery experience with our courier partners."
    },
    {
      question: "How long does it take to process a refund?",
      answer: "If your refund is approved (e.g., for a cancelled order or a valid return), we initiate it immediately on our end. However, it typically takes 5-7 business days for the funds to officially reflect in your bank account or credit card statement."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-400">FAQ</span>
          <span>›</span>
          <span className="text-gray-700 font-semibold">Payments</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#050a30] mb-8 tracking-tight uppercase">
          Payment FAQs
        </h1>

        {/* FAQ Accordion Section */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details 
              key={index} 
              className="group border border-gray-200 rounded-xl bg-white overflow-hidden [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-[#050a30] hover:bg-gray-50 transition-colors">
                <span className="pr-6">{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className="text-gray-400 transition-transform duration-300 group-open:-rotate-180 flex-shrink-0" 
                />
              </summary>
              <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                <p className="mt-3">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Contact CTA Block */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-start">
          <h3 className="font-bold text-[#050a30] mb-2">Still need help?</h3>
          <p className="text-sm text-gray-600 mb-5">
            If you couldn't find the answer you were looking for, our support team is ready to assist you.
          </p>
          <Link 
            href="/contact" 
            className="bg-[#050a30] hover:bg-[#0a0f3c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            Go to Contact Page
          </Link>
        </div>

      </div>
    </div>
  );
}