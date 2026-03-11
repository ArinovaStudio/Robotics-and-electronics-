import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: "Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-semibold">Privacy Policy</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#050a30] mb-8 tracking-tight uppercase">
          Privacy Policy
        </h1>

        {/* Content Section */}
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6">
          <p className="font-medium text-gray-800">
            Last updated: March 11, 2026
          </p>
          
          <p>
            At {SITE_NAME}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase our robotics and electronics components.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, or otherwise contact us.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Personal Data:</strong> Name, email address, phone number, and shipping/billing addresses.</li>
            <li><strong>Authentication Data:</strong> Passwords (securely hashed) and OTPs used for secure login and account recovery.</li>
            <li><strong>Order History:</strong> Details of the parts, sensors, and kits you have purchased from us.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect or receive to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Facilitate account creation and logon process.</li>
            <li>Fulfill and manage your orders, payments, returns, and exchanges.</li>
            <li>Send you administrative information, such as order confirmations, shipping updates, and policy changes.</li>
            <li>Respond to customer service requests via our Contact Us form.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">3. Payment Processing</h2>
          <p>
            All financial transactions are handled securely through our third-party payment processor, <strong>Razorpay</strong>. We do not store, process, or have access to your raw credit card numbers, UPI PINs, or bank account details on our servers. Please review Razorpay's privacy policy to understand how they handle your payment data.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">4. Sharing Your Information</h2>
          <p>
            We do not sell, rent, or trade your personal information to third parties. We only share information with third parties that perform services for us or on our behalf, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Payment Processors:</strong> To facilitate secure transactions.</li>
            <li><strong>Shipping Providers:</strong> To deliver your orders to your address.</li>
            <li><strong>Email Service Providers:</strong> To send order status updates and OTP verifications.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">5. Data Security</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
          </p>

          <h2 className="text-xl font-bold text-[#050a30] mt-8 mb-4">6. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including the right to request access to, correct, or delete the personal data we hold about you. You can manage your personal details directly from your account profile page.
          </p>

          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-start">
            <h3 className="font-bold text-[#050a30] mb-2">Contact Us About Your Privacy</h3>
            <p className="text-sm text-gray-600 mb-5">
              If you have questions or comments about this policy, or wish to request the deletion of your account data, please reach out to us directly.
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