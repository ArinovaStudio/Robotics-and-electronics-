import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `Terms & Conditions | ${SITE_NAME}`,
  description: "Read the terms and conditions for shopping at our robotics and electronics store.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-semibold">Terms & Conditions</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#050a30] mb-8 tracking-tight uppercase">
          Terms & Conditions
        </h1>

        {/* Content Section */}
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6">
          <p className="font-medium text-gray-800">
            Last updated: March 11, 2026
          </p>
          
          <p>
            Welcome to {SITE_NAME} ("we," "our," or "us"). By accessing or using our website and purchasing our robotics parts, sensors, microcontrollers, and related electronic components, you agree to be bound by these Terms and Conditions. Please read them carefully.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">1. Account & Communication</h2>
          <p>
            When you create an account, you are responsible for maintaining the confidentiality of your login credentials. By placing an order, you consent to receive order updates, payment confirmations, and shipping tracking information via email at the address you provided.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">2. Products & DIY Electronics Disclaimer</h2>
          <p>
            We specialize in DIY (Do-It-Yourself) electronics, including Arduinos, raw sensors, LED lights, and batteries. 
            <strong> Please note:</strong> These products often require technical knowledge to operate safely. 
            We are not responsible for any damage to your personal property, existing circuits, or physical injury resulting from improper wiring, over-voltage, short-circuiting, or misuse of our components.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">3. Orders & Cancellation</h2>
          <p>
            All orders are subject to acceptance and availability. We reserve the right to cancel any order for any reason, including but not limited to: out-of-stock items, pricing errors, or suspected fraud. If your order is cancelled by our administrators, you will be notified immediately via email, and a full refund will be issued if payment was already processed.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">4. Pricing & Payments</h2>
          <p>
            All prices are listed in Indian Rupees (INR) unless otherwise stated. We use secure third-party payment gateways (such as Razorpay). We do not store your raw credit card or UPI details on our servers. Prices for our products are subject to change without notice.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">5. Shipping & Order Status</h2>
          <p>
            Delivery timelines shown at checkout are estimates. As your order moves through our system, you will receive automated email updates (e.g., Confirmed, Processing, Shipped, Delivered). We are not responsible for delays caused by the courier service or unforeseen logistical issues.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, {SITE_NAME} shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products, even if we have been advised of the possibility of such damages.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">7. Changes to Terms</h2>
          <p>
            We reserve the right to update, change, or replace any part of these Terms and Conditions by posting updates to our website. It is your responsibility to check this page periodically for changes.
          </p>

          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-start">
            <h3 className="font-bold text-[#050a30] mb-2">Contact Information</h3>
            <p className="text-sm text-gray-600 mb-5">
              If you have any questions, concerns, or need clarification regarding these Terms and Conditions, please reach out to our support team.
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