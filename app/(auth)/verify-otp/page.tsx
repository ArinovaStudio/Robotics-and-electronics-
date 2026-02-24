"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          type: "EMAIL_VERIFICATION",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "EMAIL_VERIFICATION" }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setResendMessage("OTP has been resent to your email");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f8fafd] to-[#e8f4f8] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 text-center">
          <p className="text-red-600 mb-4">Email address is required</p>
          <Link
            href="/register"
            className="text-[#f0b31e] font-semibold hover:underline"
          >
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f8fafd] to-[#e8f4f8] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#050a30] mb-2">
            Email Verified!
          </h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8fafd] to-[#e8f4f8] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0b31e] shadow-lg shadow-yellow-200 mx-auto mb-5">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#050a30] tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            We've sent a 6-digit code to
          </p>
          <p className="text-[#f0b31e] font-semibold text-sm">{email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* Success Message */}
        {resendMessage && (
          <div className="mb-6 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
            {resendMessage}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          {/* OTP Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Enter OTP Code
            </label>
            <Input
              type="text"
              required
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              maxLength={6}
              className="h-14 text-center text-2xl tracking-widest rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full h-12 bg-[#f0b31e] hover:bg-[#e6a700] text-white rounded-xl text-base font-semibold shadow-md shadow-yellow-200 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResendOTP}
            disabled={isResending}
            className="text-[#f0b31e] font-semibold hover:underline disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        {/* Back to Register */}
        <div className="mt-4 text-center">
          <Link
            href="/register"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Register
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-500 font-medium">
        &copy; {new Date().getFullYear()} Electronics Store
      </p>
    </div>
  );
}
