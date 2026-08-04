"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

const ACCENT = "#ff5a1f";
const BORDER = "#232323";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "PASSWORD_RESET" }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send reset code");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col justify-center items-center px-6 py-16">
        <div className="w-full max-w-md border p-8 sm:p-10 text-center" style={{ borderColor: BORDER }}>
          <CheckCircle2 className="h-14 w-14 mx-auto mb-4" style={{ color: ACCENT }} />
          <h2 className="font-oliveira text-2xl text-gray-900 dark:text-white mb-2">
            Check Your Email!
          </h2>
          <p className="font-mono text-xs text-gray-500 dark:text-white/40">
            We&apos;ve sent a reset code to {email}
          </p>
          <p className="font-mono text-[11px] text-gray-400 dark:text-white/30 mt-2">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col justify-center items-center px-6 py-16">
      <div className="w-full max-w-md border p-8 sm:p-10" style={{ borderColor: BORDER }}>
        <div className="text-center mb-8">
          <div
            className="flex h-14 w-14 items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: ACCENT }}
          >
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-oliveira text-3xl text-gray-900 dark:text-white">
            Forgot Password?
          </h1>
          <p className="font-mono text-xs text-gray-500 dark:text-white/40 mt-2">
            Enter your email and we&apos;ll send you a code to reset your password
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/30 text-red-500 px-4 py-3 font-mono text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400 dark:text-white/30" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 h-12 border bg-transparent text-sm text-gray-900 dark:text-white outline-none focus:border-current transition-colors"
                style={{ borderColor: BORDER }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 flex items-center justify-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="font-mono text-xs text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
