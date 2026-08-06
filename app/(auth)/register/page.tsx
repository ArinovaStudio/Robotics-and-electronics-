"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";

const ACCENT = "#eab308";
const BORDER = "#232323";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("Password must contain uppercase, lowercase, and number");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.message).join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Registration failed");
      }

      const otpResponse = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "EMAIL_VERIFICATION" }),
      });

      const otpData = await otpResponse.json();

      if (!otpResponse.ok || !otpData.success) {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&error=send_failed`);
        return;
      }

      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "" });
    } catch (err: any) {
      setError(err.message || "Google sign in failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col justify-center items-center px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-md border p-6 sm:p-10" style={{ borderColor: BORDER }}>
        <div className="text-center mb-8">
          <div
            className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: ACCENT }}
          >
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
          </div>
          <h1 className="font-oliveira text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="font-mono text-xs text-gray-500 dark:text-white/40 mt-2">
            Join us and start shopping for electronics
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/30 text-red-500 px-4 py-3 font-mono text-xs text-center break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400 dark:text-white/30" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 h-12 border bg-transparent text-sm text-gray-900 dark:text-white outline-none focus:border-current transition-colors"
                style={{ borderColor: BORDER }}
              />
            </div>
          </div>

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
            <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">
              Password
            </label>
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
            <p className="font-mono text-[11px] text-gray-400 dark:text-white/30 mt-1">
              Min 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-white/40">
              Confirm Password
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
                className="w-full pl-10 pr-10 h-12 border bg-transparent text-sm text-gray-900 dark:text-white outline-none focus:border-current transition-colors"
                style={{ borderColor: BORDER }}
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
            className="w-full h-12 mt-4 flex items-center justify-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t" style={{ borderColor: BORDER }} />
          <span className="px-4 font-mono text-[11px] uppercase tracking-widest text-gray-400 dark:text-white/30 text-center">
            Or continue with
          </span>
          <div className="flex-1 border-t" style={{ borderColor: BORDER }} />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-12 flex items-center justify-center gap-3 border font-dm-sans text-xs font-semibold uppercase tracking-widest text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <span className="truncate">Sign up with Google</span>
        </button>

        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-gray-500 dark:text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "#92700a" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}