import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

export const metadata = {
  title: `Manage Deliveries FAQ | ${SITE_NAME}`,
  description: "Frequently asked questions about shipping, tracking, and managing your electronics deliveries.",
};

export default function ManageDeliveriesFAQPage() {
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "Once your order is packed and leaves our warehouse, you will receive an automated email with a tracking number and a link to the courier's website. You can also view the real-time status of your delivery by logging into your account and visiting the 'Orders' section."
    },
    {
      question: "Can I change my delivery address after placing an order?",
      answer: "If your order is still in the 'CONFIRMED' or 'PROCESSING' stage, please contact us immediately using the Contact Us form or our support email to request an address change. Once an order has been marked as 'SHIPPED', we are unable to change the delivery address."
    },
    {
      question: "What happens if I am not home to receive my package?",
      answer: "Our courier partners typically make up to 3 delivery attempts. If you miss the first attempt, they will usually try again on the next working day. You may also receive an SMS or call from the delivery executive to coordinate a better time."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship domestically within India. We are working hard to expand our logistics network to support international robotics and electronics enthusiasts in the future!"
    },
    {
      question: "My package says 'Delivered' but I haven't received it. What should I do?",
      answer: "First, check with your neighbors, building security, or reception desk to see if the package was left with them. If you still cannot locate your components within 24 hours of the 'Delivered' status, please contact our support team immediately so we can raise a dispute with the courier."
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
          <span className="text-gray-700 font-semibold">Manage Deliveries</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#050a30] mb-8 tracking-tight uppercase">
          Delivery FAQs
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