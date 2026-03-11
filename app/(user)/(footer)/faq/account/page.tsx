import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

export const metadata = {
  title: `Account FAQ | ${SITE_NAME}`,
  description: "Frequently asked questions about managing your store account.",
};

export default function AccountFAQPage() {
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' or 'Login' button in the top right corner of the navigation bar. You can either register using your email address and a password, or use the 'Sign in with Google' button for a faster, seamless checkout experience."
    },
    {
      question: "I forgot my password. How do I reset it?",
      answer: "Go to the login page and click the 'Forgot?' link above the password field. Enter your registered email address, and we will send you a secure OTP (One-Time Password) to verify your identity and allow you to set a new password."
    },
    {
      question: "How do I update my shipping address?",
      answer: "Once logged in, click on your profile icon and navigate to 'My Account' or proceed to the checkout screen. From there, you can add, edit, or delete your saved shipping addresses for faster future purchases."
    },
    {
      question: "Why do I need an OTP to log in sometimes?",
      answer: "For your security, if our system detects an unusual login attempt or if you are resetting your password, we use a 6-digit OTP sent to your email to guarantee that it is actually you accessing the account."
    },
    {
      question: "Can I delete my account?",
      answer: "Yes. We respect your data privacy. If you wish to permanently delete your account and all associated data, please reach out to us using the Contact Us form, and our admin team will securely wipe your data."
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
          <span className="text-gray-700 font-semibold">Account</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#050a30] mb-8 tracking-tight uppercase">
          Account FAQs
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