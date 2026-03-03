"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { ShoppingBag, Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    const payload = step === 1 ? { email, password, redirect: false } : { email, password, otp, redirect: false };
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
      const session = await getSession();
      const userRole = session?.user?.role;

      if (userRole === "ADMIN") {
        router.push("/admin");
      } else {
        const callbackUrl = searchParams.get("callbackUrl") || "/";
        router.push(callbackUrl);
      }

      router.refresh(); 
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
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      await signIn("google", { callbackUrl });
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8fafd] to-[#e8f4f8] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0b31e] shadow-lg shadow-yellow-200 mx-auto mb-5">
            {step === 1 ? <ShoppingBag className="h-8 w-8 text-white" /> : <ShieldCheck className="h-8 w-8 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-[#050a30] tracking-tight">
            {step === 1 ? "Welcome Back!" : "Two-Step Verification"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {step === 1 ? "Sign in to your account" : `Enter the code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="mb-6 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
            ✓ {message}
          </div>
        )}

        {isVerified && !error && (
          <div className="mb-6 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
            ✓ Email verified successfully! Please login to continue.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {step === 1 && (
            <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#f0b31e] hover:underline font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </>
          )}

          {step === 2 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1 text-center block">Enter OTP Code</label>
              <Input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="h-14 text-center text-2xl tracking-widest rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors"
              />
              <button 
                type="button" 
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setMessage("");
                }} 
                className="text-xs text-gray-500 hover:text-gray-700 mt-2 text-center block w-full"
              >
                ← Back to Login
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || (step === 2 && otp.length !== 6)}
            className="w-full h-12 mt-4 bg-[#f0b31e] hover:bg-[#e6a700] text-white rounded-xl text-base font-semibold shadow-md shadow-yellow-200 transition-all"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {step === 1 ? "Checking Credentials..." : "Verifying..."}</>
            ) : (
              step === 1 ? "Continue" : "Sign In Securely"
            )}
          </Button>
        </form>

        

        {step === 1 && (
          <>
              <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-xs text-gray-400 font-medium">
                Or continue with
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-[#f0b31e] font-semibold hover:underline">
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
  return (
      <LoginForm />
  );
}