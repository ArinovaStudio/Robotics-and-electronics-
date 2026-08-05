import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

export const metadata = {
  title: `Orders FAQ | ${SITE_NAME}`,
  description: "Frequently asked questions about placing, modifying, and tracking your electronics orders.",
};

export default function OrdersFAQPage() {
  const faqs = [
    {
      question: "How do I know if my order was successfully placed?",
      answer: "As soon as your payment is successfully processed through Razorpay, you will see a success screen with your Order ID. We will also instantly send a confirmation email containing your receipt and a list of the components you purchased."
    },
    {
      question: "Can I add items to my order after placing it?",
      answer: "Once an order is confirmed, our system locks it for processing, so we cannot add items to it. If you forgot a sensor or wire, the best approach is to place a new order. If your original order hasn't shipped yet, contact us and we can try to pack them together!"
    },
    {
      question: "How do I cancel my order?",
      answer: "If your order status is still 'CONFIRMED' or 'PENDING', you can contact our support team to request a cancellation. Once an order moves to 'PROCESSING' or 'SHIPPED', it can no longer be cancelled, and you will need to follow our Refund Policy instead."
    },
    {
      question: "I received my robotics kit, but a component is missing. What do I do?",
      answer: "We carefully pack all our electronics, but mistakes can happen! Please contact our support team within 48 hours of delivery with your Order ID. Keep all the original packaging, as it helps us investigate the issue with our warehouse team."
    },
    {
      question: "Do you offer bulk discounts for schools or robotics clubs?",
      answer: "Yes, we do! If you are ordering microcontrollers, sensors, or kits in bulk for a classroom, workshop, or college project, please reach out to us via the Contact Us page before placing your order to discuss bulk pricing and availability."
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
          <span className="text-gray-700 font-semibold">Orders</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#050a30] mb-8 tracking-tight uppercase">
          Order FAQs
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