"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

// Yellow accent — stays yellow in both light and dark mode.
const ACCENT = "#facc15"; // yellow-400, good contrast in both themes
const ACCENT_TEXT = "#1a1a1a"; // dark text on yellow bg for readability in both themes
const BORDER = "#232323";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
            href="/forgot-password"
            className="font-mono text-sm font-semibold hover:underline"
            style={{ color: ACCENT_TEXT === "#1a1a1a" ? "#b45309" : ACCENT }}
          >
            Go to Forgot Password
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
            Password Reset!
          </h2>
          <p className="font-mono text-xs text-gray-500 dark:text-white/40">
            Your password has been successfully reset
          </p>
          <p className="font-mono text-[11px] text-gray-400 dark:text-white/30 mt-2">
            Redirecting to login...
          </p>
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
            <Lock className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: ACCENT_TEXT }} />
          </div>
          <h1 className="font-oliveira text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="font-mono text-xs text-gray-500 dark:text-white/40 mt-2 break-words px-2">
            Enter the code sent to {email}
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/30 text-red-500 px-4 py-3 font-mono text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">
              Reset Code
            </label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full h-11 sm:h-12 text-center text-lg sm:text-xl tracking-widest border bg-transparent text-gray-900 dark:text-white outline-none transition-colors"
              style={{ borderColor: BORDER }}
              onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
              onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400 dark:text-white/30" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 h-11 sm:h-12 border bg-transparent text-sm text-gray-900 dark:text-white outline-none transition-colors"
                style={{ borderColor: BORDER }}
                onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400 dark:text-white/30" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 h-11 sm:h-12 border bg-transparent text-sm text-gray-900 dark:text-white outline-none transition-colors"
                style={{ borderColor: BORDER }}
                onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 sm:h-12 mt-2 flex items-center justify-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT, color: ACCENT_TEXT }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#facc15" }} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}