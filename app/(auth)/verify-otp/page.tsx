"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

const ACCENT = "#eab308";
const ACCENT_TEXT = "#1a1a1a"; // dark text on yellow bg, readable in both themes
const BORDER = "#232323";

function VerifyOTPForm() {
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
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: otp,
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
      const response = await fetch("/api/auth/otp/send", {
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
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col justify-center items-center px-4 sm:px-6 py-12 sm:py-16">
        <div
          className="w-full max-w-md border p-6 sm:p-8 md:p-10 text-center"
          style={{ borderColor: BORDER }}
        >
          <p className="font-mono text-sm text-red-500 mb-4">Email address is required</p>
          <Link
            href="/register"
            className="font-mono text-sm font-semibold hover:underline text-[#92700a] dark:text-[#eab308]"
          >
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col justify-center items-center px-4 sm:px-6 py-12 sm:py-16">
        <div
          className="w-full max-w-md border p-6 sm:p-8 md:p-10 text-center"
          style={{ borderColor: BORDER }}
        >
          <CheckCircle2
            className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-4"
            style={{ color: ACCENT }}
          />
          <h2 className="font-oliveira text-xl sm:text-2xl text-gray-900 dark:text-white mb-2">
            Email Verified!
          </h2>
          <p className="font-mono text-xs text-gray-500 dark:text-white/40">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col justify-center items-center px-4 sm:px-6 py-10 sm:py-16">
      <div
        className="w-full max-w-md border p-6 sm:p-8 md:p-10"
        style={{ borderColor: BORDER }}
      >
        <div className="text-center mb-6 sm:mb-8">
          <div
            className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center mx-auto mb-4 sm:mb-5"
            style={{ backgroundColor: ACCENT }}
          >
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: ACCENT_TEXT }} />
          </div>
          <h1 className="font-oliveira text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Verify Your Email
          </h1>
          <p className="font-mono text-xs text-gray-500 dark:text-white/40 mt-2">
            We&apos;ve sent a 6-digit code to
          </p>
          <p
            className="font-mono text-xs font-semibold mt-1 break-words px-2 text-[#92700a] dark:text-[#eab308]"
          >
            {email}
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/30 text-red-500 px-4 py-3 font-mono text-xs text-center break-words">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="mb-6 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 font-mono text-xs text-center">
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">
              Enter OTP Code
            </label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full h-12 sm:h-14 text-center text-xl sm:text-2xl tracking-widest border bg-transparent text-gray-900 dark:text-white outline-none transition-colors"
              style={{ borderColor: BORDER }}
              onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
              onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full h-11 sm:h-12 flex items-center justify-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT, color: ACCENT_TEXT }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-gray-500 dark:text-white/40 mb-2">
            Didn&apos;t receive the code?
          </p>
          <button
            onClick={handleResendOTP}
            disabled={isResending}
            className="font-mono text-xs font-semibold hover:underline disabled:opacity-50 text-[#92700a] dark:text-[#eab308]"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/register"
            className="font-mono text-xs text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
          >
            ← Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#eab308" }} />
        </div>
      }
    >
      <VerifyOTPForm />
    </Suspense>
  );
}