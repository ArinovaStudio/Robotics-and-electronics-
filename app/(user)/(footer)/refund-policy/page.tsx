import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `Refund Policy | ${SITE_NAME}`,
  description: "Read our refund and return policy for robotics and electronic parts.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-semibold">Refund Policy</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#050a30] mb-8 tracking-tight uppercase">
          Refund & Return Policy
        </h1>

        {/* Content Section */}
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6">
          <p className="font-medium text-gray-800">
            Last updated: March 11, 2026
          </p>
          
          <p>
            At {SITE_NAME}, we want you to be completely satisfied with your purchase. However, due to the sensitive nature of DIY electronics, raw components, and robotics kits, we have specific guidelines regarding returns and refunds to ensure the quality of our inventory.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">1. Eligibility for Returns</h2>
          <p>
            We accept returns within <strong>7 days</strong> of the delivery date. To be eligible for a return, your item must be:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Unused and in the exact same condition that you received it.</li>
            <li>In its original packaging (including intact anti-static bags).</li>
            <li>Accompanied by the original receipt or proof of purchase.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">2. Non-Returnable Items</h2>
          <p>
            Because electronic components can be easily damaged by static electricity, incorrect wiring, or reverse polarity, the following items cannot be returned:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Components that have been soldered, modified, or altered in any way.</li>
            <li>Microcontrollers, sensors, or development boards that have been powered on or flashed with custom code.</li>
            <li>Batteries and power supplies (for safety and shipping reasons).</li>
            <li>Items damaged by short-circuits, over-voltage, or user error.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">3. Damaged or Defective on Arrival (DOA)</h2>
          <p>
            If you receive an item that is physically damaged in transit or defective straight out of the box, please contact us within <strong>48 hours</strong> of delivery. We will require photos of the damaged item and packaging to process a replacement or full refund.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">4. Refund Process</h2>
          <p>
            Once your return is received and inspected, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed automatically via Razorpay to your original method of payment (Credit Card, UPI, etc.). 
          </p>
          <p>
            <em>Please note: Depending on your bank, it may take 5-7 business days for the refunded amount to reflect in your account.</em>
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">5. Shipping Costs for Returns</h2>
          <p>
            You will be responsible for paying your own shipping costs for returning your item unless the item was received defective or damaged. Original shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
          </p>

          {/* Contact CTA Block */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-start">
            <h3 className="font-bold text-[#050a30] mb-2">Initiate a Return</h3>
            <p className="text-sm text-gray-600 mb-5">
              To start a return or report a defective item, please reach out to our support team with your Order ID and the reason for the return.
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
    </div>
  );
}