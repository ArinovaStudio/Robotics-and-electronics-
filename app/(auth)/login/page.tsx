"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

const ACCENT = "#eab308";
const BORDER = "#232323";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isVerified = searchParams.get("verified") === "true";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const payload =
        step === 1
          ? { email, password, redirect: false }
          : { email, password, otp, redirect: false };
      const res = await signIn("credentials", payload);

      if (res?.error) {
        if (res.error === "OTP_SENT") {
          setStep(2);
          setMessage("An OTP has been sent to your email.");
          setIsLoading(false);
          return;
        }

        throw new Error(res.error);
      }

      if (res?.ok) {
        router.refresh();
        const session = await getSession();
        const userRole = String(session?.user?.role || "").toUpperCase();
        if (userRole === "ADMIN") {
          window.location.href = "/admin";
          return;
        } else if (userRole === "CUSTOMER") {
          let callbackUrl = searchParams.get("callbackUrl") || "";
          if (callbackUrl.includes("/login")) {
            callbackUrl = "/";
          }
          window.location.href = callbackUrl;
          return;
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      let callbackUrl = searchParams.get("callbackUrl") || "";
      if (callbackUrl.includes("/login")) {
        callbackUrl = "/";
      }
      await signIn("google", { callbackUrl });
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col justify-center items-center px-4 sm:px-6 py-10 sm:py-16">
      <div
        className="w-full max-w-md border p-6 sm:p-10"
        style={{ borderColor: BORDER }}
      >
        <div className="text-center mb-8">
          <div
            className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: ACCENT }}
          >
            {step === 1 ? (
              <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
            ) : (
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
            )}
          </div>
          <h1 className="font-oliveira text-2xl sm:text-3xl text-gray-900 dark:text-white">
            {step === 1 ? "Welcome Back" : "Two-Step Verification"}
          </h1>
          <p className="font-mono text-xs text-gray-500 dark:text-white/40 mt-2 break-words">
            {step === 1
              ? "Sign in to your account"
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/30 text-red-500 px-4 py-3 font-mono text-xs text-center break-words">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="mb-6 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 font-mono text-xs text-center">
            ✓ {message}
          </div>
        )}

        {isVerified && !error && (
          <div className="mb-6 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 font-mono text-xs text-center">
            ✓ Email verified successfully! Please login to continue.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {step === 1 && (
            <>
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

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-mono text-xs hover:underline"
                    style={{ color: "#92700a" }}
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 dark:text-white/30" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 h-12 border bg-transparent text-sm text-gray-900 dark:text-white outline-none focus:border-current transition-colors"
                    style={{ borderColor: BORDER }}
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
            </>
          )}

          {step === 2 && (
            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40 text-center block">
                Enter OTP Code
              </label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full h-14 text-center text-xl sm:text-2xl tracking-widest border bg-transparent text-gray-900 dark:text-white outline-none focus:border-current transition-colors"
                style={{ borderColor: BORDER }}
              />
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setMessage("");
                }}
                className="font-mono text-xs text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 mt-2 text-center block w-full"
              >
                ← Back to Login
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (step === 2 && otp.length !== 6)}
            className="w-full h-12 mt-2 flex items-center justify-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {step === 1 ? "Checking Credentials..." : "Verifying..."}
              </>
            ) : step === 1 ? (
              "Continue"
            ) : (
              "Sign In Securely"
            )}
          </button>
        </form>

        {step === 1 && (
          <>
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t" style={{ borderColor: BORDER }} />
              <span className="px-4 font-mono text-[11px] uppercase tracking-widest text-gray-400 dark:text-white/30 text-center">
                Or continue with
              </span>
              <div className="flex-1 border-t" style={{ borderColor: BORDER }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center gap-3 border font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              style={{ borderColor: BORDER }}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="truncate">Sign in with Google</span>
            </button>

            <div className="mt-6 text-center">
              <p className="font-mono text-xs text-gray-500 dark:text-white/40">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold hover:underline" style={{ color: "#92700a" }}>
                  Sign Up
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const session = await getSession();
      if (session) {
        const role = String(session.user?.role || "").toUpperCase();
        if (role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setIsChecking(false);
      }
    };
    verifyUser();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: ACCENT }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}